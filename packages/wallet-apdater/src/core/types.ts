import type { EvmChainConfig } from '@/core/evm';

export enum ChainType {
    EVM = 'EVM',
    SOL = 'SOL',
    BTC = 'BTC',
    SUI = 'SUI',
    APTOS = 'APTOS',
    TRON = 'TRON',
    STARKNET = 'STARKNET',
}

export interface BtcAccount {
    address: string;
    publicKey: string;
    addressType: string;
    purpose: string;
}

export type ChainId = number | string;

export interface ConnectedAccount {
    address: string | BtcAccount;
    chainType: ChainType;
    chainId?: ChainId;
}

export interface ConnectOptions {
    chainType: ChainType;
    chainId?: ChainId;
}

export interface DisconnectOptions {
    chainType?: ChainType;
}

export interface SendTransactionOptions {
    chainType: ChainType;
    chainId?: ChainId;
    transaction: unknown;
}

export type AdapterEvent =
    | 'accountsChanged'
    | 'accountChanged'
    | 'chainChanged'
    | 'networkChanged'
    | 'disconnect'
    | 'connect';

export type AdapterEventListener = (payload: unknown) => void;

export type AccountChangeListener = (accounts: Array<ConnectedAccount['address']>) => void;
export type NetworkChangeInfo = { chainId?: ChainId; network?: string; raw?: unknown };
export type NetworkChangeListener = (info: NetworkChangeInfo) => void;
export type DisconnectListener = (error?: unknown) => void;

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
    sendTransaction?(options: SendTransactionOptions): Promise<unknown>;
    switchNetwork?(options: { chainId: number; chainType?: ChainType }): Promise<boolean>;
    addNetwork?(options: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }): Promise<boolean>;
    on?(event: AdapterEvent, listener: AdapterEventListener, options?: { chainType?: ChainType }): () => void;
    onAccountChanged?(listener: AccountChangeListener, options?: { chainType?: ChainType }): () => void;
    onNetworkChanged?(listener: NetworkChangeListener, options?: { chainType?: ChainType }): () => void;
    onDisconnect?(listener: DisconnectListener, options?: { chainType?: ChainType }): () => void;
}
