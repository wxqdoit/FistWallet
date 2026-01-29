import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createAptosStrategy } from './strategies/aptos';

export const RAZOR_RDNS = 'wallet.razor';

function resolveRazorProvider(): any {
    if (typeof window === 'undefined') return undefined;
    const win = window as any;
    return win.razor ?? win.razorWallet ?? win.razorwallet ?? win.razor_sdk;
}

export function createRazorAdapter(): WalletAdapter {
    const provider = resolveRazorProvider();
    const strategy = createAptosStrategy(provider);
    const installed = !!provider;

    return {
        info: {
            rdns: RAZOR_RDNS,
            name: 'Razor',
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
