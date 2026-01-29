/**
 * Filecoin Chain Provider
 * Uses Lotus JSON-RPC for Filecoin blockchain interactions
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
 * Lotus RPC response structure
 */
interface LotusRpcResponse<T> {
    jsonrpc: string;
    result?: T;
    error?: { code: number; message: string };
    id: number;
}

/**
 * Filecoin message structure
 */
interface FilecoinMessage {
    Version: number;
    To: string;
    From: string;
    Nonce: number;
    Value: string;
    GasLimit: number;
    GasFeeCap: string;
    GasPremium: string;
    Method: number;
    Params: string;
}

/**
 * Filecoin Chain Provider implementation
 */
export class FilecoinProvider extends ChainProvider {
    readonly chainType: ChainType = 'filecoin';
    private requestId = 0;

    constructor(config: ChainConfig) {
        super(config);
    }

    /**
     * Make JSON-RPC call to Lotus node
     */
    private async rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
        try {
            const response = await fetch(this.config.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: ++this.requestId,
                    method: `Filecoin.${method}`,
                    params,
                }),
            });

            const data = await response.json() as LotusRpcResponse<T>;

            if (data.error) {
                throw new Error(`RPC Error: ${data.error.message}`);
            }

            return data.result as T;
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.NETWORK_ERROR,
                `Filecoin RPC call failed: ${error}`,
                error
            );
        }
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            const balance = await this.rpcCall<string>('WalletBalance', [address]);

            // Balance is in attoFIL (10^-18 FIL)
            return {
                balance,
                decimals: 18,
                symbol: 'FIL',
                formatted: this.formatBalance(balance, 18),
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.NETWORK_ERROR,
                `Failed to get native balance: ${error}`,
                error
            );
        }
    }

    async getTokenBalance(_address: Address, _tokenAddress: Address): Promise<TokenBalance> {
        // Filecoin doesn't have native token standard like ERC20
        // FVM (Filecoin Virtual Machine) tokens would need specific handling
        throw new ChainError(
            ChainErrorCode.UNSUPPORTED_OPERATION,
            'Filecoin native tokens are not yet widely standardized'
        );
    }

    // ==================== Transaction Methods ====================

    async sendTransaction(_privateKey: string, params: TransactionParams): Promise<TransactionResult> {
        try {
            // Note: Lotus typically uses wallet stored in the node
            // For external signing, you'd need to sign offline and submit

            // Estimate gas first
            const gasEstimate = await this.estimateMessageGas({
                To: params.to,
                From: params.data || '', // Sender address should be passed
                Value: params.value,
            });

            // Build message
            const message: FilecoinMessage = {
                Version: 0,
                To: params.to,
                From: params.data || '', // Should be sender address
                Nonce: params.nonce || 0,
                Value: params.value,
                GasLimit: parseInt(gasEstimate.GasLimit),
                GasFeeCap: gasEstimate.GasFeeCap,
                GasPremium: gasEstimate.GasPremium,
                Method: 0, // Method 0 is transfer
                Params: '',
            };

            // Send message (requires wallet in node or signed message)
            const cid = await this.rpcCall<{ '/': string }>('MpoolPush', [message]);

            return {
                hash: cid['/'],
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

    /**
     * Submit a signed message to the message pool
     */
    async submitSignedMessage(signedMessage: {
        Message: FilecoinMessage;
        Signature: { Type: number; Data: string };
    }): Promise<TransactionResult> {
        try {
            const cid = await this.rpcCall<{ '/': string }>('MpoolPush', [signedMessage]);

            return {
                hash: cid['/'],
                status: 'pending',
            };
        } catch (error) {
            throw new ChainError(
                ChainErrorCode.TRANSACTION_FAILED,
                `Failed to submit signed message: ${error}`,
                error
            );
        }
    }

    async sendTokenTransfer(_privateKey: string, _params: TokenTransferParams): Promise<TransactionResult> {
        throw new ChainError(
            ChainErrorCode.UNSUPPORTED_OPERATION,
            'Filecoin native token transfers require FVM token handling'
        );
    }

    async simulateTransaction(params: TransactionParams, from: Address): Promise<SimulationResult> {
        try {
            const message = {
                To: params.to,
                From: from,
                Value: params.value,
                Method: 0,
                Params: '',
            };

            // Use StateCall to simulate
            const result = await this.rpcCall<{
                MsgRct: { ExitCode: number; Return: string; GasUsed: number };
            }>('StateCall', [message, null]);

            if (result.MsgRct.ExitCode !== 0) {
                return {
                    success: false,
                    error: `Exit code: ${result.MsgRct.ExitCode}`,
                };
            }

            return {
                success: true,
                gasEstimate: result.MsgRct.GasUsed.toString(),
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    /**
     * Estimate gas for a message
     */
    private async estimateMessageGas(message: {
        To: string;
        From: string;
        Value: string;
    }): Promise<{ GasLimit: string; GasFeeCap: string; GasPremium: string }> {
        const fullMessage = {
            Version: 0,
            To: message.To,
            From: message.From,
            Nonce: 0,
            Value: message.Value,
            GasLimit: 0,
            GasFeeCap: '0',
            GasPremium: '0',
            Method: 0,
            Params: '',
        };

        const estimated = await this.rpcCall<{
            GasLimit: number;
            GasFeeCap: string;
            GasPremium: string;
        }>('GasEstimateMessageGas', [fullMessage, { MaxFee: '0' }, null]);

        return {
            GasLimit: estimated.GasLimit.toString(),
            GasFeeCap: estimated.GasFeeCap,
            GasPremium: estimated.GasPremium,
        };
    }

    async estimateGas(params: TransactionParams, from: Address): Promise<GasEstimate> {
        try {
            const estimated = await this.estimateMessageGas({
                To: params.to,
                From: from,
                Value: params.value,
            });

            const gasLimit = BigInt(estimated.GasLimit);
            const gasFeeCap = BigInt(estimated.GasFeeCap);
            const totalCost = gasLimit * gasFeeCap;

            return {
                gasLimit: estimated.GasLimit,
                gasPrice: estimated.GasFeeCap,
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
            const receipt = await this.rpcCall<{
                ExitCode: number;
                Return: string;
                GasUsed: number;
            } | null>('StateSearchMsg', [null, { '/': hash }, -1, true]);

            if (!receipt) {
                return { hash, status: 'pending' };
            }

            return {
                hash,
                status: receipt.ExitCode === 0 ? 'confirmed' : 'failed',
                gasUsed: receipt.GasUsed.toString(),
                error: receipt.ExitCode !== 0 ? `Exit code: ${receipt.ExitCode}` : undefined,
            };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        const head = await this.rpcCall<{ Height: number }>('ChainHead', []);
        return head.Height;
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        if (blockNumber === 'latest') {
            const head = await this.rpcCall<{
                Height: number;
                Blocks: Array<{ Cid: { '/': string }; Timestamp: number }>;
            }>('ChainHead', []);

            return {
                number: head.Height,
                hash: head.Blocks[0]?.Cid['/'] || '',
                timestamp: head.Blocks[0]?.Timestamp || 0,
                transactionCount: head.Blocks.length,
            };
        }

        const tipset = await this.rpcCall<{
            Height: number;
            Blocks: Array<{ Cid: { '/': string }; Timestamp: number }>;
        }>('ChainGetTipSetByHeight', [blockNumber, null]);

        return {
            number: tipset.Height,
            hash: tipset.Blocks[0]?.Cid['/'] || '',
            timestamp: tipset.Blocks[0]?.Timestamp || 0,
            transactionCount: tipset.Blocks.length,
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const [head, networkName] = await Promise.all([
            this.rpcCall<{ Height: number }>('ChainHead', []),
            this.rpcCall<string>('StateNetworkName', []),
        ]);

        return {
            chainId: networkName,
            name: 'Filecoin',
            nativeSymbol: 'FIL',
            nativeDecimals: 18,
            blockNumber: head.Height,
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const [balance, actor] = await Promise.all([
            this.getNativeBalance(address),
            this.rpcCall<{ Nonce: number; Balance: string } | null>('StateGetActor', [address, null]),
        ]);

        return {
            address,
            balance,
            nonce: actor?.Nonce || 0,
        };
    }

    async getNonce(address: Address): Promise<number> {
        const nonce = await this.rpcCall<number>('MpoolGetNonce', [address]);
        return nonce;
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        // Filecoin address formats:
        // f0xxx - ID address
        // f1xxx - secp256k1 address
        // f2xxx - actor address
        // f3xxx - BLS address
        // t prefix for testnet
        const pattern = /^[ft][0-3][a-z0-9]{7,}$/i;
        return pattern.test(address);
    }
}
