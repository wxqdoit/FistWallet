import type { IBaseProvider } from '@/core/providers/btc';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type BtcAccount, type ConnectedAccount, type ConnectOptions } from '@/core/types';

type BitcoinProvider = {
    requestAccounts: () => Promise<Array<string | BtcAccount>>;
};

type DisconnectMode = 'error' | 'noop';

export class BtcProvider implements IBaseProvider {
    readonly chainType: ChainType.BTC = ChainType.BTC;
    constructor(private provider?: BitcoinProvider, private disconnectMode: DisconnectMode = 'error') {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const btcProvider = this.requireProvider();
        const accounts = await btcProvider.requestAccounts();
        if (!accounts?.length) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No accounts returned from provider'
            );
        }
        return {
            address: accounts[0] as ConnectedAccount['address'],
            chainType: ChainType.BTC,
        };
    }

    async disconnect(): Promise<void> {
        if (this.disconnectMode === 'noop') {
            return;
        }
        throw new AdapterError(
            ADAPTER_ERROR_CODES.REQUEST_FAILED,
            'Bitcoin disconnect not supported'
        );
    }

    private requireProvider(): BitcoinProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Bitcoin provider not found'
            );
        }
        return this.provider;
    }
}
