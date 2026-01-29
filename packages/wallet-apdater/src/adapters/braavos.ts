import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createStarknetStrategy } from './strategies/starknet';

export const BRAAVOS_RDNS = 'wallet.braavos';

type StarknetLike = {
    id?: string;
    name?: string;
    wallet?: { id?: string; name?: string };
};

function isBraavos(provider?: StarknetLike): boolean {
    if (!provider) return false;
    const candidates = [
        provider.id,
        provider.name,
        provider.wallet?.id,
        provider.wallet?.name,
    ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
    return candidates.some((value) => value.includes('braavos'));
}

export function createBraavosAdapter(): WalletAdapter {
    const win = typeof window !== 'undefined' ? (window as any) : undefined;
    const injected = win?.starknet_braavos;
    const generic = win?.starknet;
    const provider = injected ?? (isBraavos(generic) ? generic : undefined);
    const strategy = createStarknetStrategy(provider);
    const installed = !!provider;

    return {
        info: {
            rdns: BRAAVOS_RDNS,
            name: 'Braavos',
            installed,
        },
        supports: [ChainType.STARKNET],
        async connect(options: ConnectOptions) {
            if (options.chainType !== ChainType.STARKNET) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            return strategy.connect();
        },
        async disconnect(options?: DisconnectOptions) {
            if (options?.chainType && options.chainType !== ChainType.STARKNET) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            await strategy.disconnect();
        },
    };
}
