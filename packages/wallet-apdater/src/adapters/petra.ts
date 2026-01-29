import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createAptosStrategy } from './strategies/aptos';

export const PETRA_RDNS = 'app.petra';

export function createPetraAdapter(): WalletAdapter {
    const aptosProvider = typeof window !== 'undefined' ? (window as any).aptos : undefined;
    const strategy = createAptosStrategy(aptosProvider);
    const installed = !!aptosProvider;

    return {
        info: {
            rdns: PETRA_RDNS,
            name: 'Petra',
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
