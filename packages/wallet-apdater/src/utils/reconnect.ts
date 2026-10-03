import { ChainType, type ConnectedAccount } from '../core/types';
import type { AdapterRegistry } from '../registry';

const LAST_CONNECTED_WALLET_KEY = 'fistwallet_last_connected_adapter';
const memoryFallback = new Map<string, string>();

function getItem(key: string): string | null {
    try {
        if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
            const val = localStorage.getItem(key);
            if (val !== null) return val;
        }
    } catch {}
    return memoryFallback.get(key) ?? null;
}

function setItem(key: string, value: string): void {
    try {
        if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
            localStorage.setItem(key, value);
        }
    } catch {}
    memoryFallback.set(key, value);
}

function removeItem(key: string): void {
    try {
        if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
            localStorage.removeItem(key);
        }
    } catch {}
    memoryFallback.delete(key);
}

export interface RememberedConnection {
    adapterId: string;
    chainType: ChainType;
    timestamp: number;
}

/**
 * Persists the last successfully connected wallet adapter ID
 */
export function rememberConnectedWallet(adapterId: string, chainType: ChainType): void {
    const entry: RememberedConnection = {
        adapterId,
        chainType,
        timestamp: Date.now(),
    };
    setItem(LAST_CONNECTED_WALLET_KEY, JSON.stringify(entry));
}

/**
 * Reads the remembered wallet adapter connection
 */
export function getRememberedWallet(): RememberedConnection | null {
    const raw = getItem(LAST_CONNECTED_WALLET_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as RememberedConnection;
    } catch {
        return null;
    }
}

/**
 * Clears the remembered connection
 */
export function clearRememberedWallet(): void {
    removeItem(LAST_CONNECTED_WALLET_KEY);
}

/**
 * Attempts eager reconnection to the previously connected wallet adapter without prompt
 */
export async function eagerConnect(
    registry: AdapterRegistry
): Promise<{ account: ConnectedAccount; adapterId: string } | null> {
    const remembered = getRememberedWallet();
    if (!remembered) return null;

    try {
        const adapter = registry.getAdapter(remembered.adapterId);
        if (!adapter) return null;

        // Try connecting (silent check if already connected)
        const account = await adapter.connect({ chainType: remembered.chainType });
        if (account && account.address) {
            return { account, adapterId: remembered.adapterId };
        }
    } catch {
        // Eager connection failed or rejected, clean up stale state
        clearRememberedWallet();
    }

    return null;
}
