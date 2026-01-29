import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType } from '../core/types';
import { createEvmStrategy } from './strategies/evm';
export const METAMASK_RDNS = 'io.metamask';
export function createMetamaskAdapter(detail) {
    const injected = typeof window !== 'undefined' ? window.ethereum : undefined;
    const fallbackProvider = injected?.isMetaMask ? injected : undefined;
    const evmProvider = detail?.provider ?? fallbackProvider;
    const strategy = createEvmStrategy(evmProvider);
    const installed = !!detail || !!fallbackProvider;
    return {
        info: {
            rdns: METAMASK_RDNS,
            name: 'Metamask',
            installed,
        },
        supports: [ChainType.EVM],
        async connect(options) {
            if (options.chainType !== ChainType.EVM) {
                throw new AdapterError(ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN, `Unsupported chain type: ${options.chainType}`);
            }
            return strategy.connect(options.chainId);
        },
        async disconnect(_options) {
            if (_options?.chainType && _options.chainType !== ChainType.EVM) {
                throw new AdapterError(ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN, `Unsupported chain type: ${_options.chainType}`);
            }
            await strategy.disconnect();
        },
        async switchNetwork({ chainId }) {
            return strategy.switchNetwork?.(chainId) ?? false;
        },
        async addNetwork({ chainConfig }) {
            return strategy.addNetwork?.(chainConfig) ?? false;
        },
    };
}
//# sourceMappingURL=metamask.js.map