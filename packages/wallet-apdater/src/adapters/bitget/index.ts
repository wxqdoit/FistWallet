import type { EIP6963ProviderDetail } from 'mipd';
import type { EvmChainConfig } from '@/core/evm';
import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { BtcProvider } from '@/adapters/bitget/providers/btc';
import { EvmProvider } from '@/adapters/bitget/providers/evm';
import { SolProvider } from '@/adapters/bitget/providers/sol';

export class BitgetAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.EVM, ChainType.SOL, ChainType.BTC];

    constructor(detail?: EIP6963ProviderDetail) {
        super();
        const bitkeep = typeof window !== 'undefined' ? (window as any).bitkeep : undefined;
        const evmProvider = detail?.provider ?? bitkeep?.ethereum ?? bitkeep?.ethreum;
        const solProvider = bitkeep?.solana;
        const btcProvider = bitkeep?.unisat;

        this.providers.set(ChainType.EVM, new EvmProvider(evmProvider));
        this.providers.set(ChainType.SOL, new SolProvider(solProvider));
        this.providers.set(ChainType.BTC, new BtcProvider(btcProvider));

        this.info = {
            rdns: 'com.bitget.wallet',
            name: 'Bitget Wallet',
            installed: !!detail || !!bitkeep,
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

export function createBitgetAdapter(detail?: EIP6963ProviderDetail): WalletAdapter {
    return new BitgetAdapter(detail);
}
