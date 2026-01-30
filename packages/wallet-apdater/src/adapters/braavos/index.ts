import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { StarknetProvider } from '@/adapters/braavos/providers/starknet';

type StarknetLike = {
    id?: string;
    name?: string;
    wallet?: { id?: string; name?: string };
};

function isBraavos(provider?: StarknetLike): boolean {
    if (!provider) return false;
    const candidates = [
        provider.id,
        provider.name,
        provider.wallet?.id,
        provider.wallet?.name,
    ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
    return candidates.some((value) => value.includes('braavos'));
}

export class BraavosAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.STARKNET];

    constructor() {
        super();
        const win = typeof window !== 'undefined' ? (window as any) : undefined;
        const injected = win?.starknet_braavos;
        const generic = win?.starknet;
        const provider = injected ?? (isBraavos(generic) ? generic : undefined);
        this.providers.set(ChainType.STARKNET, new StarknetProvider(provider));
        this.info = {
            rdns: 'wallet.braavos',
            name: 'Braavos',
            installed: !!provider,
        };
    }
}

export function createBraavosAdapter(): WalletAdapter {
    return new BraavosAdapter();
}
