import type { IBaseProvider } from '@/core/providers/tron';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions, type SendTransactionOptions } from '@/core/types';

type TronWeb = {
    defaultAddress?: {
        base58?: string;
        hex?: string;
        address?: string;
    };
    trx?: {
        sendRawTransaction?: (transaction: unknown) => Promise<unknown>;
        sendTransaction?: (to: string, amount: unknown, from?: string, options?: unknown) => Promise<unknown>;
    };
};

type TronWalletProvider = {
    tronWeb?: TronWeb;
    request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    disconnect?: () => Promise<void>;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export class TronProvider implements IBaseProvider {
    readonly chainType: ChainType.TRON = ChainType.TRON;
    constructor(private provider?: TronWalletProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const tronProvider = this.requireProvider();
        if (tronProvider.request) {
            await tronProvider.request({ method: 'tron_requestAccounts' });
        }

        const address = this.resolveAddress(tronProvider);
        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No account returned from provider'
            );
        }

        return {
            address,
            chainType: ChainType.TRON,
        };
    }

    async disconnect(): Promise<void> {
        const tronProvider = this.requireProvider();
        if (tronProvider.disconnect) {
            await tronProvider.disconnect();
        }
    }

    async sendTransaction(options: SendTransactionOptions): Promise<unknown> {
        const tronProvider = this.requireProvider();
        const transaction = options.transaction as any;

        if (transaction && typeof transaction === 'object' && typeof transaction.method === 'string' && tronProvider.request) {
            const params = Array.isArray(transaction.params)
                ? transaction.params
                : (transaction.params !== undefined ? [transaction.params] : transaction.args);
            return tronProvider.request({ method: transaction.method, params });
        }

        const tronWeb = tronProvider.tronWeb;
        const tronTrx = tronWeb?.trx;
        if (!tronTrx) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'Tron provider does not expose tronWeb.trx'
            );
        }

        if (tronTrx.sendTransaction && transaction) {
            const to = transaction.to ?? transaction.address ?? transaction.toAddress;
            const amount = transaction.amount ?? transaction.value ?? transaction.sun ?? transaction.satoshis;
            if (to !== undefined && amount !== undefined) {
                return tronTrx.sendTransaction(to, amount, transaction.from, transaction.options ?? transaction.opts);
            }
        }

        const rawCandidate = transaction?.rawTransaction ?? transaction?.signedTransaction;
        const isRawTx = rawCandidate !== undefined || transaction?.raw_data || transaction?.txID || transaction?.signature;
        if (tronTrx.sendRawTransaction && isRawTx) {
            return tronTrx.sendRawTransaction(rawCandidate ?? transaction);
        }

        if (tronTrx.sendRawTransaction) {
            return tronTrx.sendRawTransaction(transaction);
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Tron sendTransaction not supported'
        );
    }

    on(event: string, listener: (...args: unknown[]) => void): () => void {
        const tronProvider = this.requireProvider();
        if (tronProvider.on) {
            tronProvider.on(event, listener);
            return () => {
                if (tronProvider.removeListener) {
                    tronProvider.removeListener(event, listener);
                    return;
                }
                if (tronProvider.off) {
                    tronProvider.off(event, listener);
                }
            };
        }

        if (typeof window === 'undefined') {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'Tron provider does not support events'
            );
        }

        const handler = (e: MessageEvent) => {
            const action = (e as any)?.data?.message?.action;
            if (!action) return;
            if ((event === 'accountsChanged' || event === 'accountChanged') && action === 'accountsChanged') {
                listener((e as any).data?.message?.data ?? (e as any).data?.message);
                return;
            }
            if (event === 'disconnect' && (action === 'disconnect' || action === 'disconnectWeb')) {
                listener((e as any).data?.message);
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }

    private resolveAddress(provider: TronWalletProvider): string | undefined {
        const defaultAddress = provider.tronWeb?.defaultAddress;
        return defaultAddress?.base58 ?? defaultAddress?.address ?? defaultAddress?.hex;
    }

    private requireProvider(): TronWalletProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Tron provider not found'
            );
        }
        return this.provider;
    }
}
