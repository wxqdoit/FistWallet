import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { TronProvider } from '@/adapters/tronlink/providers/tron';

export class TronLinkAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.TRON];

    constructor() {
        super();
        const tronLink = typeof window !== 'undefined' ? (window as any).tronLink : undefined;
        this.providers.set(ChainType.TRON, new TronProvider(tronLink));
        this.info = {
            rdns: 'org.tronlink',
            name: 'TronLink',
            installed: !!tronLink,
        };
    }
}

export function createTronLinkAdapter(): WalletAdapter {
    return new TronLinkAdapter();
}
