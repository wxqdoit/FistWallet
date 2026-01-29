import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createTronStrategy } from './strategies/tron';

export const TRONLINK_RDNS = 'org.tronlink';

export function createTronLinkAdapter(): WalletAdapter {
    const tronLink = typeof window !== 'undefined' ? (window as any).tronLink : undefined;
    const strategy = createTronStrategy(tronLink);
    const installed = !!tronLink;

    return {
        info: {
            rdns: TRONLINK_RDNS,
            name: 'TronLink',
            installed,
        },
        supports: [ChainType.TRON],
        async connect(options: ConnectOptions) {
            if (options.chainType !== ChainType.TRON) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            return strategy.connect();
        },
        async disconnect(options?: DisconnectOptions) {
            if (options?.chainType && options.chainType !== ChainType.TRON) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            await strategy.disconnect();
        },
    };
}
