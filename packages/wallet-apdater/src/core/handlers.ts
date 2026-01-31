import type { EvmChainConfig } from '@/core/evm';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type AccountChangeListener, type AdapterEvent, type AdapterEventListener, type ConnectedAccount, type ConnectOptions, type DisconnectListener, type DisconnectOptions, type NetworkChangeInfo, type NetworkChangeListener, type SendTransactionOptions, type WalletAdapter } from '@/core/types';

type BaseProvider = {
    connect(options: ConnectOptions): Promise<ConnectedAccount>;
    disconnect(options?: DisconnectOptions): Promise<void>;
    switchNetwork?(options: { chainId: number; chainType?: ChainType }): Promise<boolean>;
    addNetwork?(options: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }): Promise<boolean>;
    sendTransaction?(options: SendTransactionOptions): Promise<unknown>;
    on?(event: AdapterEvent, listener: AdapterEventListener): () => void;
};

export abstract class BaseAdapter implements WalletAdapter {
    abstract info: WalletAdapter['info'];
    abstract supports: ChainType[];
    protected _providers?: Map<ChainType, BaseProvider>;

    protected get providers(): Map<ChainType, BaseProvider> {
        if (!this._providers) {
            this._providers = new Map<ChainType, BaseProvider>();
        }
        return this._providers;
    }

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

    async sendTransaction(options: SendTransactionOptions) {
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

    on(event: AdapterEvent, listener: AdapterEventListener, options?: { chainType?: ChainType }): () => void {
        const chainType = options?.chainType ?? (this.supports.length === 1 ? this.supports[0] : undefined);
        if (!chainType) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN,
                'chainType is required to subscribe to events'
            );
        }
        const provider = this.providers.get(chainType);
        if (!provider?.on) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                `Event ${event} is not supported for chain type: ${chainType}`
            );
        }
        return provider.on(event, listener);
    }

    onAccountChanged(listener: AccountChangeListener, options?: { chainType?: ChainType }): () => void {
        return this.on(
            'accountsChanged',
            (payload) => listener(this.normalizeAccounts(payload)),
            options
        );
    }

    onNetworkChanged(listener: NetworkChangeListener, options?: { chainType?: ChainType }): () => void {
        const chainType = options?.chainType ?? (this.supports.length === 1 ? this.supports[0] : undefined);
        const event: AdapterEvent = chainType === ChainType.EVM ? 'chainChanged' : 'networkChanged';
        return this.on(
            event,
            (payload) => listener(this.normalizeNetwork(payload)),
            { chainType }
        );
    }

    onDisconnect(listener: DisconnectListener, options?: { chainType?: ChainType }): () => void {
        return this.on(
            'disconnect',
            (payload) => listener(payload),
            options
        );
    }

    private normalizeAccounts(payload: unknown): Array<ConnectedAccount['address']> {
        if (!payload) return [];
        if (Array.isArray(payload)) return payload as Array<ConnectedAccount['address']>;
        if (typeof payload === 'string') return [payload];
        if (typeof payload === 'object') {
            const candidate = payload as any;
            if (Array.isArray(candidate.accounts)) {
                return candidate.accounts as Array<ConnectedAccount['address']>;
            }
            if (candidate.address) {
                return [candidate.address as ConnectedAccount['address']];
            }
            if (typeof candidate.toString === 'function') {
                return [candidate.toString() as ConnectedAccount['address']];
            }
        }
        return [payload as ConnectedAccount['address']];
    }

    private normalizeNetwork(payload: unknown): NetworkChangeInfo {
        const info: NetworkChangeInfo = { raw: payload };
        if (payload == null) return info;

        if (typeof payload === 'string') {
            if (payload.startsWith('0x')) {
                const parsed = Number.parseInt(payload, 16);
                if (!Number.isNaN(parsed)) info.chainId = parsed;
            } else {
                info.network = payload;
            }
            return info;
        }

        if (typeof payload === 'number') {
            info.chainId = payload;
            return info;
        }

        if (typeof payload === 'object') {
            const candidate = payload as any;
            const chainId = candidate.chainId ?? candidate.chainID;
            if (chainId !== undefined) {
                if (typeof chainId === 'string') {
                    const parsed = Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
                    if (!Number.isNaN(parsed)) info.chainId = parsed;
                } else if (typeof chainId === 'number') {
                    info.chainId = chainId;
                }
            }
            if (typeof candidate.name === 'string') info.network = candidate.name;
            if (!info.network && typeof candidate.network === 'string') info.network = candidate.network;
        }

        return info;
    }
}
