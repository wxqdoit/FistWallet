import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { SuiProvider } from '@/adapters/suiet/providers/sui';
import { findSuiWalletByNames } from '@/utils/suiWallets';

export class SuietAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.SUI];

    constructor() {
        super();
        const fallback = typeof window !== 'undefined' ? (window as any).suiet : undefined;
        const resolveProvider = () => findSuiWalletByNames(['suiet']) ?? fallback;
        this.providers.set(ChainType.SUI, new SuiProvider(resolveProvider));
        this.info = {
            rdns: 'app.suiet',
            name: 'Suiet',
            installed: !!resolveProvider(),
        };
    }
}

export function createSuietAdapter(): WalletAdapter {
    return new SuietAdapter();
}
