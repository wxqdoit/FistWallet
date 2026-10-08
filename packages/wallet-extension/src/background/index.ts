import browser from 'webextension-polyfill';
import type { Runtime } from 'webextension-polyfill';
import type { Message, Response, Wallet, DAppConnection } from '../types';
import { MessageType, STORAGE_KEYS, ChainType } from '../types';
import { DEFAULT_AUTO_LOCK_DURATION, clearAutoLockTimer, getAutoLockDurationMs, resetAutoLockTimer, getStorage, setStorage } from '../core/storage';
import { signMessage } from '../core/wallet';

console.log('FistWallet background service worker initialized');

let unlockedPassword: string | null = null;
let unlockExpiresAt: number | null = null;
let autoLockDurationMs = DEFAULT_AUTO_LOCK_DURATION;

function clearUnlockState(): void {
    unlockedPassword = null;
    unlockExpiresAt = null;
    clearAutoLockTimer();
}

function startUnlockSession(password: string): number {
    unlockExpiresAt = Date.now() + autoLockDurationMs;
    unlockedPassword = password;
    resetAutoLockTimer(() => clearUnlockState(), autoLockDurationMs);
    return unlockExpiresAt;
}

function getUnlockStatus(): { isUnlocked: boolean; expiresAt: number | null } {
    if (!unlockedPassword || !unlockExpiresAt) {
        return { isUnlocked: false, expiresAt: null };
    }

    if (unlockExpiresAt <= Date.now()) {
        clearUnlockState();
        return { isUnlocked: false, expiresAt: null };
    }

    return { isUnlocked: true, expiresAt: unlockExpiresAt };
}

function getUnlockPassword(): { password: string; expiresAt: number } | null {
    const status = getUnlockStatus();
    if (!status.isUnlocked || !unlockedPassword || !status.expiresAt) {
        return null;
    }

    return { password: unlockedPassword, expiresAt: status.expiresAt };
}

/**
 * Handle messages from popup and content scripts
 */
browser.runtime.onMessage.addListener((message: Message, sender) => {
    console.log('Background received message:', message.type, 'from:', sender);

    return handleMessage(message, sender);
});

async function syncAutoLockDuration(): Promise<void> {
    autoLockDurationMs = await getAutoLockDurationMs();
    if (unlockedPassword) {
        unlockExpiresAt = Date.now() + autoLockDurationMs;
        resetAutoLockTimer(() => clearUnlockState(), autoLockDurationMs);
    }
}

void syncAutoLockDuration();

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
        return;
    }
    if (changes[STORAGE_KEYS.SETTINGS]) {
        void syncAutoLockDuration();
    }
});

function isExtensionSender(sender: Runtime.MessageSender): boolean {
    if (sender.id && sender.id === browser.runtime.id) {
        return true;
    }
    const senderUrl = sender.url ?? '';
    return senderUrl.startsWith(browser.runtime.getURL(''));
}

interface PendingApproval {
    resolve: (approved: boolean) => void;
    reject: (error: Error) => void;
    windowId?: number;
    origin: string;
    action: string;
}

const pendingApprovals = new Map<string, PendingApproval>();

// Cleanup pending approvals if user manually closes popup window
browser.windows.onRemoved.addListener((windowId) => {
    for (const [id, req] of pendingApprovals.entries()) {
        if (req.windowId === windowId) {
            pendingApprovals.delete(id);
            req.resolve(false);
        }
    }
});

/**
 * Launch an approval notification popup and await user response
 */
async function requestUserApproval(params: {
    action: 'connect' | 'sign';
    origin: string;
    message?: string;
}): Promise<boolean> {
    const id = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const searchParams = new URLSearchParams({
        id,
        action: params.action,
        origin: params.origin,
    });
    if (params.message) {
        searchParams.set('message', params.message);
    }

    const popupUrl = browser.runtime.getURL(`index.html#/notification?${searchParams.toString()}`);

    return new Promise<boolean>((resolve, reject) => {
        pendingApprovals.set(id, {
            resolve,
            reject,
            origin: params.origin,
            action: params.action,
        });

        browser.windows.create({
            url: popupUrl,
            type: 'popup',
            width: 380,
            height: 620,
            focused: true,
        }).then((win) => {
            if (win?.id && pendingApprovals.has(id)) {
                pendingApprovals.get(id)!.windowId = win.id;
            }
        }).catch((err) => {
            pendingApprovals.delete(id);
            reject(err);
        });
    });
}

/**
 * Message handler
 */
async function handleMessage(message: Message, sender: Runtime.MessageSender): Promise<Response> {
    try {
        switch (message.type) {
            case MessageType.CREATE_WALLET:
                return { success: true };

            case MessageType.UNLOCK_WALLET: {
                if (!isExtensionSender(sender)) {
                    return { success: false, error: 'Unauthorized' };
                }

                const password = (message.payload as { password?: string } | null)?.password;
                if (!password) {
                    return { success: false, error: 'Password required' };
                }

                const expiresAt = startUnlockSession(password);
                return { success: true, data: { expiresAt } };
            }

            case MessageType.LOCK_WALLET:
                if (!isExtensionSender(sender)) {
                    return { success: false, error: 'Unauthorized' };
                }

                clearUnlockState();
                return { success: true };

            case MessageType.GET_UNLOCK_STATUS:
                if (!isExtensionSender(sender)) {
                    return { success: false, error: 'Unauthorized' };
                }

                return { success: true, data: getUnlockStatus() };

            case MessageType.GET_UNLOCK_PASSWORD: {
                if (!isExtensionSender(sender)) {
                    return { success: false, error: 'Unauthorized' };
                }

                const data = getUnlockPassword();
                if (!data) {
                    return { success: false, error: 'Wallet locked' };
                }
                return { success: true, data };
            }

            case MessageType.DAPP_APPROVAL_RESOLVE:
            case 'DAPP_APPROVAL_RESOLVE' as any: {
                const payload = (message.payload || {}) as { id?: string; approved: boolean };
                const reqId = payload.id;
                let pending: PendingApproval | undefined;
                if (reqId && pendingApprovals.has(reqId)) {
                    pending = pendingApprovals.get(reqId);
                    pendingApprovals.delete(reqId);
                } else if (!reqId && pendingApprovals.size > 0) {
                    const firstEntry = pendingApprovals.entries().next().value;
                    if (firstEntry) {
                        const [firstKey, firstVal] = firstEntry;
                        pendingApprovals.delete(firstKey);
                        pending = firstVal;
                    }
                }

                if (pending) {
                    pending.resolve(Boolean(payload.approved));
                    return { success: true };
                }
                return { success: false, error: 'No pending approval found' };
            }

            case MessageType.REQUEST_ACCOUNTS: {
                const wallets = (await getStorage<Wallet[]>(STORAGE_KEYS.WALLETS)) || [];
                const currentWalletId = await getStorage<string>(STORAGE_KEYS.CURRENT_WALLET_ID);
                const activeWallet = wallets.find((w) => w.id === currentWalletId) || wallets[0];

                if (!activeWallet || !activeWallet.accounts || activeWallet.accounts.length === 0) {
                    return { success: false, error: "No accounts available in active wallet." };
                }

                const activeAccount = activeWallet.accounts[0];
                const reqChainType = (message.payload as any)?.chainType || ChainType.EVM;
                const address = activeAccount?.addresses?.[reqChainType as ChainType] || activeAccount?.addresses?.[ChainType.EVM];

                if (!address) {
                    return { success: false, error: `No address found for ${reqChainType} in current account.` };
                }

                const origin = (message.payload as any)?.origin || (sender?.url ? new URL(sender.url).origin : 'Unknown');

                // Check if origin is already connected
                const connections = (await getStorage<DAppConnection[]>(STORAGE_KEYS.DAPP_CONNECTIONS)) || [];
                const existingConn = connections.find(c => c.origin === origin);
                if (existingConn && existingConn.connectedAccounts?.includes(address)) {
                    return { success: true, data: [address] };
                }

                // Request user approval via notification window
                const approved = await requestUserApproval({
                    action: 'connect',
                    origin,
                });

                if (!approved) {
                    return { success: false, error: 'User rejected the connection request.' };
                }

                const connectionEntry: DAppConnection = {
                    origin,
                    favicon: `https://www.google.com/s2/favicons?domain=${origin}&sz=64`,
                    name: (message.payload as any)?.name || origin.replace(/^https?:\/\//, ''),
                    connectedAccounts: [address],
                    permissions: ['eth_accounts', 'personal_sign'],
                    connectedAt: Date.now(),
                };
                const existingIdx = connections.findIndex(c => c.origin === origin);
                if (existingIdx !== -1) {
                    connections[existingIdx] = connectionEntry;
                } else {
                    connections.push(connectionEntry);
                }
                await setStorage(STORAGE_KEYS.DAPP_CONNECTIONS, connections);

                return { success: true, data: [address] };
            }

            case MessageType.CONNECT_DAPP: {
                const origin = (message.payload as any)?.origin || (sender?.url ? new URL(sender.url).origin : 'Unknown');
                const wallets = (await getStorage<Wallet[]>(STORAGE_KEYS.WALLETS)) || [];
                const currentWalletId = await getStorage<string>(STORAGE_KEYS.CURRENT_WALLET_ID);
                const activeWallet = wallets.find((w) => w.id === currentWalletId) || wallets[0];
                const activeAccount = activeWallet?.accounts?.[0];
                const address = activeAccount?.addresses?.evm || '';

                if (!address) {
                    return { success: false, error: 'No active account found.' };
                }

                const connections = (await getStorage<DAppConnection[]>(STORAGE_KEYS.DAPP_CONNECTIONS)) || [];
                const existingIdx = connections.findIndex(c => c.origin === origin);
                if (existingIdx !== -1 && connections[existingIdx].connectedAccounts?.includes(address)) {
                    return { success: true, data: { connected: true, connection: connections[existingIdx] } };
                }

                const approved = await requestUserApproval({
                    action: 'connect',
                    origin,
                });

                if (!approved) {
                    return { success: false, error: 'User rejected the connection request.' };
                }

                const connectionEntry: DAppConnection = {
                    origin,
                    favicon: `https://www.google.com/s2/favicons?domain=${origin}&sz=64`,
                    name: (message.payload as any)?.name || origin.replace(/^https?:\/\//, ''),
                    connectedAccounts: [address],
                    permissions: ['eth_accounts', 'personal_sign'],
                    connectedAt: Date.now(),
                };
                if (existingIdx !== -1) {
                    connections[existingIdx] = connectionEntry;
                } else {
                    connections.push(connectionEntry);
                }
                await setStorage(STORAGE_KEYS.DAPP_CONNECTIONS, connections);
                return { success: true, data: { connected: true, connection: connectionEntry } };
            }

            case MessageType.DISCONNECT_DAPP: {
                const origin = (message.payload as any)?.origin;
                const connections = (await getStorage<DAppConnection[]>(STORAGE_KEYS.DAPP_CONNECTIONS)) || [];
                const filtered = origin ? connections.filter(c => c.origin !== origin) : [];
                await setStorage(STORAGE_KEYS.DAPP_CONNECTIONS, filtered);
                return { success: true, data: { disconnected: true } };
            }

            case MessageType.SIGN_MESSAGE: {
                const payload = message.payload as any;
                let msgToSign: string | undefined = payload?.message;

                if (!msgToSign && Array.isArray(payload?.params)) {
                    const p0 = payload.params[0];
                    const p1 = payload.params[1];
                    if (typeof p0 === "string" && p0.startsWith("0x") && p0.length === 42) {
                        msgToSign = p1;
                    } else {
                        msgToSign = p0;
                    }
                }

                if (!msgToSign) {
                    return { success: false, error: "Message payload required for signing." };
                }

                const origin = (message.payload as any)?.origin || (sender?.url ? new URL(sender.url).origin : 'Unknown');

                // Prompt user to approve signing
                const approved = await requestUserApproval({
                    action: 'sign',
                    origin,
                    message: msgToSign,
                });

                if (!approved) {
                    return { success: false, error: 'User rejected the signing request.' };
                }

                const session = getUnlockPassword();
                if (!session) {
                    return { success: false, error: "Wallet locked. Please unlock FistWallet extension first." };
                }

                const wallets = (await getStorage<Wallet[]>(STORAGE_KEYS.WALLETS)) || [];
                const currentWalletId = await getStorage<string>(STORAGE_KEYS.CURRENT_WALLET_ID);
                const activeWallet = wallets.find((w) => w.id === currentWalletId) || wallets[0];
                const account = activeWallet?.accounts?.[0];

                const accountId = payload?.accountId || account?.id;
                const chainType = (payload?.chainType as ChainType) || ChainType.EVM;
                const accountIndex = payload?.accountIndex ?? 0;

                if (!accountId) {
                    return { success: false, error: "Account not found for signing." };
                }

                const signature = await signMessage(
                    session.password,
                    accountId,
                    chainType,
                    accountIndex,
                    msgToSign
                );

                return { success: true, data: signature };
            }

            case MessageType.SEND_TRANSACTION: {
                return { success: false, error: 'Transaction confirmation required via wallet popup.' };
            }

            default:
                return { success: false, error: 'Unknown message type' };
        }
    } catch (error) {
        console.error('Error handling message:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Handle extension installation
 */
browser.runtime.onInstalled.addListener((details) => {
    console.log('FistWallet installed:', details.reason);

    if (details.reason === 'install') {
        browser.tabs.create({
            url: browser.runtime.getURL('index.html'),
        });
    }
});

/**
 * Keep service worker alive
 */
setInterval(() => {
    console.log('Service worker heartbeat');
}, 20000);
