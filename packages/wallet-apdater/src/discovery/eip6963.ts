import { createStore as mipdCreateStore, type EIP6963ProviderDetail } from 'mipd';

let store: ReturnType<typeof mipdCreateStore> | null = null;
let cachedProviders: EIP6963ProviderDetail[] = [];
const listeners = new Set<(providers: EIP6963ProviderDetail[]) => void>();

function dedupeProviders(providers: readonly EIP6963ProviderDetail[]): EIP6963ProviderDetail[] {
    const seen = new Set<string>();
    const deduped: EIP6963ProviderDetail[] = [];
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

function ensureStore(): void {
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

export function getEip6963Providers(): EIP6963ProviderDetail[] {
    ensureStore();
    return cachedProviders;
}

export function subscribeEip6963Providers(
    listener: (providers: EIP6963ProviderDetail[]) => void
): () => void {
    ensureStore();
    listeners.add(listener);
    listener(cachedProviders);
    return () => {
        listeners.delete(listener);
    };
}
