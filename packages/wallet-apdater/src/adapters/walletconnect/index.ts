import type { EvmChainConfig } from "@/core/evm";
import { BaseAdapter } from "@/core/handlers";
import { ChainType, type AdapterInfo, type ConnectedAccount, type ConnectOptions, type DisconnectOptions, type SendTransactionOptions, type WalletAdapter } from "@/core/types";

export interface WalletConnectConfig {
    projectId?: string;
    metadata?: {
        name: string;
        description: string;
        url: string;
        icons: string[];
    };
    qrUriHandler?: (uri: string) => void;
}

export class WalletConnectAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.EVM, ChainType.SOL];
    private config?: WalletConnectConfig;
    private uri?: string;
    private connectedAccount?: ConnectedAccount;

    constructor(config?: WalletConnectConfig) {
        super();
        this.config = config;

        this.info = {
            rdns: "org.walletconnect",
            name: "WalletConnect",
            installed: true,
            icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%233B99FC'/><path d='M25 45 C35 30 65 30 75 45 L65 55 C55 45 45 45 35 55 Z' fill='white'/></svg>",
        };

        // Custom provider for WalletConnect EVM
        this.providers.set(ChainType.EVM, {
            connect: async (options: ConnectOptions) => {
                const pairingUri = `wc:${Math.random().toString(36).substring(2)}@2?relay-protocol=irn&symKey=${Math.random().toString(36).substring(2)}`;
                this.uri = pairingUri;
                if (this.config?.qrUriHandler) {
                    this.config.qrUriHandler(pairingUri);
                }

                // If window has an active wc provider session or mock
                const account: ConnectedAccount = {
                    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
                    chainType: ChainType.EVM,
                    chainId: options.chainId || 1,
                };
                this.connectedAccount = account;
                return account;
            },
            disconnect: async (_options?: DisconnectOptions) => {
                this.connectedAccount = undefined;
                this.uri = undefined;
            },
            switchNetwork: async ({ chainId }: { chainId: number }) => {
                if (this.connectedAccount) {
                    this.connectedAccount.chainId = chainId;
                }
                return true;
            },
            sendTransaction: async (_options: SendTransactionOptions) => {
                return { hash: "0xwc_mock_tx_hash_" + Date.now() };
            },
        });

        // Custom provider for WalletConnect Solana
        this.providers.set(ChainType.SOL, {
            connect: async (options: ConnectOptions) => {
                const account: ConnectedAccount = {
                    address: "SolWcAccount111111111111111111111111111111111",
                    chainType: ChainType.SOL,
                    chainId: options.chainId || "mainnet-beta",
                };
                this.connectedAccount = account;
                return account;
            },
            disconnect: async () => {
                this.connectedAccount = undefined;
            },
        });
    }

    getPairingUri(): string | undefined {
        return this.uri;
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

export function createWalletConnectAdapter(config?: any): WalletAdapter {
    return new WalletConnectAdapter(config);
}
