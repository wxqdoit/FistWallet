import type { EIP6963ProviderDetail } from 'mipd';
import type { EvmChainConfig } from '@/core/evm';
import { BaseAdapter } from '@/core/handlers';
import { ChainType, type AdapterInfo, type WalletAdapter } from '@/core/types';
import { AptosProvider } from '@/adapters/bitget/providers/aptos';
import { BtcProvider } from '@/adapters/bitget/providers/btc';
import { EvmProvider } from '@/adapters/bitget/providers/evm';
import { SolProvider } from '@/adapters/bitget/providers/sol';
import { StarknetProvider } from '@/adapters/bitget/providers/starknet';
import { SuiProvider } from '@/adapters/bitget/providers/sui';
import { TronProvider } from '@/adapters/bitget/providers/tron';
import { findSuiWalletByNames } from '@/utils/suiWallets';

type StarknetLike = {
    id?: string;
    name?: string;
    wallet?: { id?: string; name?: string };
};

function isBitget(provider?: StarknetLike): boolean {
    if (!provider) return false;
    const candidates = [
        provider.id,
        provider.name,
        provider.wallet?.id,
        provider.wallet?.name,
    ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
    return candidates.some((value) => value.includes('bitget') || value.includes('bitkeep'));
}

export class BitgetAdapter extends BaseAdapter implements WalletAdapter {
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
        const bitkeep = typeof window !== 'undefined' ? (window as any).bitkeep : undefined;
        const evmProvider = detail?.provider ?? bitkeep?.ethereum ?? bitkeep?.ethreum;
        const solProvider = bitkeep?.solana;
        const btcProvider = bitkeep?.unisat;
        const aptosProvider = bitkeep?.aptos;
        const resolveSuiProvider = () => findSuiWalletByNames(['bitget', 'bitkeep']) ?? bitkeep?.suiWallet;
        const tronProvider = bitkeep?.tronLink ?? (bitkeep?.tronWeb ? { tronWeb: bitkeep.tronWeb } : undefined);
        const win = typeof window !== 'undefined' ? (window as any) : undefined;
        const injectedStarknet = win?.starknet_bitkeep ?? bitkeep?.starknet;
        const fallbackStarknet = isBitget(win?.starknet) ? win?.starknet : undefined;
        const starknetProvider = injectedStarknet ?? fallbackStarknet;

        this.providers.set(ChainType.EVM, new EvmProvider(evmProvider));
        this.providers.set(ChainType.SOL, new SolProvider(solProvider));
        this.providers.set(ChainType.BTC, new BtcProvider(btcProvider));
        this.providers.set(ChainType.APTOS, new AptosProvider(aptosProvider));
        this.providers.set(ChainType.SUI, new SuiProvider(resolveSuiProvider));
        this.providers.set(ChainType.TRON, new TronProvider(tronProvider));
        this.providers.set(ChainType.STARKNET, new StarknetProvider(starknetProvider));

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
