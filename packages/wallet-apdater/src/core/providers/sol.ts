import { ChainType, type ConnectedAccount, type ConnectOptions, type DisconnectOptions, type SendTransactionOptions } from '@/core/types';

export interface IBaseProvider {
    chainType: ChainType.SOL;
    connect(options: ConnectOptions): Promise<ConnectedAccount>;
    disconnect(options?: DisconnectOptions): Promise<void>;
    sendTransaction?(options: SendTransactionOptions): Promise<unknown>;
    on?(event: import('@/core/types').AdapterEvent, listener: import('@/core/types').AdapterEventListener): () => void;
}
