import { BaseAdapter } from '../core/handlers';
import { ChainType } from '../core/types';
import { BtcHandler } from './handlers/btc';
import { EvmHandler } from './handlers/evm';
import { SolHandler } from './handlers/sol';
export class OkxAdapter extends BaseAdapter {
    constructor(detail) {
        super();
        this.supports = [ChainType.EVM, ChainType.SOL, ChainType.BTC];
        const okxwallet = typeof window !== 'undefined' ? window.okxwallet : undefined;
        const evmProvider = detail?.provider ?? okxwallet?.ethereum;
        const solProvider = okxwallet?.solana;
        const btcProvider = okxwallet?.bitcoin;
        this.handlers.set(ChainType.EVM, new EvmHandler(evmProvider));
        this.handlers.set(ChainType.SOL, new SolHandler(solProvider));
        this.handlers.set(ChainType.BTC, new BtcHandler(btcProvider));
        this.info = {
            rdns: 'com.okex.wallet',
            name: 'OKEx',
            installed: !!detail || !!okxwallet,
        };
    }
    async switchNetwork({ chainId, chainType }) {
        if (chainType && chainType !== ChainType.EVM)
            return false;
        return this.handlers.get(ChainType.EVM)?.switchNetwork?.({ chainId, chainType: ChainType.EVM }) ?? false;
    }
    async addNetwork({ chainId, chainConfig, chainType }) {
        if (chainType && chainType !== ChainType.EVM)
            return false;
        return this.handlers.get(ChainType.EVM)?.addNetwork?.({ chainId, chainType: ChainType.EVM, chainConfig }) ?? false;
    }
}
export function createOkxAdapter(detail) {
    return new OkxAdapter(detail);
}
//# sourceMappingURL=okx.js.map