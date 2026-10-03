export interface IWalletFields {
    mnemonic: string;
    privateKey: string;
    publicKey?: string;
    address: string;
}

export interface ICreateWallet {
    length?: 128 | 256,
    path?: string,
    passphrase?: string,
    addressType?: BitcoinAddressType | FilecoinAddressType // For Bitcoin and Filecoin wallets
}

/**
 * Bitcoin address types
 */
export type BitcoinAddressType = 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2tr';

/**
 * Filecoin address types
 */
export type FilecoinAddressType = 'secp256k1' | 'bls';

/**
 * EVM Transaction interface
 */
export interface EVMTransaction {
    to: string;
    value: string;
    gasLimit: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce: number;
    data?: string;
    chainId: number;
    type?: number; // 0 = legacy, 2 = EIP-1559
}

/**
 * Bitcoin UTXO (Unspent Transaction Output) interface
 */
export interface BitcoinUTXO {
    txid: string;
    vout: number;
    value: number; // in satoshis
    scriptPubKey: string;
}

/**
 * Bitcoin Transaction interface (simplified)
 */
export interface BitcoinTransaction {
    version: number;
    inputs: Array<{
        utxo: BitcoinUTXO;
        sequence?: number;
    }>;
    outputs: Array<{
        address: string;
        value: number; // in satoshis
    }>;
    locktime?: number;
}

/**
 * Solana Transaction interface (simplified)
 */
export interface SolanaTransaction {
    recentBlockhash: string;
    feePayer: string;
    instructions: Array<{
        programId: string;
        keys: Array<{ pubkey: string; isSigner: boolean; isWritable: boolean }>;
        data: Uint8Array;
    }>;
}

/**
 * Aptos Transaction interface (simplified)
 */
export interface AptosTransaction {
    sender: string;
    sequenceNumber: string;
    maxGasAmount: string;
    gasUnitPrice: string;
    expirationTimestampSecs: string;
    chainId: number;
    payload: any;
}

/**
 * Sui Transaction interface (simplified)
 */
export interface SuiTransaction {
    sender: string;
    gasPayment: Array<{
        objectId: string;
        version: string;
        digest: string;
    }>;
    gasPrice: string;
    gasBudget: string;
    data: any;
}

/**
 * TRON Transaction interface (simplified)
 */
export interface TronTransaction {
    to: string;
    amount: number;
    timestamp?: number;
    expiration?: number;
    data?: string;
}

/**
 * NEAR Transaction interface (simplified)
 */
export interface NearTransaction {
    signerId: string;
    receiverId: string;
    actions: Array<any>;
    nonce: number;
    blockHash: string;
}

/**
 * Filecoin Transaction interface (simplified)
 */
export interface FilecoinTransaction {
    to: string;
    from: string;
    nonce: number;
    value: string;
    gasLimit: number;
    gasFeeCap: string;
    gasPremium: string;
    method: number;
    params?: string;
}
/**
 * EIP-712 Typed Data Specification
 */
export interface EIP712TypeProperty {
    name: string;
    type: string;
}

export interface EIP712Domain {
    name?: string;
    version?: string;
    chainId?: number | string;
    verifyingContract?: string;
    salt?: string;
}

export interface EIP712TypedData {
    types: Record<string, EIP712TypeProperty[]>;
    primaryType: string;
    domain: EIP712Domain;
    message: Record<string, any>;
}

/**
 * ERC-4337 UserOperation specification
 */
export interface UserOperation {
    sender: string;
    nonce: bigint | string;
    initCode: string;
    callData: string;
    callGasLimit: bigint | string;
    verificationGasLimit: bigint | string;
    preVerificationGas: bigint | string;
    maxFeePerGas: bigint | string;
    maxPriorityFeePerGas: bigint | string;
    paymasterAndData: string;
    signature?: string;
}

export interface PackedUserOperation {
    sender: string;
    nonce: string;
    initCode: string;
    callData: string;
    accountGasLimits: string;
    preVerificationGas: string;
    gasFees: string;
    paymasterAndData: string;
    signature: string;
}

/**
 * EIP-7702 Authorization specification
 */
export interface EIP7702Authorization {
    chainId: number;
    address: string;
    nonce: number | bigint;
    yParity?: number;
    r?: string;
    s?: string;
}
