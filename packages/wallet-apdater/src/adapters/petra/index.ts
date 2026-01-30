import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { AptosProvider } from '@/adapters/petra/providers/aptos';

export class PetraAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.APTOS];

    constructor() {
        super();
        const aptosProvider = typeof window !== 'undefined' ? (window as any).aptos : undefined;
        this.providers.set(ChainType.APTOS, new AptosProvider(aptosProvider));
        this.info = {
            rdns: 'app.petra',
            name: 'Petra',
            installed: !!aptosProvider,
        };
    }
}

export function createPetraAdapter(): WalletAdapter {
    return new PetraAdapter();
}
