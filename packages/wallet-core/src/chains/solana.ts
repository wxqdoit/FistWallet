import { ICreateWallet, IWalletFields } from "../types";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { SOLANA_DERIVATION_PATH } from "../constans";
import { base58 } from "@scure/base";
import { hexToBytes } from "@noble/hashes/utils";
import { ed25519 } from "@noble/curves/ed25519";
import { derivePath } from "../utils/ed25519-hd";
import { InvalidMnemonicError, InvalidPrivateKeyError } from "../errors";

/**
 * Create a new Solana wallet
 * @param params
 */
export function createWallet(params?: ICreateWallet): IWalletFields {
    const args = {
        length: 128,
        path: SOLANA_DERIVATION_PATH,
        ...params
    };
    const mnemonic = generateMnemonic(args.length);
    const privateKey = getPrivateKeyByMnemonic(mnemonic, args.path, args.passphrase); // Now returns base58 string
    const address = getAddressByPrivateKey(privateKey); // Now accepts string

    // Extract public key from the base58 private key (last 32 bytes)
    const fullKey = base58.decode(privateKey);
    const publicKey = fullKey.slice(32);

    return {
        mnemonic,
        privateKey, // base58 string (64 bytes)
        publicKey: base58.encode(publicKey),
        address
    }
}

/**
 * Get address by private key
 * @param privateKey - Private key in base58 format (64 bytes) or hex string
 */

function parseSolanaPrivateKey(privateKey: string): { secretKey: Uint8Array; publicKey: Uint8Array } {
    let cleanKey = privateKey.trim();
    if (cleanKey.startsWith("0x") || cleanKey.startsWith("0X")) {
        cleanKey = cleanKey.slice(2);
    }

    let bytes: Uint8Array;
    if (/^[0-9a-fA-F]{64}$/.test(cleanKey) || /^[0-9a-fA-F]{128}$/.test(cleanKey)) {
        bytes = hexToBytes(cleanKey);
    } else {
        try {
            bytes = base58.decode(cleanKey);
        } catch {
            throw new InvalidPrivateKeyError("Solana private key must be valid base58 or hex format");
        }
    }

    if (bytes.length === 64) {
        return {
            secretKey: bytes.slice(0, 32),
            publicKey: bytes.slice(32),
        };
    } else if (bytes.length === 32) {
        return {
            secretKey: bytes,
            publicKey: ed25519.getPublicKey(bytes),
        };
    } else {
        throw new InvalidPrivateKeyError("Solana private key must be 32 bytes or 64 bytes");
    }
}

export function getAddressByPrivateKey(privateKey: string): string {
    const { publicKey } = parseSolanaPrivateKey(privateKey);
    return base58.encode(publicKey);
}

/**
 * Get private key from mnemonic
 * @param mnemonic
 * @param hdPath
 * @returns Private key in base58 format (64 bytes: 32 secret + 32 public)
 */
export function getPrivateKeyByMnemonic(mnemonic: string, hdPath: string = SOLANA_DERIVATION_PATH, passphrase?: string): string {
    if (!validateMnemonic(mnemonic)) {
        throw new InvalidMnemonicError();
    }
    // mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic, passphrase);

    // create master key
    const { key } = derivePath(hdPath, seed);

    // Get public key from private key
    const publicKey = ed25519.getPublicKey(key);

    // Concatenate private key (32 bytes) + public key (32 bytes) = 64 bytes
    const concatKey = new Uint8Array([...key, ...publicKey]);

    // Return as base58 string for consistency
    return base58.encode(concatKey);
}

// ==================== Transaction Signing ====================

/**
 * Sign a Solana transaction
 * @param privateKeyBase58 Private key in base58 format (64 bytes with public key appended)
 * @param messageBytes Transaction message bytes
 * @returns Signature in base58 format
 */
export function signTransaction(privateKeyBase58: string, messageBytes: Uint8Array): string {
    try {
        const { secretKey } = parseSolanaPrivateKey(privateKeyBase58);
        const signature = ed25519.sign(messageBytes, secretKey);
        return base58.encode(signature);
    } catch (error) {
        throw new Error(`Failed to sign transaction: ${error}`);
    }
}

/**
 * Sign a message
 * @param privateKeyBase58 Private key in base58 format
 * @param message Message to sign (string or Uint8Array)
 * @returns Signature in base58 format
 */
export function signMessage(privateKeyBase58: string, message: string | Uint8Array): string {
    try {
        const { secretKey } = parseSolanaPrivateKey(privateKeyBase58);
        const messageBytes = typeof message === "string"
            ? new TextEncoder().encode(message)
            : message;
        const signature = ed25519.sign(messageBytes, secretKey);
        return base58.encode(signature);
    } catch (error) {
        throw new Error(`Failed to sign message: ${error}`);
    }
}

// ==================== Signature Verification ====================

/**
 * Verify a signature
 * @param message Original message
 * @param signature Signature in base58 format
 * @param publicKey Public key in base58 format
 * @returns true if signature is valid
 */
export const verifyMessage = verifySignature;

export function verifySignature(
    message: string | Uint8Array,
    signature: string,
    publicKey: string
): boolean {
    try {
        const messageBytes = typeof message === 'string'
            ? new TextEncoder().encode(message)
            : message;

        const signatureBytes = base58.decode(signature);
        const publicKeyBytes = base58.decode(publicKey);

        return ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);
    } catch (error) {
        return false;
    }
}

// ==================== Address Validation ====================

/**
 * Validate a Solana address (base58 encoded public key)
 * @param address Address to validate
 * @returns true if address is valid
 */
export function validateAddress(address: string): boolean {
    try {
        const decoded = base58.decode(address);
        // Solana public keys are 32 bytes
        return decoded.length === 32;
    } catch {
        return false;
    }
}

/**
 * Get public key from private key
 * @param privateKeyBase58 Private key in base58 format
 * @returns Public key in base58 format
 */
export function getPublicKey(privateKeyBase58: string): string {
    try {
        const { publicKey } = parseSolanaPrivateKey(privateKeyBase58);
        return base58.encode(publicKey);
    } catch (error) {
        throw new Error(`Failed to get public key: ${error}`);
    }
}

// ==================== Private Key Validation ====================

/**
 * Validate a Solana private key format
 * Accepts either base58 encoded (64 bytes) or hex format (64 chars)
 * @param privateKey Private key in base58 or hex format
 * @returns true if private key is valid
 */
export function validatePrivateKey(privateKey: string): boolean {
    try {
        parseSolanaPrivateKey(privateKey);
        return true;
    } catch {
        return false;
    }
}

// ==================== Solana Versioned Transaction (v0) ====================

export interface SolanaMessageV0 {
    header: {
        numRequiredSignatures: number;
        numReadonlySignedAccounts: number;
        numReadonlyUnsignedAccounts: number;
    };
    staticAccountKeys: string[]; // Base58 public keys
    recentBlockhash: string; // Base58
    compiledInstructions: Array<{
        programIdIndex: number;
        accountKeyIndexes: number[];
        data: Uint8Array | number[];
    }>;
    addressTableLookups?: Array<{
        accountKey: string;
        writableIndexes: number[];
        readonlyIndexes: number[];
    }>;
}

function encodeCompactU16(val: number): number[] {
    let rem = val;
    const out: number[] = [];
    while (rem >= 0x80) {
        out.push((rem & 0x7f) | 0x80);
        rem >>= 7;
    }
    out.push(rem);
    return out;
}

/**
 * Serialize a Solana v0 Message into raw bytes
 */
export function serializeV0Message(message: SolanaMessageV0): Uint8Array {
    const bytes: number[] = [];

    // Prefix for versioned message: 0x80 = version 0
    bytes.push(0x80);

    // Header
    bytes.push(
        message.header.numRequiredSignatures,
        message.header.numReadonlySignedAccounts,
        message.header.numReadonlyUnsignedAccounts
    );

    // Static account keys
    bytes.push(...encodeCompactU16(message.staticAccountKeys.length));
    for (const key of message.staticAccountKeys) {
        bytes.push(...base58.decode(key));
    }

    // Recent blockhash (32 bytes)
    bytes.push(...base58.decode(message.recentBlockhash));

    // Compiled instructions
    bytes.push(...encodeCompactU16(message.compiledInstructions.length));
    for (const ix of message.compiledInstructions) {
        bytes.push(ix.programIdIndex);
        bytes.push(...encodeCompactU16(ix.accountKeyIndexes.length));
        bytes.push(...ix.accountKeyIndexes);
        const dataBytes = ix.data instanceof Uint8Array ? Array.from(ix.data) : ix.data;
        bytes.push(...encodeCompactU16(dataBytes.length));
        bytes.push(...dataBytes);
    }

    // Address table lookups
    const lookups = message.addressTableLookups || [];
    bytes.push(...encodeCompactU16(lookups.length));
    for (const lookup of lookups) {
        bytes.push(...base58.decode(lookup.accountKey));
        bytes.push(...encodeCompactU16(lookup.writableIndexes.length));
        bytes.push(...lookup.writableIndexes);
        bytes.push(...encodeCompactU16(lookup.readonlyIndexes.length));
        bytes.push(...lookup.readonlyIndexes);
    }

    return new Uint8Array(bytes);
}

/**
 * Sign a Solana v0 Versioned Transaction and serialize to wire format
 * @param privateKeys Array of private keys in base58 or hex format
 * @param message SolanaMessageV0 object
 * @returns Serialized transaction bytes in Uint8Array
 */
export function signVersionedTransaction(
    privateKeys: string[],
    message: SolanaMessageV0
): Uint8Array {
    const messageBytes = serializeV0Message(message);
    const signatures: Uint8Array[] = [];

    for (const pk of privateKeys) {
        const { secretKey } = parseSolanaPrivateKey(pk);
        const sig = ed25519.sign(messageBytes, secretKey);
        signatures.push(sig);
    }

    const wire: number[] = [];
    wire.push(...encodeCompactU16(signatures.length));
    for (const sig of signatures) {
        wire.push(...Array.from(sig));
    }
    wire.push(...Array.from(messageBytes));

    return new Uint8Array(wire);
}
