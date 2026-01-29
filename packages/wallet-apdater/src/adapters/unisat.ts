import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createBtcStrategy } from './strategies/btc';

export const UNISAT_RDNS = 'io.unisat';

export function createUnisatAdapter(): WalletAdapter {
    const unisat = typeof window !== 'undefined' ? (window as any).unisat : undefined;
    const strategy = createBtcStrategy(unisat);
    const installed = !!unisat;

    return {
        info: {
            rdns: UNISAT_RDNS,
            name: 'UniSat',
            installed,
        },
        supports: [ChainType.BTC],
        async connect(options: ConnectOptions) {
            if (options.chainType !== ChainType.BTC) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            return strategy.connect();
        },
        async disconnect(options?: DisconnectOptions) {
            if (options?.chainType && options.chainType !== ChainType.BTC) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            // UniSat does not support programmatic disconnect.
        },
    };
}
