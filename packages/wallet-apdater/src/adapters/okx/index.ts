import type { EIP6963ProviderDetail } from 'mipd';
import type { EvmChainConfig } from '@/core/evm';
import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { AptosProvider } from '@/adapters/okx/providers/aptos';
import { BtcProvider } from '@/adapters/okx/providers/btc';
import { EvmProvider } from '@/adapters/okx/providers/evm';
import { SolProvider } from '@/adapters/okx/providers/sol';
import { StarknetProvider } from '@/adapters/okx/providers/starknet';
import { SuiProvider } from '@/adapters/okx/providers/sui';
import { TronProvider } from '@/adapters/okx/providers/tron';
import { findSuiWalletByNames } from '@/utils/suiWallets';

export class OkxAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [
        ChainType.EVM,
        ChainType.SOL,
        ChainType.BTC,
        ChainType.APTOS,
        ChainType.SUI,
        ChainType.TRON,
        ChainType.STARKNET,
    ];

    constructor(detail?: EIP6963ProviderDetail) {
        super();
        const okxwallet = typeof window !== 'undefined' ? (window as any).okxwallet : undefined;
        const evmProvider = detail?.provider ?? okxwallet?.ethereum;
        const solProvider = okxwallet?.solana;
        const btcProvider = okxwallet?.bitcoin;
        const aptosProvider = okxwallet?.aptos;
        const resolveSuiProvider = () => findSuiWalletByNames(['okx']) ?? okxwallet?.suiWallet;
        const tronProvider = okxwallet?.tronLink ?? (okxwallet?.tronWeb ? { tronWeb: okxwallet.tronWeb } : undefined);
        const starknetProvider = okxwallet?.starknet ?? (typeof window !== 'undefined' ? (window as any).starknet_okxwallet : undefined);

        this.providers.set(ChainType.EVM, new EvmProvider(evmProvider));
        this.providers.set(ChainType.SOL, new SolProvider(solProvider));
        this.providers.set(ChainType.BTC, new BtcProvider(btcProvider));
        this.providers.set(ChainType.APTOS, new AptosProvider(aptosProvider));
        this.providers.set(ChainType.SUI, new SuiProvider(resolveSuiProvider));
        this.providers.set(ChainType.TRON, new TronProvider(tronProvider));
        this.providers.set(ChainType.STARKNET, new StarknetProvider(starknetProvider));

        this.info = {
            rdns: 'com.okex.wallet',
            name: 'OKEx',
            installed: !!detail || !!okxwallet,
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

export function createOkxAdapter(detail?: EIP6963ProviderDetail): WalletAdapter {
    return new OkxAdapter(detail);
}
