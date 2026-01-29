import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType, type BtcAccount, type ConnectedAccount } from '../../core/types';

type BitcoinProvider = {
    requestAccounts: () => Promise<Array<string | BtcAccount>>;
};

type BtcStrategy = {
    connect: () => Promise<ConnectedAccount>;
};

function requireProvider(provider?: BitcoinProvider): BitcoinProvider {
    if (!provider) {
        throw new AdapterError(
            ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
            'Bitcoin provider not found'
        );
    }
    return provider;
}

export function createBtcStrategy(provider?: BitcoinProvider): BtcStrategy {
    return {
        async connect(): Promise<ConnectedAccount> {
            const btcProvider = requireProvider(provider);
            const accounts = await btcProvider.requestAccounts();
            if (!accounts?.length) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.REQUEST_FAILED,
                    'No accounts returned from provider'
                );
            }
            return {
                address: accounts[0] as ConnectedAccount['address'],
                chainType: ChainType.BTC,
            };
        },
    };
}
