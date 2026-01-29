import type { EIP6963ProviderDetail } from 'mipd';
import { createMetamaskAdapter, METAMASK_RDNS } from '../adapters/metamask';
import { createOkxAdapter, OKX_RDNS } from '../adapters/okx';
import { createPhantomAdapter, PHANTOM_RDNS } from '../adapters/phantom';
import type { WalletAdapter } from '../core/types';
import { getEip6963Providers, subscribeEip6963Providers } from '../discovery/eip6963';

export interface AdapterFactory {
    rdns: string;
    create: (detail?: EIP6963ProviderDetail) => WalletAdapter;
}

export interface AdapterRegistry {
    list: () => WalletAdapter[];
    refresh: (details?: EIP6963ProviderDetail[]) => void;
    subscribe: (listener: (adapters: WalletAdapter[]) => void) => () => void;
}

export const defaultAdapterFactories: AdapterFactory[] = [
    { rdns: METAMASK_RDNS, create: createMetamaskAdapter },
    { rdns: PHANTOM_RDNS, create: createPhantomAdapter },
    { rdns: OKX_RDNS, create: createOkxAdapter },
];

export function createAdapterRegistry(
    factories: AdapterFactory[] = defaultAdapterFactories
): AdapterRegistry {
    let adapters: WalletAdapter[] = [];
    const listeners = new Set<(adapters: WalletAdapter[]) => void>();

    const notify = () => {
        for (const listener of listeners) {
            listener(adapters);
        }
    };

    const refresh = (details: EIP6963ProviderDetail[] = getEip6963Providers()) => {
        const detailMap = new Map(details.map((detail) => [detail.info.rdns, detail]));
        adapters = factories.map((factory) => factory.create(detailMap.get(factory.rdns)));
        notify();
    };

    const list = () => adapters;

    const subscribe = (listener: (adapters: WalletAdapter[]) => void) => {
        listeners.add(listener);
        listener(adapters);
        return () => {
            listeners.delete(listener);
        };
    };

    return {
        list,
        refresh,
        subscribe,
    };
}

export function createDefaultAdapterRegistry(): { registry: AdapterRegistry; stop: () => void } {
    const registry = createAdapterRegistry();
    registry.refresh();
    const unsubscribe = subscribeEip6963Providers((details) => {
        registry.refresh(details);
    });
    return {
        registry,
        stop: unsubscribe,
    };
}
