import { ChainType, type ConnectedAccount, type ConnectOptions, type DisconnectOptions, type SendTransactionOptions } from '@/core/types';

export interface IBaseProvider {
    chainType: ChainType.STARKNET;
    connect(options: ConnectOptions): Promise<ConnectedAccount>;
    disconnect(options?: DisconnectOptions): Promise<void>;
    sendTransaction?(options: SendTransactionOptions): Promise<unknown>;
}
