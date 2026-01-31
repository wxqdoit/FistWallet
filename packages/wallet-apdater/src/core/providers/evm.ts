import type { EvmChainConfig, EvmSendTransaction } from '@/core/evm';
import { ChainType, type ConnectedAccount, type ConnectOptions, type DisconnectOptions, type SendTransactionOptions } from '@/core/types';

export interface IBaseProvider {
    chainType: ChainType.EVM;
    connect(options: ConnectOptions): Promise<ConnectedAccount>;
    disconnect(options?: DisconnectOptions): Promise<void>;
    sendTransaction?(options: SendTransactionOptions & { transaction: EvmSendTransaction }): Promise<unknown>;
    switchNetwork?(options: { chainId: number; chainType?: ChainType }): Promise<boolean>;
    addNetwork?(options: { chainId: number; chainType?: ChainType; chainConfig: EvmChainConfig }): Promise<boolean>;
    on?(event: import('@/core/types').AdapterEvent, listener: import('@/core/types').AdapterEventListener): () => void;
}
