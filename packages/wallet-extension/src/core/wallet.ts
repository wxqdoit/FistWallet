/**
 * Wallet management layer for FistWallet extension
 * This module orchestrates wallet-core functions and manages encrypted storage
 * All cryptographic operations are delegated to wallet-core
 */

import { v4 as uuidv4 } from 'uuid';
import type { Wallet, Account, VaultData } from '../types';
import { ChainType } from '../types';
import { saveVault, loadVault } from './storage';
import { DERIVATION_PATHS } from './networks';

// Import wallet-core - all wallet operations use this
import { EVM, BTC, Solana, Aptos, Sui, Tron, Ton, Near, Filecoin } from 'wallet-core';

/**
 * Generate a mnemonic phrase using wallet-core
 */
export function generateMnemonic(wordCount: 12 | 24 = 12): string {
    const length = wordCount === 12 ? 128 : 256;
    const wallet = EVM.createWallet({ length });
    return wallet.mnemonic;
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
    try {
        // Try to derive a key - if it works, mnemonic is valid
        EVM.getPrivateKeyByMnemonic(mnemonic.trim(), "m/44'/60'/0'/0/0");
        return true;
    } catch {
        return false;
    }
}


/**
 * Chain-specific helper to get the correct wallet-core module
 */
function getChainModule(chainType: ChainType) {
    const modules = {
        [ChainType.EVM]: EVM,
        [ChainType.BITCOIN]: BTC,
        [ChainType.SOLANA]: Solana,
        [ChainType.APTOS]: Aptos,
        [ChainType.SUI]: Sui,
        [ChainType.TRON]: Tron,
        [ChainType.TON]: Ton,
        [ChainType.NEAR]: Near,
        [ChainType.FILECOIN]: Filecoin,
    };

    const module = modules[chainType];
    if (!module) {
        throw new Error(`Unsupported chain type: ${chainType}`);
    }

    return module;
}

function buildEd25519DerivationPath(chainType: ChainType, accountIndex: number): string {
    const basePath = DERIVATION_PATHS[chainType.toLowerCase() as keyof typeof DERIVATION_PATHS];
    const segments = basePath.split('/');

    if (segments.length < 4) {
        return basePath;
    }

    segments[3] = `${accountIndex}'`;
    return segments.join('/');
}

function normalizeVaultData(vault: VaultData | null): VaultData {
    if (!vault) {
        return {
            version: 2,
            wallets: {},
            accountWalletIds: {},
        };
    }

    return {
        ...vault,
        version: vault.version || 2,
        wallets: vault.wallets ?? {},
        accountWalletIds: vault.accountWalletIds ?? {},
    };
}

function hasPrivateKey(vault: VaultData | null, privateKey: string): boolean {
    if (!vault) {
        return false;
    }

    if (vault.privateKeys && Object.values(vault.privateKeys).includes(privateKey)) {
        return true;
    }

    const walletEntries = vault.wallets ? Object.values(vault.wallets) : [];
    return walletEntries.some((entry) => {
        if (!entry?.privateKeys) {
            return false;
        }
        return Object.values(entry.privateKeys).includes(privateKey);
    });
}

function attachWalletToVault(
    vault: VaultData | null,
    wallet: Wallet,
    data: { mnemonic?: string; privateKey?: string }
): VaultData {
    const nextVault = normalizeVaultData(vault);
    const existingWalletEntry = nextVault.wallets?.[wallet.id];
    const walletEntry = existingWalletEntry ?? {};

    if (data.mnemonic) {
        walletEntry.mnemonic = data.mnemonic;
    }

    if (data.privateKey) {
        walletEntry.privateKeys = {
            ...(walletEntry.privateKeys ?? {}),
            [wallet.accounts[0].id]: data.privateKey,
        };
    }

    nextVault.wallets = {
        ...(nextVault.wallets ?? {}),
        [wallet.id]: walletEntry,
    };

    const accountWalletIds = { ...(nextVault.accountWalletIds ?? {}) };
    wallet.accounts.forEach((account) => {
        accountWalletIds[account.id] = wallet.id;
    });
    nextVault.accountWalletIds = accountWalletIds;

    return nextVault;
}

function getAddressFromPrivateKey(chainType: ChainType, privateKey: string): string {
    const module = getChainModule(chainType);

    if (chainType === ChainType.BITCOIN) {
        return BTC.getAddressByPrivateKey(privateKey, 'p2wpkh');
    }

    if (chainType === ChainType.FILECOIN) {
        return Filecoin.getAddressByPrivateKey(privateKey, 'secp256k1');
    }

    return module.getAddressByPrivateKey(privateKey as any);
}

/**
 * Derive address for a specific chain from mnemonic
 * Uses wallet-core's getPrivateKeyByMnemonic + getAddressByPrivateKey
 */
export async function deriveAddress(
    mnemonic: string,
    chainType: ChainType,
    accountIndex: number = 0
): Promise<string> {
    const module = getChainModule(chainType);
    let derivationPath: string;

    // Build derivation path based on chain type
    switch (chainType) {
        case ChainType.EVM:
        case ChainType.BITCOIN:
        case ChainType.TRON:
            derivationPath = `${DERIVATION_PATHS[chainType.toLowerCase() as keyof typeof DERIVATION_PATHS]}/${accountIndex}`;
            break;
        case ChainType.SOLANA:
        case ChainType.APTOS:
        case ChainType.SUI:
        case ChainType.TON:
        case ChainType.NEAR:
        case ChainType.FILECOIN:
            derivationPath = buildEd25519DerivationPath(chainType, accountIndex);
            break;
        default:
            throw new Error(`Unsupported chain type: ${chainType}`);
    }

    // Use wallet-core to derive private key from mnemonic
    const keys = module.getPrivateKeyByMnemonic(mnemonic, derivationPath);

    // Handle different return types from wallet-core
    let privateKey: string;
    if (typeof keys === 'object' && 'privateKey' in keys) {
        // Most chains return { privateKey, publicKey }
        privateKey = keys.privateKey;
    } else {
        // Some chains return string directly (now including Solana)
        privateKey = keys as string;
    }

    // Use wallet-core to get address from private key
    if (chainType === ChainType.BITCOIN) {
        return BTC.getAddressByPrivateKey(privateKey, 'p2wpkh');
    } else if (chainType === ChainType.FILECOIN) {
        return Filecoin.getAddressByPrivateKey(privateKey, 'secp256k1');
    } else {
        return module.getAddressByPrivateKey(privateKey as any);
    }
}

/**
 * Derive all supported addresses from a private key
 */
export async function deriveAddressesFromPrivateKey(
    privateKey: string
): Promise<Record<ChainType, string>> {
    const chainTypes: ChainType[] = [
        ChainType.EVM,
        ChainType.BITCOIN,
        ChainType.SOLANA,
        ChainType.APTOS,
        ChainType.SUI,
        ChainType.TRON,
        ChainType.TON,
        ChainType.NEAR,
        ChainType.FILECOIN,
    ];

    const addresses = {} as Record<ChainType, string>;

    for (const chainType of chainTypes) {
        try {
            addresses[chainType] = getAddressFromPrivateKey(chainType, privateKey);
        } catch (error) {
            console.error(`Failed to derive ${chainType} address from private key:`, error);
            addresses[chainType] = '';
        }
    }

    return addresses;
}

/**
 * Derive all addresses for all supported chains
 */
export async function deriveAllAddresses(
    mnemonic: string,
    accountIndex: number = 0
): Promise<Record<ChainType, string>> {
    const chainTypes: ChainType[] = [
        ChainType.EVM,
        ChainType.BITCOIN,
        ChainType.SOLANA,
        ChainType.APTOS,
        ChainType.SUI,
        ChainType.TRON,
        ChainType.TON,
        ChainType.NEAR,
        ChainType.FILECOIN,
    ];

    const addresses: Partial<Record<ChainType, string>> = {};

    for (const chainType of chainTypes) {
        try {
            addresses[chainType] = await deriveAddress(mnemonic, chainType, accountIndex);
        } catch (error) {
            console.error(`Failed to derive ${chainType} address:`, error);
            addresses[chainType] = '';
        }
    }

    return addresses as Record<ChainType, string>;
}

/**
 * Create a new wallet
 * Uses wallet-core's createWallet to generate mnemonic
 */
export async function createWallet(password: string, mnemonic?: string): Promise<Wallet> {
    let mnemonicPhrase: string;

    if (mnemonic) {
        // Validate provided mnemonic using wallet-core
        try {
            EVM.getPrivateKeyByMnemonic(mnemonic, "m/44'/60'/0'/0/0");
            mnemonicPhrase = mnemonic;
        } catch {
            throw new Error('Invalid mnemonic phrase');
        }
    } else {
        // Generate new mnemonic using wallet-core's createWallet
        const newWallet = EVM.createWallet({ length: 128 }); // 12 words
        mnemonicPhrase = newWallet.mnemonic;
    }

    // Create first account
    const account = await createAccount(mnemonicPhrase, 0);

    const wallet: Wallet = {
        id: uuidv4(),
        type: 'mnemonic',
        accounts: [account],
        createdAt: Date.now(),
    };

    const existingVault = await loadVault(password);
    const nextVault = attachWalletToVault(existingVault, wallet, { mnemonic: mnemonicPhrase });
    nextVault.version = 2;

    await saveVault(nextVault, password);

    return wallet;
}

/**
 * Create a new account from existing wallet
 */
export async function createAccount(
    mnemonic: string,
    accountIndex: number
): Promise<Account> {
    const addresses = await deriveAllAddresses(mnemonic, accountIndex);

    return {
        id: uuidv4(),
        name: `Account ${accountIndex + 1}`,
        addresses,
        derivationPath: `m/44'/.../${accountIndex}`,
        index: accountIndex,
    };
}

/**
 * Import wallet from mnemonic
 */
export async function importWalletFromMnemonic(
    password: string,
    mnemonic: string
): Promise<Wallet> {
    return createWallet(password, mnemonic);
}

/**
 * Import wallet from private key
 * Uses wallet-core's getAddressByPrivateKey
 */
export async function importWalletFromPrivateKey(
    password: string,
    privateKey: string,
    chainType: ChainType
): Promise<Wallet> {
    const existingVault = await loadVault(password);
    if (hasPrivateKey(existingVault, privateKey)) {
        throw new Error('Private key already imported');
    }

    // Validate private key against the selected chain type
    const address = getAddressFromPrivateKey(chainType, privateKey);
    const addresses = await deriveAddressesFromPrivateKey(privateKey);
    addresses[chainType] = address;

    const account: Account = {
        id: uuidv4(),
        name: 'Imported Account',
        addresses,
        derivationPath: 'imported',
        index: 0,
    };

    const wallet: Wallet = {
        id: uuidv4(),
        type: 'privateKey',
        accounts: [account],
        createdAt: Date.now(),
    };

    const nextVault = attachWalletToVault(existingVault, wallet, { privateKey });
    nextVault.version = 2;

    await saveVault(nextVault, password);

    return wallet;
}

/**
 * Get private key for an account
 * Uses wallet-core's getPrivateKeyByMnemonic
 */
export async function getPrivateKey(
    password: string,
    accountId: string,
    chainType: ChainType,
    accountIndex: number = 0
): Promise<string> {
    const vault = await loadVault(password);

    if (!vault) {
        throw new Error('Vault not found');
    }

    const mappedWalletId = vault.accountWalletIds?.[accountId];
    if (mappedWalletId && vault.wallets?.[mappedWalletId]) {
        const walletEntry = vault.wallets[mappedWalletId];
        if (walletEntry.privateKeys && walletEntry.privateKeys[accountId]) {
            return walletEntry.privateKeys[accountId];
        }

        if (walletEntry.mnemonic) {
            const module = getChainModule(chainType);
            const derivationPath = ((): string => {
                switch (chainType) {
                    case ChainType.EVM:
                    case ChainType.BITCOIN:
                    case ChainType.TRON:
                        return `${DERIVATION_PATHS[chainType.toLowerCase() as keyof typeof DERIVATION_PATHS]}/${accountIndex}`;
                    case ChainType.SOLANA:
                    case ChainType.APTOS:
                    case ChainType.SUI:
                    case ChainType.TON:
                    case ChainType.NEAR:
                    case ChainType.FILECOIN:
                        return buildEd25519DerivationPath(chainType, accountIndex);
                    default:
                        throw new Error(`Unsupported chain type: ${chainType}`);
                }
            })();

            const keys = module.getPrivateKeyByMnemonic(walletEntry.mnemonic, derivationPath);
            if (typeof keys === 'object' && 'privateKey' in keys) {
                return keys.privateKey;
            }
            return keys as string;
        }
    }

    // If wallet was imported with private key
    if (vault.privateKeys && vault.privateKeys[accountId]) {
        return vault.privateKeys[accountId];
    }

    // If wallet was created with mnemonic, derive private key using wallet-core
    if (vault.mnemonic) {
        const module = getChainModule(chainType);
        let derivationPath: string;

        // Build derivation path
        switch (chainType) {
            case ChainType.EVM:
            case ChainType.BITCOIN:
            case ChainType.TRON:
                derivationPath = `${DERIVATION_PATHS[chainType.toLowerCase() as keyof typeof DERIVATION_PATHS]}/${accountIndex}`;
                break;
            case ChainType.SOLANA:
            case ChainType.APTOS:
            case ChainType.SUI:
            case ChainType.TON:
            case ChainType.NEAR:
            case ChainType.FILECOIN:
                derivationPath = buildEd25519DerivationPath(chainType, accountIndex);
                break;
            default:
                throw new Error(`Unsupported chain type: ${chainType}`);
        }

        // Use wallet-core to derive private key
        const keys = module.getPrivateKeyByMnemonic(vault.mnemonic, derivationPath);

        // Handle different return types
        if (typeof keys === 'object' && 'privateKey' in keys) {
            return keys.privateKey;
        } else {
            return keys as string;
        }
    }

    throw new Error('Unable to retrieve private key');
}

/**
 * Sign a transaction using wallet-core
 */
export async function signTransaction(
    password: string,
    accountId: string,
    chainType: ChainType,
    accountIndex: number,
    transaction: any
): Promise<string> {
    const privateKey = await getPrivateKey(password, accountId, chainType, accountIndex);

    // Use wallet-core's signTransaction
    // Bitcoin signTransaction requires additional inputIndex parameter
    if (chainType === ChainType.BITCOIN) {
        return BTC.signTransaction(privateKey, transaction, transaction.inputIndex || 0);
    }

    // For other chains, use the generic signTransaction
    const module = getChainModule(chainType) as {
        signTransaction: (privateKey: string, transaction: any) => string;
    };
    return module.signTransaction(privateKey, transaction);
}

/**
 * Sign a message using wallet-core
 */
export async function signMessage(
    password: string,
    accountId: string,
    chainType: ChainType,
    accountIndex: number,
    message: string
): Promise<string> {
    const privateKey = await getPrivateKey(password, accountId, chainType, accountIndex);
    const module = getChainModule(chainType);

    // Use wallet-core's signMessage
    return module.signMessage(privateKey, message);
}
