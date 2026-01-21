import type { Account, Network, ChainType } from '../types';

/**
 * Predefined network configurations
 */
export const NETWORKS: Record<string, Network> = {
    // EVM Networks
    ethereum: {
        id: 'ethereum',
        name: 'Ethereum',
        chainType: 'evm' as ChainType,
        chainId: 1,
        rpcUrl: 'https://eth.llamarpc.com',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        icon: 'evm',
    },
    sepolia: {
        id: 'sepolia',
        name: 'Sepolia Testnet',
        chainType: 'evm' as ChainType,
        chainId: 11155111,
        rpcUrl: 'https://rpc.sepolia.org',
        explorerUrl: 'https://sepolia.etherscan.io',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        icon: 'evm',
        isTestnet: true,
    },
    bsc: {
        id: 'bsc',
        name: 'BNB Smart Chain',
        chainType: 'evm' as ChainType,
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed1.binance.org',
        explorerUrl: 'https://bscscan.com',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
        },
        icon: 'bnb',
    },
    polygon: {
        id: 'polygon',
        name: 'Polygon',
        chainType: 'evm' as ChainType,
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        icon: 'polygon',
    },
    arbitrum: {
        id: 'arbitrum',
        name: 'Arbitrum One',
        chainType: 'evm' as ChainType,
        chainId: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        icon: 'arbitrum',
    },
    optimism: {
        id: 'optimism',
        name: 'Optimism',
        chainType: 'evm' as ChainType,
        chainId: 10,
        rpcUrl: 'https://mainnet.optimism.io',
        explorerUrl: 'https://optimistic.etherscan.io',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        icon: 'optimism',
    },
    base: {
        id: 'base',
        name: 'Base',
        chainType: 'evm' as ChainType,
        chainId: 8453,
        rpcUrl: 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        icon: 'base',
    },

    // Bitcoin
    bitcoin: {
        id: 'bitcoin',
        name: 'Bitcoin',
        chainType: 'bitcoin' as ChainType,
        rpcUrl: 'https://blockstream.info/api',
        explorerUrl: 'https://blockstream.info',
        nativeCurrency: {
            name: 'Bitcoin',
            symbol: 'BTC',
            decimals: 8,
        },
        icon: 'bitcoin',
    },
    bitcoinTestnet: {
        id: 'bitcoinTestnet',
        name: 'Bitcoin Testnet',
        chainType: 'bitcoin' as ChainType,
        rpcUrl: 'https://blockstream.info/testnet/api',
        explorerUrl: 'https://blockstream.info/testnet',
        nativeCurrency: {
            name: 'Test Bitcoin',
            symbol: 'tBTC',
            decimals: 8,
        },
        icon: 'bitcoin',
        isTestnet: true,
    },

    // Solana
    solana: {
        id: 'solana',
        name: 'Solana',
        chainType: 'solana' as ChainType,
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        explorerUrl: 'https://explorer.solana.com',
        nativeCurrency: {
            name: 'Solana',
            symbol: 'SOL',
            decimals: 9,
        },
        icon: 'solana',
    },
    solanaDevnet: {
        id: 'solanaDevnet',
        name: 'Solana Devnet',
        chainType: 'solana' as ChainType,
        rpcUrl: 'https://api.devnet.solana.com',
        explorerUrl: 'https://explorer.solana.com?cluster=devnet',
        nativeCurrency: {
            name: 'Solana',
            symbol: 'SOL',
            decimals: 9,
        },
        icon: 'solana',
        isTestnet: true,
    },

    // Aptos
    aptos: {
        id: 'aptos',
        name: 'Aptos',
        chainType: 'aptos' as ChainType,
        rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
        explorerUrl: 'https://explorer.aptoslabs.com',
        nativeCurrency: {
            name: 'Aptos',
            symbol: 'APT',
            decimals: 8,
        },
        icon: 'aptos',
    },

    // Sui
    sui: {
        id: 'sui',
        name: 'Sui',
        chainType: 'sui' as ChainType,
        rpcUrl: 'https://fullnode.mainnet.sui.io',
        explorerUrl: 'https://suiexplorer.com',
        nativeCurrency: {
            name: 'Sui',
            symbol: 'SUI',
            decimals: 9,
        },
        icon: 'sui',
    },

    // TRON
    tron: {
        id: 'tron',
        name: 'TRON',
        chainType: 'tron' as ChainType,
        rpcUrl: 'https://api.trongrid.io',
        explorerUrl: 'https://tronscan.org',
        nativeCurrency: {
            name: 'TRON',
            symbol: 'TRX',
            decimals: 6,
        },
        icon: 'tron',
    },

    // TON
    ton: {
        id: 'ton',
        name: 'TON',
        chainType: 'ton' as ChainType,
        rpcUrl: 'https://toncenter.com/api/v2',
        explorerUrl: 'https://tonscan.org',
        nativeCurrency: {
            name: 'Toncoin',
            symbol: 'TON',
            decimals: 9,
        },
        icon: 'ton',
    },

    // NEAR
    near: {
        id: 'near',
        name: 'NEAR',
        chainType: 'near' as ChainType,
        rpcUrl: 'https://rpc.mainnet.near.org',
        explorerUrl: 'https://explorer.near.org',
        nativeCurrency: {
            name: 'NEAR',
            symbol: 'NEAR',
            decimals: 24,
        },
        icon: 'near',
    },

    // Filecoin
    filecoin: {
        id: 'filecoin',
        name: 'Filecoin',
        chainType: 'filecoin' as ChainType,
        rpcUrl: 'https://api.node.glif.io',
        explorerUrl: 'https://filfox.info',
        nativeCurrency: {
            name: 'Filecoin',
            symbol: 'FIL',
            decimals: 18,
        },
        icon: 'filecoin',
    },
};

/**
 * Get network by ID
 */
export function getNetwork(networkId: string): Network | undefined {
    return NETWORKS[networkId];
}

/**
 * Get all networks for a specific chain type
 */
export function getNetworksByChainType(chainType: ChainType): Network[] {
    return Object.values(NETWORKS).filter((network) => network.chainType === chainType);
}

/**
 * Get default network for a chain type
 */
export function getDefaultNetwork(chainType: ChainType): Network {
    const networks = getNetworksByChainType(chainType);
    return networks.find((n) => !n.isTestnet) || networks[0];
}

export function getSupportedNetworksForAccount(account?: Account | null): Network[] {
    if (!account) {
        return [];
    }

    return Object.values(NETWORKS).filter((network) => {
        const address = account.addresses[network.chainType];
        return typeof address === 'string' && address.length > 0;
    });
}

/**
 * Derivation paths for different chains
 */
export const DERIVATION_PATHS = {
    evm: "m/44'/60'/0'/0",
    bitcoin: "m/84'/0'/0'/0", // Native SegWit (Bech32)
    bitcoinLegacy: "m/44'/0'/0'/0", // Legacy P2PKH
    bitcoinSegwit: "m/49'/0'/0'/0", // SegWit P2SH
    bitcoinTaproot: "m/86'/0'/0'/0", // Taproot
    solana: "m/44'/501'/0'/0'",
    aptos: "m/44'/637'/0'/0'/0'",
    sui: "m/44'/784'/0'/0'/0'",
    tron: "m/44'/195'/0'/0",
    ton: "m/44'/607'/0'",
    near: "m/44'/397'/0'",
    filecoin: "m/44'/461'/0'/0'/0'",
} as const;
