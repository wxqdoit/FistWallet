/**
 * Base Chain Provider
 * Abstract class defining the unified interface for all chain interactions
 */

import {
    ChainConfig,
    NativeBalance,
    TokenBalance,
    TransactionParams,
    TokenTransferParams,
    TransactionResult,
    SimulationResult,
    GasEstimate,
    BlockInfo,
    ChainInfo,
    AccountInfo,
    EventFilter,
    EventLog,
    ChainType,
    Address,
} from '../types';

/**
 * Abstract base class for chain providers
 * All chain-specific implementations must extend this class
 */
export abstract class ChainProvider {
    protected config: ChainConfig;
    abstract readonly chainType: ChainType;

    constructor(config: ChainConfig) {
        this.config = config;
    }

    /**
     * Get RPC URL
     */
    get rpcUrl(): string {
        return this.config.rpcUrl;
    }

    // ==================== Balance Methods ====================

    /**
     * Get native token balance for an address
     * @param address Account address
     * @returns Native balance info
     */
    abstract getNativeBalance(address: Address): Promise<NativeBalance>;

    /**
     * Get token balance for an address
     * @param address Account address
     * @param tokenAddress Token contract/mint address
     * @returns Token balance info
     */
    abstract getTokenBalance(address: Address, tokenAddress: Address): Promise<TokenBalance>;

    /**
     * Get multiple token balances for an address
     * @param address Account address
     * @param tokenAddresses Array of token addresses
     * @returns Array of token balances
     */
    async getTokenBalances(address: Address, tokenAddresses: Address[]): Promise<TokenBalance[]> {
        return Promise.all(
            tokenAddresses.map(tokenAddress => this.getTokenBalance(address, tokenAddress))
        );
    }

    // ==================== Transaction Methods ====================

    /**
     * Send a transaction
     * @param privateKey Sender's private key
     * @param params Transaction parameters
     * @returns Transaction result with hash and status
     */
    abstract sendTransaction(privateKey: string, params: TransactionParams): Promise<TransactionResult>;

    /**
     * Send a token transfer
     * @param privateKey Sender's private key
     * @param params Token transfer parameters
     * @returns Transaction result
     */
    abstract sendTokenTransfer(privateKey: string, params: TokenTransferParams): Promise<TransactionResult>;

    /**
     * Simulate a transaction without broadcasting
     * @param params Transaction parameters
     * @param from Sender address (for simulation context)
     * @returns Simulation result
     */
    abstract simulateTransaction(params: TransactionParams, from: Address): Promise<SimulationResult>;

    /**
     * Estimate gas/fees for a transaction
     * @param params Transaction parameters
     * @param from Sender address
     * @returns Gas estimation
     */
    abstract estimateGas(params: TransactionParams, from: Address): Promise<GasEstimate>;

    /**
     * Get transaction status by hash
     * @param hash Transaction hash/signature
     * @returns Transaction result
     */
    abstract getTransactionStatus(hash: string): Promise<TransactionResult>;

    /**
     * Wait for transaction confirmation
     * @param hash Transaction hash
     * @param confirmations Number of confirmations to wait for
     * @param timeout Timeout in milliseconds
     * @returns Final transaction result
     */
    async waitForTransaction(
        hash: string,
        _confirmations: number = 1,
        timeout: number = 60000
    ): Promise<TransactionResult> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const result = await this.getTransactionStatus(hash);

            if (result.status === 'confirmed' || result.status === 'failed') {
                return result;
            }

            // Wait 1 second before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return {
            hash,
            status: 'pending',
            error: 'Transaction confirmation timeout'
        };
    }

    // ==================== Chain State Methods ====================

    /**
     * Get current block number/height
     * @returns Current block number
     */
    abstract getBlockNumber(): Promise<number>;

    /**
     * Get block information
     * @param blockNumber Block number (or 'latest')
     * @returns Block info
     */
    abstract getBlock(blockNumber: number | 'latest'): Promise<BlockInfo>;

    /**
     * Get chain information
     * @returns Chain info
     */
    abstract getChainInfo(): Promise<ChainInfo>;

    // ==================== Account Methods ====================

    /**
     * Get account information
     * @param address Account address
     * @returns Account info
     */
    abstract getAccountInfo(address: Address): Promise<AccountInfo>;

    /**
     * Get account nonce/transaction count
     * @param address Account address
     * @returns Nonce
     */
    abstract getNonce(address: Address): Promise<number>;

    // ==================== Event/Log Methods (Optional) ====================

    /**
     * Get event logs
     * Not all chains support this - default throws unsupported error
     * @param filter Event filter
     * @returns Array of event logs
     */
    async getLogs(_filter: EventFilter): Promise<EventLog[]> {
        throw new Error(`getLogs not supported for ${this.chainType}`);
    }

    // ==================== Utility Methods ====================

    /**
     * Check if an address is valid
     * @param address Address to validate
     * @returns Whether address is valid
     */
    abstract isValidAddress(address: string): boolean;

    /**
     * Format balance to human-readable string
     * @param balance Balance in smallest unit
     * @param decimals Token decimals
     * @returns Formatted balance string
     */
    formatBalance(balance: string, decimals: number): string {
        const balanceBigInt = BigInt(balance);
        const divisor = BigInt(10 ** decimals);
        const integerPart = balanceBigInt / divisor;
        const fractionalPart = balanceBigInt % divisor;

        if (fractionalPart === 0n) {
            return integerPart.toString();
        }

        const fractionalStr = fractionalPart.toString().padStart(decimals, '0').replace(/0+$/, '');
        return `${integerPart}.${fractionalStr}`;
    }

    /**
     * Parse human-readable balance to smallest unit
     * @param formatted Formatted balance string (e.g., "1.5")
     * @param decimals Token decimals
     * @returns Balance in smallest unit
     */
    parseBalance(formatted: string, decimals: number): string {
        const [integerPart, fractionalPart = ''] = formatted.split('.');
        const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
        const combined = integerPart + paddedFractional;
        return BigInt(combined).toString();
    }
}
