/**
 * NEAR Chain Provider
 * Uses near-api-js for NEAR blockchain interactions
 */

import { KeyPair, utils, transactions, providers } from 'near-api-js';
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
 * NEAR Chain Provider implementation
 */
export class NearProvider extends ChainProvider {
    readonly chainType: ChainType = 'near';
    private provider: providers.JsonRpcProvider;

    constructor(config: ChainConfig) {
        super(config);
        this.provider = new providers.JsonRpcProvider({ url: config.rpcUrl });
    }

    /**
     * Get keypair from private key
     */
    private getKeyPair(privateKey: string): KeyPair {
        // NEAR private keys are ed25519:base58 format or raw hex
        if (privateKey.startsWith('ed25519:')) {
            return KeyPair.fromString(privateKey as `ed25519:${string}`);
        }

        // Convert hex to base58 format
        const pk = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        const keyBytes = Buffer.from(pk, 'hex');
        return KeyPair.fromString(`ed25519:${utils.serialize.base_encode(keyBytes)}`);
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            const account = await this.provider.query({
                request_type: 'view_account',
                account_id: address,
                finality: 'final',
            }) as unknown as { amount: string };

            return {
                balance: account.amount,
                decimals: 24,
                symbol: 'NEAR',
                formatted: utils.format.formatNearAmount(account.amount),
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
            // Query NEP-141 token balance
            const result = await this.provider.query({
                request_type: 'call_function',
                account_id: tokenAddress,
                method_name: 'ft_balance_of',
                args_base64: Buffer.from(JSON.stringify({ account_id: address })).toString('base64'),
                finality: 'final',
            }) as unknown as { result: number[] };

            const balance = JSON.parse(Buffer.from(result.result).toString());

            // Get token metadata
            const metadataResult = await this.provider.query({
                request_type: 'call_function',
                account_id: tokenAddress,
                method_name: 'ft_metadata',
                args_base64: Buffer.from('{}').toString('base64'),
                finality: 'final',
            }) as unknown as { result: number[] };

            const metadata = JSON.parse(Buffer.from(metadataResult.result).toString());

            return {
                balance: balance.toString(),
                decimals: metadata.decimals,
                symbol: metadata.symbol,
                name: metadata.name,
                address: tokenAddress,
                formatted: this.formatBalance(balance.toString(), metadata.decimals),
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
            const keyPair = this.getKeyPair(privateKey);
            const publicKey = keyPair.getPublicKey();
            const senderAddress = utils.serialize.base_encode(publicKey.data);

            // Get access key info
            const accessKey = await this.provider.query({
                request_type: 'view_access_key',
                account_id: senderAddress,
                public_key: publicKey.toString(),
                finality: 'final',
            }) as unknown as { nonce: number; block_hash: string };

            // Get recent block hash
            const block = await this.provider.block({ finality: 'final' });

            // Create transfer action
            const actions = [
                transactions.transfer(BigInt(params.value)),
            ];

            // Create and sign transaction
            const tx = transactions.createTransaction(
                senderAddress,
                publicKey,
                params.to,
                accessKey.nonce + 1,
                actions,
                utils.serialize.base_decode(block.header.hash)
            );

            const serializedTx = utils.serialize.serialize(transactions.SCHEMA.Transaction, tx);
            const signature = keyPair.sign(serializedTx);

            const signedTx = new transactions.SignedTransaction({
                transaction: tx,
                signature: new transactions.Signature({
                    keyType: publicKey.keyType,
                    data: signature.signature,
                }),
            });

            // Send transaction
            const result = await this.provider.sendTransaction(signedTx);

            return {
                hash: result.transaction.hash,
                status: 'confirmed',
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
            const keyPair = this.getKeyPair(privateKey);
            const publicKey = keyPair.getPublicKey();
            const senderAddress = utils.serialize.base_encode(publicKey.data);

            // Get access key info
            const accessKey = await this.provider.query({
                request_type: 'view_access_key',
                account_id: senderAddress,
                public_key: publicKey.toString(),
                finality: 'final',
            }) as unknown as { nonce: number };

            // Get recent block hash
            const block = await this.provider.block({ finality: 'final' });

            // Create function call action for ft_transfer
            const actions = [
                transactions.functionCall(
                    'ft_transfer',
                    {
                        receiver_id: params.to,
                        amount: params.amount,
                    },
                    BigInt(30_000_000_000_000), // 30 TGas
                    BigInt(1) // 1 yoctoNEAR for security deposit
                ),
            ];

            const tx = transactions.createTransaction(
                senderAddress,
                publicKey,
                params.tokenAddress,
                accessKey.nonce + 1,
                actions,
                utils.serialize.base_decode(block.header.hash)
            );

            const serializedTx = utils.serialize.serialize(transactions.SCHEMA.Transaction, tx);
            const signature = keyPair.sign(serializedTx);

            const signedTx = new transactions.SignedTransaction({
                transaction: tx,
                signature: new transactions.Signature({
                    keyType: publicKey.keyType,
                    data: signature.signature,
                }),
            });

            const result = await this.provider.sendTransaction(signedTx);

            return {
                hash: result.transaction.hash,
                status: 'confirmed',
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.TRANSACTION_FAILED,
                `Failed to send token transfer: ${error}`,
                error
            );
        }
    }

    async simulateTransaction(_params: TransactionParams, _from: Address): Promise<SimulationResult> {
        // NEAR doesn't have native simulation like EVM
        // Return success for valid parameters
        try {
            return {
                success: true,
                gasEstimate: '30000000000000', // 30 TGas default
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async estimateGas(_params: TransactionParams, _from: Address): Promise<GasEstimate> {
        // NEAR uses TGas (10^12 gas units)
        return {
            gasLimit: '30000000000000', // 30 TGas
            gasPrice: '100000000', // 0.1 GigaGas
            totalCost: '3000000000000000000000', // ~0.003 NEAR
        };
    }

    async getTransactionStatus(hash: string): Promise<TransactionResult> {
        try {
            const result = await this.provider.txStatus(hash, 'sender');

            const isSuccess = result.status &&
                typeof result.status === 'object' &&
                'SuccessValue' in result.status;

            return {
                hash,
                status: isSuccess ? 'confirmed' : 'failed',
            };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        const block = await this.provider.block({ finality: 'final' });
        return block.header.height;
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const block = blockNumber === 'latest'
            ? await this.provider.block({ finality: 'final' })
            : await this.provider.block({ blockId: blockNumber });

        return {
            number: block.header.height,
            hash: block.header.hash,
            timestamp: Math.floor(block.header.timestamp / 1_000_000_000),
            transactionCount: block.chunks.reduce((sum, chunk) => sum + chunk.tx_root.length, 0),
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const [block, status] = await Promise.all([
            this.provider.block({ finality: 'final' }),
            this.provider.status(),
        ]);

        return {
            chainId: status.chain_id,
            name: 'NEAR',
            nativeSymbol: 'NEAR',
            nativeDecimals: 24,
            blockNumber: block.header.height,
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        await this.provider.query({
            request_type: 'view_account',
            account_id: address,
            finality: 'final',
        });

        const balance = await this.getNativeBalance(address);

        return {
            address,
            balance,
            nonce: 0, // NEAR uses access key nonces, not account nonces
        };
    }

    async getNonce(address: Address): Promise<number> {
        // Get nonce from first access key
        const keys = await this.provider.query({
            request_type: 'view_access_key_list',
            account_id: address,
            finality: 'final',
        }) as unknown as { keys: Array<{ access_key: { nonce: number } }> };

        return keys.keys[0]?.access_key?.nonce || 0;
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        // NEAR addresses are either named (human-readable) or implicit (64 hex chars)
        // Named: lowercase alphanumeric with _ and -, min 2 chars, max 64 chars
        // Implicit: 64 hex characters
        const namedPattern = /^[a-z0-9_-]{2,64}(\.[a-z0-9_-]{2,64})*$/;
        const implicitPattern = /^[0-9a-f]{64}$/;

        return namedPattern.test(address) || implicitPattern.test(address);
    }
}
