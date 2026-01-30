import type { EIP6963ProviderDetail } from 'mipd';
import type { EvmChainConfig } from '@/core/evm';
import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { EvmProvider } from '@/adapters/metamask/providers/evm';

export class MetamaskAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.EVM];

    constructor(detail?: EIP6963ProviderDetail) {
        super();
        const injected = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
        const fallbackProvider = injected?.isMetaMask ? injected : undefined;
        const evmProvider = detail?.provider ?? fallbackProvider;
        this.providers.set(ChainType.EVM, new EvmProvider(evmProvider));
        this.info = {
            rdns: 'io.metamask',
            name: 'Metamask',
            installed: !!detail || !!fallbackProvider,
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

export function createMetamaskAdapter(detail?: EIP6963ProviderDetail): WalletAdapter {
    return new MetamaskAdapter(detail);
}
