/**
 * Standardized RPC & Wallet Error Parser
 */

export interface StandardRpcError {
    code: number;
    message: string;
    isUserRejection: boolean;
    isChainNotAdded: boolean;
    isUnauthorized: boolean;
    rawError: unknown;
}

export function parseRpcError(error: any): StandardRpcError {
    const code = typeof error?.code === 'number' ? error.code : -32603;
    const msg = error?.message || (typeof error === 'string' ? error : 'Unknown wallet error');
    const lower = String(msg).toLowerCase();

    const isUserRejection =
        code === 4001 ||
        lower.includes('user rejected') ||
        lower.includes('rejected by user') ||
        lower.includes('cancelled') ||
        lower.includes('canceled') ||
        lower.includes('user denied');

    const isChainNotAdded =
        code === 4902 ||
        lower.includes('unrecognized chain') ||
        lower.includes('chain has not been added');

    const isUnauthorized =
        code === 4100 ||
        lower.includes('unauthorized') ||
        lower.includes('not connected');

    return {
        code,
        message: msg,
        isUserRejection,
        isChainNotAdded,
        isUnauthorized,
        rawError: error,
    };
}
