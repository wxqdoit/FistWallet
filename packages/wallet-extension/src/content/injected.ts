/**
 * Injected script - Runs in page context
 * Provides window.ethereum, window.solana, etc. to DApps
 */

console.log('FistWallet provider injected');

/**
 * EVM Provider (window.ethereum)
 */
class EthereumProvider {
    isMetaMask = true; // For compatibility
    isFistWallet = true;

    private requestId = 0;
    private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();

    constructor() {
        // Listen for responses from content script
        window.addEventListener('message', (event) => {
            if (event.data.target !== 'fistwallet-inpage') return;

            const { id, response } = event.data;
            const pending = this.pendingRequests.get(id);

            if (pending) {
                if (response.success) {
                    pending.resolve(response.data);
                } else {
                    pending.reject(new Error(response.error));
                }
                this.pendingRequests.delete(id);
            }
        });
    }

    async request({ method, params }: { method: string; params?: any[] }): Promise<any> {
        console.log('Ethereum request:', method, params);

        // Handle some methods locally
        switch (method) {
            case 'eth_chainId':
                return '0x1'; // Ethereum mainnet

            case 'net_version':
                return '1';

            case 'eth_accounts':
            case 'eth_requestAccounts':
                // Request accounts from extension
                return this.sendMessage({
                    type: 'REQUEST_ACCOUNTS',
                    payload: { method, params },
                });

            case 'personal_sign':
            case 'eth_sign':
            case 'eth_signTypedData':
            case 'eth_signTypedData_v4':
                return this.sendMessage({
                    type: 'SIGN_MESSAGE',
                    payload: { method, params },
                });

            case 'eth_sendTransaction':
                return this.sendMessage({
                    type: 'SEND_TRANSACTION',
                    payload: { method, params },
                });

            default:
                throw new Error(`Method ${method} not supported`);
        }
    }

    private sendMessage(message: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.requestId++;
            this.pendingRequests.set(id, { resolve, reject });

            window.postMessage({
                target: 'fistwallet-contentscript',
                id,
                message,
            }, '*');

            // Timeout after 60 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 60000);
        });
    }

    // Legacy methods for compatibility
    async enable() {
        return this.request({ method: 'eth_requestAccounts' });
    }

    async send(method: string, params?: any[]) {
        return this.request({ method, params });
    }
}

/**
 * Solana Provider (window.solana)
 */
class SolanaProvider {
    isFistWallet = true;
    isPhantom = true; // For compatibility

    async connect() {
        console.log('Solana connect requested');
        // TODO: Implement Solana connection
        throw new Error('Solana provider not yet implemented');
    }

    async disconnect() {
        console.log('Solana disconnect requested');
    }

    async signMessage(_message: Uint8Array) {
        console.log('Solana signMessage requested');
        throw new Error('Solana provider not yet implemented');
    }

    async signTransaction(_transaction: any) {
        console.log('Solana signTransaction requested');
        throw new Error('Solana provider not yet implemented');
    }
}

/**
 * Bitcoin Provider (window.bitcoin)
 */
class BitcoinProvider {
    isFistWallet = true;
    isUniSat = true; // For compatibility

    async requestAccounts() {
        console.log('Bitcoin requestAccounts');
        throw new Error('Bitcoin provider not yet implemented');
    }

    async signMessage(_message: string) {
        console.log('Bitcoin signMessage requested');
        throw new Error('Bitcoin provider not yet implemented');
    }

    async sendBitcoin(_to: string, _amount: number) {
        console.log('Bitcoin sendBitcoin requested');
        throw new Error('Bitcoin provider not yet implemented');
    }
}

// Inject providers
(window as any).ethereum = new EthereumProvider();
(window as any).solana = new SolanaProvider();
(window as any).bitcoin = new BitcoinProvider();
(window as any).fistwallet = {
    ethereum: (window as any).ethereum,
    solana: (window as any).solana,
    bitcoin: (window as any).bitcoin,
};

// Announce provider
window.dispatchEvent(new Event('ethereum#initialized'));

console.log('FistWallet providers ready');
