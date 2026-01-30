import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { AptosProvider } from '@/adapters/razor/providers/aptos';

function resolveRazorProvider(): any {
    if (typeof window === 'undefined') return undefined;
    const win = window as any;
    return win.razor ?? win.razorWallet ?? win.razorwallet ?? win.razor_sdk;
}

export class RazorAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.APTOS];

    constructor() {
        super();
        const provider = resolveRazorProvider();
        this.providers.set(ChainType.APTOS, new AptosProvider(provider));
        this.info = {
            rdns: 'wallet.razor',
            name: 'Razor',
            installed: !!provider,
        };
    }
}

export function createRazorAdapter(): WalletAdapter {
    return new RazorAdapter();
}
