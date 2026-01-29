import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType, type ConnectedAccount } from '../../core/types';

type SuiAccount = {
    address?: string;
};

type SuiConnectResult = {
    accounts?: SuiAccount[];
    address?: string;
};

type SuiProvider = {
    features?: Record<string, { connect?: () => Promise<SuiConnectResult> } | { disconnect?: () => Promise<void> }>;
    connect?: () => Promise<SuiConnectResult>;
    disconnect?: () => Promise<void>;
    accounts?: SuiAccount[];
};

type SuiStrategy = {
    connect: () => Promise<ConnectedAccount>;
    disconnect: () => Promise<void>;
};

type ProviderSource = SuiProvider | (() => SuiProvider | undefined);

function resolveProvider(source?: ProviderSource): SuiProvider {
    const provider = typeof source === 'function' ? source() : source;
    if (!provider) {
        throw new AdapterError(
            ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
            'Sui provider not found'
        );
    }
    return provider;
}

function resolveAddress(result?: SuiConnectResult | null, provider?: SuiProvider): string | undefined {
    if (result?.address) return result.address;
    const accounts = result?.accounts ?? provider?.accounts;
    return accounts?.[0]?.address;
}

export function createSuiStrategy(provider?: ProviderSource): SuiStrategy {
    return {
        async connect(): Promise<ConnectedAccount> {
            const suiProvider = resolveProvider(provider);
            let result: SuiConnectResult | undefined;

            const standardConnect = suiProvider.features?.['standard:connect'] as { connect?: () => Promise<SuiConnectResult> } | undefined;
            if (standardConnect?.connect) {
                result = await standardConnect.connect();
            } else if (suiProvider.connect) {
                result = await suiProvider.connect();
            }

            const address = resolveAddress(result, suiProvider);
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
        },
        async disconnect(): Promise<void> {
            const suiProvider = resolveProvider(provider);
            const standardDisconnect = suiProvider.features?.['standard:disconnect'] as { disconnect?: () => Promise<void> } | undefined;
            if (standardDisconnect?.disconnect) {
                await standardDisconnect.disconnect();
                return;
            }
            if (suiProvider.disconnect) {
                await suiProvider.disconnect();
            }
        },
    };
}
