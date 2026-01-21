/**
 * TRON Chain Provider
 * Uses TronWeb for TRON blockchain interactions
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const TronWeb = require('tronweb');
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

// TRC20 ABI
const TRC20_ABI = [
    {
        constant: true,
        inputs: [{ name: 'who', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function',
    },
];

/**
 * TRON Chain Provider implementation
 */
export class TronProvider extends ChainProvider {
    readonly chainType: ChainType = 'tron';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private tronWeb: any;

    constructor(config: ChainConfig) {
        super(config);
        this.tronWeb = new TronWeb.TronWeb({
            fullHost: config.rpcUrl,
        });
    }

    /**
     * Set private key for signing
     */
    private setPrivateKey(privateKey: string): void {
        const pk = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        this.tronWeb.setPrivateKey(pk);
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            // Convert to hex address if needed
            const hexAddress = address.startsWith('T')
                ? this.tronWeb.address.toHex(address)
                : address;

            const balance = await this.tronWeb.trx.getBalance(hexAddress);

            return {
                balance: balance.toString(),
                decimals: 6,
                symbol: 'TRX',
                formatted: (balance / 1_000_000).toString(),
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
            const contract = await this.tronWeb.contract(TRC20_ABI, tokenAddress);

            const [balance, decimals, symbol, name] = await Promise.all([
                contract.methods.balanceOf(address).call(),
                contract.methods.decimals().call(),
                contract.methods.symbol().call(),
                contract.methods.name().call(),
            ]);

            const balanceStr = balance.toString();
            const decimalsNum = parseInt(decimals.toString());

            return {
                balance: balanceStr,
                decimals: decimalsNum,
                symbol: symbol,
                name: name,
                address: tokenAddress,
                formatted: this.formatBalance(balanceStr, decimalsNum),
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
            this.setPrivateKey(privateKey);

            // Build transaction
            const tx = await this.tronWeb.transactionBuilder.sendTrx(
                params.to,
                parseInt(params.value),
                this.tronWeb.defaultAddress.base58!
            );

            // Sign transaction
            const signedTx = await this.tronWeb.trx.sign(tx);

            // Broadcast transaction
            const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

            if (!result.result) {
                throw new Error(result.message || 'Transaction failed');
            }

            return {
                hash: result.txid,
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
            this.setPrivateKey(privateKey);

            const contract = await this.tronWeb.contract(TRC20_ABI, params.tokenAddress);

            // Call transfer function
            const result = await contract.methods
                .transfer(params.to, params.amount)
                .send({
                    feeLimit: 100_000_000, // 100 TRX max fee
                });

            return {
                hash: result,
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
            // TRON doesn't have native simulation, we'll just check if the transaction can be built
            const tx = await this.tronWeb.transactionBuilder.sendTrx(
                params.to,
                parseInt(params.value),
                from
            );

            if (tx) {
                return {
                    success: true,
                };
            }

            return {
                success: false,
                error: 'Failed to build transaction',
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async estimateGas(_params: TransactionParams, _from: Address): Promise<GasEstimate> {
        // TRON uses energy and bandwidth, not gas
        // Return simplified estimate
        return {
            gasLimit: '100000', // Energy
            gasPrice: '420', // Sun per energy
            totalCost: '42000000', // 42 TRX in Sun
        };
    }

    async getTransactionStatus(hash: string): Promise<TransactionResult> {
        try {
            const txInfo = await this.tronWeb.trx.getTransactionInfo(hash);

            if (!txInfo || !txInfo.id) {
                return { hash, status: 'pending' };
            }

            const isSuccess = txInfo.receipt?.result === 'SUCCESS' ||
                (txInfo.blockNumber && !txInfo.receipt?.result);

            return {
                hash,
                status: isSuccess ? 'confirmed' : 'failed',
                blockNumber: txInfo.blockNumber,
                gasUsed: txInfo.fee?.toString(),
            };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        const block = await this.tronWeb.trx.getCurrentBlock();
        return block.block_header.raw_data.number;
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const block = blockNumber === 'latest'
            ? await this.tronWeb.trx.getCurrentBlock()
            : await this.tronWeb.trx.getBlock(blockNumber);

        return {
            number: block.block_header.raw_data.number,
            hash: block.blockID,
            timestamp: Math.floor(block.block_header.raw_data.timestamp / 1000),
            transactionCount: block.transactions?.length || 0,
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const block = await this.tronWeb.trx.getCurrentBlock();

        return {
            chainId: 'tron-mainnet',
            name: 'TRON',
            nativeSymbol: 'TRX',
            nativeDecimals: 6,
            blockNumber: block.block_header.raw_data.number,
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const [balance, account] = await Promise.all([
            this.getNativeBalance(address),
            this.tronWeb.trx.getAccount(address),
        ]);

        return {
            address,
            balance,
            nonce: 0, // TRON doesn't use nonces
            isContract: !!account.type,
        };
    }

    async getNonce(_address: Address): Promise<number> {
        return 0; // TRON doesn't use nonces
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        return this.tronWeb.isAddress(address);
    }
}
