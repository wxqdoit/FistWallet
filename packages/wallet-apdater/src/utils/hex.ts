export function toHexChainId(chainId: number): `0x${string}` {
    if (!Number.isFinite(chainId)) {
        throw new Error('Invalid chainId');
    }
    return `0x${chainId.toString(16)}`;
}
