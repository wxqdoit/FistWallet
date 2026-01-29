import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType, type ConnectedAccount } from '../../core/types';

type SolanaProvider = {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
};

type SolStrategy = {
    connect: () => Promise<ConnectedAccount>;
    disconnect: () => Promise<void>;
};

function requireProvider(provider?: SolanaProvider): SolanaProvider {
    if (!provider) {
        throw new AdapterError(
            ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
            'Solana provider not found'
        );
    }
    return provider;
}

export function createSolStrategy(provider?: SolanaProvider): SolStrategy {
    return {
        async connect(): Promise<ConnectedAccount> {
            const solProvider = requireProvider(provider);
            const resp = await solProvider.connect();
            return {
                address: resp.publicKey.toString(),
                chainType: ChainType.SOL,
            };
        },
        async disconnect(): Promise<void> {
            const solProvider = requireProvider(provider);
            await solProvider.disconnect();
        },
    };
}
