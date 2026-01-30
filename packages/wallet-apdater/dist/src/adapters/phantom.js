import { BaseAdapter } from '../core/handlers';
import { ChainType } from '../core/types';
import { BtcHandler } from './handlers/btc';
import { EvmHandler } from './handlers/evm';
import { SolHandler } from './handlers/sol';
export class PhantomAdapter extends BaseAdapter {
    constructor(detail) {
        super();
        this.supports = [ChainType.EVM, ChainType.SOL, ChainType.BTC];
        const phantom = typeof window !== 'undefined' ? window.phantom : undefined;
        const evmProvider = detail?.provider ?? phantom?.ethereum;
        const solProvider = phantom?.solana;
        const btcProvider = phantom?.bitcoin;
        this.handlers.set(ChainType.EVM, new EvmHandler(evmProvider));
        this.handlers.set(ChainType.SOL, new SolHandler(solProvider));
        this.handlers.set(ChainType.BTC, new BtcHandler(btcProvider));
        this.info = {
            rdns: 'app.phantom',
            name: 'Phantom',
            installed: !!detail || !!phantom,
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
export function createPhantomAdapter(detail) {
    return new PhantomAdapter(detail);
}
//# sourceMappingURL=phantom.js.map