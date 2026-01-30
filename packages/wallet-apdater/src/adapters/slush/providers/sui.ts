import type { IBaseProvider } from '@/core/providers/sui';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions } from '@/core/types';

type SuiAccount = {
    address?: string;
};

type SuiConnectResult = {
    accounts?: SuiAccount[];
    address?: string;
};

type SuiWalletProvider = {
    features?: Record<string, { connect?: () => Promise<SuiConnectResult> } | { disconnect?: () => Promise<void> }>;
    connect?: () => Promise<SuiConnectResult>;
    disconnect?: () => Promise<void>;
    accounts?: SuiAccount[];
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
