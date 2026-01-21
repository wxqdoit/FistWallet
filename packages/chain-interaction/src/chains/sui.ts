/**
 * Sui Chain Provider
 * Uses @mysten/sui for Sui blockchain interactions
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
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
    ChainType,
    Address,
    ChainError,
    ChainErrorCode,
} from '../types';

/**
 * Sui Chain Provider implementation
 */
export class SuiProvider extends ChainProvider {
    readonly chainType: ChainType = 'sui';
    private client: SuiClient;

    constructor(config: ChainConfig) {
        super(config);
        this.client = new SuiClient({ url: config.rpcUrl });
    }

    /**
     * Get keypair from private key
     */
    private getKeypair(privateKey: string): Ed25519Keypair {
        const pk = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        const secretKey = Buffer.from(pk, 'hex');
        return Ed25519Keypair.fromSecretKey(secretKey);
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            const balance = await this.client.getBalance({
                owner: address,
                coinType: '0x2::sui::SUI',
            });

            return {
                balance: balance.totalBalance,
                decimals: 9,
                symbol: 'SUI',
                formatted: this.formatBalance(balance.totalBalance, 9),
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
            const balance = await this.client.getBalance({
                owner: address,
                coinType: tokenAddress,
            });

            // Get coin metadata
            const metadata = await this.client.getCoinMetadata({
                coinType: tokenAddress,
            });

            const decimals = metadata?.decimals || 9;

            return {
                balance: balance.totalBalance,
                decimals,
                symbol: metadata?.symbol || '',
                name: metadata?.name,
                address: tokenAddress,
                formatted: this.formatBalance(balance.totalBalance, decimals),
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
            const keypair = this.getKeypair(privateKey);
            const tx = new Transaction();

            // Split coins and transfer
            const [coin] = tx.splitCoins(tx.gas, [BigInt(params.value)]);
            tx.transferObjects([coin], params.to);

            // Execute transaction
            const result = await this.client.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: {
                    showEffects: true,
                },
            });

            const isSuccess = result.effects?.status?.status === 'success';

            return {
                hash: result.digest,
                status: isSuccess ? 'confirmed' : 'failed',
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
            const keypair = this.getKeypair(privateKey);
            const tx = new Transaction();

            // Get coins of the specified type
            const coins = await this.client.getCoins({
                owner: keypair.getPublicKey().toSuiAddress(),
                coinType: params.tokenAddress,
            });

            if (coins.data.length === 0) {
                throw new Error('No coins available for transfer');
            }

            // Merge coins if needed and transfer
            const coinIds = coins.data.map((c) => c.coinObjectId);
            if (coinIds.length > 1) {
                tx.mergeCoins(coinIds[0], coinIds.slice(1));
            }

            const [splitCoin] = tx.splitCoins(coinIds[0], [BigInt(params.amount)]);
            tx.transferObjects([splitCoin], params.to);

            const result = await this.client.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: {
                    showEffects: true,
                },
            });

            const isSuccess = result.effects?.status?.status === 'success';

            return {
                hash: result.digest,
                status: isSuccess ? 'confirmed' : 'failed',
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
            const tx = new Transaction();
            const [coin] = tx.splitCoins(tx.gas, [BigInt(params.value)]);
            tx.transferObjects([coin], params.to);
            tx.setSender(from);

            const result = await this.client.dryRunTransactionBlock({
                transactionBlock: await tx.build({ client: this.client }),
            });

            if (result.effects.status.status !== 'success') {
                return {
                    success: false,
                    error: result.effects.status.error,
                };
            }

            return {
                success: true,
                gasEstimate: result.effects.gasUsed.computationCost,
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
            const tx = new Transaction();
            const [coin] = tx.splitCoins(tx.gas, [BigInt(params.value)]);
            tx.transferObjects([coin], params.to);
            tx.setSender(from);

            const result = await this.client.dryRunTransactionBlock({
                transactionBlock: await tx.build({ client: this.client }),
            });

            const gasUsed = result.effects.gasUsed;
            const totalCost = BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost) - BigInt(gasUsed.storageRebate);

            return {
                gasLimit: gasUsed.computationCost,
                gasPrice: '1000', // Reference gas price
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
            const tx = await this.client.getTransactionBlock({
                digest: hash,
                options: {
                    showEffects: true,
                },
            });

            const isSuccess = tx.effects?.status?.status === 'success';

            return {
                hash,
                status: isSuccess ? 'confirmed' : 'failed',
                gasUsed: tx.effects?.gasUsed?.computationCost,
            };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        const checkpoint = await this.client.getLatestCheckpointSequenceNumber();
        return parseInt(checkpoint);
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const checkpoint = blockNumber === 'latest'
            ? await this.client.getLatestCheckpointSequenceNumber()
            : blockNumber.toString();

        const block = await this.client.getCheckpoint({
            id: checkpoint,
        });

        return {
            number: parseInt(block.sequenceNumber),
            hash: block.digest,
            timestamp: Math.floor(parseInt(block.timestampMs) / 1000),
            transactionCount: block.transactions?.length || 0,
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const [checkpoint, chainId] = await Promise.all([
            this.client.getLatestCheckpointSequenceNumber(),
            this.client.getChainIdentifier(),
        ]);

        return {
            chainId,
            name: 'Sui',
            nativeSymbol: 'SUI',
            nativeDecimals: 9,
            blockNumber: parseInt(checkpoint),
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const [balance] = await Promise.all([
            this.getNativeBalance(address),
            this.client.getOwnedObjects({ owner: address, limit: 1 }),
        ]);

        return {
            address,
            balance,
            nonce: 0, // Sui uses object-based model, no nonces
        };
    }

    async getNonce(_address: Address): Promise<number> {
        return 0; // Sui doesn't use nonces
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        // Sui addresses are 64 hex characters (32 bytes) with 0x prefix
        return /^0x[0-9a-fA-F]{64}$/.test(address);
    }
}
