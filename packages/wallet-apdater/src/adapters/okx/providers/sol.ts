import type { IBaseProvider } from '@/core/providers/sol';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions, type SendTransactionOptions } from '@/core/types';

type SolanaProvider = {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    signAndSendTransaction?: (transaction: unknown, options?: unknown) => Promise<unknown>;
    signAndSendAllTransactions?: (transactions: unknown[], options?: unknown) => Promise<unknown>;
    request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export class SolProvider implements IBaseProvider {
    readonly chainType: ChainType.SOL = ChainType.SOL;
    constructor(private provider?: SolanaProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const solProvider = this.requireProvider();
        const resp = await solProvider.connect();
        return {
            address: resp.publicKey.toString(),
            chainType: ChainType.SOL,
        };
    }

    async disconnect(): Promise<void> {
        const solProvider = this.requireProvider();
        await solProvider.disconnect();
    }

    async sendTransaction(options: SendTransactionOptions): Promise<unknown> {
        const solProvider = this.requireProvider();
        const transaction = options.transaction as any;

        if (transaction && typeof transaction === 'object') {
            if (Array.isArray(transaction.transactions) && solProvider.signAndSendAllTransactions) {
                return solProvider.signAndSendAllTransactions(transaction.transactions, transaction.options);
            }
            if (transaction.transaction && solProvider.signAndSendTransaction) {
                return solProvider.signAndSendTransaction(transaction.transaction, transaction.options);
            }
        }

        if (Array.isArray(transaction) && solProvider.signAndSendAllTransactions) {
            return solProvider.signAndSendAllTransactions(transaction);
        }

        if (solProvider.signAndSendTransaction) {
            return solProvider.signAndSendTransaction(transaction);
        }

        if (solProvider.request) {
            if (Array.isArray(transaction)) {
                return solProvider.request({ method: 'signAndSendAllTransactions', params: [transaction] });
            }
            return solProvider.request({ method: 'signAndSendTransaction', params: [transaction] });
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Solana sendTransaction not supported'
        );
    }

    on(event: string, listener: (...args: unknown[]) => void): () => void {
        const solProvider = this.requireProvider();
        const mappedEvent = event === 'accountsChanged' ? 'accountChanged' : event;
        const handler = event === 'accountsChanged'
            ? (account: unknown) => listener([account])
            : listener;

        if (!solProvider.on) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'Solana provider does not support events'
            );
        }
        solProvider.on(mappedEvent, handler);
        return () => {
            if (solProvider.removeListener) {
                solProvider.removeListener(mappedEvent, handler);
                return;
            }
            if (solProvider.off) {
                solProvider.off(mappedEvent, handler);
            }
        };
    }

    private requireProvider(): SolanaProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Solana provider not found'
            );
        }
        return this.provider;
    }
}
