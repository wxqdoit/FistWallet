import { createMetamaskAdapter, METAMASK_RDNS } from '../adapters/metamask';
import { createOkxAdapter, OKX_RDNS } from '../adapters/okx';
import { createPhantomAdapter, PHANTOM_RDNS } from '../adapters/phantom';
import { getEip6963Providers, subscribeEip6963Providers } from '../discovery/eip6963';
export const defaultAdapterFactories = [
    { rdns: METAMASK_RDNS, create: createMetamaskAdapter },
    { rdns: PHANTOM_RDNS, create: createPhantomAdapter },
    { rdns: OKX_RDNS, create: createOkxAdapter },
];
export function createAdapterRegistry(factories = defaultAdapterFactories) {
    let adapters = [];
    const listeners = new Set();
    const notify = () => {
        for (const listener of listeners) {
            listener(adapters);
        }
    };
    const refresh = (details = getEip6963Providers()) => {
        const detailMap = new Map(details.map((detail) => [detail.info.rdns, detail]));
        adapters = factories.map((factory) => factory.create(detailMap.get(factory.rdns)));
        notify();
    };
    const list = () => adapters;
    const subscribe = (listener) => {
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
export function createDefaultAdapterRegistry() {
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
//# sourceMappingURL=index.js.map