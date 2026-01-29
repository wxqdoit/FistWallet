/**
 * Solana Chain Provider
 * Uses @solana/web3.js for Solana blockchain interactions
 */

import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Keypair,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    getAccount,
    getAssociatedTokenAddress,
    createTransferInstruction,
    getMint,
} from '@solana/spl-token';
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
import { base58 } from '@scure/base';

/**
 * Solana Chain Provider implementation
 */
export class SolanaProvider extends ChainProvider {
    readonly chainType: ChainType = 'solana';
    private connection: Connection;

    constructor(config: ChainConfig) {
        super(config);
        this.connection = new Connection(config.rpcUrl, {
            commitment: 'confirmed',
        });
    }

    /**
     * Convert private key string to Keypair
     */
    private getKeypair(privateKey: string): Keypair {
        // Handle base58 encoded private key (64 bytes: 32 secret + 32 public)
        const decoded = base58.decode(privateKey);
        if (decoded.length === 64) {
            return Keypair.fromSecretKey(decoded);
        }
        // Handle 32-byte secret key
        if (decoded.length === 32) {
            return Keypair.fromSeed(decoded);
        }
        throw new ChainError(
            ChainErrorCode.INVALID_TRANSACTION,
            'Invalid Solana private key format'
        );
    }

    // ==================== Balance Methods ====================

    async getNativeBalance(address: Address): Promise<NativeBalance> {
        try {
            const pubkey = new PublicKey(address);
            const balance = await this.connection.getBalance(pubkey);

            return {
                balance: balance.toString(),
                decimals: 9,
                symbol: 'SOL',
                formatted: (balance / LAMPORTS_PER_SOL).toString(),
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
            const ownerPubkey = new PublicKey(address);
            const mintPubkey = new PublicKey(tokenAddress);

            // Get associated token account
            const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);

            // Get token account info
            const [accountInfo, mintInfo] = await Promise.all([
                getAccount(this.connection, ata).catch(() => null),
                getMint(this.connection, mintPubkey),
            ]);

            const balance = accountInfo ? accountInfo.amount : BigInt(0);
            const decimals = mintInfo.decimals;

            return {
                balance: balance.toString(),
                decimals,
                symbol: '', // SPL tokens don't have on-chain symbol
                address: tokenAddress,
                formatted: this.formatBalance(balance.toString(), decimals),
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
            const toPubkey = new PublicKey(params.to);

            // Create transfer instruction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey,
                    lamports: Number(params.value),
                })
            );

            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = keypair.publicKey;

            // Sign and send
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [keypair],
                { commitment: 'confirmed' }
            );

            return {
                hash: signature,
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
            const keypair = this.getKeypair(privateKey);
            const mintPubkey = new PublicKey(params.tokenAddress);
            const toPubkey = new PublicKey(params.to);

            // Get source and destination ATAs
            const sourceAta = await getAssociatedTokenAddress(mintPubkey, keypair.publicKey);
            const destAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);

            // Create transfer instruction
            const transferIx = createTransferInstruction(
                sourceAta,
                destAta,
                keypair.publicKey,
                BigInt(params.amount)
            );

            const transaction = new Transaction().add(transferIx);

            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = keypair.publicKey;

            // Sign and send
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [keypair],
                { commitment: 'confirmed' }
            );

            return {
                hash: signature,
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

    async simulateTransaction(params: TransactionParams, from: Address): Promise<SimulationResult> {
        try {
            const fromPubkey = new PublicKey(from);
            const toPubkey = new PublicKey(params.to);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: BigInt(params.value),
                })
            );

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            const simulation = await this.connection.simulateTransaction(transaction);

            if (simulation.value.err) {
                return {
                    success: false,
                    error: JSON.stringify(simulation.value.err),
                };
            }

            return {
                success: true,
                gasEstimate: simulation.value.unitsConsumed?.toString(),
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
            const fromPubkey = new PublicKey(from);
            const toPubkey = new PublicKey(params.to);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: BigInt(params.value),
                })
            );

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            // Get fee for transaction
            const fee = await this.connection.getFeeForMessage(
                transaction.compileMessage(),
                'confirmed'
            );

            const feeValue = fee.value || 5000; // Default 5000 lamports

            return {
                gasLimit: '200000', // Compute units
                gasPrice: feeValue.toString(),
                totalCost: feeValue.toString(),
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
            const signature = await this.connection.getSignatureStatus(hash);

            if (!signature.value) {
                return { hash, status: 'pending' };
            }

            const confirmationStatus = signature.value.confirmationStatus;

            if (signature.value.err) {
                return {
                    hash,
                    status: 'failed',
                    error: JSON.stringify(signature.value.err),
                };
            }

            return {
                hash,
                status: confirmationStatus === 'finalized' || confirmationStatus === 'confirmed'
                    ? 'confirmed'
                    : 'pending',
                blockNumber: signature.value.slot,
            };
        } catch {
            return { hash, status: 'pending' };
        }
    }

    // ==================== Chain State Methods ====================

    async getBlockNumber(): Promise<number> {
        return await this.connection.getSlot();
    }

    async getBlock(blockNumber: number | 'latest'): Promise<BlockInfo> {
        const slot = blockNumber === 'latest'
            ? await this.connection.getSlot()
            : blockNumber;

        const block = await this.connection.getBlock(slot, {
            transactionDetails: 'none',
        });

        if (!block) {
            throw new ChainError(
                ChainErrorCode.NETWORK_ERROR,
                `Block ${slot} not found`
            );
        }

        return {
            number: slot,
            hash: block.blockhash,
            timestamp: block.blockTime || 0,
            transactionCount: block.transactions?.length || 0,
        };
    }

    async getChainInfo(): Promise<ChainInfo> {
        const [slot, genesisHash] = await Promise.all([
            this.connection.getSlot(),
            this.connection.getGenesisHash(),
        ]);

        // Determine network from genesis hash
        const isMainnet = genesisHash === '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';

        return {
            chainId: isMainnet ? 'mainnet-beta' : 'devnet',
            name: isMainnet ? 'Solana Mainnet' : 'Solana Devnet',
            nativeSymbol: 'SOL',
            nativeDecimals: 9,
            blockNumber: slot,
        };
    }

    // ==================== Account Methods ====================

    async getAccountInfo(address: Address): Promise<AccountInfo> {
        const pubkey = new PublicKey(address);
        const [balance, accountInfo] = await Promise.all([
            this.getNativeBalance(address),
            this.connection.getAccountInfo(pubkey),
        ]);

        return {
            address,
            balance,
            nonce: 0, // Solana doesn't use nonces for accounts
            isContract: accountInfo?.executable || false,
        };
    }

    async getNonce(_address: Address): Promise<number> {
        // Solana doesn't use sequential nonces
        // Return 0 as placeholder
        return 0;
    }

    // ==================== Utility Methods ====================

    isValidAddress(address: string): boolean {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }
}
