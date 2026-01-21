import browser from 'webextension-polyfill';
import { create } from 'zustand';
import type { Wallet, Account, Network } from '../types';
import { ChainType, MessageType, STORAGE_KEYS } from '../types';
import {
    clearAutoLockTimer,
    deleteVault,
    getStorage,
    hasVault,
    loadVault,
    removeSessionStorage,
    removeStorage,
    resetAutoLockTimer,
    saveVault,
    setStorage,
} from '@core/storage';
import { createWallet, importWalletFromMnemonic, importWalletFromPrivateKey } from '@core/wallet';
import { getSupportedNetworksForAccount, NETWORKS } from '@core/networks';

interface WalletState {
    // Initialization state
    isInitialized: boolean | null;
    isLocked: boolean;

    // Wallet data
    wallets: Wallet[];
    wallet: Wallet | null;
    currentWalletId: string | null;
    currentAccount: Account | null;
    currentNetwork: Network;

    // Actions
    initialize: () => Promise<void>;
    createNewWallet: (password: string, mnemonic?: string) => Promise<void>;
    importWallet: (password: string, mnemonic: string) => Promise<void>;
    importFromPrivateKey: (password: string, privateKey: string, chainType: any) => Promise<void>;
    addWalletFromMnemonic: (mnemonic: string) => Promise<void>;
    addWalletFromPrivateKey: (privateKey: string, chainType: any) => Promise<void>;
    switchWallet: (walletId: string) => void;
    exportMnemonic: () => Promise<string | null>;
    exportPrivateKey: (chainType: ChainType) => Promise<string>;
    deleteWallet: (walletId?: string) => Promise<void>;
    unlock: (password: string) => Promise<boolean>;
    lock: () => void;
    switchAccount: (accountId: string) => void;
    switchNetwork: (networkId: string) => void;
    addAccount: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => {
    const LEGACY_UNLOCK_EXPIRES_AT_KEY = 'unlock_expires_at';
    const LEGACY_SESSION_PASSWORD_KEY = 'session_password';

    const scheduleAutoLock = (expiresAt: number | null): void => {
        if (typeof expiresAt !== 'number') {
            return;
        }

        const remainingMs = expiresAt - Date.now();
        if (remainingMs > 0) {
            resetAutoLockTimer(() => get().lock(), remainingMs);
        }
    };

    const fetchUnlockStatus = async (): Promise<{ isUnlocked: boolean; expiresAt: number | null }> => {
        try {
            const response = await browser.runtime.sendMessage({
                type: MessageType.GET_UNLOCK_STATUS,
                payload: null,
            });
            const data = response?.success
                ? (response.data as { isUnlocked?: boolean; expiresAt?: number | null })
                : null;

            if (data && typeof data.isUnlocked === 'boolean') {
                return {
                    isUnlocked: data.isUnlocked,
                    expiresAt: typeof data.expiresAt === 'number' ? data.expiresAt : null,
                };
            }
        } catch (error) {
            console.error('Failed to fetch unlock status:', error);
        }

        return { isUnlocked: false, expiresAt: null };
    };

    const startUnlockSession = async (password: string): Promise<number | null> => {
        const response = await browser.runtime.sendMessage({
            type: MessageType.UNLOCK_WALLET,
            payload: { password },
        });

        if (!response?.success) {
            throw new Error(response?.error || 'Failed to start unlock session');
        }

        const expiresAt = typeof response.data?.expiresAt === 'number' ? response.data.expiresAt : null;
        scheduleAutoLock(expiresAt);
        return expiresAt;
    };

    const clearUnlockSession = async (): Promise<void> => {
        clearAutoLockTimer();
        try {
            await browser.runtime.sendMessage({
                type: MessageType.LOCK_WALLET,
                payload: null,
            });
        } catch (error) {
            console.error('Failed to clear unlock session:', error);
        }
    };

    const requireUnlockPassword = async (): Promise<string> => {
        try {
            const response = await browser.runtime.sendMessage({
                type: MessageType.GET_UNLOCK_PASSWORD,
                payload: null,
            });
            const data = response?.success
                ? (response.data as { password?: string; expiresAt?: number | null })
                : null;

            if (!data?.password) {
                throw new Error(response?.error || 'Wallet not unlocked');
            }

            scheduleAutoLock(typeof data.expiresAt === 'number' ? data.expiresAt : null);
            return data.password;
        } catch (error) {
            set({ isLocked: true });
            throw error;
        }
    };

    const isNetworkSupported = (account: Account | null, networkId: string): boolean => {
        const network = NETWORKS[networkId];
        if (!account || !network) {
            return false;
        }

        const address = account.addresses[network.chainType];
        return typeof address === 'string' && address.length > 0;
    };

    const selectPreferredNetwork = (account: Account | null, storedNetworkId?: string | null): Network => {
        const supportedNetworks = getSupportedNetworksForAccount(account);
        const storedNetwork = storedNetworkId ? NETWORKS[storedNetworkId] : undefined;

        if (storedNetwork && supportedNetworks.some((network) => network.id === storedNetwork.id)) {
            return storedNetwork;
        }

        const primaryNetwork = supportedNetworks.find((network) => !network.isTestnet);
        return primaryNetwork || supportedNetworks[0] || NETWORKS.ethereum;
    };

    const resolveWalletState = (
        wallets: Wallet[],
        walletId: string | null,
        storedNetworkId?: string | null
    ): {
        wallet: Wallet | null;
        currentWalletId: string | null;
        currentAccount: Account | null;
        currentNetwork: Network;
    } => {
        const wallet = walletId ? wallets.find((item) => item.id === walletId) ?? null : wallets[0] ?? null;
        const currentAccount = wallet?.accounts[0] || null;
        const currentNetwork = selectPreferredNetwork(currentAccount, storedNetworkId);
        return {
            wallet,
            currentWalletId: wallet?.id ?? null,
            currentAccount,
            currentNetwork,
        };
    };

    const persistWalletSelection = async (
        wallets: Wallet[],
        walletId: string | null
    ): Promise<void> => {
        await setStorage(STORAGE_KEYS.WALLETS, wallets);
        if (walletId) {
            await setStorage(STORAGE_KEYS.CURRENT_WALLET_ID, walletId);
        } else {
            await removeStorage(STORAGE_KEYS.CURRENT_WALLET_ID);
        }
    };

    return {
        isInitialized: null,
        isLocked: true,
        wallets: [],
        wallet: null,
        currentWalletId: null,
        currentAccount: null,
        currentNetwork: NETWORKS.ethereum,

        /**
         * Initialize wallet store on app start
         */
        initialize: async () => {
            try {
                const vaultExists = await hasVault();
                const storedWallets = await getStorage<Wallet[]>(STORAGE_KEYS.WALLETS);
                let wallets = storedWallets ?? [];
                if (!wallets.length) {
                    const legacyWallet = await getStorage<Wallet>(STORAGE_KEYS.WALLET);
                    if (legacyWallet) {
                        wallets = [legacyWallet];
                        await setStorage(STORAGE_KEYS.WALLETS, wallets);
                        await removeStorage(STORAGE_KEYS.WALLET);
                    }
                }

                const storedWalletId = await getStorage<string>(STORAGE_KEYS.CURRENT_WALLET_ID);
                const storedNetworkId = await getStorage<string>('currentNetwork');
                await removeStorage(LEGACY_UNLOCK_EXPIRES_AT_KEY);
                await removeSessionStorage(LEGACY_SESSION_PASSWORD_KEY);

                const { isUnlocked, expiresAt } = await fetchUnlockStatus();
                const hasActiveSession = !!vaultExists && isUnlocked;

                if (!vaultExists && isUnlocked) {
                    await clearUnlockSession();
                }

                const hasWallets = wallets.length > 0;
                const { wallet, currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                    wallets,
                    storedWalletId,
                    storedNetworkId
                );

                set({
                    isInitialized: vaultExists && hasWallets,
                    isLocked: vaultExists ? !hasActiveSession : false,
                    wallets,
                    wallet,
                    currentWalletId,
                    currentAccount,
                    currentNetwork,
                });

                if (hasActiveSession) {
                    scheduleAutoLock(expiresAt);
                }

                if (currentNetwork && storedNetworkId !== currentNetwork.id) {
                    setStorage('currentNetwork', currentNetwork.id);
                }

                if (wallets.length && storedWalletId !== currentWalletId) {
                    await setStorage(STORAGE_KEYS.CURRENT_WALLET_ID, currentWalletId);
                }
            } catch (error) {
                console.error('Failed to initialize wallet:', error);
                set({ isInitialized: false });
            }
        },

        /**
         * Create a new wallet
         */
        createNewWallet: async (password: string, mnemonic?: string) => {
            try {
                const wallet = await createWallet(password, mnemonic);
                const wallets = [...get().wallets, wallet];
                const { currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                    wallets,
                    wallet.id
                );

                await persistWalletSelection(wallets, currentWalletId);
                await setStorage('currentNetwork', currentNetwork.id);
                await startUnlockSession(password);

                set({
                    isInitialized: true,
                    isLocked: false,
                    wallets,
                    wallet,
                    currentWalletId,
                    currentAccount,
                    currentNetwork,
                });
            } catch (error) {
                console.error('Failed to create wallet:', error);
                throw error;
            }
        },

        /**
         * Import wallet from mnemonic
         */
        importWallet: async (password: string, mnemonic: string) => {
            try {
                const wallet = await importWalletFromMnemonic(password, mnemonic);
                const wallets = [...get().wallets, wallet];
                const { currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                    wallets,
                    wallet.id
                );

                await persistWalletSelection(wallets, currentWalletId);
                await setStorage('currentNetwork', currentNetwork.id);
                await startUnlockSession(password);

                set({
                    isInitialized: true,
                    isLocked: false,
                    wallets,
                    wallet,
                    currentWalletId,
                    currentAccount,
                    currentNetwork,
                });
            } catch (error) {
                console.error('Failed to import wallet:', error);
                throw error;
            }
        },

        /**
         * Import wallet from private key
         */
        importFromPrivateKey: async (password: string, privateKey: string, chainType: any) => {
            try {
                const wallet = await importWalletFromPrivateKey(password, privateKey, chainType);
                const wallets = [...get().wallets, wallet];
                const { currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                    wallets,
                    wallet.id
                );

                await persistWalletSelection(wallets, currentWalletId);
                await setStorage('currentNetwork', currentNetwork.id);
                await startUnlockSession(password);

                set({
                    isInitialized: true,
                    isLocked: false,
                    wallets,
                    wallet,
                    currentWalletId,
                    currentAccount,
                    currentNetwork,
                });
            } catch (error) {
                console.error('Failed to import from private key:', error);
                throw error;
            }
        },

        addWalletFromMnemonic: async (mnemonic: string) => {
            try {
                const password = await requireUnlockPassword();
                const wallet = await createWallet(password, mnemonic);
                const wallets = [...get().wallets, wallet];
                const { currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                    wallets,
                    wallet.id
                );

                await persistWalletSelection(wallets, currentWalletId);
                await setStorage('currentNetwork', currentNetwork.id);

                set({
                    isInitialized: true,
                    wallets,
                    wallet,
                    currentWalletId,
                    currentAccount,
                    currentNetwork,
                });
            } catch (error) {
                console.error('Failed to add wallet from mnemonic:', error);
                throw error;
            }
        },

        addWalletFromPrivateKey: async (privateKey: string, chainType: any) => {
            try {
                const password = await requireUnlockPassword();
                const wallet = await importWalletFromPrivateKey(password, privateKey, chainType);
                const wallets = [...get().wallets, wallet];
                const { currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                    wallets,
                    wallet.id
                );

                await persistWalletSelection(wallets, currentWalletId);
                await setStorage('currentNetwork', currentNetwork.id);

                set({
                    isInitialized: true,
                    wallets,
                    wallet,
                    currentWalletId,
                    currentAccount,
                    currentNetwork,
                });
            } catch (error) {
                console.error('Failed to add wallet from private key:', error);
                throw error;
            }
        },

        switchWallet: (walletId: string) => {
            const { wallets, currentNetwork: storedNetwork } = get();
            const { wallet, currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                wallets,
                walletId,
                storedNetwork?.id
            );

            if (!wallet) {
                return;
            }

            set({
                wallet,
                currentWalletId,
                currentAccount,
                currentNetwork,
            });

            void persistWalletSelection(wallets, currentWalletId);
            void setStorage('currentNetwork', currentNetwork.id);
        },

        exportMnemonic: async () => {
            const { wallet } = get();
            if (!wallet) return null;

            const password = await requireUnlockPassword();
            const vault = await loadVault(password);
            if (!vault) return null;

            const mappedMnemonic = vault.wallets?.[wallet.id]?.mnemonic;
            if (mappedMnemonic) {
                return mappedMnemonic;
            }

            return vault.mnemonic ?? null;
        },

        exportPrivateKey: async (chainType: ChainType) => {
            const { currentAccount } = get();
            if (!currentAccount) {
                throw new Error('No account selected');
            }

            const password = await requireUnlockPassword();
            const { getPrivateKey } = await import('@core/wallet');
            return getPrivateKey(password, currentAccount.id, chainType, currentAccount.index);
        },

        deleteWallet: async (walletId?: string) => {
            const { wallets, wallet: currentWallet, currentNetwork: storedNetwork } = get();
            const targetId = walletId ?? currentWallet?.id;
            if (!targetId) return;

            const targetWallet = wallets.find((item) => item.id === targetId);
            if (!targetWallet) return;

            const password = await requireUnlockPassword();
            const vault = await loadVault(password);
            if (!vault) {
                throw new Error('Vault not found');
            }

            const nextVault = {
                ...vault,
                version: vault.version || 2,
                wallets: { ...(vault.wallets ?? {}) },
                accountWalletIds: { ...(vault.accountWalletIds ?? {}) },
                privateKeys: vault.privateKeys ? { ...vault.privateKeys } : undefined,
            };

            if (nextVault.wallets && nextVault.wallets[targetId]) {
                delete nextVault.wallets[targetId];
            } else if (nextVault.mnemonic) {
                delete nextVault.mnemonic;
            }

            targetWallet.accounts.forEach((account) => {
                if (nextVault.accountWalletIds) {
                    delete nextVault.accountWalletIds[account.id];
                }
                if (nextVault.privateKeys) {
                    delete nextVault.privateKeys[account.id];
                }
            });

            const remainingWallets = wallets.filter((item) => item.id !== targetId);

            if (!remainingWallets.length) {
                await deleteVault();
                await persistWalletSelection([], null);
                await removeStorage('currentNetwork');
                set({
                    isInitialized: false,
                    isLocked: true,
                    wallet: null,
                    wallets: [],
                    currentWalletId: null,
                    currentAccount: null,
                    currentNetwork: NETWORKS.ethereum,
                });
                void clearUnlockSession();
                return;
            }

            const { wallet, currentAccount, currentNetwork, currentWalletId } = resolveWalletState(
                remainingWallets,
                remainingWallets[0]?.id ?? null,
                storedNetwork?.id
            );

            await saveVault(nextVault, password);
            await persistWalletSelection(remainingWallets, currentWalletId);
            await setStorage('currentNetwork', currentNetwork.id);

            set({
                wallets: remainingWallets,
                wallet,
                currentWalletId,
                currentAccount,
                currentNetwork,
            });
        },

        /**
         * Unlock wallet with password
         */
        unlock: async (password: string): Promise<boolean> => {
            try {
                // Verify password by attempting to load vault
                const vault = await loadVault(password);

                if (!vault) {
                    return false;
                }

                await startUnlockSession(password);

                set({
                    isLocked: false,
                });

                return true;
            } catch (error) {
                console.error('Failed to unlock wallet:', error);
                return false;
            }
        },

        /**
         * Lock wallet
         */
        lock: () => {
            void clearUnlockSession();

            set({
                isLocked: true,
            });
        },

        /**
         * Switch to a different account
         */
        switchAccount: (accountId: string) => {
            const { wallet } = get();
            if (!wallet) return;

            const account = wallet.accounts.find((acc) => acc.id === accountId);
            if (account) {
                set({ currentAccount: account });
            }
        },

        /**
         * Switch to a different network
         */
        switchNetwork: (networkId: string) => {
            const { currentAccount } = get();
            if (!isNetworkSupported(currentAccount, networkId)) {
                return;
            }

            const network = NETWORKS[networkId];
            if (network) {
                set({ currentNetwork: network });
                setStorage('currentNetwork', networkId);
            }
        },

        /**
         * Add a new account to the wallet
         */
        addAccount: async () => {
            const { wallet } = get();
            if (!wallet) {
                throw new Error('Wallet not unlocked');
            }

            try {
                const password = await requireUnlockPassword();
                const vault = await loadVault(password);
                if (!vault) {
                    throw new Error('Vault not found');
                }

                const mnemonic = vault.wallets?.[wallet.id]?.mnemonic ?? vault.mnemonic;
                if (!mnemonic) {
                    throw new Error('Cannot add account to imported private key wallet');
                }

                const { createAccount } = await import('@core/wallet');
                const newAccount = await createAccount(mnemonic, wallet.accounts.length);

                const updatedWallet = {
                    ...wallet,
                    accounts: [...wallet.accounts, newAccount],
                };

                const wallets = get().wallets.map((item) =>
                    item.id === wallet.id ? updatedWallet : item
                );

                vault.wallets = vault.wallets ?? {};
                if (!vault.wallets[wallet.id] && mnemonic) {
                    vault.wallets[wallet.id] = { mnemonic };
                }
                vault.accountWalletIds = { ...(vault.accountWalletIds ?? {}) };
                vault.accountWalletIds[newAccount.id] = wallet.id;
                vault.version = vault.version || 2;

                await saveVault(vault, password);
                await persistWalletSelection(wallets, wallet.id);

                set({
                    wallets,
                    wallet: updatedWallet,
                    currentAccount: newAccount,
                });
            } catch (error) {
                console.error('Failed to add account:', error);
                throw error;
            }
        },
    };
});
