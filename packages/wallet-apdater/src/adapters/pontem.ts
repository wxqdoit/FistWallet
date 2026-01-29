import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createAptosStrategy } from './strategies/aptos';

export const PONTEM_RDNS = 'network.pontem';

export function createPontemAdapter(): WalletAdapter {
    const pontemProvider = typeof window !== 'undefined' ? (window as any).pontem : undefined;
    const strategy = createAptosStrategy(pontemProvider);
    const installed = !!pontemProvider;

    return {
        info: {
            rdns: PONTEM_RDNS,
            name: 'Pontem',
            installed,
        },
        supports: [ChainType.APTOS],
        async connect(options: ConnectOptions) {
            if (options.chainType !== ChainType.APTOS) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            return strategy.connect();
        },
        async disconnect(options?: DisconnectOptions) {
            if (options?.chainType && options.chainType !== ChainType.APTOS) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            await strategy.disconnect();
        },
    };
}
