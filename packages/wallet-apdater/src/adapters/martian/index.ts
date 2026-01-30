import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { AptosProvider } from '@/adapters/martian/providers/aptos';
import { SuiProvider } from '@/adapters/martian/providers/sui';

export class MartianAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.APTOS, ChainType.SUI];

    constructor() {
        super();
        const martian = typeof window !== 'undefined' ? (window as any).martian : undefined;
        this.providers.set(ChainType.APTOS, new AptosProvider(martian));
        this.providers.set(ChainType.SUI, new SuiProvider(martian));
        this.info = {
            rdns: 'app.martian',
            name: 'Martian',
            installed: !!martian,
        };
    }
}

export function createMartianAdapter(): WalletAdapter {
    return new MartianAdapter();
}
