export interface EvmChainConfig {
    chainId: `0x${number}`;
    chainName: string;
    rpcUrls: Array<string>;
    iconUrls?: Array<string>;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    blockExplorerUrls?: Array<string>;
}

export interface EvmSendTransaction {
    from: string;
    to?: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: string;
}

export interface Eip1193Provider {
    isStatus?: boolean;
    host?: string;
    path?: string;
    request: (request: {
        method: string;
        params?: Array<unknown>;
    }) => Promise<unknown>;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    off?: (event: string, listener: (...args: unknown[]) => void) => void;
    sendAsync?: (
        request: { method: string; params?: Array<unknown> },
        callback: (error: Error | null, response: unknown) => void
    ) => void;
    send?: (
        request: { method: string; params?: Array<unknown> },
        callback: (error: Error | null, response: unknown) => void
    ) => void;
}
