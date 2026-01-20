import browser from 'webextension-polyfill';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import type { EncryptedVault, VaultData } from '../types';
import { STORAGE_KEYS } from '../types';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits for AES-256

/**
 * Generate random bytes using Web Crypto API
 */
function randomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const passwordBytes = new TextEncoder().encode(password);
    return pbkdf2(sha256, passwordBytes, salt, {
        c: PBKDF2_ITERATIONS,
        dkLen: KEY_LENGTH,
    });
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(data: string, password: string): Promise<EncryptedVault> {
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = await deriveKey(password, salt);

    // Use Web Crypto API for AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(key), // Cast to plain Uint8Array for compatibility
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const dataBytes = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        cryptoKey,
        dataBytes
    );

    return {
        data: bytesToHex(new Uint8Array(encrypted)),
        iv: bytesToHex(iv),
        salt: bytesToHex(salt),
    };
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(vault: EncryptedVault, password: string): Promise<string> {
    const salt = hexToBytes(vault.salt);
    const iv = hexToBytes(vault.iv);
    const encryptedData = hexToBytes(vault.data);
    const key = await deriveKey(password, salt);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(key), // Cast to plain Uint8Array for compatibility
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    try {
        // Create new ArrayBuffers to ensure compatibility with Web Crypto API
        const ivBuffer = new Uint8Array(iv.length);
        ivBuffer.set(iv);
        const dataBuffer = new Uint8Array(encryptedData.length);
        dataBuffer.set(encryptedData);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBuffer },
            cryptoKey,
            dataBuffer
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        throw new Error('Invalid password or corrupted data');
    }
}

/**
 * Save encrypted vault to storage
 */
export async function saveVault(vaultData: VaultData, password: string): Promise<void> {
    const dataString = JSON.stringify(vaultData);
    const encrypted = await encrypt(dataString, password);
    await browser.storage.local.set({ [STORAGE_KEYS.VAULT]: encrypted });
}

/**
 * Load and decrypt vault from storage
 */
export async function loadVault(password: string): Promise<VaultData | null> {
    const result = await browser.storage.local.get(STORAGE_KEYS.VAULT);
    const vault = result[STORAGE_KEYS.VAULT] as EncryptedVault | undefined;

    if (!vault) {
        return null;
    }

    const decrypted = await decrypt(vault, password);
    return JSON.parse(decrypted) as VaultData;
}

/**
 * Check if vault exists
 */
export async function hasVault(): Promise<boolean> {
    const result = await browser.storage.local.get(STORAGE_KEYS.VAULT);
    return !!result[STORAGE_KEYS.VAULT];
}

/**
 * Delete vault from storage
 */
export async function deleteVault(): Promise<void> {
    await browser.storage.local.remove(STORAGE_KEYS.VAULT);
}

/**
 * Verify password is correct
 */
export async function verifyPassword(password: string): Promise<boolean> {
    try {
        await loadVault(password);
        return true;
    } catch {
        return false;
    }
}

/**
 * Auto-lock timer management
 */
let autoLockTimer: NodeJS.Timeout | null = null;
const AUTO_LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export function resetAutoLockTimer(onLock: () => void): void {
    if (autoLockTimer) {
        clearTimeout(autoLockTimer);
    }

    autoLockTimer = setTimeout(() => {
        onLock();
    }, AUTO_LOCK_DURATION);
}

export function clearAutoLockTimer(): void {
    if (autoLockTimer) {
        clearTimeout(autoLockTimer);
        autoLockTimer = null;
    }
}

/**
 * Generic storage operations
 */
export async function setStorage<T>(key: string, value: T): Promise<void> {
    await browser.storage.local.set({ [key]: value });
}

export async function getStorage<T>(key: string): Promise<T | null> {
    const result = await browser.storage.local.get(key);
    return (result[key] as T) || null;
}

export async function removeStorage(key: string): Promise<void> {
    await browser.storage.local.remove(key);
}

export async function clearStorage(): Promise<void> {
    await browser.storage.local.clear();
}
