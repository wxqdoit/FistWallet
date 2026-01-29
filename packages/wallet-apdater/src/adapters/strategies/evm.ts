import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import type { Eip1193Provider, EvmChainConfig } from '../../core/evm';
import { ChainType, type ConnectedAccount } from '../../core/types';
import { toHexChainId } from '../../utils/hex';

type EvmStrategy = {
    connect: (chainId?: number) => Promise<ConnectedAccount>;
    disconnect: () => Promise<void>;
    switchNetwork?: (chainId: number) => Promise<boolean>;
    addNetwork?: (config: EvmChainConfig) => Promise<boolean>;
};

function requireProvider(provider?: Eip1193Provider): Eip1193Provider {
    if (!provider) {
        throw new AdapterError(
            ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
            'EVM provider not found'
        );
    }
    return provider;
}

export function createEvmStrategy(provider?: Eip1193Provider): EvmStrategy {
    return {
        async connect(chainId?: number): Promise<ConnectedAccount> {
            const evmProvider = requireProvider(provider);
            if (typeof chainId === 'number') {
                const currentChainId = await evmProvider.request({ method: 'eth_chainId' }) as string;
                const current = Number.parseInt(currentChainId, 16);
                if (current !== chainId) {
                    try {
                        await evmProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: toHexChainId(chainId) }],
                        });
                    } catch (error: any) {
                        if (error?.code === 4902) {
                            throw new AdapterError(
                                ADAPTER_ERROR_CODES.NETWORK_NOT_ADDED,
                                'Requested network is not added to the wallet',
                                error
                            );
                        }
                        throw new AdapterError(
                            ADAPTER_ERROR_CODES.REQUEST_FAILED,
                            'Failed to switch network',
                            error
                        );
                    }
                }
            }

            const accounts = await evmProvider.request({ method: 'eth_requestAccounts' }) as string[];
            const address = accounts?.[0];
            if (!address) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.REQUEST_FAILED,
                    'No accounts returned from provider'
                );
            }

            return {
                address,
                chainType: ChainType.EVM,
                chainId,
            };
        },
        async disconnect(): Promise<void> {
            const evmProvider = requireProvider(provider);
            try {
                await evmProvider.request({
                    method: 'wallet_revokePermissions',
                    params: [{ eth_accounts: {} }],
                });
            } catch (error) {
                throw new AdapterError(
                    ADAPTER_ERROR_CODES.REQUEST_FAILED,
                    'Failed to revoke permissions',
                    error
                );
            }
        },
        async switchNetwork(chainId: number): Promise<boolean> {
            const evmProvider = requireProvider(provider);
            try {
                await evmProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: toHexChainId(chainId) }],
                });
                return true;
            } catch {
                return false;
            }
        },
        async addNetwork(config: EvmChainConfig): Promise<boolean> {
            const evmProvider = requireProvider(provider);
            try {
                await evmProvider.request({
                    method: 'wallet_addEthereumChain',
                    params: [config],
                });
                return true;
            } catch {
                return false;
            }
        },
    };
}
