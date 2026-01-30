import type { IBaseProvider } from '@/core/providers/tron';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions } from '@/core/types';

type TronWeb = {
    defaultAddress?: {
        base58?: string;
        hex?: string;
        address?: string;
    };
};

type TronWalletProvider = {
    tronWeb?: TronWeb;
    request?: (args: { method: string }) => Promise<unknown>;
};

export class TronProvider implements IBaseProvider {
    readonly chainType: ChainType.TRON = ChainType.TRON;
    constructor(private provider?: TronWalletProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const tronProvider = this.requireProvider();
        if (tronProvider.request) {
            await tronProvider.request({ method: 'tron_requestAccounts' });
        }

        const address = this.resolveAddress(tronProvider);
        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No account returned from provider'
            );
        }

        return {
            address,
            chainType: ChainType.TRON,
        };
    }

    async disconnect(): Promise<void> {
        // TronLink does not support programmatic disconnect.
    }

    private resolveAddress(provider: TronWalletProvider): string | undefined {
        const defaultAddress = provider.tronWeb?.defaultAddress;
        return defaultAddress?.base58 ?? defaultAddress?.address ?? defaultAddress?.hex;
    }

    private requireProvider(): TronWalletProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Tron provider not found'
            );
        }
        return this.provider;
    }
}
