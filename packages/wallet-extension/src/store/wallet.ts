import { create } from 'zustand';
import type { Wallet, Account, Network } from '../types';
import { STORAGE_KEYS } from '../types';
import { hasVault, loadVault, resetAutoLockTimer, clearAutoLockTimer, getStorage, setStorage } from '@core/storage';
import { createWallet, importWalletFromMnemonic, importWalletFromPrivateKey } from '@core/wallet';
import { NETWORKS } from '@core/networks';

interface WalletState {
    // Initialization state
    isInitialized: boolean | null;
    isLocked: boolean;

    // Wallet data
    wallet: Wallet | null;
    currentAccount: Account | null;
    currentNetwork: Network;

    // Temporary data (not persisted)
    password: string | null; // Kept in memory while unlocked

    // Actions
    initialize: () => Promise<void>;
    createNewWallet: (password: string, mnemonic?: string) => Promise<void>;
    importWallet: (password: string, mnemonic: string) => Promise<void>;
    importFromPrivateKey: (password: string, privateKey: string, chainType: any) => Promise<void>;
    unlock: (password: string) => Promise<boolean>;
    lock: () => void;
    switchAccount: (accountId: string) => void;
    switchNetwork: (networkId: string) => void;
    addAccount: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
    isInitialized: null,
    isLocked: true,
    wallet: null,
    currentAccount: null,
    currentNetwork: NETWORKS.ethereum,
    password: null,

    /**
     * Initialize wallet store on app start
     */
    initialize: async () => {
        try {
            const vaultExists = await hasVault();
            const storedWallet = await getStorage<Wallet>(STORAGE_KEYS.WALLET);
            const storedNetworkId = await getStorage<string>('currentNetwork');

            set({
                isInitialized: vaultExists,
                isLocked: vaultExists,
                wallet: storedWallet,
                currentAccount: storedWallet?.accounts[0] || null,
                currentNetwork: storedNetworkId ? NETWORKS[storedNetworkId] : NETWORKS.ethereum,
            });
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

            await setStorage(STORAGE_KEYS.WALLET, wallet);

            set({
                isInitialized: true,
                isLocked: false,
                wallet,
                currentAccount: wallet.accounts[0],
                password,
            });

            // Start auto-lock timer
            resetAutoLockTimer(() => get().lock());
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

            await setStorage(STORAGE_KEYS.WALLET, wallet);

            set({
                isInitialized: true,
                isLocked: false,
                wallet,
                currentAccount: wallet.accounts[0],
                password,
            });

            resetAutoLockTimer(() => get().lock());
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

            await setStorage(STORAGE_KEYS.WALLET, wallet);

            set({
                isInitialized: true,
                isLocked: false,
                wallet,
                currentAccount: wallet.accounts[0],
                password,
            });

            resetAutoLockTimer(() => get().lock());
        } catch (error) {
            console.error('Failed to import from private key:', error);
            throw error;
        }
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

            set({
                isLocked: false,
                password,
            });

            // Start auto-lock timer
            resetAutoLockTimer(() => get().lock());

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
        clearAutoLockTimer();

        set({
            isLocked: true,
            password: null, // Clear password from memory
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
        const { wallet, password } = get();
        if (!wallet || !password) {
            throw new Error('Wallet not unlocked');
        }

        try {
            const vault = await loadVault(password);
            if (!vault || !vault.mnemonic) {
                throw new Error('Cannot add account to imported private key wallet');
            }

            const { createAccount } = await import('@core/wallet');
            const newAccount = await createAccount(vault.mnemonic, wallet.accounts.length);

            const updatedWallet = {
                ...wallet,
                accounts: [...wallet.accounts, newAccount],
            };

            await setStorage(STORAGE_KEYS.WALLET, updatedWallet);

            set({
                wallet: updatedWallet,
                currentAccount: newAccount,
            });
        } catch (error) {
            console.error('Failed to add account:', error);
            throw error;
        }
    },
}));
