// Import all chain modules
import * as AptosChain from './chains/aptos'
import * as TronChain from './chains/tron'
import * as NearChain from './chains/near'
import * as TonChain from './chains/ton'
import * as EVMChain from './chains/evm'
import * as BTCChain from './chains/btc'
import * as SolanaChain from './chains/solana'
import * as SuiChain from './chains/sui'
import * as FilecoinChain from './chains/filecoin'

// Export all chains
export const Aptos = {
    createWallet: AptosChain.createWallet,
    getPrivateKeyByMnemonic: AptosChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: AptosChain.getAddressByPrivateKey,
    getPublicKey: AptosChain.getPublicKey,
    signTransaction: AptosChain.signTransaction,
    signMessage: AptosChain.signMessage,
    verifySignature: AptosChain.verifySignature,
    validateAddress: AptosChain.validateAddress
}

export const Tron = {
    createWallet: TronChain.createWallet,
    getPrivateKeyByMnemonic: TronChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: TronChain.getAddressByPrivateKey,
    getPublicKey: TronChain.getPublicKey,
    signTransaction: TronChain.signTransaction,
    signMessage: TronChain.signMessage,
    verifySignature: TronChain.verifySignature,
    validateAddress: TronChain.validateAddress
}

export const Near = {
    createWallet: NearChain.createWallet,
    getPrivateKeyByMnemonic: NearChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: NearChain.getAddressByPrivateKey,
    getPublicKey: NearChain.getPublicKey,
    signTransaction: NearChain.signTransaction,
    signMessage: NearChain.signMessage,
    verifySignature: NearChain.verifySignature,
    validateAddress: NearChain.validateAddress
}

export const Ton = {
    createWallet: TonChain.createWallet,
    getPrivateKeyByMnemonic: TonChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: TonChain.getAddressByPrivateKey,
    getRawAddress: TonChain.getRawAddress,
    getPublicKey: TonChain.getPublicKey,
    signTransaction: TonChain.signTransaction,
    signMessage: TonChain.signMessage,
    verifySignature: TonChain.verifySignature,
    validateAddress: TonChain.validateAddress
}

export const EVM = {
    createWallet: EVMChain.createWallet,
    getPrivateKeyByMnemonic: EVMChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: EVMChain.getAddressByPrivateKey,
    getPublicKey: EVMChain.getPublicKey,
    signTransaction: EVMChain.signTransaction,
    signMessage: EVMChain.signMessage,
    verifySignature: EVMChain.verifySignature,
    validateAddress: EVMChain.validateAddress,
    toChecksumAddress: EVMChain.toChecksumAddress,
    hashTypedData: EVMChain.hashTypedData,
    signTypedData: EVMChain.signTypedData,
    verifyTypedData: EVMChain.verifyTypedData,
    recoverPersonalSignature: EVMChain.recoverPersonalSignature,
    recoverTypedSignature: EVMChain.recoverTypedSignature,
    getUserOperationHash: EVMChain.getUserOperationHash,
    signUserOperation: EVMChain.signUserOperation,
    packUserOperation: EVMChain.packUserOperation,
    hashAuthorization: EVMChain.hashAuthorization,
    signAuthorization: EVMChain.signAuthorization
}

export const BTC = {
    createWallet: BTCChain.createWallet,
    getPrivateKeyByMnemonic: BTCChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: BTCChain.getAddressByPrivateKey,
    getPublicKey: BTCChain.getPublicKey,
    signTransaction: BTCChain.signTransaction,
    signMessage: BTCChain.signMessage,
    verifySignature: BTCChain.verifySignature,
    validateAddress: BTCChain.validateAddress,
    signSchnorr: BTCChain.signSchnorr,
    verifySchnorr: BTCChain.verifySchnorr
}

export const Solana = {
    createWallet: SolanaChain.createWallet,
    getPrivateKeyByMnemonic: SolanaChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: SolanaChain.getAddressByPrivateKey,
    getPublicKey: SolanaChain.getPublicKey,
    signTransaction: SolanaChain.signTransaction,
    signMessage: SolanaChain.signMessage,
    verifySignature: SolanaChain.verifySignature,
    verifyMessage: SolanaChain.verifyMessage,
    validateAddress: SolanaChain.validateAddress,
    serializeV0Message: SolanaChain.serializeV0Message,
    signVersionedTransaction: SolanaChain.signVersionedTransaction
}

export const Sui = {
    createWallet: SuiChain.createWallet,
    getPrivateKeyByMnemonic: SuiChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: SuiChain.getAddressByPrivateKey,
    encodeSuiPrivateKey: SuiChain.encodeSuiPrivateKey,
    decodeSuiPrivateKey: SuiChain.decodeSuiPrivateKey,
    getPublicKey: SuiChain.getPublicKey,
    signTransaction: SuiChain.signTransaction,
    signMessage: SuiChain.signMessage,
    verifySignature: SuiChain.verifySignature,
    validateAddress: SuiChain.validateAddress
}

export const Filecoin = {
    createWallet: FilecoinChain.createWallet,
    getPrivateKeyByMnemonic: FilecoinChain.getPrivateKeyByMnemonic,
    getAddressByPrivateKey: FilecoinChain.getAddressByPrivateKey,
    getPublicKey: FilecoinChain.getPublicKey,
    signTransaction: FilecoinChain.signTransaction,
    signMessage: FilecoinChain.signMessage,
    verifySignature: FilecoinChain.verifySignature,
    validateAddress: FilecoinChain.validateAddress
}

// Export types
export * from './types'

// Export constants
export * from './constans'

// Export errors
export * from './errors'