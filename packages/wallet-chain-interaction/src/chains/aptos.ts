/**
 * Aptos Chain Provider
 * Uses @aptos-labs/ts-sdk for Aptos blockchain interactions
 */

import {
    Aptos,
    AptosConfig,
    Network,
    Account,
    Ed25519PrivateKey,
    AccountAddress,
} from '@aptos-labs/ts-sdk';
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
 * Aptos Chain Provider implementation
 */
export class AptosProvider extends ChainProvider {
    readonly chainType: ChainType = 'aptos';
    private client: Aptos;

    constructor(config: ChainConfig) {
        super(config);

        const aptosConfig = new AptosConfig({
            fullnode: config.rpcUrl,
            network: Network.MAINNET,
        });

        this.client = new Aptos(aptosConfig);
    }

    /**
     * Get account from private key
     */
    private getAccount(privateKey: string): Account {
        const pk = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        const privateKeyBytes = Buffer.from(pk, 'hex');
        const ed25519Key = new Ed25519PrivateKey(privateKeyBytes);
        return Account.fromPrivateKey({ privateKey: ed25519Key });
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            const accountAddress = AccountAddress.from(address);
            const resources = await this.client.getAccountResources({
                accountAddress,
            });

            const coinResource = resources.find(
                (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
            );

            const balance = coinResource
                ? (coinResource.data as { coin: { value: string } }).coin.value
                : '0';

            return {
                balance,
                decimals: 8,
                symbol: 'APT',
                formatted: this.formatBalance(balance, 8),
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
            const accountAddress = AccountAddress.from(address);
            const resources = await this.client.getAccountResources({
                accountAddress,
            });

            // Find coin store for the token
            const coinStoreType = `0x1::coin::CoinStore<${tokenAddress}>`;
            const coinResource = resources.find((r) => r.type === coinStoreType);

            const balance = coinResource
                ? (coinResource.data as { coin: { value: string } }).coin.value
                : '0';

            return {
                balance,
                decimals: 8, // Default, would need to query coin info
                symbol: '',
                address: tokenAddress,
                formatted: this.formatBalance(balance, 8),
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
            const account = this.getAccount(privateKey);

            // Build transaction
            const transaction = await this.client.transaction.build.simple({
                sender: account.accountAddress,
                data: {
                    function: '0x1::aptos_account::transfer',
                    functionArguments: [params.to, params.value],
                },
            });

            // Sign and submit
            const pendingTx = await this.client.signAndSubmitTransaction({
                signer: account,
                transaction,
            });

            return {
                hash: pendingTx.hash,
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
            const account = this.getAccount(privateKey);

            // Build coin transfer transaction
            const transaction = await this.client.transaction.build.simple({
                sender: account.accountAddress,
                data: {
                    function: '0x1::coin::transfer',
                    typeArguments: [params.tokenAddress],
                    functionArguments: [params.to, params.amount],
                },
            });

            // Sign and submit
            const pendingTx = await this.client.signAndSubmitTransaction({
                signer: account,
                transaction,
            });

            return {
                hash: pendingTx.hash,
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
            const accountAddress = AccountAddress.from(from);

            await this.client.transaction.build.simple({
                sender: accountAddress,
                data: {
                    function: '0x1::aptos_account::transfer',
                    functionArguments: [params.to, params.value],
                },
            });

            // Note: Full simulation requires actual account private key
            // Returning success with gas estimate if transaction builds successfully
            return {
                success: true,
                gasEstimate: '10000',
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
            const accountAddress = AccountAddress.from(from);

            await this.client.transaction.build.simple({
                sender: accountAddress,
                data: {
                    function: '0x1::aptos_account::transfer',
                    functionArguments: [params.to, params.value],
                },
            });

            // Get gas estimation from simulation
            const gasPrice = await this.client.getGasPriceEstimation();

            return {
                gasLimit: '10000',
                gasPrice: gasPrice.gas_estimate.toString(),
                totalCost: (10000 * gasPrice.gas_estimate).toString(),
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
            const tx = await this.client.getTransactionByHash({ transactionHash: hash });

            const isSuccess = (tx as { success: boolean }).success;

            return {
                hash,
                status: isSuccess ? 'confirmed' : 'failed',
                blockNumber: parseInt((tx as { version: string }).version),
                gasUsed: (tx as { gas_used: string }).gas_used,
            };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        const ledgerInfo = await this.client.getLedgerInfo();
        return parseInt(ledgerInfo.block_height);
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const height = blockNumber === 'latest'
            ? await this.getBlockNumber()
            : blockNumber;

        const block = await this.client.getBlockByHeight({ blockHeight: height });

        return {
            number: parseInt(block.block_height.toString()),
            hash: block.block_hash,
            timestamp: Math.floor(parseInt(block.block_timestamp) / 1000000),
            transactionCount: block.transactions?.length || 0,
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const ledgerInfo = await this.client.getLedgerInfo();

        return {
            chainId: Number(ledgerInfo.chain_id),
            name: 'Aptos',
            nativeSymbol: 'APT',
            nativeDecimals: 8,
            blockNumber: Number(ledgerInfo.block_height),
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const accountAddress = AccountAddress.from(address);

        const [balance, account] = await Promise.all([
            this.getNativeBalance(address),
            this.client.getAccountInfo({ accountAddress }),
        ]);

        return {
            address,
            balance,
            nonce: parseInt(account.sequence_number),
        };
    }

    async getNonce(address: Address): Promise<number> {
        const accountAddress = AccountAddress.from(address);
        const account = await this.client.getAccountInfo({ accountAddress });
        return parseInt(account.sequence_number);
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        try {
            AccountAddress.from(address);
            return true;
        } catch {
            return false;
        }
    }
}
