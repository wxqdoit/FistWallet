import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Network } from '../types';
import {
    fetchNativeBalance,
    fetchTokenBalance,
    fetchTokenMetadata,
    estimateFee,
} from './rpc';

export interface CustomTokenItem {
    address: string;
    symbol: string;
    decimals: number;
    formatted: string;
    isDefault?: boolean;
}

export const DEFAULT_TOKENS_BY_NETWORK: Record<string, { address: string; symbol: string; decimals: number }[]> = {
    polygon: [
        { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', decimals: 6 },
        { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', decimals: 6 },
        { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC.e', decimals: 6 },
    ],
    ethereum: [
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', decimals: 18 },
    ],
    bsc: [
        { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18 },
        { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18 },
    ],
    arbitrum: [
        { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', decimals: 6 },
        { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', decimals: 6 },
    ],
    optimism: [
        { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', decimals: 6 },
        { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', decimals: 6 },
    ],
    base: [
        { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 },
    ],
};

/**
 * Hook to query native currency balance with automatic polling & caching
 */
export function useNativeBalanceQuery(network?: Network | null, address?: string | null) {
    return useQuery({
        queryKey: ['nativeBalance', network?.id, address],
        queryFn: async () => {
            if (!network || !address) return { balance: '0', formatted: '0.00' };
            return await fetchNativeBalance(network, address);
        },
        enabled: Boolean(network && address),
        staleTime: 10_000,
        refetchInterval: 15_000,
    });
}

/**
 * Hook to query custom ERC-20 / SPL token balances
 */
export function useCustomTokensQuery(network?: Network | null, address?: string | null) {
    return useQuery({
        queryKey: ['customTokens', network?.id, address],
        queryFn: async () => {
            if (!network || !address) return [];
            if (network.chainType !== 'evm') return [];

            const savedTokens: CustomTokenItem[] = JSON.parse(
                localStorage.getItem(`custom_tokens_${network.id}`) || '[]'
            );
            const defaultDefs = DEFAULT_TOKENS_BY_NETWORK[network.id] || [];
            
            // Merge defaults and user-added tokens (unique by address)
            const tokenMap = new Map<string, { address: string; symbol: string; decimals: number; isDefault: boolean }>();
            for (const def of defaultDefs) {
                tokenMap.set(def.address.toLowerCase(), { ...def, isDefault: true });
            }
            for (const saved of savedTokens) {
                tokenMap.set(saved.address.toLowerCase(), { ...saved, isDefault: false });
            }

            const candidateList = Array.from(tokenMap.values());
            if (!candidateList.length) return [];

            const balances = await Promise.all(
                candidateList.map(async (tok) => {
                    try {
                        const { formatted, balance } = await fetchTokenBalance(
                            network,
                            tok.address,
                            address,
                            tok.decimals
                        );
                        return {
                            ...tok,
                            balance,
                            formatted,
                        };
                    } catch {
                        return { ...tok, balance: '0', formatted: '0' };
                    }
                })
            );

            // Filter: show if non-zero balance OR if explicitly added by user
            return balances
                .filter((tok) => !tok.isDefault || (tok.balance && tok.balance !== '0'))
                .map((tok) => ({
                    address: tok.address,
                    symbol: tok.symbol,
                    decimals: tok.decimals,
                    formatted: tok.formatted,
                    isDefault: tok.isDefault,
                }));
        },
        enabled: Boolean(network && address),
        staleTime: 12_000,
        refetchInterval: 20_000,
    });
}

/**
 * Hook to query dynamic network fee estimate
 */
export function useFeeEstimateQuery(network?: Network | null, fromAddress?: string | null) {
    return useQuery({
        queryKey: ['feeEstimate', network?.id, fromAddress],
        queryFn: async () => {
            if (!network || !fromAddress) return { fee: '0.00042' };
            return await estimateFee(network, fromAddress, '', '');
        },
        enabled: Boolean(network && fromAddress),
        staleTime: 15_000,
    });
}

/**
 * Mutation to add and persist a new custom token
 */
export function useAddCustomTokenMutation(network?: Network | null, address?: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tokenAddress: string) => {
            if (!network || !address) throw new Error('Network or address missing');
            const meta = await fetchTokenMetadata(network, tokenAddress);
            if (!meta) throw new Error('Token not found on this network');

            const { formatted } = await fetchTokenBalance(network, tokenAddress, address, meta.decimals);
            const tokenItem: CustomTokenItem = {
                address: tokenAddress,
                symbol: meta.symbol,
                decimals: meta.decimals,
                formatted,
                isDefault: false,
            };

            const currentList: CustomTokenItem[] = JSON.parse(
                localStorage.getItem(`custom_tokens_${network.id}`) || '[]'
            );
            const nextList = [
                ...currentList.filter((t) => t.address.toLowerCase() !== tokenAddress.toLowerCase()),
                tokenItem,
            ];
            localStorage.setItem(`custom_tokens_${network.id}`, JSON.stringify(nextList));
            return tokenItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customTokens', network?.id, address] });
        },
    });
}
