import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType } from '../core/types';
import { createBtcStrategy } from './strategies/btc';
import { createEvmStrategy } from './strategies/evm';
import { createSolStrategy } from './strategies/sol';
export const PHANTOM_RDNS = 'app.phantom';
export function createPhantomAdapter(detail) {
    const phantom = typeof window !== 'undefined' ? window.phantom : undefined;
    const evmProvider = detail?.provider ?? phantom?.ethereum;
    const solProvider = phantom?.solana;
    const btcProvider = phantom?.bitcoin;
    const evmStrategy = createEvmStrategy(evmProvider);
    const solStrategy = createSolStrategy(solProvider);
    const btcStrategy = createBtcStrategy(btcProvider);
    const installed = !!detail || !!phantom;
    return {
        info: {
            rdns: PHANTOM_RDNS,
            name: 'Phantom',
            installed,
        },
        supports: [ChainType.EVM, ChainType.SOL, ChainType.BTC],
        async connect(options) {
            switch (options.chainType) {
                case ChainType.EVM:
                    return evmStrategy.connect(options.chainId);
                case ChainType.SOL:
                    return solStrategy.connect();
                case ChainType.BTC:
                    return btcStrategy.connect();
                default:
                    throw new AdapterError(ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN, `Unsupported chain type: ${options.chainType}`);
            }
        },
        async disconnect(options) {
            switch (options?.chainType) {
                case ChainType.EVM:
                    await evmStrategy.disconnect();
                    return;
                case ChainType.SOL:
                    await solStrategy.disconnect();
                    return;
                case ChainType.BTC:
                    throw new AdapterError(ADAPTER_ERROR_CODES.REQUEST_FAILED, 'Bitcoin disconnect not supported');
                case undefined:
                    await Promise.allSettled([
                        evmStrategy.disconnect(),
                        solStrategy.disconnect(),
                    ]);
                    return;
                default:
                    throw new AdapterError(ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN, `Unsupported chain type: ${options?.chainType}`);
            }
        },
        async switchNetwork({ chainId, chainType }) {
            if (chainType && chainType !== ChainType.EVM) {
                return false;
            }
            return evmStrategy.switchNetwork?.(chainId) ?? false;
        },
        async addNetwork({ chainConfig, chainType }) {
            if (chainType && chainType !== ChainType.EVM) {
                return false;
            }
            return evmStrategy.addNetwork?.(chainConfig) ?? false;
        },
    };
}
//# sourceMappingURL=phantom.js.map