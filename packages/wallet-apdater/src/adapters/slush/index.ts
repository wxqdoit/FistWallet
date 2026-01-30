import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { SuiProvider } from '@/adapters/slush/providers/sui';
import { findSuiWalletByNames } from '@/utils/suiWallets';

export class SlushAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.SUI];

    constructor() {
        super();
        const fallback = typeof window !== 'undefined' ? (window as any).suiWallet : undefined;
        const resolveProvider = () => findSuiWalletByNames(['slush']) ?? fallback;
        this.providers.set(ChainType.SUI, new SuiProvider(resolveProvider));
        this.info = {
            rdns: 'app.slush',
            name: 'Slush',
            installed: !!resolveProvider(),
        };
    }
}

export function createSlushAdapter(): WalletAdapter {
    return new SlushAdapter();
}
