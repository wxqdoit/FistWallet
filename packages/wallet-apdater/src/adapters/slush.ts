import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createSuiStrategy } from './strategies/sui';
import { findSuiWalletByNames } from './utils/suiWallets';

export const SLUSH_RDNS = 'app.slush';

export function createSlushAdapter(): WalletAdapter {
    const fallback = typeof window !== 'undefined' ? (window as any).suiWallet : undefined;
    const resolveProvider = () => findSuiWalletByNames(['slush']) ?? fallback;
    const installed = !!resolveProvider();
    const strategy = createSuiStrategy(resolveProvider);

    return {
        info: {
            rdns: SLUSH_RDNS,
            name: 'Slush',
            installed,
        },
        supports: [ChainType.SUI],
        async connect(options: ConnectOptions) {
            if (options.chainType !== ChainType.SUI) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            return strategy.connect();
        },
        async disconnect(options?: DisconnectOptions) {
            if (options?.chainType && options.chainType !== ChainType.SUI) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            await strategy.disconnect();
        },
    };
}
