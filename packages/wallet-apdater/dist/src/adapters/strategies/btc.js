import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType } from '../../core/types';
function requireProvider(provider) {
    if (!provider) {
        throw new AdapterError(ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND, 'Bitcoin provider not found');
    }
    return provider;
}
export function createBtcStrategy(provider) {
    return {
        async connect() {
            const btcProvider = requireProvider(provider);
            const accounts = await btcProvider.requestAccounts();
            if (!accounts?.length) {
                throw new AdapterError(ADAPTER_ERROR_CODES.REQUEST_FAILED, 'No accounts returned from provider');
            }
            return {
                address: accounts[0],
                chainType: ChainType.BTC,
            };
        },
    };
}
//# sourceMappingURL=btc.js.map