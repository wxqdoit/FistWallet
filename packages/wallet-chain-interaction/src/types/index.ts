/**
 * Chain Interaction Types
 * Unified types for all blockchain RPC interactions
 */

// ==================== Configuration Types ====================

/**
 * Chain configuration for provider initialization
 */
export interface ChainConfig {
    /** RPC endpoint URL */
    rpcUrl: string;
    /** Chain ID (number for EVM, string for others) */
    chainId?: number | string;
    /** Optional API key for authenticated endpoints */
    apiKey?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
}

// ==================== Balance Types ====================

/**
 * Native token balance (ETH, SOL, BTC, etc.)
 */
export interface NativeBalance {
    /** Balance in smallest unit (wei, lamports, satoshi) as string */
    balance: string;
    /** Token decimals */
    decimals: number;
    /** Token symbol */
    symbol: string;
    /** Human-readable formatted balance */
    formatted: string;
}

/**
 * Token balance (ERC20, SPL, TRC20, etc.)
 */
export interface TokenBalance {
    /** Balance in smallest unit as string */
    balance: string;
    /** Token decimals */
    decimals: number;
    /** Token symbol */
    symbol: string;
    /** Token contract/mint address */
    address: string;
    /** Token name */
    name?: string;
    /** Human-readable formatted balance */
    formatted: string;
}

// ==================== Transaction Types ====================

/**
 * Transaction parameters for sending
 */
export interface TransactionParams {
    /** Recipient address */
    to: string;
    /** Value to send (in smallest unit) */
    value: string;
    /** Transaction data (hex for EVM, instruction data for others) */
    data?: string;
    /** Gas limit/compute units (optional, will be estimated if not provided) */
    gasLimit?: string;
    /** Gas price/fee settings (chain-specific) */
    gasPrice?: string;
    /** For EIP-1559 transactions */
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    /** Nonce (optional, will be fetched if not provided) */
    nonce?: number;
}

/**
 * Token transfer parameters
 */
export interface TokenTransferParams {
    /** Token contract/mint address */
    tokenAddress: string;
    /** Recipient address */
    to: string;
    /** Amount to transfer (in smallest unit) */
    amount: string;
    /** Token decimals (required for some chains) */
    decimals?: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
    /** Transaction hash/signature */
    hash: string;
    /** Transaction status */
    status: 'pending' | 'confirmed' | 'failed';
    /** Block number (if confirmed) */
    blockNumber?: number;
    /** Gas used */
    gasUsed?: string;
    /** Effective gas price */
    effectiveGasPrice?: string;
    /** Error message (if failed) */
    error?: string;
}

/**
 * Transaction simulation result
 */
export interface SimulationResult {
    /** Whether simulation succeeded */
    success: boolean;
    /** Estimated gas/compute units */
    gasEstimate?: string;
    /** Return value (if any) */
    returnValue?: string;
    /** Error message (if failed) */
    error?: string;
    /** State changes preview (chain-specific) */
    stateChanges?: Record<string, unknown>;
}

/**
 * Gas estimation result
 */
export interface GasEstimate {
    /** Estimated gas units */
    gasLimit: string;
    /** Current gas price */
    gasPrice: string;
    /** For EIP-1559 */
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    /** Estimated total cost in native token */
    totalCost: string;
}

// ==================== Block & Chain State Types ====================

/**
 * Block information
 */
export interface BlockInfo {
    /** Block number/height */
    number: number;
    /** Block hash */
    hash: string;
    /** Block timestamp (unix seconds) */
    timestamp: number;
    /** Number of transactions */
    transactionCount: number;
}

/**
 * Chain information
 */
export interface ChainInfo {
    /** Chain ID */
    chainId: string | number;
    /** Chain name */
    name: string;
    /** Native token symbol */
    nativeSymbol: string;
    /** Native token decimals */
    nativeDecimals: number;
    /** Current block number */
    blockNumber: number;
}

// ==================== Account Types ====================

/**
 * Account information
 */
export interface AccountInfo {
    /** Account address */
    address: string;
    /** Account balance */
    balance: NativeBalance;
    /** Transaction count/nonce */
    nonce: number;
    /** Whether account is a contract (EVM) */
    isContract?: boolean;
}

// ==================== Event/Log Types ====================

/**
 * Event filter for querying logs
 */
export interface EventFilter {
    /** Contract address(es) to filter */
    address?: string | string[];
    /** Event topics */
    topics?: (string | string[] | null)[];
    /** Start block */
    fromBlock?: number | 'latest' | 'earliest';
    /** End block */
    toBlock?: number | 'latest' | 'earliest';
}

/**
 * Event log entry
 */
export interface EventLog {
    /** Contract address */
    address: string;
    /** Log topics */
    topics: string[];
    /** Log data */
    data: string;
    /** Block number */
    blockNumber: number;
    /** Transaction hash */
    transactionHash: string;
    /** Log index in block */
    logIndex: number;
}

// ==================== Error Types ====================

/**
 * Chain interaction error codes
 */
export enum ChainErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_ADDRESS = 'INVALID_ADDRESS',
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
    INVALID_TRANSACTION = 'INVALID_TRANSACTION',
    TRANSACTION_FAILED = 'TRANSACTION_FAILED',
    TIMEOUT = 'TIMEOUT',
    RATE_LIMITED = 'RATE_LIMITED',
    UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
    UNKNOWN = 'UNKNOWN',
}

/**
 * Chain interaction error
 */
export class ChainError extends Error {
    code: ChainErrorCode;
    details?: unknown;

    constructor(code: ChainErrorCode, message: string, details?: unknown) {
        super(message);
        this.name = 'ChainError';
        this.code = code;
        this.details = details;
    }
}

// ==================== Utility Types ====================

/**
 * Hex string type (with 0x prefix)
 */
export type HexString = `0x${string}`;

/**
 * Address type (chain-specific format)
 */
export type Address = string;

/**
 * Supported chain types
 */
export const ChainType = {
    EVM: 'evm',
    SOLANA: 'solana',
    BITCOIN: 'bitcoin',
    TRON: 'tron',
    TON: 'ton',
    APTOS: 'aptos',
    SUI: 'sui',
    NEAR: 'near',
    FILECOIN: 'filecoin',
} as const;

export type ChainType = (typeof ChainType)[keyof typeof ChainType];

/**
 * Fee Tiers for EIP-1559 Dynamic Gas Estimation
 */
export interface FeeTier {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    estimatedTimeMs?: number;
}

export interface FeeTiersEstimate {
    slow: FeeTier;
    standard: FeeTier;
    fast: FeeTier;
    baseFeePerGas: string;
}

/**
 * Parsed Token Account for Solana SPL Tokens
 */
export interface ParsedTokenAccount {
    pubkey: string;
    mint: string;
    amount: string;
    decimals: number;
    formatted: string;
}

/**
 * Detailed transaction receipt with logs and execution status
 */
export interface DetailedTransactionReceipt {
    hash: string;
    status: 'success' | 'reverted' | 'pending';
    blockNumber: number;
    blockHash: string;
    gasUsed: string;
    effectiveGasPrice: string;
    from: string;
    to?: string;
    contractAddress?: string;
    cumulativeGasUsed: string;
    logs: Array<{
        address: string;
        topics: string[];
        data: string;
    }>;
}

/**
 * Result for batch token balance queries
 */
export interface BatchTokenBalanceResult {
    tokenAddress: string;
    balance: string;
    rawBalance: string;
    decimals: number;
    symbol: string;
}

/**
 * Parameters for token approvals
 */
export interface ApproveTokenParams {
    tokenAddress: string;
    spender: string;
    amount: string | bigint;
}

/**
 * NFT Metadata and Collection Details
 */
export interface NFTMetadata {
    name: string;
    description?: string;
    image: string;
    animationUrl?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
    tokenId: string;
    contractAddress: string;
    standard: 'ERC721' | 'ERC1155' | 'Metaplex';
}

/**
 * Parameters for DEX Swap Quoting & Simulation
 */
export interface SwapQuoteParams {
    fromToken: string;
    toToken: string;
    amountIn: string;
    slippageBasisPoints?: number;
}

export interface SwapQuoteResult {
    amountIn: string;
    expectedAmountOut: string;
    minimumAmountOut: string;
    priceImpactPercent: number;
    route: string[];
    calldata?: string;
}

/**
 * Account Abstraction (ERC-4337) Bundler Gas Estimation
 */
export interface UserOperationGasEstimate {
    preVerificationGas: string;
    verificationGasLimit: string;
    callGasLimit: string;
    validAfter?: number;
    validUntil?: number;
}

/**
 * ERC-4337 UserOperation Execution Receipt
 */
export interface UserOperationReceipt {
    userOpHash: string;
    entryPoint: string;
    sender: string;
    nonce: string;
    paymaster?: string;
    actualGasCost: string;
    actualGasUsed: string;
    success: boolean;
    reason?: string;
    logs: Array<{ address: string; topics: string[]; data: string }>;
}

/**
 * Paymaster Sponsorship Result
 */
export interface PaymasterSponsorResult {
    paymasterAndData: string;
    preVerificationGas?: string;
    verificationGasLimit?: string;
    callGasLimit?: string;
}

