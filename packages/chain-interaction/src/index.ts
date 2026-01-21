/**
 * Chain Interaction Library
 * Unified blockchain RPC interaction for 9+ chains
 */

// Export types
export * from './types';

// Export base provider
export { ChainProvider } from './provider/base';

// Export chain providers
export { EVMProvider } from './chains/evm';
export { SolanaProvider } from './chains/solana';
export { TronProvider } from './chains/tron';
export { TonProvider } from './chains/ton';
export { AptosProvider } from './chains/aptos';
export { SuiProvider } from './chains/sui';
export { NearProvider } from './chains/near';
export { BitcoinProvider } from './chains/bitcoin';
export { FilecoinProvider } from './chains/filecoin';

// Factory function for creating providers
import { ChainConfig, ChainType } from './types';
import { EVMProvider } from './chains/evm';
import { SolanaProvider } from './chains/solana';
import { TronProvider } from './chains/tron';
import { TonProvider } from './chains/ton';
import { AptosProvider } from './chains/aptos';
import { SuiProvider } from './chains/sui';
import { NearProvider } from './chains/near';
import { BitcoinProvider } from './chains/bitcoin';
import { FilecoinProvider } from './chains/filecoin';
import { ChainProvider } from './provider/base';

/**
 * Create a chain provider for the specified chain type
 * @param chainType Type of blockchain
 * @param config Chain configuration with RPC URL
 * @returns Chain provider instance
 */
export function createProvider(chainType: ChainType, config: ChainConfig): ChainProvider {
    switch (chainType) {
        case 'evm':
            return new EVMProvider(config);
        case 'solana':
            return new SolanaProvider(config);
        case 'tron':
            return new TronProvider(config);
        case 'ton':
            return new TonProvider(config);
        case 'aptos':
            return new AptosProvider(config);
        case 'sui':
            return new SuiProvider(config);
        case 'near':
            return new NearProvider(config);
        case 'bitcoin':
            return new BitcoinProvider(config);
        case 'filecoin':
            return new FilecoinProvider(config);
        default:
            throw new Error(`Unsupported chain type: ${chainType}`);
    }
}
