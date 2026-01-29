import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType, type ConnectedAccount } from '../../core/types';

type TronWeb = {
    defaultAddress?: {
        base58?: string;
        hex?: string;
        address?: string;
    };
};

type TronProvider = {
    ready?: boolean;
    tronWeb?: TronWeb;
    request?: (args: { method: string }) => Promise<unknown>;
};

type TronStrategy = {
    connect: () => Promise<ConnectedAccount>;
    disconnect: () => Promise<void>;
};

function requireProvider(provider?: TronProvider): TronProvider {
    if (!provider) {
        throw new AdapterError(
            ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
            'Tron provider not found'
        );
    }
    return provider;
}

function resolveAddress(provider: TronProvider): string | undefined {
    const defaultAddress = provider.tronWeb?.defaultAddress;
    return defaultAddress?.base58 ?? defaultAddress?.address ?? defaultAddress?.hex;
}

export function createTronStrategy(provider?: TronProvider): TronStrategy {
    return {
        async connect(): Promise<ConnectedAccount> {
            const tronProvider = requireProvider(provider);
            if (tronProvider.request) {
                await tronProvider.request({ method: 'tron_requestAccounts' });
            }

            const address = resolveAddress(tronProvider);
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
        },
        async disconnect(): Promise<void> {
            // TronLink does not support programmatic disconnect.
        },
    };
}
