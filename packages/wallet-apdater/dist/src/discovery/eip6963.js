import { createStore as mipdCreateStore } from 'mipd';
let store = null;
let cachedProviders = [];
const listeners = new Set();
function dedupeProviders(providers) {
    const seen = new Set();
    const deduped = [];
    for (const provider of providers) {
        if (seen.has(provider.info.rdns)) {
            continue;
        }
        seen.add(provider.info.rdns);
        deduped.push(provider);
    }
    return deduped;
}
function notify() {
    for (const listener of listeners) {
        listener(cachedProviders);
    }
}
function ensureStore() {
    if (store || typeof window === 'undefined') {
        return;
    }
    store = mipdCreateStore();
    cachedProviders = dedupeProviders(store.getProviders());
    store.subscribe((providers) => {
        const nextProviders = dedupeProviders(providers);
        const changed = nextProviders.length !== cachedProviders.length ||
            nextProviders.some((provider, index) => provider.info.rdns !== cachedProviders[index]?.info.rdns);
        if (changed) {
            cachedProviders = nextProviders;
            notify();
        }
    });
}
export function getEip6963Providers() {
    ensureStore();
    return cachedProviders;
}
export function subscribeEip6963Providers(listener) {
    ensureStore();
    listeners.add(listener);
    listener(cachedProviders);
    return () => {
        listeners.delete(listener);
    };
}
//# sourceMappingURL=eip6963.js.map