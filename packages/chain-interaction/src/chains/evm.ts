/**
 * EVM Chain Provider
 * Uses viem for Ethereum and EVM-compatible chains
 */

import {
    createPublicClient,
    createWalletClient,
    http,
    formatEther,
    formatUnits,
    parseUnits,
    encodeFunctionData,
    type PublicClient,
    type WalletClient,
    type Chain,
    type Account,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import { ChainProvider } from '../provider/base';
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
    ChainError,
    ChainErrorCode,
    HexString,
} from '../types';

// ERC20 ABI for token interactions
const ERC20_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
    },
    {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
    },
    {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
    },
    {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
] as const;

/**
 * EVM Chain Provider implementation
 */
export class EVMProvider extends ChainProvider {
    readonly chainType: ChainType = 'evm';
    private publicClient: PublicClient;
    private chain: Chain;

    constructor(config: ChainConfig) {
        super(config);

        // Create chain config
        this.chain = {
            id: (config.chainId as number) || 1,
            name: 'EVM Chain',
            nativeCurrency: mainnet.nativeCurrency,
            rpcUrls: {
                default: { http: [config.rpcUrl] },
            },
        } as Chain;

        // Create public client
        this.publicClient = createPublicClient({
            chain: this.chain,
            transport: http(config.rpcUrl, {
                timeout: config.timeout || 30000,
            }),
        });
    }

    /**
     * Create wallet client for signing transactions
     */
    private createWalletClient(privateKey: string): { walletClient: WalletClient; account: Account } {
        const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey as HexString : `0x${privateKey}`);
        const walletClient = createWalletClient({
            account,
            chain: this.chain,
            transport: http(this.config.rpcUrl),
        });
        return { walletClient, account };
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            const balance = await this.publicClient.getBalance({
                address: address as HexString,
            });

            return {
                balance: balance.toString(),
                decimals: 18,
                symbol: 'ETH',
                formatted: formatEther(balance),
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.NETWORK_ERROR,
                `Failed to get native balance: ${error}`,
                error
            );
        }
    }

    async getTokenBalance(address: Address, tokenAddress: Address): Promise<TokenBalance> {
        try {
            const [balance, decimals, symbol, name] = await Promise.all([
                this.publicClient.readContract({
                    address: tokenAddress as HexString,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [address as HexString],
                }),
                this.publicClient.readContract({
                    address: tokenAddress as HexString,
                    abi: ERC20_ABI,
                    functionName: 'decimals',
                }),
                this.publicClient.readContract({
                    address: tokenAddress as HexString,
                    abi: ERC20_ABI,
                    functionName: 'symbol',
                }),
                this.publicClient.readContract({
                    address: tokenAddress as HexString,
                    abi: ERC20_ABI,
                    functionName: 'name',
                }),
            ]);

            return {
                balance: balance.toString(),
                decimals: decimals,
                symbol: symbol,
                name: name,
                address: tokenAddress,
                formatted: formatUnits(balance, decimals),
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.NETWORK_ERROR,
                `Failed to get token balance: ${error}`,
                error
            );
        }
    }

    // ==================== Transaction Methods ====================

    async sendTransaction(privateKey: string, params: TransactionParams): Promise<TransactionResult> {
        try {
            const { walletClient, account } = this.createWalletClient(privateKey);

            // Prepare transaction
            const txParams: Parameters<typeof walletClient.sendTransaction>[0] = {
                account,
                to: params.to as HexString,
                value: BigInt(params.value),
                chain: this.chain,
            };

            if (params.data) {
                txParams.data = params.data as HexString;
            }

            if (params.gasLimit) {
                txParams.gas = BigInt(params.gasLimit);
            }

            if (params.maxFeePerGas && params.maxPriorityFeePerGas) {
                // EIP-1559 transaction
                txParams.maxFeePerGas = BigInt(params.maxFeePerGas);
                txParams.maxPriorityFeePerGas = BigInt(params.maxPriorityFeePerGas);
            } else if (params.gasPrice) {
                // Legacy transaction
                txParams.gasPrice = BigInt(params.gasPrice);
            }

            if (params.nonce !== undefined) {
                txParams.nonce = params.nonce;
            }

            // Send transaction
            const hash = await walletClient.sendTransaction(txParams);

            return {
                hash,
                status: 'pending',
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.TRANSACTION_FAILED,
                `Failed to send transaction: ${error}`,
                error
            );
        }
    }

    async sendTokenTransfer(privateKey: string, params: TokenTransferParams): Promise<TransactionResult> {
        try {
            const { walletClient, account } = this.createWalletClient(privateKey);

            // Encode ERC20 transfer
            const data = encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [params.to as HexString, BigInt(params.amount)],
            });

            const hash = await walletClient.sendTransaction({
                account,
                to: params.tokenAddress as HexString,
                data,
                chain: this.chain,
            });

            return {
                hash,
                status: 'pending',
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.TRANSACTION_FAILED,
                `Failed to send token transfer: ${error}`,
                error
            );
        }
    }

    async simulateTransaction(params: TransactionParams, from: Address): Promise<SimulationResult> {
        try {
            const result = await this.publicClient.call({
                account: from as HexString,
                to: params.to as HexString,
                value: BigInt(params.value),
                data: params.data as HexString | undefined,
            });

            return {
                success: true,
                returnValue: result.data,
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async estimateGas(params: TransactionParams, from: Address): Promise<GasEstimate> {
        try {
            const [gasLimit, gasPrice, block] = await Promise.all([
                this.publicClient.estimateGas({
                    account: from as HexString,
                    to: params.to as HexString,
                    value: BigInt(params.value),
                    data: params.data as HexString | undefined,
                }),
                this.publicClient.getGasPrice(),
                this.publicClient.getBlock({ blockTag: 'latest' }),
            ]);

            const maxFeePerGas = block.baseFeePerGas
                ? block.baseFeePerGas * 2n
                : gasPrice;
            const maxPriorityFeePerGas = parseUnits('1', 9); // 1 gwei

            const totalCost = gasLimit * maxFeePerGas;

            return {
                gasLimit: gasLimit.toString(),
                gasPrice: gasPrice.toString(),
                maxFeePerGas: maxFeePerGas.toString(),
                maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                totalCost: totalCost.toString(),
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.NETWORK_ERROR,
                `Failed to estimate gas: ${error}`,
                error
            );
        }
    }

    async getTransactionStatus(hash: string): Promise<TransactionResult> {
        try {
            const receipt = await this.publicClient.getTransactionReceipt({
                hash: hash as HexString,
            });

            return {
                hash,
                status: receipt.status === 'success' ? 'confirmed' : 'failed',
                blockNumber: Number(receipt.blockNumber),
                gasUsed: receipt.gasUsed.toString(),
                effectiveGasPrice: receipt.effectiveGasPrice.toString(),
            };
        } catch {
            // Transaction not found or not confirmed yet
            return {
                hash,
                status: 'pending',
            };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        const blockNumber = await this.publicClient.getBlockNumber();
        return Number(blockNumber);
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const block = blockNumber === 'latest'
            ? await this.publicClient.getBlock({ blockTag: 'latest' })
            : await this.publicClient.getBlock({ blockNumber: BigInt(blockNumber) });

        return {
            number: Number(block.number),
            hash: block.hash!,
            timestamp: Number(block.timestamp),
            transactionCount: block.transactions.length,
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const [chainId, blockNumber] = await Promise.all([
            this.publicClient.getChainId(),
            this.getBlockNumber(),
        ]);

        return {
            chainId,
            name: this.chain.name,
            nativeSymbol: 'ETH',
            nativeDecimals: 18,
            blockNumber,
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const [balance, nonce, code] = await Promise.all([
            this.getNativeBalance(address),
            this.getNonce(address),
            this.publicClient.getCode({ address: address as HexString }),
        ]);

        return {
            address,
            balance,
            nonce,
            isContract: code !== undefined && code !== '0x',
        };
    }

    async getNonce(address: Address): Promise<number> {
        const nonce = await this.publicClient.getTransactionCount({
            address: address as HexString,
        });
        return nonce;
    }

    // ==================== Event Methods ====================

    async getLogs(filter: EventFilter): Promise<EventLog[]> {
        const logs = await this.publicClient.getLogs({
            address: filter.address as HexString | HexString[] | undefined,
            fromBlock: typeof filter.fromBlock === 'number' ? BigInt(filter.fromBlock) : (filter.fromBlock as 'latest' | 'earliest' | undefined),
            toBlock: typeof filter.toBlock === 'number' ? BigInt(filter.toBlock) : (filter.toBlock as 'latest' | 'earliest' | undefined),
        });

        return logs.map(log => ({
            address: log.address,
            topics: log.topics as string[],
            data: log.data,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash!,
            logIndex: Number(log.logIndex),
        }));
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        // Check if it's a valid hex address
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            return false;
        }
        return true;
    }
}
