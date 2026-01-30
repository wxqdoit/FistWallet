import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { BtcProvider } from '@/adapters/unisat/providers/btc';

export class UnisatAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.BTC];

    constructor() {
        super();
        const unisat = typeof window !== 'undefined' ? (window as any).unisat : undefined;
        this.providers.set(ChainType.BTC, new BtcProvider(unisat, 'noop'));
        this.info = {
            rdns: 'io.unisat',
            name: 'UniSat',
            installed: !!unisat,
        };
    }
}

export function createUnisatAdapter(): WalletAdapter {
    return new UnisatAdapter();
}
