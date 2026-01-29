import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType, type ConnectedAccount } from '../../core/types';

type AptosConnectResult = {
    address?: string;
    account?: { address?: string };
    publicKey?: string;
};

type AptosProvider = {
    connect?: () => Promise<AptosConnectResult>;
    account?: () => Promise<{ address?: string }>;
    disconnect?: () => Promise<void>;
};

type AptosStrategy = {
    connect: () => Promise<ConnectedAccount>;
    disconnect: () => Promise<void>;
};

function requireProvider(provider?: AptosProvider): AptosProvider {
    if (!provider) {
        throw new AdapterError(
            ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
            'Aptos provider not found'
        );
    }
    return provider;
}

function resolveAddress(result?: AptosConnectResult | { address?: string } | null): string | undefined {
    if (!result) return undefined;
    if ('address' in result && result.address) return result.address;
    const account = (result as AptosConnectResult).account;
    if (account?.address) return account.address;
    return undefined;
}

export function createAptosStrategy(provider?: AptosProvider): AptosStrategy {
    return {
        async connect(): Promise<ConnectedAccount> {
            const aptosProvider = requireProvider(provider);
            let address: string | undefined;

            if (aptosProvider.connect) {
                const result = await aptosProvider.connect();
                address = resolveAddress(result);
            }

            if (!address && aptosProvider.account) {
                const account = await aptosProvider.account();
                address = resolveAddress(account);
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
        },
        async disconnect(): Promise<void> {
            const aptosProvider = requireProvider(provider);
            if (aptosProvider.disconnect) {
                await aptosProvider.disconnect();
            }
        },
    };
}
