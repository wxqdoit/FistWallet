import { BaseAdapter } from '../core/handlers';
import { ChainType } from '../core/types';
import { EvmHandler } from './handlers/evm';
export class MetamaskAdapter extends BaseAdapter {
    constructor(detail) {
        super();
        this.supports = [ChainType.EVM];
        const injected = typeof window !== 'undefined' ? window.ethereum : undefined;
        const fallbackProvider = injected?.isMetaMask ? injected : undefined;
        const evmProvider = detail?.provider ?? fallbackProvider;
        this.handlers.set(ChainType.EVM, new EvmHandler(evmProvider));
        this.info = {
            rdns: 'io.metamask',
            name: 'Metamask',
            installed: !!detail || !!fallbackProvider,
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
export function createMetamaskAdapter(detail) {
    return new MetamaskAdapter(detail);
}
//# sourceMappingURL=metamask.js.map