import type { IBaseProvider } from '@/core/providers/aptos';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions } from '@/core/types';

type AptosConnectResult = {
    address?: string;
    account?: { address?: string };
    publicKey?: string;
};

type AptosWalletProvider = {
    connect?: () => Promise<AptosConnectResult>;
    account?: () => Promise<{ address?: string }>;
    disconnect?: () => Promise<void>;
};

export class AptosProvider implements IBaseProvider {
    readonly chainType: ChainType.APTOS = ChainType.APTOS;
    constructor(private provider?: AptosWalletProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const aptosProvider = this.requireProvider();
        let address: string | undefined;

        if (aptosProvider.connect) {
            const result = await aptosProvider.connect();
            address = this.resolveAddress(result);
        }

        if (!address && aptosProvider.account) {
            const account = await aptosProvider.account();
            address = this.resolveAddress(account);
        }

        if (!address) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.REQUEST_FAILED,
                'No account returned from provider'
            );
        }

        return {
            address,
            chainType: ChainType.APTOS,
        };
    }

    async disconnect(): Promise<void> {
        const aptosProvider = this.requireProvider();
        if (aptosProvider.disconnect) {
            await aptosProvider.disconnect();
        }
    }

    private resolveAddress(result?: AptosConnectResult | { address?: string } | null): string | undefined {
        if (!result) return undefined;
        if ('address' in result && result.address) return result.address;
        const account = (result as AptosConnectResult).account;
        if (account?.address) return account.address;
        return undefined;
    }

    private requireProvider(): AptosWalletProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Aptos provider not found'
            );
        }
        return this.provider;
    }
}
