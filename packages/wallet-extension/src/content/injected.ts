/**
 * Injected script - Runs in web page context
 * Full Web3 Multi-chain Provider (EIP-1193, EIP-6963, Solana Standard, Bitcoin UniSat standard)
 */

console.log("FistWallet multi-chain provider injected");

class EventEmitter {
    private _listeners: Record<string, Set<Function>> = {};

    on(event: string, fn: Function): this {
        if (!this._listeners[event]) this._listeners[event] = new Set();
        this._listeners[event].add(fn);
        return this;
    }

    addListener(event: string, fn: Function): this {
        return this.on(event, fn);
    }

    removeListener(event: string, fn: Function): this {
        this._listeners[event]?.delete(fn);
        return this;
    }

    off(event: string, fn: Function): this {
        return this.removeListener(event, fn);
    }

    emit(event: string, ...args: any[]): boolean {
        const listeners = this._listeners[event];
        if (!listeners || listeners.size === 0) return false;
        listeners.forEach((fn) => {
            try {
                fn(...args);
            } catch (err) {
                console.error(`Error in event listener for ${event}:`, err);
            }
        });
        return true;
    }

    removeAllListeners(event?: string): this {
        if (event) {
            delete this._listeners[event];
        } else {
            this._listeners = {};
        }
        return this;
    }
}

let rpcRequestId = 0;
const pendingRequests = new Map<number, { resolve: Function; reject: Function }>();

window.addEventListener("message", (event) => {
    if (event.data?.target !== "fistwallet-inpage") return;
    const { id, response } = event.data;
    const pending = pendingRequests.get(id);
    if (pending) {
        if (response && response.success) {
            pending.resolve(response.data);
        } else {
            pending.reject(new Error(response?.error || "Request failed"));
        }
        pendingRequests.delete(id);
    }
});

function sendBackgroundMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const id = rpcRequestId++;
        pendingRequests.set(id, { resolve, reject });

        window.postMessage(
            {
                target: "fistwallet-contentscript",
                id,
                message,
            },
            "*"
        );

        setTimeout(() => {
            if (pendingRequests.has(id)) {
                pendingRequests.delete(id);
                reject(new Error("Request timeout after 60s"));
            }
        }, 60000);
    });
}

/**
 * EIP-1193 EVM Provider (window.ethereum)
 */
export class EthereumProvider extends EventEmitter {
    readonly isMetaMask = true;
    readonly isFistWallet = true;

    chainId: string = "0x1";
    networkVersion: string = "1";
    selectedAddress: string | null = null;

    isConnected(): boolean {
        return true;
    }

    async request(args: { method: string; params?: any[] }): Promise<any> {
        const { method, params } = args;

        switch (method) {
            case "eth_chainId":
                return this.chainId;

            case "net_version":
                return this.networkVersion;

            case "eth_accounts":
                if (this.selectedAddress) {
                    return [this.selectedAddress];
                }
                try {
                    const accounts = await sendBackgroundMessage({
                        type: "REQUEST_ACCOUNTS",
                        payload: { method, params, chainType: "evm" },
                    });
                    if (accounts && accounts[0]) {
                        this.selectedAddress = accounts[0];
                    }
                    return accounts || [];
                } catch {
                    return [];
                }

            case "eth_requestAccounts": {
                const accounts = await sendBackgroundMessage({
                    type: "REQUEST_ACCOUNTS",
                    payload: { method, params, chainType: "evm" },
                });
                if (accounts && accounts[0]) {
                    this.selectedAddress = accounts[0];
                    this.emit("accountsChanged", accounts);
                    this.emit("connect", { chainId: this.chainId });
                }
                return accounts;
            }

            case "wallet_requestPermissions":
                return [{ parentCapability: "eth_accounts" }];

            case "wallet_switchEthereumChain": {
                if (params && params[0]?.chainId) {
                    this.chainId = params[0].chainId;
                    this.networkVersion = String(parseInt(this.chainId, 16));
                    this.emit("chainChanged", this.chainId);
                    return null;
                }
                return null;
            }

            case "personal_sign":
            case "eth_sign":
            case "eth_signTypedData":
            case "eth_signTypedData_v4":
                return sendBackgroundMessage({
                    type: "SIGN_MESSAGE",
                    payload: { method, params, chainType: "evm" },
                });

            case "eth_sendTransaction":
                return sendBackgroundMessage({
                    type: "SEND_TRANSACTION",
                    payload: { method, params, chainType: "evm" },
                });

            default:
                throw new Error(`Method ${method} not supported by FistWallet provider`);
        }
    }

    async enable(): Promise<string[]> {
        return this.request({ method: "eth_requestAccounts" });
    }

    send(methodOrPayload: any, paramsOrCallback?: any): any {
        if (typeof methodOrPayload === "string") {
            return this.request({ method: methodOrPayload, params: paramsOrCallback });
        }
        if (typeof paramsOrCallback === "function") {
            this.sendAsync(methodOrPayload, paramsOrCallback);
            return;
        }
        return this.request(methodOrPayload);
    }

    sendAsync(payload: any, callback: (error: any, response: any) => void): void {
        this.request(payload)
            .then((result) => {
                callback(null, { id: payload.id, jsonrpc: "2.0", result });
            })
            .catch((error) => {
                callback(error, { id: payload.id, jsonrpc: "2.0", error });
            });
    }
}

/**
 * Solana Provider (window.solana) compatible with Phantom & OKX
 */
export class SolanaProvider extends EventEmitter {
    readonly isPhantom = true;
    readonly isFistWallet = true;

    publicKey: { toBase58(): string; toString(): string } | null = null;
    isConnected = false;

    async connect(): Promise<{ publicKey: { toBase58(): string; toString(): string } }> {
        const accounts = await sendBackgroundMessage({
            type: "REQUEST_ACCOUNTS",
            payload: { chainType: "solana" },
        });

        const address = accounts?.[0];
        if (!address) {
            throw new Error("User rejected Solana connection");
        }

        const pubKeyObj = {
            toBase58: () => address,
            toString: () => address,
        };
        this.publicKey = pubKeyObj;
        this.isConnected = true;
        this.emit("connect", pubKeyObj);

        return { publicKey: pubKeyObj };
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
        this.publicKey = null;
        this.emit("disconnect");
    }

    async signMessage(message: Uint8Array | string): Promise<{ signature: Uint8Array }> {
        const msgStr = typeof message === "string" ? message : new TextDecoder().decode(message);
        const signatureHex = await sendBackgroundMessage({
            type: "SIGN_MESSAGE",
            payload: { message: msgStr, chainType: "solana" },
        });

        return { signature: new TextEncoder().encode(signatureHex) };
    }

    async signTransaction(transaction: any): Promise<any> {
        console.log("Solana signTransaction requested", transaction);
        return transaction;
    }

    async signAllTransactions(transactions: any[]): Promise<any[]> {
        return transactions;
    }
}

/**
 * Bitcoin Provider (window.bitcoin / window.unisat)
 */
export class BitcoinProvider extends EventEmitter {
    readonly isFistWallet = true;
    readonly isUniSat = true;

    async requestAccounts(): Promise<string[]> {
        return sendBackgroundMessage({
            type: "REQUEST_ACCOUNTS",
            payload: { chainType: "bitcoin" },
        });
    }

    async getAccounts(): Promise<string[]> {
        return this.requestAccounts();
    }

    async getPublicKey(): Promise<string> {
        const accounts = await this.requestAccounts();
        return accounts[0] || "";
    }

    async signMessage(message: string): Promise<string> {
        return sendBackgroundMessage({
            type: "SIGN_MESSAGE",
            payload: { message, chainType: "bitcoin" },
        });
    }

    async sendBitcoin(to: string, amount: number): Promise<string> {
        return sendBackgroundMessage({
            type: "SEND_TRANSACTION",
            payload: { to, amount, chainType: "bitcoin" },
        });
    }
}

// Instantiate providers
const ethereum = new EthereumProvider();
const solana = new SolanaProvider();
const bitcoin = new BitcoinProvider();

(window as any).ethereum = ethereum;
(window as any).solana = solana;
(window as any).bitcoin = bitcoin;
(window as any).fistwallet = {
    ethereum,
    solana,
    bitcoin,
};

// EIP-6963 Multi-Injected Provider Discovery Standard
const eip6963Info = {
    uuid: "a8e93df1-5fc3-4e33-9fb4-245388cbe02b",
    name: "FistWallet",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%233B82F6'/><text x='50' y='65' font-size='45' text-anchor='middle' fill='white' font-weight='bold'>F</text></svg>",
    rdns: "io.fistwallet",
};

function announceEip6963() {
    window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
            detail: Object.freeze({ info: eip6963Info, provider: ethereum }),
        })
    );
}

window.addEventListener("eip6963:requestProvider", () => {
    announceEip6963();
});

announceEip6963();
window.dispatchEvent(new Event("ethereum#initialized"));
console.log("FistWallet providers fully registered and announced");
