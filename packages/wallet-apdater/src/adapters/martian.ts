import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createAptosStrategy } from './strategies/aptos';
import { createSuiStrategy } from './strategies/sui';

export const MARTIAN_RDNS = 'app.martian';

export function createMartianAdapter(): WalletAdapter {
    const martian = typeof window !== 'undefined' ? (window as any).martian : undefined;
    const aptosStrategy = createAptosStrategy(martian);
    const suiStrategy = createSuiStrategy(martian);
    const installed = !!martian;

    return {
        info: {
            rdns: MARTIAN_RDNS,
            name: 'Martian',
            installed,
        },
        supports: [ChainType.APTOS, ChainType.SUI],
        async connect(options: ConnectOptions) {
            switch (options.chainType) {
                case ChainType.APTOS:
                    return aptosStrategy.connect();
                case ChainType.SUI:
                    return suiStrategy.connect();
                default:
                    throw new AdapterError(
                        ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                        `Unsupported chain type: ${options.chainType}`
                    );
            }
        },
        async disconnect(options?: DisconnectOptions) {
            switch (options?.chainType) {
                case ChainType.APTOS:
                    await aptosStrategy.disconnect();
                    return;
                case ChainType.SUI:
                    await suiStrategy.disconnect();
                    return;
                case undefined:
                    await Promise.allSettled([
                        aptosStrategy.disconnect(),
                        suiStrategy.disconnect(),
                    ]);
                    return;
                default:
                    throw new AdapterError(
                        ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                        `Unsupported chain type: ${options?.chainType}`
                    );
            }
        },
    };
}
