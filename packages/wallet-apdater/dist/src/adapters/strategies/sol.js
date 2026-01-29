import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType } from '../../core/types';
function requireProvider(provider) {
    if (!provider) {
        throw new AdapterError(ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND, 'Solana provider not found');
    }
    return provider;
}
export function createSolStrategy(provider) {
    return {
        async connect() {
            const solProvider = requireProvider(provider);
            const resp = await solProvider.connect();
            return {
                address: resp.publicKey.toString(),
                chainType: ChainType.SOL,
            };
        },
        async disconnect() {
            const solProvider = requireProvider(provider);
            await solProvider.disconnect();
        },
    };
}
//# sourceMappingURL=sol.js.map