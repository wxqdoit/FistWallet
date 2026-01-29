import { AdapterError, ADAPTER_ERROR_CODES } from '../../core/errors';
import { ChainType } from '../../core/types';
import { toHexChainId } from '../../utils/hex';
function requireProvider(provider) {
    if (!provider) {
        throw new AdapterError(ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND, 'EVM provider not found');
    }
    return provider;
}
export function createEvmStrategy(provider) {
    return {
        async connect(chainId) {
            const evmProvider = requireProvider(provider);
            if (typeof chainId === 'number') {
                const currentChainId = await evmProvider.request({ method: 'eth_chainId' });
                const current = Number.parseInt(currentChainId, 16);
                if (current !== chainId) {
                    try {
                        await evmProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: toHexChainId(chainId) }],
                        });
                    }
                    catch (error) {
                        if (error?.code === 4902) {
                            throw new AdapterError(ADAPTER_ERROR_CODES.NETWORK_NOT_ADDED, 'Requested network is not added to the wallet', error);
                        }
                        throw new AdapterError(ADAPTER_ERROR_CODES.REQUEST_FAILED, 'Failed to switch network', error);
                    }
                }
            }
            const accounts = await evmProvider.request({ method: 'eth_requestAccounts' });
            const address = accounts?.[0];
            if (!address) {
                throw new AdapterError(ADAPTER_ERROR_CODES.REQUEST_FAILED, 'No accounts returned from provider');
            }
            return {
                address,
                chainType: ChainType.EVM,
                chainId,
            };
        },
        async disconnect() {
            const evmProvider = requireProvider(provider);
            try {
                await evmProvider.request({
                    method: 'wallet_revokePermissions',
                    params: [{ eth_accounts: {} }],
                });
            }
            catch (error) {
                throw new AdapterError(ADAPTER_ERROR_CODES.REQUEST_FAILED, 'Failed to revoke permissions', error);
            }
        },
        async switchNetwork(chainId) {
            const evmProvider = requireProvider(provider);
            try {
                await evmProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: toHexChainId(chainId) }],
                });
                return true;
            }
            catch {
                return false;
            }
        },
        async addNetwork(config) {
            const evmProvider = requireProvider(provider);
            try {
                await evmProvider.request({
                    method: 'wallet_addEthereumChain',
                    params: [config],
                });
                return true;
            }
            catch {
                return false;
            }
        },
    };
}
//# sourceMappingURL=evm.js.map