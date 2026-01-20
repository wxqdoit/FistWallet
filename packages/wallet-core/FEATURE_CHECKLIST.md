# Wallet Core Feature Checklist

Analysis of `packages/wallet-core` capabilities and verification status.

## Core Capabilities

| Feature | Status | Implementation Details |
|---------|:------:|------------------------|
| **Mnemonic Generation** | ✅ | BIP39 (12/24 words) |
| **Seed Derivation** | ✅ | BIP39 `mnemonicToSeed` |
| **HD Wallets** | ✅ | BIP32 / BIP44 Standard |
| **Security** | ✅ | Uses `@noble/*` (audited crypto primitives) |
| **Type Safety** | ✅ | 100% TypeScript |
| **Testing** | ✅ | Jest Unit Tests & Integration Tests (Testnet) |

## Blockchain Support Matrix

Reflecting capabilities found in `src/chains/*` and verified in `src/test/signing.test.ts`.

| Chain | Address Gen | Tx Signing | Msg Signing | Verify Sig | Address Valid. | Notes |
|-------|:-----------:|:----------:|:-----------:|:----------:|:--------------:|-------|
| **EVM** | ✅ | ✅ | ✅ | ✅ | ✅ | Supports Legacy & EIP-1559 (Type 2) |
| **Bitcoin** | ✅ | ✅ | ✅ | ✅ | ✅ | Verified P2PKH; Uses `bitcoinjs-lib` |
| **Solana** | ✅ | ✅ | ✅ | ✅ | ✅ | Ed25519; Base58 encoded keys |
| **Aptos** | ✅ | ✅ | ✅ | ✅ | ✅ | Ed25519; SHA3-256 addresses |
| **Sui** | ✅ | ✅ | ✅ | ✅ | ✅ | Ed25519; Blake2b addresses; Bech32 key format support |
| **TRON** | ✅ | ✅ | ✅ | ✅ | ✅ | Secp256k1; Base58Check addresses |
| **TON** | ✅ | ✅ | ✅ | ✅ | ✅ | Ed25519; Bounceable addresses; Raw address support |
| **NEAR** | ✅ | ✅ | ✅ | ✅ | ✅ | Ed25519; Named account validation support |
| **Filecoin** | ✅ | ✅ | ✅ | ✅ | ✅ | Ed25519; Supports ID (f0) & Testnet (t0) addresses |

## Detailed Feature Trace

### Common Interface (`ChainAPI`)
All chains implement the standard interface:
- `createWallet`: Generates mnemonic -> private key -> address
- `getPrivateKeyByMnemonic`: HD derivation
- `getAddressByPrivateKey`: Public key derivation -> hashing/encoding
- `signTransaction`: Chain-specific serialization & signing
- `signMessage`: Standardized message signing (e.g. EIP-191 for EVM)
- `verifySignature`: Pubkey recovery or direct verification
- `validateAddress`: Format & checksum validation
- `getPublicKey`: derivation from private key

### Chain-Specific Utilities

- **EVM**
  - `toChecksumAddress`: EIP-55 implementation
  - EIP-1559 Transaction Support (`type: 2`)

- **Sui**
  - `encodeSuiPrivateKey` / `decodeSuiPrivateKey`: Buffer <-> Bech32 helpers

- **TON**
  - `getRawAddress`: Conversion to raw hex format

- **Bitcoin**
  - `addressType` support in creation (e.g. `p2pkh`)

## Verification Status

- **Unit Tests**: `src/test/signing.test.ts` covers all chains for:
    - Transaction signing matches regex/format
    - Message signing & verification roundtrip
    - Address validation (valid/invalid cases)
    - Public key derivation
- **Integration Tests**: `src/test/integration.test.ts` exists (skipped by default) for on-chain verification.
