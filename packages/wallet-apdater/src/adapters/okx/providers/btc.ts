import type { IBaseProvider } from '@/core/providers/btc';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type BtcAccount, type ConnectedAccount, type ConnectOptions, type SendTransactionOptions } from '@/core/types';

type BitcoinProvider = {
    connect?: () => Promise<unknown>;
    requestAccounts?: () => Promise<Array<string | BtcAccount>>;
    getAccounts?: () => Promise<Array<string | BtcAccount>>;
    sendBitcoin?: (to: string, amount: unknown, options?: unknown) => Promise<unknown>;
    send?: (params: unknown) => Promise<unknown>;
    sendInscription?: (to: string, inscriptionId: string, options?: unknown) => Promise<unknown>;
    transferNft?: (params: unknown) => Promise<unknown>;
    pushTx?: (rawTx: string) => Promise<unknown>;
    signPsbt?: (psbt: unknown, options?: unknown) => Promise<unknown>;
    signPSBT?: (psbt: unknown, options?: unknown) => Promise<unknown>;
    signPsbts?: (psbts: unknown, options?: unknown) => Promise<unknown>;
    pushPsbt?: (psbt: unknown) => Promise<unknown>;
    sendPsbt?: (txs: unknown, from?: unknown) => Promise<unknown>;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type DisconnectMode = 'error' | 'noop';

export class BtcProvider implements IBaseProvider {
    readonly chainType: ChainType.BTC = ChainType.BTC;
    constructor(private provider?: BitcoinProvider, private disconnectMode: DisconnectMode = 'error') {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const btcProvider = this.requireProvider();
        let address = await this.resolveAddress(btcProvider.connect ? await btcProvider.connect() : undefined);

        if (!address && btcProvider.requestAccounts) {
            address = await this.resolveAddress(await btcProvider.requestAccounts());
        }

        if (!address && btcProvider.getAccounts) {
            address = await this.resolveAddress(await btcProvider.getAccounts());
        }

        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No accounts returned from provider'
            );
        }
        return {
            address,
            chainType: ChainType.BTC,
        };
    }

    async disconnect(): Promise<void> {
        if (this.disconnectMode === 'noop') {
            return;
        }
        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Bitcoin disconnect not supported'
        );
    }

    async sendTransaction(options: SendTransactionOptions): Promise<unknown> {
        const btcProvider = this.requireProvider();
        const transaction = options.transaction as any;

        if (transaction && typeof transaction === 'object' && typeof transaction.method === 'string') {
            const fn = (btcProvider as any)[transaction.method];
            if (typeof fn === 'function') {
                const params = Array.isArray(transaction.params)
                    ? transaction.params
                    : (Array.isArray(transaction.args) ? transaction.args : (transaction.params !== undefined ? [transaction.params] : []));
                return fn(...params);
            }
        }

        if (btcProvider.sendBitcoin) {
            const to = transaction?.toAddress ?? transaction?.to ?? transaction?.address;
            const amount = transaction?.satoshis ?? transaction?.amount ?? transaction?.value;
            if (to !== undefined && amount !== undefined) {
                return btcProvider.sendBitcoin(to, amount, transaction?.options ?? transaction?.opts);
            }
        }

        if (btcProvider.send && transaction && typeof transaction === 'object') {
            return btcProvider.send(transaction);
        }

        if (btcProvider.sendInscription) {
            const to = transaction?.toAddress ?? transaction?.to ?? transaction?.address;
            const inscriptionId = transaction?.inscriptionId ?? transaction?.id;
            if (to && inscriptionId) {
                return btcProvider.sendInscription(to, inscriptionId, transaction?.options ?? transaction?.opts);
            }
        }

        if (btcProvider.transferNft && transaction && typeof transaction === 'object') {
            return btcProvider.transferNft(transaction);
        }

        if (btcProvider.pushTx) {
            const rawTx = typeof transaction === 'string'
                ? transaction
                : (transaction?.rawTx ?? transaction?.rawTransaction ?? transaction?.tx);
            if (rawTx) {
                return btcProvider.pushTx(rawTx);
            }
        }

        const psbt = transaction?.psbt ?? transaction?.psbtHex ?? transaction?.psbtBytes ?? transaction?.psbtBase64;
        if (psbt && (btcProvider.signPsbt || btcProvider.signPSBT)) {
            const sign = btcProvider.signPsbt ?? btcProvider.signPSBT;
            return sign?.(psbt, transaction?.options ?? transaction?.opts);
        }

        if (psbt && btcProvider.pushPsbt) {
            return btcProvider.pushPsbt(psbt);
        }

        if (transaction?.txs && btcProvider.sendPsbt) {
            return btcProvider.sendPsbt(transaction.txs, transaction.from);
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Bitcoin sendTransaction not supported'
        );
    }

    on(event: string, listener: (...args: unknown[]) => void): () => void {
        const btcProvider = this.requireProvider();
        if (!btcProvider.on) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'Bitcoin provider does not support events'
            );
        }
        btcProvider.on(event, listener);
        return () => {
            if (btcProvider.removeListener) {
                btcProvider.removeListener(event, listener);
                return;
            }
            if (btcProvider.off) {
                btcProvider.off(event, listener);
            }
        };
    }

    private async resolveAddress(result: unknown): Promise<ConnectedAccount['address'] | undefined> {
        if (!result) return undefined;
        if (Array.isArray(result)) {
            return result[0] as ConnectedAccount['address'];
        }
        if (typeof result === 'object') {
            const address = (result as any).address;
            if (address) return address as ConnectedAccount['address'];
            const accounts = (result as any).accounts;
            if (Array.isArray(accounts) && accounts.length) {
                return accounts[0] as ConnectedAccount['address'];
            }
        }
        return undefined;
    }

    private requireProvider(): BitcoinProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Bitcoin provider not found'
            );
        }
        return this.provider;
    }
}
