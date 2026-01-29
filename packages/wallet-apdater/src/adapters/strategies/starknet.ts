import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType, type ConnectedAccount } from '../../core/types';

type StarknetAccount = {
    address?: string;
};

type StarknetProvider = {
    enable?: () => Promise<Array<string | StarknetAccount>>;
    account?: StarknetAccount;
    selectedAddress?: string;
    id?: string;
    name?: string;
    disconnect?: () => Promise<void>;
};

type StarknetStrategy = {
    connect: () => Promise<ConnectedAccount>;
    disconnect: () => Promise<void>;
};

function requireProvider(provider?: StarknetProvider): StarknetProvider {
    if (!provider) {
        throw new AdapterError(
            ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
            'Starknet provider not found'
        );
    }
    return provider;
}

function resolveAddress(provider: StarknetProvider, result?: Array<string | StarknetAccount>): string | undefined {
    if (provider.account?.address) return provider.account.address;
    if (provider.selectedAddress) return provider.selectedAddress;
    const first = result?.[0];
    if (!first) return undefined;
    if (typeof first === 'string') return first;
    return first.address;
}

export function createStarknetStrategy(provider?: StarknetProvider): StarknetStrategy {
    return {
        async connect(): Promise<ConnectedAccount> {
            const starknetProvider = requireProvider(provider);
            let result: Array<string | StarknetAccount> | undefined;
            if (starknetProvider.enable) {
                result = await starknetProvider.enable();
            }

            const address = resolveAddress(starknetProvider, result);
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
        },
        async disconnect(): Promise<void> {
            const starknetProvider = requireProvider(provider);
            if (starknetProvider.disconnect) {
                await starknetProvider.disconnect();
            }
        },
    };
}
