import type { EIP6963ProviderDetail } from 'mipd';
import { createMetamaskAdapter, METAMASK_RDNS } from '../adapters/metamask';
import { createOkxAdapter, OKX_RDNS } from '../adapters/okx';
import { createPhantomAdapter, PHANTOM_RDNS } from '../adapters/phantom';
import { createBitgetAdapter, BITGET_RDNS } from '../adapters/bitget';
import { createPontemAdapter, PONTEM_RDNS } from '../adapters/pontem';
import { createPetraAdapter, PETRA_RDNS } from '../adapters/petra';
import { createSlushAdapter, SLUSH_RDNS } from '../adapters/slush';
import { createSuietAdapter, SUIET_RDNS } from '../adapters/suiet';
import { createMartianAdapter, MARTIAN_RDNS } from '../adapters/martian';
import { createTronLinkAdapter, TRONLINK_RDNS } from '../adapters/tronlink';
import { createUnisatAdapter, UNISAT_RDNS } from '../adapters/unisat';
import { createBraavosAdapter, BRAAVOS_RDNS } from '../adapters/braavos';
import { createRazorAdapter, RAZOR_RDNS } from '../adapters/razor';
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
    { rdns: BITGET_RDNS, create: createBitgetAdapter },
    { rdns: PONTEM_RDNS, create: createPontemAdapter },
    { rdns: PETRA_RDNS, create: createPetraAdapter },
    { rdns: SLUSH_RDNS, create: createSlushAdapter },
    { rdns: SUIET_RDNS, create: createSuietAdapter },
    { rdns: MARTIAN_RDNS, create: createMartianAdapter },
    { rdns: TRONLINK_RDNS, create: createTronLinkAdapter },
    { rdns: UNISAT_RDNS, create: createUnisatAdapter },
    { rdns: BRAAVOS_RDNS, create: createBraavosAdapter },
    { rdns: RAZOR_RDNS, create: createRazorAdapter },
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
