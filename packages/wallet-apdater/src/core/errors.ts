export const ADAPTER_ERROR_CODES = {
    PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
    UNSUPPORTED_CHAIN: 'UNSUPPORTED_CHAIN',
    REQUEST_FAILED: 'REQUEST_FAILED',
    NETWORK_NOT_ADDED: 'NETWORK_NOT_ADDED',
} as const;

export type AdapterErrorCode = typeof ADAPTER_ERROR_CODES[keyof typeof ADAPTER_ERROR_CODES];

export class AdapterError extends Error {
    readonly code: AdapterErrorCode;
    readonly details?: unknown;

    constructor(code: AdapterErrorCode, message: string, details?: unknown) {
        super(message);
        this.name = 'AdapterError';
        this.code = code;
        this.details = details;
    }
}
