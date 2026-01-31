import { createMetamaskAdapter } from '../adapters/metamask';
import { createOkxAdapter } from '../adapters/okx';
import { createPhantomAdapter } from '../adapters/phantom';
import { createBitgetAdapter } from '../adapters/bitget';
import { createPontemAdapter } from '../adapters/pontem';
import { createPetraAdapter } from '../adapters/petra';
import { createSlushAdapter } from '../adapters/slush';
import { createSuietAdapter } from '../adapters/suiet';
import { createMartianAdapter } from '../adapters/martian';
import { createTronLinkAdapter } from '../adapters/tronlink';
import { createUnisatAdapter } from '../adapters/unisat';
import { createBraavosAdapter } from '../adapters/braavos';
import { createRazorAdapter } from '../adapters/razor';
import { getEip6963Providers, subscribeEip6963Providers } from '../discovery/eip6963';
export const defaultAdapterFactories = [
    { rdns: 'io.metamask', create: createMetamaskAdapter },
    { rdns: 'app.phantom', create: createPhantomAdapter },
    { rdns: 'com.okex.wallet', create: createOkxAdapter },
    { rdns: 'com.bitget.wallet', create: createBitgetAdapter },
    { rdns: 'network.pontem', create: createPontemAdapter },
    { rdns: 'app.petra', create: createPetraAdapter },
    { rdns: 'app.slush', create: createSlushAdapter },
    { rdns: 'app.suiet', create: createSuietAdapter },
    { rdns: 'app.martian', create: createMartianAdapter },
    { rdns: 'org.tronlink', create: createTronLinkAdapter },
    { rdns: 'io.unisat', create: createUnisatAdapter },
    { rdns: 'wallet.braavos', create: createBraavosAdapter },
    { rdns: 'wallet.razor', create: createRazorAdapter },
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