import type { IBaseProvider } from '@/core/providers/sol';
import { AdapterError, ADAPTER_ERROR_CODES } from '@/core/errors';
import { ChainType, type ConnectedAccount, type ConnectOptions } from '@/core/types';

type SolanaProvider = {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
};

export class SolProvider implements IBaseProvider {
    readonly chainType: ChainType.SOL = ChainType.SOL;
    constructor(private provider?: SolanaProvider) {}

    async connect(_options: ConnectOptions): Promise<ConnectedAccount> {
        const solProvider = this.requireProvider();
        const resp = await solProvider.connect();
        return {
            address: resp.publicKey.toString(),
            chainType: ChainType.SOL,
        };
    }

    async disconnect(): Promise<void> {
        const solProvider = this.requireProvider();
        await solProvider.disconnect();
    }

    private requireProvider(): SolanaProvider {
        if (!this.provider) {
            throw new AdapterError(
                ADAPTER_ERROR_CODES.PROVIDER_NOT_FOUND,
                'Solana provider not found'
            );
        }
        return this.provider;
    }
}
