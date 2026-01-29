export function toHexChainId(chainId) {
    if (!Number.isFinite(chainId)) {
        throw new Error('Invalid chainId');
    }
    return `0x${chainId.toString(16)}`;
}
//# sourceMappingURL=hex.js.map