import { createDefaultAdapterRegistry, type WalletAdapter } from 'wallet-apdater';

const { registry, stop } = createDefaultAdapterRegistry();

export function subscribeAdapters(listener: (adapters: WalletAdapter[]) => void): () => void {
    const unsubscribe = registry.subscribe(listener);
    return () => {
        unsubscribe();
    };
}

export function stopAdapterDiscovery(): void {
    stop();
}
