import type { EIP6963ProviderDetail } from "mipd";
import type { EvmChainConfig } from "@/core/evm";
import { BaseAdapter } from "@/core/handlers";
import { ChainType, type AdapterInfo, type WalletAdapter } from "@/core/types";
import { AptosProvider } from "@/adapters/okx/providers/aptos";
import { BtcProvider } from "@/adapters/okx/providers/btc";
import { EvmProvider } from "@/adapters/okx/providers/evm";
import { SolProvider } from "@/adapters/okx/providers/sol";
import { SuiProvider } from "@/adapters/okx/providers/sui";
import { TronProvider } from "@/adapters/okx/providers/tron";
import { findSuiWalletByNames } from "@/utils/suiWallets";

export class FistWalletAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [
        ChainType.EVM,
        ChainType.SOL,
        ChainType.BTC,
        ChainType.APTOS,
        ChainType.SUI,
        ChainType.TRON,
    ];

    constructor(detail?: EIP6963ProviderDetail) {
        super();
        const fistwallet = typeof window !== "undefined" ? (window as any).fistwallet : undefined;
        const evmProvider = detail?.provider ?? fistwallet?.ethereum ?? (typeof window !== "undefined" && (window as any).ethereum?.isFistWallet ? (window as any).ethereum : undefined);
        const solProvider = fistwallet?.solana ?? (typeof window !== "undefined" && (window as any).solana?.isFistWallet ? (window as any).solana : undefined);
        const btcProvider = fistwallet?.bitcoin ?? (typeof window !== "undefined" && (window as any).bitcoin?.isFistWallet ? (window as any).bitcoin : undefined);
        const aptosProvider = fistwallet?.aptos;
        const resolveSuiProvider = () => findSuiWalletByNames(["fistwallet"]) ?? fistwallet?.suiWallet;
        const tronProvider = fistwallet?.tronLink ?? (fistwallet?.tronWeb ? { tronWeb: fistwallet.tronWeb } : undefined);

        this.providers.set(ChainType.EVM, new EvmProvider(evmProvider));
        this.providers.set(ChainType.SOL, new SolProvider(solProvider));
        this.providers.set(ChainType.BTC, new BtcProvider(btcProvider));
        this.providers.set(ChainType.APTOS, new AptosProvider(aptosProvider));
        this.providers.set(ChainType.SUI, new SuiProvider(resolveSuiProvider));
        this.providers.set(ChainType.TRON, new TronProvider(tronProvider));

        this.info = {
            rdns: "io.fistwallet",
            name: "FistWallet",
            icon: detail?.info?.icon,
            installed: !!detail || !!fistwallet || !!(typeof window !== "undefined" && ((window as any).ethereum?.isFistWallet || (window as any).solana?.isFistWallet)),
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

export function createFistWalletAdapter(detail?: EIP6963ProviderDetail): WalletAdapter {
    return new FistWalletAdapter(detail);
}
