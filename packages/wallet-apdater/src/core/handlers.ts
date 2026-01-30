import type { EvmChainConfig } from '@/core/evm';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions, type DisconnectOptions, type SendTransactionOptions, type WalletAdapter } from '@/core/types';

type BaseProvider = {
    connect(options: ConnectOptions): Promise<ConnectedAccount>;
    disconnect(options?: DisconnectOptions): Promise<void>;
    switchNetwork?(options: { chainId: number; chainType?: ChainType }): Promise<boolean>;
    addNetwork?(options: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }): Promise<boolean>;
    sendTransaction?(options: SendTransactionOptions): Promise<unknown>;
};

export abstract class BaseAdapter implements WalletAdapter {
    abstract info: WalletAdapter['info'];
    abstract supports: ChainType[];
    protected providers = new Map<ChainType, BaseProvider>();

    connect(options: ConnectOptions) {
        const provider = this.providers.get(options.chainType);
        if (!provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                `Unsupported chain type: ${options.chainType}`
            );
        }
        return provider.connect(options);
    }

    async disconnect(options?: DisconnectOptions) {
        if (!options?.chainType) {
            await Promise.allSettled([...this.providers.values()].map((provider) => provider.disconnect()));
            return;
        }
        const provider = this.providers.get(options.chainType);
        if (!provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                `Unsupported chain type: ${options.chainType}`
            );
        }
        await provider.disconnect(options);
    }

    async switchNetwork?(options: { chainId: number; chainType?: ChainType }) {
        if (!options.chainType) return false;
        return this.providers.get(options.chainType)?.switchNetwork?.(options) ?? false;
    }

    async sendTransaction(options: { chainType: ChainType; chainId?: number; transaction: unknown }) {
        const provider = this.providers.get(options.chainType);
        if (!provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                `Unsupported chain type: ${options.chainType}`
            );
        }
        if (!provider.sendTransaction) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                `sendTransaction is not supported for chain type: ${options.chainType}`
            );
        }
        return provider.sendTransaction(options);
    }

    async addNetwork?(options: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }) {
        if (!options.chainType) return false;
        return this.providers.get(options.chainType)?.addNetwork?.(options) ?? false;
    }
}
