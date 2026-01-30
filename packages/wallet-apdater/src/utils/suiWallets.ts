import { getWallets, isWalletWithRequiredFeatureSet } from '@mysten/wallet-standard';

export function findSuiWalletByNames(names: string[]): any | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
        const { get } = getWallets();
        const wallets = get().filter((wallet) => isWalletWithRequiredFeatureSet(wallet));
        const matchers = names.map((name) => name.toLowerCase());
        return wallets.find((wallet) => {
            const walletName = String(wallet?.name ?? '').toLowerCase();
            return matchers.some((matcher) => walletName.includes(matcher));
        });
    } catch {
        return undefined;
    }
}
