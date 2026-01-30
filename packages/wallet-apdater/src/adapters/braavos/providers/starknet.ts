import type { IBaseProvider } from '@/core/providers/starknet';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions } from '@/core/types';

type StarknetAccount = {
    address?: string;
};

type StarknetWalletProvider = {
    enable?: () => Promise<Array<string | StarknetAccount>>;
    account?: StarknetAccount;
    selectedAddress?: string;
    disconnect?: () => Promise<void>;
};

export class StarknetProvider implements IBaseProvider {
    readonly chainType: ChainType.STARKNET = ChainType.STARKNET;
    constructor(private provider?: StarknetWalletProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const starknetProvider = this.requireProvider();
        let result: Array<string | StarknetAccount> | undefined;
        if (starknetProvider.enable) {
            result = await starknetProvider.enable();
        }

        const address = this.resolveAddress(starknetProvider, result);
        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No account returned from provider'
            );
        }

        return {
            address,
            chainType: ChainType.STARKNET,
        };
    }

    async disconnect(): Promise<void> {
        const starknetProvider = this.requireProvider();
        if (starknetProvider.disconnect) {
            await starknetProvider.disconnect();
        }
    }

    private resolveAddress(provider: StarknetWalletProvider, result?: Array<string | StarknetAccount>): string | undefined {
        if (provider.account?.address) return provider.account.address;
        if (provider.selectedAddress) return provider.selectedAddress;
        const first = result?.[0];
        if (!first) return undefined;
        if (typeof first === 'string') return first;
        return first.address;
    }

    private requireProvider(): StarknetWalletProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Starknet provider not found'
            );
        }
        return this.provider;
    }
}
