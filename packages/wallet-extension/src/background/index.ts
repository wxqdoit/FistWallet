import browser from 'webextension-polyfill';
import type { Runtime } from 'webextension-polyfill';
import type { Message, Response } from '../types';
import { MessageType, STORAGE_KEYS } from '../types';
import { DEFAULT_AUTO_LOCK_DURATION, clearAutoLockTimer, getAutoLockDurationMs, resetAutoLockTimer } from '../core/storage';

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
    const senderUrl = sender.url ?? '';
    return senderUrl.startsWith(browser.runtime.getURL(''));
}

/**
 * Message handler
 */
async function handleMessage(message: Message, sender: Runtime.MessageSender): Promise<Response> {
    try {
        switch (message.type) {
            case MessageType.CREATE_WALLET:
                // Handled by popup directly
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

            case MessageType.SEND_TRANSACTION:
                // TODO: Implement transaction sending
                return { success: false, error: 'Not implemented' };

            case MessageType.SIGN_MESSAGE:
                // TODO: Implement message signing
                return { success: false, error: 'Not implemented' };

            case MessageType.CONNECT_DAPP:
                // TODO: Implement DApp connection
                return { success: false, error: 'Not implemented' };

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
        // Open welcome page on first install
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
