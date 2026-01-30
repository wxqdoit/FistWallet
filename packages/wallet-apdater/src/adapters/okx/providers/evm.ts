import type { IBaseProvider } from '@/core/providers/evm';
import type { Eip1193Provider, EvmChainConfig, EvmSendTransaction } from '@/core/evm';
import { ChainType, type ConnectedAccount, type ConnectOptions, type SendTransactionOptions } from '@/core/types';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { toHexChainId } from '@/utils/hex';

export class EvmProvider implements IBaseProvider {
    readonly chainType: ChainType.EVM = ChainType.EVM;
    constructor(private provider?: Eip1193Provider) {}

    async connect(options: ConnectOptions): Promise<ConnectedAccount> {
        const chainId = options.chainId;
        const evmProvider = this.requireProvider();
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
    }

    async sendTransaction(options: SendTransactionOptions & { transaction: EvmSendTransaction }): Promise<unknown> {
        const evmProvider = this.requireProvider();
        return evmProvider.request({
            method: 'eth_sendTransaction',
            params: [options.transaction],
        });
    }

    async disconnect(): Promise<void> {
        const evmProvider = this.requireProvider();
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
    }

    async switchNetwork({ chainId }: { chainId: number; chainType?: ChainType }): Promise<boolean> {
        const evmProvider = this.requireProvider();
        try {
            await evmProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: toHexChainId(chainId) }],
            });
            return true;
        } catch {
            return false;
        }
    }

    async addNetwork({ chainConfig }: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }): Promise<boolean> {
        const evmProvider = this.requireProvider();
        try {
            await evmProvider.request({
                method: 'wallet_addEthereumChain',
                params: [chainConfig],
            });
            return true;
        } catch {
            return false;
        }
    }

    private requireProvider(): Eip1193Provider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'EVM provider not found'
            );
        }
        return this.provider;
    }
}
