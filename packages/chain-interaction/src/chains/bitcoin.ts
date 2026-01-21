/**
 * Bitcoin Chain Provider
 * Uses custom JSON-RPC wrapper for Bitcoin node/Electrum interactions
 */

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
 * Bitcoin UTXO structure
 */
interface BitcoinUTXO {
    txid: string;
    vout: number;
    value: number;
    scriptPubKey: string;
}

/**
 * Bitcoin JSON-RPC response
 */
interface JsonRpcResponse<T> {
    result?: T;
    error?: { code: number; message: string };
    id: number;
}

/**
 * Bitcoin Chain Provider implementation
 * Uses JSON-RPC to communicate with Bitcoin node or Electrum server
 */
export class BitcoinProvider extends ChainProvider {
    readonly chainType: ChainType = 'bitcoin';
    private requestId = 0;

    constructor(config: ChainConfig) {
        super(config);
    }

    /**
     * Make JSON-RPC call to Bitcoin node
     */
    private async rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
        try {
            const response = await fetch(this.config.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && { Authorization: `Basic ${this.config.apiKey}` }),
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: ++this.requestId,
                    method,
                    params,
                }),
            });

            const data = await response.json() as JsonRpcResponse<T>;

            if (data.error) {
                throw new Error(`RPC Error: ${data.error.message}`);
            }

            return data.result as T;
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.NETWORK_ERROR,
                `Bitcoin RPC call failed: ${error}`,
                error
            );
        }
    }

    /**
     * Get UTXOs for an address using Electrum-style API
     * Note: Standard bitcoind doesn't have direct address lookup
     * This assumes an Electrum server or custom indexer
     */
    private async getUTXOs(address: string): Promise<BitcoinUTXO[]> {
        try {
            // For Electrum servers
            const utxos = await this.rpcCall<Array<{
                tx_hash: string;
                tx_pos: number;
                value: number;
                height: number;
            }>>('blockchain.address.listunspent', [address]);

            return utxos.map(utxo => ({
                txid: utxo.tx_hash,
                vout: utxo.tx_pos,
                value: utxo.value,
                scriptPubKey: '', // Would need to fetch from tx
            }));
        } catch {
            // Fallback: return empty array if indexer not available
            return [];
        }
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            // Try Electrum-style balance query
            const balance = await this.rpcCall<{
                confirmed: number;
                unconfirmed: number;
            }>('blockchain.address.get_balance', [address]);

            const totalSatoshis = balance.confirmed + balance.unconfirmed;

            return {
                balance: totalSatoshis.toString(),
                decimals: 8,
                symbol: 'BTC',
                formatted: (totalSatoshis / 100_000_000).toFixed(8),
            };
        } catch (error) {
            // Fallback: Get balance from UTXOs
            const utxos = await this.getUTXOs(address);
            const totalSatoshis = utxos.reduce((sum, utxo) => sum + utxo.value, 0);

            return {
                balance: totalSatoshis.toString(),
                decimals: 8,
                symbol: 'BTC',
                formatted: (totalSatoshis / 100_000_000).toFixed(8),
            };
        }
    }

    async getTokenBalance(_address: Address, _tokenAddress: Address): Promise<TokenBalance> {
        // Bitcoin doesn't have native token support
        // Could integrate with Ordinals/BRC-20 APIs in the future
        throw new ChainError(
            ChainErrorCode.UNSUPPORTED_OPERATION,
            'Bitcoin does not support native tokens. BRC-20/Ordinals require specialized indexers.'
        );
    }

    // ==================== Transaction Methods ====================

    async sendTransaction(_privateKey: string, _params: TransactionParams): Promise<TransactionResult> {
        // Full Bitcoin transaction requires:
        // 1. Fetch UTXOs
        // 2. Build transaction with proper inputs/outputs
        // 3. Sign with private key
        // 4. Broadcast via sendrawtransaction

        // This is a placeholder - full implementation would use wallet-core's Bitcoin signing
        throw new ChainError(
            ChainErrorCode.UNSUPPORTED_OPERATION,
            'Bitcoin transaction sending requires UTXO-based transaction building. Use wallet-core for signing and provide the raw transaction.'
        );
    }

    /**
     * Broadcast a signed raw transaction
     * @param rawTxHex Signed transaction in hex format
     */
    async broadcastTransaction(rawTxHex: string): Promise<TransactionResult> {
        try {
            const txid = await this.rpcCall<string>('sendrawtransaction', [rawTxHex]);

            return {
                hash: txid,
                status: 'pending',
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.TRANSACTION_FAILED,
                `Failed to broadcast transaction: ${error}`,
                error
            );
        }
    }

    async sendTokenTransfer(_privateKey: string, _params: TokenTransferParams): Promise<TransactionResult> {
        throw new ChainError(
            ChainErrorCode.UNSUPPORTED_OPERATION,
            'Bitcoin does not support native token transfers'
        );
    }

    async simulateTransaction(_params: TransactionParams, _from: Address): Promise<SimulationResult> {
        // Bitcoin doesn't have transaction simulation
        return {
            success: true,
            gasEstimate: '250', // Typical transaction size in vbytes
        };
    }

    async estimateGas(_params: TransactionParams, _from: Address): Promise<GasEstimate> {
        try {
            // Get fee estimates from node
            const feeRate = await this.rpcCall<number>('estimatesmartfee', [6]); // 6 block target

            const satPerVbyte = Math.ceil((feeRate || 10) * 100_000); // Convert BTC/kB to sat/vB
            const estimatedSize = 250; // Typical P2WPKH transaction size

            return {
                gasLimit: estimatedSize.toString(),
                gasPrice: satPerVbyte.toString(),
                totalCost: (estimatedSize * satPerVbyte).toString(),
            };
        } catch {
            // Default fallback
            return {
                gasLimit: '250',
                gasPrice: '10',
                totalCost: '2500',
            };
        }
    }

    async getTransactionStatus(hash: string): Promise<TransactionResult> {
        try {
            const tx = await this.rpcCall<{
                confirmations?: number;
                blockhash?: string;
                blockheight?: number;
            }>('getrawtransaction', [hash, true]);

            if (tx.confirmations && tx.confirmations > 0) {
                return {
                    hash,
                    status: 'confirmed',
                    blockNumber: tx.blockheight,
                };
            }

            return { hash, status: 'pending' };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        return await this.rpcCall<number>('getblockcount', []);
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const height = blockNumber === 'latest'
            ? await this.getBlockNumber()
            : blockNumber;

        const blockHash = await this.rpcCall<string>('getblockhash', [height]);
        const block = await this.rpcCall<{
            height: number;
            hash: string;
            time: number;
            nTx: number;
        }>('getblock', [blockHash]);

        return {
            number: block.height,
            hash: block.hash,
            timestamp: block.time,
            transactionCount: block.nTx,
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const [blockchainInfo, blockNumber] = await Promise.all([
            this.rpcCall<{ chain: string }>('getblockchaininfo', []),
            this.getBlockNumber(),
        ]);

        const isMainnet = blockchainInfo.chain === 'main';

        return {
            chainId: isMainnet ? 'bitcoin-mainnet' : 'bitcoin-testnet',
            name: isMainnet ? 'Bitcoin Mainnet' : 'Bitcoin Testnet',
            nativeSymbol: 'BTC',
            nativeDecimals: 8,
            blockNumber,
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const balance = await this.getNativeBalance(address);

        return {
            address,
            balance,
            nonce: 0, // Bitcoin doesn't use nonces
        };
    }

    async getNonce(_address: Address): Promise<number> {
        return 0; // Bitcoin doesn't use nonces
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        // Check for various Bitcoin address formats
        // P2PKH: starts with 1
        // P2SH: starts with 3
        // Bech32 (P2WPKH/P2WSH): starts with bc1q
        // Bech32m (P2TR): starts with bc1p
        // Testnet: starts with m, n, 2, or tb1

        const mainnetPattern = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;
        const testnetPattern = /^(m|n|2|tb1)[a-zA-HJ-NP-Z0-9]{25,62}$/;

        return mainnetPattern.test(address) || testnetPattern.test(address);
    }

    // ==================== Bitcoin-Specific Methods ====================

    /**
     * Get transaction history for an address
     */
    async getTransactionHistory(address: string, limit: number = 10): Promise<string[]> {
        try {
            const history = await this.rpcCall<Array<{ tx_hash: string }>>(
                'blockchain.address.get_history',
                [address]
            );
            return history.slice(0, limit).map(h => h.tx_hash);
        } catch {
            return [];
        }
    }

    /**
     * Get current fee rates
     */
    async getFeeRates(): Promise<{ fast: number; medium: number; slow: number }> {
        try {
            const [fast, medium, slow] = await Promise.all([
                this.rpcCall<{ feerate: number }>('estimatesmartfee', [1]),
                this.rpcCall<{ feerate: number }>('estimatesmartfee', [6]),
                this.rpcCall<{ feerate: number }>('estimatesmartfee', [24]),
            ]);

            // Convert BTC/kB to sat/vB
            return {
                fast: Math.ceil((fast.feerate || 0.0001) * 100_000),
                medium: Math.ceil((medium.feerate || 0.00005) * 100_000),
                slow: Math.ceil((slow.feerate || 0.00002) * 100_000),
            };
        } catch {
            return { fast: 20, medium: 10, slow: 5 };
        }
    }
}
