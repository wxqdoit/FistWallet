import type { EvmChainConfig } from './evm';

export enum ChainType {
    EVM = 'EVM',
    SOL = 'SOL',
    BTC = 'BTC',
    SUI = 'SUI',
    APTOS = 'APTOS',
    TRON = 'TRON',
}

export interface BtcAccount {
    address: string;
    publicKey: string;
    addressType: string;
    purpose: string;
}

export interface ConnectedAccount {
    address: string | BtcAccount;
    chainType: ChainType;
    chainId?: number;
}

export interface ConnectOptions {
    chainType: ChainType;
    chainId?: number;
}

export interface DisconnectOptions {
    chainType?: ChainType;
}

export interface AdapterInfo {
    rdns: string;
    name: string;
    installed: boolean;
    icon?: string;
}

export interface WalletAdapter {
    info: AdapterInfo;
    supports: ChainType[];
    connect(options: ConnectOptions): Promise<ConnectedAccount>;
    disconnect(options?: DisconnectOptions): Promise<void>;
    switchNetwork?(options: { chainId: number; chainType?: ChainType }): Promise<boolean>;
    addNetwork?(options: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }): Promise<boolean>;
}
