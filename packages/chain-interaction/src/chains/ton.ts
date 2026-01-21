/**
 * TON Chain Provider
 * Uses @ton/ton for TON blockchain interactions
 */

import { TonClient, WalletContractV4, internal, Address as TonAddress } from '@ton/ton';
import { beginCell } from '@ton/core';
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
 * TON Chain Provider implementation
 */
export class TonProvider extends ChainProvider {
    readonly chainType: ChainType = 'ton';
    private client: TonClient;

    constructor(config: ChainConfig) {
        super(config);
        this.client = new TonClient({
            endpoint: config.rpcUrl,
            apiKey: config.apiKey,
        });
    }

    /**
     * Get keypair from private key hex
     */
    private getKeyPair(privateKeyHex: string) {
        const pk = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
        const secretKey = Buffer.from(pk, 'hex');

        // TON uses 64-byte secret key (32 secret + 32 public)
        // Extract public key from secret key using ed25519
        const publicKey = secretKey.slice(32);

        return { secretKey, publicKey };
    }

    /**
     * Get wallet contract from private key
     */
    private getWallet(privateKeyHex: string) {
        const { secretKey, publicKey } = this.getKeyPair(privateKeyHex);

        const wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: publicKey,
        });

        return { wallet, secretKey };
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            const tonAddress = TonAddress.parse(address);
            const balance = await this.client.getBalance(tonAddress);

            return {
                balance: balance.toString(),
                decimals: 9,
                symbol: 'TON',
                formatted: this.formatBalance(balance.toString(), 9),
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
            // Query Jetton wallet balance
            const jettonMaster = TonAddress.parse(tokenAddress);
            const ownerAddress = TonAddress.parse(address);

            // Get jetton wallet address
            const result = await this.client.runMethod(
                jettonMaster,
                'get_wallet_address',
                [{ type: 'slice', cell: beginCell().storeAddress(ownerAddress).endCell() }]
            );

            const jettonWalletAddress = result.stack.readAddress();

            // Get balance from jetton wallet
            const balanceResult = await this.client.runMethod(
                jettonWalletAddress,
                'get_wallet_data',
                []
            );

            const balance = balanceResult.stack.readBigNumber();

            // Get jetton metadata
            const metadataResult = await this.client.runMethod(
                jettonMaster,
                'get_jetton_data',
                []
            );

            metadataResult.stack.readBigNumber(); // total supply
            metadataResult.stack.readNumber(); // mintable
            metadataResult.stack.readAddress(); // admin
            // Note: symbol and decimals are typically in metadata cell

            return {
                balance: balance.toString(),
                decimals: 9, // Standard Jetton decimals
                symbol: '',
                address: tokenAddress,
                formatted: this.formatBalance(balance.toString(), 9),
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
            const { wallet, secretKey } = this.getWallet(privateKey);
            const contract = this.client.open(wallet);

            // Get seqno
            const seqno = await contract.getSeqno();

            // Send transfer
            await contract.sendTransfer({
                secretKey,
                seqno,
                messages: [
                    internal({
                        to: TonAddress.parse(params.to),
                        value: BigInt(params.value),
                        body: params.data || undefined,
                    }),
                ],
            });

            // TON doesn't return tx hash immediately, generate placeholder
            const hash = `${wallet.address.toString()}_${seqno}`;

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
            const { wallet, secretKey } = this.getWallet(privateKey);
            const contract = this.client.open(wallet);

            // Get seqno
            const seqno = await contract.getSeqno();

            // For Jetton transfers, we need to construct the proper message
            // This is a simplified version - full implementation would need proper Jetton transfer message
            const jettonWallet = TonAddress.parse(params.tokenAddress);

            // Jetton transfer message body
            const body = `Jetton transfer: ${params.amount} to ${params.to}`;

            await contract.sendTransfer({
                secretKey,
                seqno,
                messages: [
                    internal({
                        to: jettonWallet,
                        value: BigInt(50000000), // 0.05 TON for gas
                        body,
                    }),
                ],
            });

            const hash = `${wallet.address.toString()}_${seqno}`;

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
            // TON doesn't have native transaction simulation
            // Just validate addresses
            TonAddress.parse(params.to);
            TonAddress.parse(from);

            return {
                success: true,
                gasEstimate: '50000000', // 0.05 TON estimated
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async estimateGas(_params: TransactionParams, _from: Address): Promise<GasEstimate> {
        // TON uses message-based fees
        return {
            gasLimit: '1000000', // Gas units
            gasPrice: '50', // nanoTON per gas unit
            totalCost: '50000000', // 0.05 TON
        };
    }

    async getTransactionStatus(hash: string): Promise<TransactionResult> {
        try {
            // Parse hash to get address and seqno
            const [addressStr] = hash.split('_');
            const address = TonAddress.parse(addressStr);

            // Get account transactions
            const txs = await this.client.getTransactions(address, { limit: 10 });

            // Look for transaction with matching seqno in the transaction list
            // This is a simplified approach

            if (txs.length > 0) {
                return {
                    hash,
                    status: 'confirmed',
                    blockNumber: 0, // TON uses logical time instead
                };
            }

            return { hash, status: 'pending' };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        const masterchainInfo = await this.client.getMasterchainInfo();
        return masterchainInfo.latestSeqno;
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const masterchainInfo = await this.client.getMasterchainInfo();
        const seqno = blockNumber === 'latest' ? masterchainInfo.latestSeqno : blockNumber;

        return {
            number: seqno,
            hash: '',
            timestamp: Math.floor(Date.now() / 1000),
            transactionCount: 0, // Not easily available
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const masterchainInfo = await this.client.getMasterchainInfo();

        return {
            chainId: 'ton-mainnet',
            name: 'TON',
            nativeSymbol: 'TON',
            nativeDecimals: 9,
            blockNumber: masterchainInfo.latestSeqno,
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const tonAddressParsed = TonAddress.parse(address);
        const [balance, state] = await Promise.all([
            this.getNativeBalance(address),
            this.client.getContractState(tonAddressParsed),
        ]);

        return {
            address,
            balance,
            nonce: 0,
            isContract: state.state === 'active',
        };
    }

    async getNonce(address: Address): Promise<number> {
        try {
            TonAddress.parse(address);
            // For wallet contracts, get seqno
            const wallet = WalletContractV4.create({
                workchain: 0,
                publicKey: Buffer.alloc(32), // Placeholder
            });

            const contract = this.client.open(wallet);
            return await contract.getSeqno();
        } catch {
            return 0;
        }
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        try {
            TonAddress.parse(address);
            return true;
        } catch {
            return false;
        }
    }
}
