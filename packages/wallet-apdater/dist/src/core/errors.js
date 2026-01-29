export const ADAPTER_ERROR_CODES = {
    PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
    UNSUPPORTED_CHAIN: 'UNSUPPORTED_CHAIN',
    REQUEST_FAILED: 'REQUEST_FAILED',
    NETWORK_NOT_ADDED: 'NETWORK_NOT_ADDED',
};
export class AdapterError extends Error {
    constructor(code, message, details) {
        super(message);
        this.name = 'AdapterError';
        this.code = code;
        this.details = details;
    }
}
//# sourceMappingURL=errors.js.map