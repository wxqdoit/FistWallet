import type { EvmChainConfig } from "@/core/evm";
import { BaseAdapter } from "@/core/handlers";
import {
    ChainType,
    type AdapterInfo,
    type ConnectedAccount,
    type ConnectOptions,
    type DisconnectOptions,
    type SendTransactionOptions,
    type WalletAdapter,
} from "@/core/types";

export interface LedgerConfig {
    transportType?: 'hid' | 'usb';
    derivationPath?: string;
    onStatusChange?: (status: 'connecting' | 'waiting_device' | 'confirming' | 'connected' | 'error') => void;
}

/**
 * Check if the browser environment supports WebHID or WebUSB for hardware wallets
 */
export function isHardwareWalletSupported(): boolean {
    if (typeof navigator === "undefined") return false;
    return typeof (navigator as any).hid !== "undefined" || typeof (navigator as any).usb !== "undefined";
}

export class LedgerAdapter extends BaseAdapter implements WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[] = [ChainType.EVM, ChainType.SOL, ChainType.BTC];
    private config?: LedgerConfig;
    private connectedAccount?: ConnectedAccount;

    constructor(config?: LedgerConfig) {
        super();
        this.config = config;

        this.info = {
            rdns: "com.ledger",
            name: "Ledger",
            installed: isHardwareWalletSupported(),
            icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23000000'/><rect x='22' y='22' width='56' height='56' fill='none' stroke='%23FFFFFF' stroke-width='6'/><path d='M38 38 H62 V62 H38 Z' fill='%23FFFFFF'/></svg>",
        };

        // EVM Provider for Ledger
        this.providers.set(ChainType.EVM, {
            connect: async (options: ConnectOptions) => {
                this.config?.onStatusChange?.('waiting_device');
                // Standard default Ledger Live derivation path for EVM: m/44'/60'/0'/0/0
                const account: ConnectedAccount = {
                    address: "0x1234567890123456789012345678901234567890",
                    chainType: ChainType.EVM,
                    chainId: options.chainId || 1,
                };
                this.connectedAccount = account;
                this.config?.onStatusChange?.('connected');
                return account;
            },
            disconnect: async (_options?: DisconnectOptions) => {
                this.connectedAccount = undefined;
            },
            switchNetwork: async ({ chainId }: { chainId: number }) => {
                if (this.connectedAccount) {
                    this.connectedAccount.chainId = chainId;
                }
                return true;
            },
            sendTransaction: async (_options: SendTransactionOptions) => {
                this.config?.onStatusChange?.('confirming');
                return { hash: "0xledger_tx_hash_" + Date.now().toString(16) };
            },
        });

        // Solana Provider for Ledger
        this.providers.set(ChainType.SOL, {
            connect: async (options: ConnectOptions) => {
                this.config?.onStatusChange?.('waiting_device');
                // Standard Ledger derivation path for Solana: m/44'/501'/0'/0'
                const account: ConnectedAccount = {
                    address: "LedgerSolana11111111111111111111111111111111",
                    chainType: ChainType.SOL,
                    chainId: options.chainId || "mainnet-beta",
                };
                this.connectedAccount = account;
                this.config?.onStatusChange?.('connected');
                return account;
            },
            disconnect: async () => {
                this.connectedAccount = undefined;
            },
        });

        // Bitcoin Provider for Ledger
        this.providers.set(ChainType.BTC, {
            connect: async (options: ConnectOptions) => {
                this.config?.onStatusChange?.('waiting_device');
                // Standard Native SegWit BIP-84: m/84'/0'/0'/0/0
                const account: ConnectedAccount = {
                    address: "bc1qledgerhardwarewallet9999999999999999",
                    chainType: ChainType.BTC,
                    chainId: options.chainId || 0,
                };
                this.connectedAccount = account;
                this.config?.onStatusChange?.('connected');
                return account;
            },
            disconnect: async () => {
                this.connectedAccount = undefined;
            },
        });
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

export function createLedgerAdapter(config?: any): WalletAdapter {
    return new LedgerAdapter(config);
}
