import type { EIP6963ProviderDetail } from 'mipd';
import type { EvmChainConfig } from '@/core/evm';
import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { BtcProvider } from '@/adapters/phantom/providers/btc';
import { EvmProvider } from '@/adapters/phantom/providers/evm';
import { SolProvider } from '@/adapters/phantom/providers/sol';

export class PhantomAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.EVM, ChainType.SOL, ChainType.BTC];

    constructor(detail?: EIP6963ProviderDetail) {
        super();
        const phantom = typeof window !== 'undefined' ? (window as any).phantom : undefined;
        const evmProvider = detail?.provider ?? phantom?.ethereum;
        const solProvider = phantom?.solana;
        const btcProvider = phantom?.bitcoin;

        this.providers.set(ChainType.EVM, new EvmProvider(evmProvider));
        this.providers.set(ChainType.SOL, new SolProvider(solProvider));
        this.providers.set(ChainType.BTC, new BtcProvider(btcProvider));

        this.info = {
            rdns: 'app.phantom',
            name: 'Phantom',
            installed: !!detail || !!phantom,
        };
    }

    override async switchNetwork({ chainId, chainType }: { chainId: number; chainType?: ChainType }) {
        if (chainType && chainType !== ChainType.EVM) return false;
        return this.providers.get(ChainType.EVM)?.switchNetwork?.({ chainId, chainType: ChainType.EVM }) ?? false;
    }

    override async addNetwork({ chainId, chainConfig, chainType }: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }) {
        if (chainType && chainType !== ChainType.EVM) return false;
        return this.providers.get(ChainType.EVM)?.addNetwork?.({ chainId, chainType: ChainType.EVM, chainConfig }) ?? false;
    }
}

export function createPhantomAdapter(detail?: EIP6963ProviderDetail): WalletAdapter {
    return new PhantomAdapter(detail);
}
