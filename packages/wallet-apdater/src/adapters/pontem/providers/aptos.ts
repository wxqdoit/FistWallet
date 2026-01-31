import type { IBaseProvider } from '@/core/providers/aptos';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions, type SendTransactionOptions } from '@/core/types';

type AptosConnectResult = {
    address?: string;
    account?: { address?: string };
    publicKey?: string;
};

type AptosWalletProvider = {
    connect?: () => Promise<AptosConnectResult>;
    account?: () => Promise<{ address?: string }>;
    disconnect?: () => Promise<void>;
    signAndSubmitTransaction?: (transaction: unknown) => Promise<unknown>;
    signAndSubmit?: (payload: unknown, options?: unknown) => Promise<unknown>;
    onAccountChange?: (callback: (account: unknown) => void) => void;
    onChangeAccount?: (callback: (account: unknown) => void) => void;
    onNetworkChange?: (callback: (network: unknown) => void) => void;
    onChangeNetwork?: (callback: (network: unknown) => void) => void;
    onDisconnect?: (callback: () => void) => void;
};

export class AptosProvider implements IBaseProvider {
    readonly chainType: ChainType.APTOS = ChainType.APTOS;
    constructor(private provider?: AptosWalletProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const aptosProvider = this.requireProvider();
        let address: string | undefined;

        if (aptosProvider.connect) {
            const result = await aptosProvider.connect();
            address = this.resolveAddress(result);
        }

        if (!address && aptosProvider.account) {
            const account = await aptosProvider.account();
            address = this.resolveAddress(account);
        }

        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No account returned from provider'
            );
        }

        return {
            address,
            chainType: ChainType.APTOS,
        };
    }

    async disconnect(): Promise<void> {
        const aptosProvider = this.requireProvider();
        if (aptosProvider.disconnect) {
            await aptosProvider.disconnect();
        }
    }

    async sendTransaction(options: SendTransactionOptions): Promise<unknown> {
        const aptosProvider = this.requireProvider();
        const transaction = options.transaction as any;

        if (aptosProvider.signAndSubmitTransaction) {
            return aptosProvider.signAndSubmitTransaction(transaction);
        }

        if (aptosProvider.signAndSubmit) {
            if (transaction && typeof transaction === 'object' && 'payload' in transaction) {
                return aptosProvider.signAndSubmit(transaction.payload, transaction.options);
            }
            return aptosProvider.signAndSubmit(transaction);
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Aptos sendTransaction not supported'
        );
    }

    on(event: string, listener: (...args: unknown[]) => void): () => void {
        const aptosProvider = this.requireProvider();
        if (event === 'accountsChanged' || event === 'accountChanged') {
            const handler = event === 'accountsChanged'
                ? (account: unknown) => listener(Array.isArray(account) ? account : [account])
                : listener;
            if (aptosProvider.onAccountChange) {
                aptosProvider.onAccountChange(handler);
                return () => {};
            }
            if (aptosProvider.onChangeAccount) {
                aptosProvider.onChangeAccount(handler);
                return () => {};
            }
        }

        if (event === 'networkChanged') {
            if (aptosProvider.onNetworkChange) {
                aptosProvider.onNetworkChange(listener);
                return () => {};
            }
            if (aptosProvider.onChangeNetwork) {
                aptosProvider.onChangeNetwork(listener);
                return () => {};
            }
        }

        if (event === 'disconnect' && aptosProvider.onDisconnect) {
            aptosProvider.onDisconnect(() => listener(undefined));
            return () => {};
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            `Aptos provider does not support event: ${event}`
        );
    }

    private resolveAddress(result?: AptosConnectResult | { address?: string } | null): string | undefined {
        if (!result) return undefined;
        if ('address' in result && result.address) return result.address;
        const account = (result as AptosConnectResult).account;
        if (account?.address) return account.address;
        return undefined;
    }

    private requireProvider(): AptosWalletProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Aptos provider not found'
            );
        }
        return this.provider;
    }
}
