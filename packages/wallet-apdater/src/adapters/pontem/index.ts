import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { AptosProvider } from '@/adapters/pontem/providers/aptos';

export class PontemAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.APTOS];

    constructor() {
        super();
        const pontemProvider = typeof window !== 'undefined' ? (window as any).pontem : undefined;
        this.providers.set(ChainType.APTOS, new AptosProvider(pontemProvider));
        this.info = {
            rdns: 'network.pontem',
            name: 'Pontem',
            installed: !!pontemProvider,
        };
    }
}

export function createPontemAdapter(): WalletAdapter {
    return new PontemAdapter();
}
