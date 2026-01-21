/**
 * Supported blockchain networks
 */
export enum ChainType {
    EVM = 'evm',
    BITCOIN = 'bitcoin',
    SOLANA = 'solana',
    APTOS = 'aptos',
    SUI = 'sui',
    TRON = 'tron',
    TON = 'ton',
    NEAR = 'near',
    FILECOIN = 'filecoin',
}

/**
 * Network configuration
 */
export interface Network {
    id: string;
    name: string;
    chainType: ChainType;
    chainId?: number | string;
    rpcUrl: string;
    explorerUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    icon: string;
    isTestnet?: boolean;
}

/**
 * Account structure
 */
export interface Account {
    id: string;
    name: string;
    addresses: Record<ChainType, string>;
    derivationPath: string;
    index: number;
}

/**
 * Wallet structure
 */
export interface Wallet {
    id: string;
    type: 'mnemonic' | 'privateKey' | 'hardware' | 'watch';
    accounts: Account[];
    createdAt: number;
}

/**
 * Encrypted vault structure
 */
export interface EncryptedVault {
    data: string; // Encrypted JSON
    iv: string;
    salt: string;
}

/**
 * Decrypted vault data
 */
export interface VaultData {
    mnemonic?: string;
    privateKeys?: Record<string, string>; // accountId -> privateKey
    wallets?: Record<string, {
        mnemonic?: string;
        privateKeys?: Record<string, string>;
    }>;
    accountWalletIds?: Record<string, string>;
    version: number;
}

/**
 * App settings
 */
export type ThemeMode = 'dark' | 'light';
export type LanguageCode = 'en' | 'ko' | 'ja' | 'zh';

export interface AppSettings {
    theme: ThemeMode;
    language: LanguageCode;
    autoLockMinutes: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
    language: 'en',
    autoLockMinutes: 10,
};

/**
 * Token information
 */
export interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string;
    balanceFormatted: string;
    priceUSD?: number;
    valueUSD?: number;
    chainType: ChainType;
    networkId: string;
    logoURI?: string;
    isNative?: boolean;
}

/**
 * NFT information
 */
export interface NFT {
    id: string;
    contractAddress: string;
    tokenId: string;
    name: string;
    description?: string;
    image?: string;
    animation?: string;
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
    chainType: ChainType;
    networkId: string;
    standard: 'ERC721' | 'ERC1155' | 'SPL' | 'Ordinals';
}

/**
 * Transaction structure
 */
export interface Transaction {
    id: string;
    hash?: string;
    from: string;
    to: string;
    value: string;
    data?: string;
    chainType: ChainType;
    networkId: string;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    gasUsed?: string;
    gasPrice?: string;
    nonce?: number;
}

/**
 * DApp connection request
 */
export interface DAppConnection {
    origin: string;
    favicon?: string;
    name?: string;
    connectedAccounts: string[];
    permissions: string[];
    connectedAt: number;
}

/**
 * Transaction request from DApp
 */
export interface TransactionRequest {
    from: string;
    to?: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
    chainId?: number | string;
}

/**
 * Message signing request
 */
export interface SignMessageRequest {
    message: string;
    type: 'personal_sign' | 'eth_sign' | 'signTypedData' | 'signTypedData_v4';
    account: string;
    origin: string;
}

/**
 * Swap quote
 */
export interface SwapQuote {
    fromToken: Token;
    toToken: Token;
    fromAmount: string;
    toAmount: string;
    rate: string;
    priceImpact: number;
    gasEstimate: string;
    route: Array<{
        protocol: string;
        percentage: number;
    }>;
    aggregator: string;
}

/**
 * Gas fee estimation
 */
export interface GasFee {
    low: {
        maxFeePerGas: string;
        maxPriorityFeePerGas: string;
        estimatedTime: number; // seconds
    };
    medium: {
        maxFeePerGas: string;
        maxPriorityFeePerGas: string;
        estimatedTime: number;
    };
    high: {
        maxFeePerGas: string;
        maxPriorityFeePerGas: string;
        estimatedTime: number;
    };
}

/**
 * Bitcoin UTXO
 */
export interface UTXO {
    txid: string;
    vout: number;
    value: number;
    script: string;
    address: string;
    hasInscription?: boolean;
    inscriptionId?: string;
}

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
    VAULT: 'vault',
    WALLET: 'wallet',
    WALLETS: 'wallets',
    CURRENT_WALLET_ID: 'current_wallet_id',
    SETTINGS: 'settings',
    NETWORKS: 'networks',
    TOKENS: 'tokens',
    DAPP_CONNECTIONS: 'dapp_connections',
    TRANSACTION_HISTORY: 'transaction_history',
} as const;

/**
 * Message types for background communication
 */
export enum MessageType {
    // Wallet operations
    CREATE_WALLET = 'CREATE_WALLET',
    IMPORT_WALLET = 'IMPORT_WALLET',
    UNLOCK_WALLET = 'UNLOCK_WALLET',
    LOCK_WALLET = 'LOCK_WALLET',
    GET_UNLOCK_STATUS = 'GET_UNLOCK_STATUS',
    GET_UNLOCK_PASSWORD = 'GET_UNLOCK_PASSWORD',

    // Account operations
    CREATE_ACCOUNT = 'CREATE_ACCOUNT',
    SWITCH_ACCOUNT = 'SWITCH_ACCOUNT',

    // Transaction operations
    SEND_TRANSACTION = 'SEND_TRANSACTION',
    SIGN_MESSAGE = 'SIGN_MESSAGE',
    ESTIMATE_GAS = 'ESTIMATE_GAS',

    // DApp operations
    CONNECT_DAPP = 'CONNECT_DAPP',
    DISCONNECT_DAPP = 'DISCONNECT_DAPP',
    REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS',

    // Network operations
    SWITCH_NETWORK = 'SWITCH_NETWORK',
    ADD_NETWORK = 'ADD_NETWORK',
}

/**
 * Message structure for background communication
 */
export interface Message<T = any> {
    type: MessageType;
    payload: T;
    id?: string;
}

/**
 * Response structure
 */
export interface Response<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    id?: string;
}
