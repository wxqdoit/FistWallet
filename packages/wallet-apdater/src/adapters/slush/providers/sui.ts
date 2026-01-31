import type { IBaseProvider } from '@/core/providers/sui';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions, type SendTransactionOptions } from '@/core/types';

type SuiAccount = {
    address?: string;
};

type SuiConnectResult = {
    accounts?: SuiAccount[];
    address?: string;
};

type SuiWalletProvider = {
    features?: Record<string, unknown>;
    connect?: () => Promise<SuiConnectResult>;
    disconnect?: () => Promise<void>;
    accounts?: SuiAccount[];
    signAndExecuteTransactionBlock?: (input: unknown) => Promise<unknown>;
    signAndExecuteTransaction?: (input: unknown) => Promise<unknown>;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    off?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type ProviderSource = SuiWalletProvider | (() => SuiWalletProvider | undefined);

export class SuiProvider implements IBaseProvider {
    readonly chainType: ChainType.SUI = ChainType.SUI;
    constructor(private provider?: ProviderSource) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const suiProvider = this.resolveProvider();
        let result: SuiConnectResult | undefined;

        const standardConnect = suiProvider.features?.['standard:connect'] as { connect?: () => Promise<SuiConnectResult> } | undefined;
        if (standardConnect?.connect) {
            result = await standardConnect.connect();
        } else if (suiProvider.connect) {
            result = await suiProvider.connect();
        }

        const address = this.resolveAddress(result, suiProvider);
        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No account returned from provider'
            );
        }

        return {
            address,
            chainType: ChainType.SUI,
        };
    }

    async disconnect(): Promise<void> {
        const suiProvider = this.resolveProvider();
        const standardDisconnect = suiProvider.features?.['standard:disconnect'] as { disconnect?: () => Promise<void> } | undefined;
        if (standardDisconnect?.disconnect) {
            await standardDisconnect.disconnect();
            return;
        }
        if (suiProvider.disconnect) {
            await suiProvider.disconnect();
        }
    }

    async sendTransaction(options: SendTransactionOptions): Promise<unknown> {
        const suiProvider = this.resolveProvider();
        const transaction = options.transaction;

        const standardExecute = suiProvider.features?.['sui:signAndExecuteTransactionBlock'] as { signAndExecuteTransactionBlock?: (input: unknown) => Promise<unknown> } | undefined;
        if (standardExecute?.signAndExecuteTransactionBlock) {
            return standardExecute.signAndExecuteTransactionBlock(transaction);
        }

        const standardExecuteLegacy = suiProvider.features?.['sui:signAndExecuteTransaction'] as { signAndExecuteTransaction?: (input: unknown) => Promise<unknown> } | undefined;
        if (standardExecuteLegacy?.signAndExecuteTransaction) {
            return standardExecuteLegacy.signAndExecuteTransaction(transaction);
        }

        if (suiProvider.signAndExecuteTransactionBlock) {
            return suiProvider.signAndExecuteTransactionBlock(transaction);
        }

        if (suiProvider.signAndExecuteTransaction) {
            return suiProvider.signAndExecuteTransaction(transaction);
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Sui sendTransaction not supported'
        );
    }

    on(event: string, listener: (...args: unknown[]) => void): () => void {
        const suiProvider = this.resolveProvider();
        const events = suiProvider.features?.['standard:events'] as { on?: (event: string, listener: (...args: unknown[]) => void) => void; off?: (event: string, listener: (...args: unknown[]) => void) => void; removeListener?: (event: string, listener: (...args: unknown[]) => void) => void } | undefined;
        const mappedEvent = event === 'accountsChanged' ? 'accountChanged' : event;
        const handler = event === 'accountsChanged'
            ? (accounts: unknown) => listener(Array.isArray(accounts) ? accounts : [accounts])
            : listener;

        if (events?.on) {
            events.on(mappedEvent, handler);
            return () => {
                if (events.removeListener) {
                    events.removeListener(mappedEvent, handler);
                    return;
                }
                if (events.off) {
                    events.off(mappedEvent, handler);
                }
            };
        }

        if (suiProvider.on) {
            suiProvider.on(mappedEvent, handler);
            return () => {
                if (suiProvider.removeListener) {
                    suiProvider.removeListener(mappedEvent, handler);
                    return;
                }
                if (suiProvider.off) {
                    suiProvider.off(mappedEvent, handler);
                }
            };
        }

        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Sui provider does not support events'
        );
    }

    private resolveAddress(result?: SuiConnectResult | null, provider?: SuiWalletProvider): string | undefined {
        if (result?.address) return result.address;
        const accounts = result?.accounts ?? provider?.accounts;
        return accounts?.[0]?.address;
    }

    private resolveProvider(): SuiWalletProvider {
        const provider = typeof this.provider === 'function' ? this.provider() : this.provider;
        if (!provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Sui provider not found'
            );
        }
        return provider;
    }
}
