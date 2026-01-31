import type { IBaseProvider } from '@/core/providers/starknet';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions, type SendTransactionOptions } from '@/core/types';

type StarknetAccount = {
    address?: string;
    execute?: (transactions: unknown, abis?: unknown) => Promise<unknown>;
};

type StarknetWalletProvider = {
    enable?: () => Promise<Array<string | StarknetAccount>>;
    account?: StarknetAccount;
    selectedAddress?: string;
    disconnect?: () => Promise<void>;
    execute?: (transactions: unknown, abis?: unknown) => Promise<unknown>;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export class StarknetProvider implements IBaseProvider {
    readonly chainType: ChainType.STARKNET = ChainType.STARKNET;
    constructor(private provider?: StarknetWalletProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const starknetProvider = this.requireProvider();
        let result: Array<string | StarknetAccount> | undefined;
        if (starknetProvider.enable) {
            result = await starknetProvider.enable();
        }

        const address = this.resolveAddress(starknetProvider, result);
        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No account returned from provider'
            );
        }

        return {
            address,
            chainType: ChainType.STARKNET,
        };
    }

    async disconnect(): Promise<void> {
        const starknetProvider = this.requireProvider();
        if (starknetProvider.disconnect) {
            await starknetProvider.disconnect();
        }
    }

    async sendTransaction(options: SendTransactionOptions): Promise<unknown> {
        const starknetProvider = this.requireProvider();
        const account = starknetProvider.account;
        const transaction = options.transaction as any;
        const calls = transaction && typeof transaction === 'object'
            ? (transaction.transactions ?? transaction.calls ?? transaction)
            : transaction;
        const abis = transaction && typeof transaction === 'object'
            ? (transaction.abis ?? transaction.abi)
            : undefined;

        if (account?.execute) {
            return account.execute(calls, abis);
        }

        if (starknetProvider.execute) {
            return starknetProvider.execute(calls, abis);
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Starknet sendTransaction not supported'
        );
    }

    on(event: string, listener: (...args: unknown[]) => void): () => void {
        const starknetProvider = this.requireProvider();
        const mappedEvent = event === 'accountChanged' ? 'accountsChanged' : event;
        if (!starknetProvider.on) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'Starknet provider does not support events'
            );
        }
        starknetProvider.on(mappedEvent, listener);
        return () => {
            if (starknetProvider.removeListener) {
                starknetProvider.removeListener(mappedEvent, listener);
                return;
            }
            if (starknetProvider.off) {
                starknetProvider.off(mappedEvent, listener);
            }
        };
    }

    private resolveAddress(provider: StarknetWalletProvider, result?: Array<string | StarknetAccount>): string | undefined {
        if (provider.account?.address) return provider.account.address;
        if (provider.selectedAddress) return provider.selectedAddress;
        const first = result?.[0];
        if (!first) return undefined;
        if (typeof first === 'string') return first;
        return first.address;
    }

    private requireProvider(): StarknetWalletProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Starknet provider not found'
            );
        }
        return this.provider;
    }
}
