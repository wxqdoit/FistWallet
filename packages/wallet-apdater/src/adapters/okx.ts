import type { EIP6963ProviderDetail } from 'mipd';
import { AdapterError, ADAPTER_ERROR_CODES } from '../core/errors';
import type { EvmChainConfig } from '../core/evm';
import { ChainType, type ConnectOptions, type DisconnectOptions, type WalletAdapter } from '../core/types';
import { createBtcStrategy } from './strategies/btc';
import { createEvmStrategy } from './strategies/evm';
import { createSolStrategy } from './strategies/sol';

export const OKX_RDNS = 'com.okex.wallet';

export function createOkxAdapter(detail?: EIP6963ProviderDetail): WalletAdapter {
    const okxwallet = typeof window !== 'undefined' ? (window as any).okxwallet : undefined;
    const evmProvider = detail?.provider ?? okxwallet?.ethereum;
    const solProvider = okxwallet?.solana;
    const btcProvider = okxwallet?.bitcoin;

    const evmStrategy = createEvmStrategy(evmProvider);
    const solStrategy = createSolStrategy(solProvider);
    const btcStrategy = createBtcStrategy(btcProvider);

    const installed = !!detail || !!okxwallet;

    return {
        info: {
            rdns: OKX_RDNS,
            name: 'OKEx',
            installed,
        },
        supports: [ChainType.EVM, ChainType.SOL, ChainType.BTC],
        async connect(options: ConnectOptions) {
            switch (options.chainType) {
                case ChainType.EVM:
                    return evmStrategy.connect(options.chainId);
                case ChainType.SOL:
                    return solStrategy.connect();
                case ChainType.BTC:
                    return btcStrategy.connect();
                default:
                    throw new AdapterError(
                        ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                        `Unsupported chain type: ${options.chainType}`
                    );
            }
        },
        async disconnect(options?: DisconnectOptions) {
            switch (options?.chainType) {
                case ChainType.EVM:
                    await evmStrategy.disconnect();
                    return;
                case ChainType.SOL:
                    await solStrategy.disconnect();
                    return;
                case ChainType.BTC:
                    throw new AdapterError(
                        ADAPTER_ERROR_CODES.REQUEST_FAILED,
                        'Bitcoin disconnect not supported'
                    );
                case undefined:
                    await Promise.allSettled([
                        evmStrategy.disconnect(),
                        solStrategy.disconnect(),
                    ]);
                    return;
                default:
                    throw new AdapterError(
                        ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                        `Unsupported chain type: ${options?.chainType}`
                    );
            }
        },
        async switchNetwork({ chainId, chainType }: { chainId: number; chainType?: ChainType }) {
            if (chainType && chainType !== ChainType.EVM) {
                return false;
            }
            return evmStrategy.switchNetwork?.(chainId) ?? false;
        },
        async addNetwork({ chainConfig, chainType }: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }) {
            if (chainType && chainType !== ChainType.EVM) {
                return false;
            }
            return evmStrategy.addNetwork?.(chainConfig) ?? false;
        },
    };
}
