import type { EIP6963ProviderDetail } from 'mipd';
import type { EvmChainConfig } from '../core/evm';
import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createEvmStrategy } from './strategies/evm';

export const METAMASK_RDNS = 'io.metamask';

export function createMetamaskAdapter(detail?: EIP6963ProviderDetail): WalletAdapter {
    const injected = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
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
        async connect(options: ConnectOptions) {
            if (options.chainType !== ChainType.EVM) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${options.chainType}`
                );
            }
            return strategy.connect(options.chainId);
        },
        async disconnect(_options?: DisconnectOptions) {
            if (_options?.chainType && _options.chainType !== ChainType.EVM) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                    `Unsupported chain type: ${_options.chainType}`
                );
            }
            await strategy.disconnect();
        },
        async switchNetwork({ chainId }: { chainId: number; chainType?: ChainType }) {
            return strategy.switchNetwork?.(chainId) ?? false;
        },
        async addNetwork({ chainConfig }: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }) {
            return strategy.addNetwork?.(chainConfig) ?? false;
        },
    };
}
