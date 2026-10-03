
function cleanPrivateKeyHex(key: string): string {
    let clean = key.trim();
    if (clean.startsWith("0x") || clean.startsWith("0X")) {
        clean = clean.slice(2);
    }
    return clean;
}
import {EVM_DERIVATION_PATH} from "../constans";
import {ICreateWallet, IWalletFields, EVMTransaction, EIP712TypedData, UserOperation, PackedUserOperation, EIP7702Authorization} from "../types";
import {InvalidMnemonicError, InvalidPrivateKeyError, KeyDerivationError, AddressGenerationError} from "../errors";
import {generateMnemonic, mnemonicToSeedSync, validateMnemonic} from "bip39";
import {HDKey} from "@scure/bip32";
import {bytesToHex, hexToBytes} from "@noble/hashes/utils";
import {secp256k1} from "@noble/curves/secp256k1";
import {keccak_256} from "@noble/hashes/sha3";

/**
 * Create a new EVM wallet
 * @param params

 */
export function createWallet(params?: ICreateWallet): IWalletFields {
    const args = {
        length: 128,
        path: EVM_DERIVATION_PATH,
        ...params
    };
    const mnemonic = generateMnemonic(args.length);
    const {privateKey, publicKey} = getPrivateKeyByMnemonic(mnemonic, args.path, args.passphrase);
    const address = getAddressByPrivateKey(privateKey);
    return {
        mnemonic,
        privateKey,
        publicKey,
        address
    }
}

/**
 * Get public key by private key
 * @param mnemonic
 * @param hdPath
 */
export function getPrivateKeyByMnemonic(mnemonic: string, hdPath: string = EVM_DERIVATION_PATH, passphrase?: string) {
    if (!validateMnemonic(mnemonic)) {
        throw new InvalidMnemonicError();
    }
    // mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic, passphrase);
    // create master key
    const masterKey = HDKey.fromMasterSeed(seed);

    const key = masterKey.derive(hdPath);

    if (!key.publicKey || !key.privateKey) {
        throw new KeyDerivationError('Failed to derive key from path');
    }

    return {
        privateKey: bytesToHex(key.privateKey),
        publicKey: bytesToHex(key.publicKey),
    }

}

/**
 * Get address by private key
 * @param privateKeyHex
 */
export function getAddressByPrivateKey(privateKeyHex: string): string {
    privateKeyHex = cleanPrivateKeyHex(privateKeyHex);
    if (privateKeyHex.length !== 64) {
        throw new InvalidPrivateKeyError("Private key must be 64 hex characters (32 bytes)");
    }
    const privateKey = hexToBytes(privateKeyHex);

    const uncompressedPublicKey = secp256k1.getPublicKey(privateKey, false);

    const pubKeyRaw = uncompressedPublicKey.slice(1);

    const hash = keccak_256(pubKeyRaw);

    return bytesToHex(hash.slice(-20));
}

// ==================== RLP Encoding ====================

/**
 * RLP encode a value
 */
function encodeLength(length: number, offset: number): number[] {
    if (length < 56) {
        return [length + offset];
    }
    const hexLength = length.toString(16);
    const lengthLength = hexLength.length / 2;
    const firstByte = offset + 55 + lengthLength;
    return [firstByte, ...hexToBytes(hexLength.padStart(lengthLength * 2, '0'))];
}

function rlpEncode(input: any): Uint8Array {
    if (Array.isArray(input)) {
        const output: number[] = [];
        for (const item of input) {
            output.push(...rlpEncode(item));
        }
        return new Uint8Array([...encodeLength(output.length, 0xc0), ...output]);
    }

    // Convert to bytes
    let bytes: Uint8Array;
    if (typeof input === 'string') {
        if (input.startsWith('0x')) {
            const hex = input.slice(2);
            // Pad hex string if it has odd length
            const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
            bytes = paddedHex.length === 0 ? new Uint8Array(0) : hexToBytes(paddedHex);
        } else {
            bytes = new TextEncoder().encode(input);
        }
    } else if (typeof input === 'number') {
        if (input === 0) {
            bytes = new Uint8Array(0);
        } else {
            bytes = hexToBytes(input.toString(16).padStart(input.toString(16).length % 2 ? input.toString(16).length + 1 : input.toString(16).length, '0'));
        }
    } else {
        bytes = input;
    }

    if (bytes.length === 1 && bytes[0] < 0x80) {
        return bytes;
    }

    return new Uint8Array([...encodeLength(bytes.length, 0x80), ...bytes]);
}

// ==================== Transaction Signing ====================

/**
 * Sign an EVM transaction
 * @param privateKeyHex Private key in hex format (without 0x prefix)
 * @param tx Transaction object
 * @returns Signed transaction as hex string (with 0x prefix)
 */
export function signTransaction(privateKeyHex: string, tx: EVMTransaction): string {
    privateKeyHex = cleanPrivateKeyHex(privateKeyHex);
    if (privateKeyHex.length !== 64) {
        throw new InvalidPrivateKeyError("Private key must be 64 hex characters (32 bytes)");
    }

    // Legacy transaction (Type 0)
    if (!tx.type || tx.type === 0) {
        const txArray = [
            '0x' + tx.nonce.toString(16),
            tx.gasPrice || '0x0',
            tx.gasLimit,
            tx.to,
            tx.value,
            tx.data || '0x',
            '0x' + tx.chainId.toString(16),
            '0x',
            '0x'
        ];

        const rlpEncoded = rlpEncode(txArray);
        const txHash = keccak_256(rlpEncoded);

        const signature = secp256k1.sign(txHash, hexToBytes(privateKeyHex));
        const v = Number(signature.recovery) + 35 + tx.chainId * 2;

        const signedTxArray = [
            '0x' + tx.nonce.toString(16),
            tx.gasPrice || '0x0',
            tx.gasLimit,
            tx.to,
            tx.value,
            tx.data || '0x',
            '0x' + v.toString(16),
            '0x' + signature.r.toString(16).padStart(64, '0'),
            '0x' + signature.s.toString(16).padStart(64, '0')
        ];

        return '0x' + bytesToHex(rlpEncode(signedTxArray));
    }

    // EIP-1559 transaction (Type 2)
    if (tx.type === 2) {
        const txArray = [
            '0x' + tx.chainId.toString(16),
            '0x' + tx.nonce.toString(16),
            tx.maxPriorityFeePerGas || '0x0',
            tx.maxFeePerGas || '0x0',
            tx.gasLimit,
            tx.to,
            tx.value,
            tx.data || '0x',
            []  // accessList
        ];

        const rlpEncoded = rlpEncode(txArray);
        const txBytes = new Uint8Array([0x02, ...rlpEncoded]);
        const txHash = keccak_256(txBytes);

        const signature = secp256k1.sign(txHash, hexToBytes(privateKeyHex));

        const signedTxArray = [
            '0x' + tx.chainId.toString(16),
            '0x' + tx.nonce.toString(16),
            tx.maxPriorityFeePerGas || '0x0',
            tx.maxFeePerGas || '0x0',
            tx.gasLimit,
            tx.to,
            tx.value,
            tx.data || '0x',
            [],  // accessList
            '0x' + Number(signature.recovery).toString(16),
            '0x' + signature.r.toString(16).padStart(64, '0'),
            '0x' + signature.s.toString(16).padStart(64, '0')
        ];

        return '0x02' + bytesToHex(rlpEncode(signedTxArray));
    }

    throw new Error(`Unsupported transaction type: ${tx.type}`);
}

// ==================== Message Signing (EIP-191) ====================

/**
 * Sign a message using EIP-191 standard (personal_sign)
 * @param privateKeyHex Private key in hex format (without 0x prefix)
 * @param message Message to sign (string or hex)
 * @returns Signature as hex string (with 0x prefix)
 */
export function signMessage(privateKeyHex: string, message: string): string {
    privateKeyHex = cleanPrivateKeyHex(privateKeyHex);
    if (privateKeyHex.length !== 64) {
        throw new InvalidPrivateKeyError("Private key must be 64 hex characters (32 bytes)");
    }

    // Convert message to bytes
    let messageBytes: Uint8Array;
    if (message.startsWith('0x')) {
        messageBytes = hexToBytes(message.slice(2));
    } else {
        messageBytes = new TextEncoder().encode(message);
    }

    // EIP-191: "\x19Ethereum Signed Message:\n" + len(message) + message
    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixBytes = new TextEncoder().encode(prefix);
    const fullMessage = new Uint8Array([...prefixBytes, ...messageBytes]);

    const messageHash = keccak_256(fullMessage);
    const signature = secp256k1.sign(messageHash, hexToBytes(privateKeyHex));

    // Format: r (32 bytes) + s (32 bytes) + v (1 byte)
    const v = signature.recovery + 27;
    return '0x' +
        signature.r.toString(16).padStart(64, '0') +
        signature.s.toString(16).padStart(64, '0') +
        v.toString(16).padStart(2, '0');
}

// ==================== Signature Verification ====================

/**
 * Recover signer address from an EIP-191 personal_sign signature
 * @param message Original message
 * @param signature 65-byte hex signature
 * @returns Recovered address (without 0x prefix)
 */
export function recoverPersonalSignature(message: string, signature: string): string {
    const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
    if (sig.length !== 130) {
        throw new Error('Invalid signature length: must be 65 bytes (130 hex chars)');
    }

    const r = sig.slice(0, 64);
    const s = sig.slice(64, 128);
    const v = parseInt(sig.slice(128, 130), 16);

    let messageBytes: Uint8Array;
    if (message.startsWith('0x')) {
        messageBytes = hexToBytes(message.slice(2));
    } else {
        messageBytes = new TextEncoder().encode(message);
    }

    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixBytes = new TextEncoder().encode(prefix);
    const fullMessage = new Uint8Array([...prefixBytes, ...messageBytes]);
    const messageHash = keccak_256(fullMessage);

    const recovery = v >= 27 ? v - 27 : v;
    const sigObj = new secp256k1.Signature(BigInt('0x' + r), BigInt('0x' + s));
    const publicKey = sigObj.addRecoveryBit(recovery).recoverPublicKey(messageHash);

    const uncompressedPubKey = publicKey.toRawBytes(false);
    const pubKeyHash = keccak_256(uncompressedPubKey.slice(1));
    return bytesToHex(pubKeyHash.slice(-20));
}

/**
 * Recover signer address from an EIP-712 structured data signature
 * @param typedData EIP-712 typed data object
 * @param signature 65-byte hex signature
 * @returns Recovered address (without 0x prefix)
 */
export function recoverTypedSignature(typedData: EIP712TypedData, signature: string): string {
    const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
    if (sig.length !== 130) {
        throw new Error('Invalid signature length: must be 65 bytes (130 hex chars)');
    }

    const r = sig.slice(0, 64);
    const s = sig.slice(64, 128);
    const v = parseInt(sig.slice(128, 130), 16);

    const messageHash = hashTypedData(typedData);
    const recovery = v >= 27 ? v - 27 : v;
    const sigObj = new secp256k1.Signature(BigInt('0x' + r), BigInt('0x' + s));
    const publicKey = sigObj.addRecoveryBit(recovery).recoverPublicKey(messageHash);

    const uncompressedPubKey = publicKey.toRawBytes(false);
    const pubKeyHash = keccak_256(uncompressedPubKey.slice(1));
    return bytesToHex(pubKeyHash.slice(-20));
}

/**
 * Verify a message signature
 * @param message Original message
 * @param signature Signature (with 0x prefix)
 * @param expectedAddress Expected signer address (without 0x prefix)
 * @returns true if signature is valid
 */
export function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
        // Remove 0x prefix if present
        const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
        if (sig.length !== 130) { // 65 bytes * 2
            return false;
        }

        const r = sig.slice(0, 64);
        const s = sig.slice(64, 128);
        const v = parseInt(sig.slice(128, 130), 16);

        // Convert message to bytes
        let messageBytes: Uint8Array;
        if (message.startsWith('0x')) {
            messageBytes = hexToBytes(message.slice(2));
        } else {
            messageBytes = new TextEncoder().encode(message);
        }

        // EIP-191: "\x19Ethereum Signed Message:\n" + len(message) + message
        const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
        const prefixBytes = new TextEncoder().encode(prefix);
        const fullMessage = new Uint8Array([...prefixBytes, ...messageBytes]);
        const messageHash = keccak_256(fullMessage);

        // Recover public key from signature
        const recovery = v - 27;
        const sig2 = new secp256k1.Signature(BigInt('0x' + r), BigInt('0x' + s));
        const publicKey = sig2.addRecoveryBit(recovery).recoverPublicKey(messageHash);

        // Get address from public key
        const uncompressedPubKey = publicKey.toRawBytes(false);
        const pubKeyHash = keccak_256(uncompressedPubKey.slice(1));
        const recoveredAddress = bytesToHex(pubKeyHash.slice(-20));

        // Compare addresses (case-insensitive)
        const expected = expectedAddress.toLowerCase().replace('0x', '');
        return recoveredAddress.toLowerCase() === expected;
    } catch (error) {
        return false;
    }
}

// ==================== Address Validation ====================

/**
 * Validate an EVM address
 * @param address Address to validate (with or without 0x prefix)
 * @returns true if address is valid
 */
export function validateAddress(address: string): boolean {
    // Check for null/undefined
    if (!address) {
        return false;
    }

    // Remove 0x prefix if present
    const addr = address.toLowerCase().replace('0x', '');

    // Check length (20 bytes = 40 hex characters)
    if (addr.length !== 40) {
        return false;
    }

    // Check if it's valid hex
    if (!/^[0-9a-f]{40}$/.test(addr)) {
        return false;
    }

    return true;
}

/**
 * Convert address to EIP-55 checksum format
 * @param address Address (with or without 0x prefix)
 * @returns Checksummed address with 0x prefix
 */
export function toChecksumAddress(address: string): string {
    const addr = address.toLowerCase().replace('0x', '');

    if (!validateAddress(addr)) {
        throw new AddressGenerationError('Invalid address format');
    }

    const hash = bytesToHex(keccak_256(new TextEncoder().encode(addr)));
    let checksumAddr = '0x';

    for (let i = 0; i < addr.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            checksumAddr += addr[i].toUpperCase();
        } else {
            checksumAddr += addr[i];
        }
    }

    return checksumAddr;
}

/**
 * Get public key from private key
 * @param privateKeyHex Private key in hex format (without 0x prefix)
 * @returns Public key in hex format (without 0x prefix)
 */
export function getPublicKey(privateKeyHex: string): string {
    privateKeyHex = cleanPrivateKeyHex(privateKeyHex);
    if (privateKeyHex.length !== 64) {
        throw new InvalidPrivateKeyError("Private key must be 64 hex characters (32 bytes)");
    }

    const publicKey = secp256k1.getPublicKey(hexToBytes(privateKeyHex), true);
    return bytesToHex(publicKey);
}

// ==================== Private Key Validation ====================

/**
 * Validate a private key format
 * @param privateKey Private key in hex format (with or without 0x prefix)
 * @returns true if private key is valid
 */
export function validatePrivateKey(privateKey: string): boolean {
    try {
        let key = privateKey.trim();
        if (key.startsWith('0x') || key.startsWith('0X')) {
            key = key.slice(2);
        }
        if (key.length !== 64 || !/^[0-9a-f]{64}$/i.test(key)) {
            return false;
        }
        const keyBigInt = BigInt('0x' + key);
        const secp256k1_n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
        if (keyBigInt === BigInt(0) || keyBigInt >= secp256k1_n) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}
// ==================== EIP-712 Typed Data Signing ====================


function encodeType(primaryType: string, types: Record<string, Array<{ name: string; type: string }>>): string {
    const deps = new Set<string>();

    function findDependencies(type: string) {
        if (!types[type] || deps.has(type)) return;
        deps.add(type);
        for (const field of types[type]) {
            const cleanType = field.type.replace(/\\[\\]$/, "");
            findDependencies(cleanType);
        }
    }

    findDependencies(primaryType);
    deps.delete(primaryType);
    const sortedSubtypes = Array.from(deps).sort();

    function formatSingle(t: string): string {
        const fields = types[t] || [];
        return `${t}(${fields.map(f => `${f.type} ${f.name}`).join(",")})`;
    }

    return [formatSingle(primaryType), ...sortedSubtypes.map(formatSingle)].join("");
}

function typeHash(primaryType: string, types: Record<string, Array<{ name: string; type: string }>>): Uint8Array {
    return keccak_256(new TextEncoder().encode(encodeType(primaryType, types)));
}

function encodeValue(type: string, value: any, types: Record<string, Array<{ name: string; type: string }>>): Uint8Array {
    if (types[type]) {
        return hashStruct(type, value, types);
    }

    if (type.endsWith("[]")) {
        const itemType = type.slice(0, -2);
        const encodedItems: number[] = [];
        for (const item of (value || [])) {
            encodedItems.push(...encodeValue(itemType, item, types));
        }
        return keccak_256(new Uint8Array(encodedItems));
    }

    if (type === "string") {
        return keccak_256(new TextEncoder().encode(String(value ?? "")));
    }

    if (type === "bytes") {
        const bytes = typeof value === "string" ? (value.startsWith("0x") ? hexToBytes(value.slice(2)) : new TextEncoder().encode(value)) : value;
        return keccak_256(bytes);
    }

    if (type === "bool") {
        const out = new Uint8Array(32);
        if (value) out[31] = 1;
        return out;
    }

    if (type === "address") {
        const clean = (typeof value === "string" ? value : "").toLowerCase().replace("0x", "").padStart(64, "0");
        return hexToBytes(clean);
    }

    if (type.startsWith("uint") || type.startsWith("int")) {
        const big = BigInt(value ?? 0);
        let hex = big < 0n ? (BigInt(2) ** 256n + big).toString(16) : big.toString(16);
        hex = hex.padStart(64, "0");
        return hexToBytes(hex);
    }

    if (type.startsWith("bytes")) {
        let hex = typeof value === "string" ? value.replace("0x", "") : bytesToHex(value);
        hex = hex.padEnd(64, "0").slice(0, 64);
        return hexToBytes(hex);
    }

    throw new Error(`Unsupported EIP-712 field type: ${type}`);
}

export function hashStruct(primaryType: string, data: Record<string, any>, types: Record<string, Array<{ name: string; type: string }>>): Uint8Array {
    const th = typeHash(primaryType, types);
    const fields = types[primaryType] || [];
    const encodedValues: number[] = [...th];

    for (const field of fields) {
        const val = data?.[field.name];
        encodedValues.push(...encodeValue(field.type, val, types));
    }

    return keccak_256(new Uint8Array(encodedValues));
}

export function hashTypedData(typedData: EIP712TypedData): Uint8Array {
    const typesWithDomain = {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
            { name: "salt", type: "bytes32" },
        ].filter(prop => typedData.domain && (typedData.domain as any)[prop.name] !== undefined),
        ...typedData.types,
    };

    const domainSeparator = hashStruct("EIP712Domain", typedData.domain as any, typesWithDomain);
    const messageHash = hashStruct(typedData.primaryType, typedData.message, typesWithDomain);

    const prefix = new Uint8Array([0x19, 0x01]);
    const combined = new Uint8Array(2 + domainSeparator.length + messageHash.length);
    combined.set(prefix, 0);
    combined.set(domainSeparator, 2);
    combined.set(messageHash, 2 + domainSeparator.length);

    return keccak_256(combined);
}

export function signTypedData(privateKeyHex: string, typedData: EIP712TypedData): string {
    privateKeyHex = cleanPrivateKeyHex(privateKeyHex);
    if (privateKeyHex.length !== 64) {
        throw new InvalidPrivateKeyError("Private key must be 64 hex characters (32 bytes)");
    }

    const digest = hashTypedData(typedData);
    const signature = secp256k1.sign(digest, hexToBytes(privateKeyHex));
    const v = Number(signature.recovery) + 27;

    return "0x" +
        signature.r.toString(16).padStart(64, "0") +
        signature.s.toString(16).padStart(64, "0") +
        v.toString(16).padStart(2, "0");
}

export function verifyTypedData(typedData: EIP712TypedData, signature: string, expectedAddress: string): boolean {
    try {
        const sig = signature.startsWith("0x") ? signature.slice(2) : signature;
        if (sig.length !== 130) return false;

        const r = sig.slice(0, 64);
        const s = sig.slice(64, 128);
        const v = parseInt(sig.slice(128, 130), 16);

        const digest = hashTypedData(typedData);
        const recovery = v - 27;
        const sig2 = new secp256k1.Signature(BigInt("0x" + r), BigInt("0x" + s));
        const publicKey = sig2.addRecoveryBit(recovery).recoverPublicKey(digest);

        const uncompressedPubKey = publicKey.toRawBytes(false);
        const pubKeyHash = keccak_256(uncompressedPubKey.slice(1));
        const recoveredAddress = bytesToHex(pubKeyHash.slice(-20));

        const expected = expectedAddress.toLowerCase().replace("0x", "");
        return recoveredAddress.toLowerCase() === expected;
    } catch {
        return false;
    }
}

// ==================== ERC-4337 Account Abstraction ====================

function pad32(val: bigint | string | number): Uint8Array {
    let big: bigint;
    if (typeof val === 'bigint') big = val;
    else if (typeof val === 'number') big = BigInt(val);
    else if (typeof val === 'string' && val.startsWith('0x')) big = BigInt(val);
    else big = BigInt(val || 0);

    const hex = big.toString(16).padStart(64, '0');
    return hexToBytes(hex);
}

function padAddress(addr: string): Uint8Array {
    const clean = addr.toLowerCase().replace('0x', '').padStart(64, '0');
    return hexToBytes(clean);
}

/**
 * Computes standard EIP-4337 UserOperation hash
 */
export function getUserOperationHash(userOp: UserOperation, entryPoint: string, chainId: number): string {
    const initCodeBytes = userOp.initCode && userOp.initCode !== '0x' ? hexToBytes(userOp.initCode.replace('0x', '')) : new Uint8Array(0);
    const callDataBytes = userOp.callData && userOp.callData !== '0x' ? hexToBytes(userOp.callData.replace('0x', '')) : new Uint8Array(0);
    const paymasterBytes = userOp.paymasterAndData && userOp.paymasterAndData !== '0x' ? hexToBytes(userOp.paymasterAndData.replace('0x', '')) : new Uint8Array(0);

    const packedOp = new Uint8Array([
        ...padAddress(userOp.sender),
        ...pad32(userOp.nonce),
        ...keccak_256(initCodeBytes),
        ...keccak_256(callDataBytes),
        ...pad32(userOp.callGasLimit),
        ...pad32(userOp.verificationGasLimit),
        ...pad32(userOp.preVerificationGas),
        ...pad32(userOp.maxFeePerGas),
        ...pad32(userOp.maxPriorityFeePerGas),
        ...keccak_256(paymasterBytes),
    ]);
    const opHash = keccak_256(packedOp);

    const finalPack = new Uint8Array([
        ...opHash,
        ...padAddress(entryPoint),
        ...pad32(chainId),
    ]);
    return '0x' + bytesToHex(keccak_256(finalPack));
}

/**
 * Signs an ERC-4337 UserOperation with a private key
 */
export function signUserOperation(userOp: UserOperation, privateKey: string, entryPoint: string, chainId: number): UserOperation {
    const hashHex = getUserOperationHash(userOp, entryPoint, chainId);
    const hashBytes = hexToBytes(hashHex.replace('0x', ''));
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const sig = secp256k1.sign(hashBytes, hexToBytes(cleanKey));
    const v = Number(sig.recovery) + 27;
    const signatureHex = '0x' +
        sig.r.toString(16).padStart(64, '0') +
        sig.s.toString(16).padStart(64, '0') +
        v.toString(16).padStart(2, '0');

    return {
        ...userOp,
        signature: signatureHex,
    };
}

/**
 * Packs ERC-4337 UserOperation for v0.7 bundler RPC format
 */
export function packUserOperation(userOp: UserOperation): PackedUserOperation {
    const verificationGas = BigInt(userOp.verificationGasLimit || 0);
    const callGas = BigInt(userOp.callGasLimit || 0);
    const accountGasLimits = '0x' + verificationGas.toString(16).padStart(32, '0') + callGas.toString(16).padStart(32, '0');

    const maxPriority = BigInt(userOp.maxPriorityFeePerGas || 0);
    const maxFee = BigInt(userOp.maxFeePerGas || 0);
    const gasFees = '0x' + maxPriority.toString(16).padStart(32, '0') + maxFee.toString(16).padStart(32, '0');

    return {
        sender: userOp.sender,
        nonce: typeof userOp.nonce === 'bigint' ? '0x' + userOp.nonce.toString(16) : userOp.nonce.toString(),
        initCode: userOp.initCode || '0x',
        callData: userOp.callData || '0x',
        accountGasLimits,
        preVerificationGas: typeof userOp.preVerificationGas === 'bigint' ? '0x' + userOp.preVerificationGas.toString(16) : userOp.preVerificationGas.toString(),
        gasFees,
        paymasterAndData: userOp.paymasterAndData || '0x',
        signature: userOp.signature || '0x',
    };
}

// ==================== EIP-7702 Authorization ====================

/**
 * Computes hash of EIP-7702 authorization payload
 */
export function hashAuthorization(auth: EIP7702Authorization, chainId?: number): string {
    const targetChainId = chainId ?? auth.chainId;
    const packed = new Uint8Array([
        0x05,
        ...pad32(targetChainId),
        ...padAddress(auth.address),
        ...pad32(auth.nonce),
    ]);
    return '0x' + bytesToHex(keccak_256(packed));
}

/**
 * Signs EIP-7702 authorization payload
 */
export function signAuthorization(auth: EIP7702Authorization, privateKey: string, chainId?: number): EIP7702Authorization {
    const hashHex = hashAuthorization(auth, chainId);
    const hashBytes = hexToBytes(hashHex.replace('0x', ''));
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const sig = secp256k1.sign(hashBytes, hexToBytes(cleanKey));
    return {
        ...auth,
        chainId: chainId ?? auth.chainId,
        yParity: sig.recovery,
        r: '0x' + sig.r.toString(16).padStart(64, '0'),
        s: '0x' + sig.s.toString(16).padStart(64, '0'),
    };
}
