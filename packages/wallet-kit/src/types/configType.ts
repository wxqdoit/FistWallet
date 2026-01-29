import { ChainType, type BtcAccount } from 'wallet-apdater';

export type Locals = 'zh-CN' | 'en' | 'zh' | 'en-US';
export type Theme = 'darkMode' | 'lightMode';

export enum AppModal {
    ConnectModal,
}

export interface IChainInfo {
    id: number;
    name: string;
    type?: ChainType;
}

export type IBtcAccount = BtcAccount;

export enum ConnectStatus {
    connected,
    disconnected,
    connecting,
}
