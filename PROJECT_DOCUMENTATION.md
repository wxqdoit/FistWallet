# FistWallet Project Documentation

This repository is a pnpm workspace monorepo that hosts multiple packages for a multi-chain wallet ecosystem:
- A cryptographic wallet core library
- A chain RPC interaction layer
- A React wallet connection kit for dApps
- A browser extension product

The packages are designed as layered building blocks. The extension consumes the core library directly; the chain RPC layer and the wallet kit are standalone packages that can be used by external apps or future internal integrations.

---

## 1) Monorepo Layout

```
/
├─ packages/
│  ├─ wallet-core/
│  ├─ wallet-chain-interaction/
│  ├─ wallet-kit/
│  └─ wallet-extension/
├─ pnpm-workspace.yaml
└─ pnpm-lock.yaml
```

### Dependency relationships (current state)
- wallet-extension -> wallet-core (workspace dependency)
- wallet-chain-interaction -> independent (not currently used by other packages)
- wallet-kit -> independent (not currently used by other packages)

---

## 2) Package: wallet-core

### Purpose
A TypeScript-based multi-chain wallet core library. It handles mnemonic generation, HD key derivation, address generation, signing, and verification across multiple blockchains.

### Supported chains
- EVM (Ethereum and EVM-compatible networks)
- Bitcoin
- Solana
- Aptos
- Sui
- Tron
- TON
- NEAR
- Filecoin

### High-level API shape
Each chain module exposes a consistent interface:
- createWallet(params?)
- getPrivateKeyByMnemonic(mnemonic, path)
- getAddressByPrivateKey(privateKey)
- signTransaction(privateKey, tx)
- signMessage(privateKey, message)
- verifySignature(message, signature, expectedAddress)
- validateAddress(address)
- getPublicKey(privateKey)

Chain-specific extras:
- EVM: toChecksumAddress (EIP-55)
- Sui: encodeSuiPrivateKey / decodeSuiPrivateKey
- TON: getRawAddress

### Key implementation details
- BIP39 mnemonic generation and validation (bip39)
- BIP32 HD derivation (@scure/bip32)
- Cryptography via @noble/* primitives (curves + hashes)
- EVM specifics:
  - secp256k1 keys
  - keccak-256 address derivation
  - RLP-encoded signing for legacy and EIP-1559 (type 2) transactions
  - EIP-191 personal_sign message hashing
- Bitcoin uses bitcoinjs-lib and supports multiple address types (p2pkh, p2sh, p2wpkh, p2tr)
- Ed25519 chains (Solana, Aptos, Sui, TON, NEAR, Filecoin) handle chain-specific address formats and hashing

### Types and transaction models
- Shared wallet fields: mnemonic, privateKey, publicKey (optional), address
- Transaction interfaces per chain (EVM, Bitcoin, Solana, Aptos, Sui, Tron, Near, Filecoin)
- Explicit address-type support for Bitcoin and Filecoin in createWallet

### Error handling
A dedicated error hierarchy provides typed errors for invalid mnemonics, invalid private keys, derivation failures, address generation failures, and parameter validation.

### Tests
- Jest unit tests for each chain
- Integration tests (testnet) guarded by an env flag
- Feature checklist in FEATURE_CHECKLIST.md documents coverage and functionality

### Build and publish
- TypeScript compiler output into dist/
- prepublishOnly runs clean + build + tests

---

## 3) Package: wallet-chain-interaction

### Purpose
A unified RPC interaction layer that abstracts reading chain state, fetching balances, and sending transactions across 9+ chains.

### Architecture
- ChainProvider base class defines the interface for all chains
- Typed data structures for balances, transactions, chain info, account info, and errors
- createProvider factory instantiates the right provider for a given chain type

### Supported chains and implementations
- EVM: viem (public client + wallet client)
- Solana: @solana/web3.js
- Tron: tronweb
- TON: @ton/ton
- Aptos: @aptos-labs/ts-sdk
- Sui: @mysten/sui
- NEAR: near-api-js
- Bitcoin: JSON-RPC / Electrum-style calls (requires an indexer for address-based queries)
- Filecoin: Lotus JSON-RPC

### Core capabilities
- Native balance and token balance fetch
- Transaction sending and token transfers (chain-specific)
- Transaction simulation and gas/fee estimation
- Block and chain metadata
- Account info and nonce
- Address validation

### Notable limitations
- Bitcoin sendTransaction is not implemented; it expects the caller to build and sign a raw transaction (wallet-core can sign)
- Bitcoin tokens are not supported (BRC-20/Ordinals would require specialized indexers)

### Testing
- Simple test script in src/__tests__/test.ts (runs via tsx)

---

## 4) Package: wallet-kit

### Purpose
A React-based wallet connection kit for dApps. It offers a connect modal and a unified strategy pattern to connect to different wallets across chains.

### Technology stack
- React 18, TypeScript
- State: Zustand (persistent store)
- Styling: Tailwind CSS
- I18n: i18next + react-i18next
- Wallet discovery: mipd (EIP-6963) via wallet-apdater
- Build tool: Vite (library mode) + TypeScript declarations

### Architecture and flow
- Adapter discovery and wallet-specific logic are provided by `wallet-apdater`
- `wallet-kit` subscribes to the adapter registry and exposes UI + state for connect flows
- Chain lists and UI icons live in `wallet-kit` (adapter layer is UI-agnostic)

### State model
- Persisted store (WALLET_KIT_APP in localStorage)
- Tracks selected chain, modal state, language, theme, and current account

### Public API
- Components: WalletKitProvider, ConnectButton, Modal
- Hooks: useAccount, useDisconnect, useConnectedProvider
- Utilities: useOpenConnectModal / useCloseConnectModal

### Notes / gaps
- No tests currently exist in the repo
- README flags a potentially unused dependency (lit)

---

## 5) Package: wallet-extension

### Purpose
A browser extension (Manifest V3) multi-chain wallet app for end users.

### Technology stack
- React + Vite + @crxjs/vite-plugin
- Tailwind CSS, Radix UI, framer-motion
- Zustand for state management
- webextension-polyfill for browser APIs
- wallet-core for cryptographic operations

### Extension architecture
- Popup UI: React app (index.html entry)
- Background: MV3 service worker handles session lock state and message routing
- Content script: bridges page context to extension
- Injected script: exposes window.ethereum / window.solana / window.bitcoin providers
- Side panel support (Chrome side panel API)

### Core modules
- src/core/wallet.ts
  - Orchestrates wallet-core operations
  - Derives per-chain addresses from mnemonic
  - Supports create/import from mnemonic or private key
  - Provides signTransaction and signMessage
- src/core/storage.ts
  - AES-256-GCM encrypted vault
  - PBKDF2 (100,000 iterations) key derivation
  - Uses browser.storage.local
  - Auto-lock timer and session helpers
- src/core/networks.ts
  - Predefined networks and RPC endpoints
  - Derivation paths per chain

### Security model
- Private keys and mnemonics never stored in plaintext
- Password-derived key encrypts vault (AES-256-GCM)
- Auto-lock handled by background session + timer
- Background only grants unlock status to extension pages

### DApp integration
- Injected Ethereum provider supports a limited subset of methods
- Solana and Bitcoin providers are stubs (not implemented)
- Content script forwards messages to background
- Background currently includes placeholders for SEND_TRANSACTION and SIGN_MESSAGE

### UI flows (implemented at UI level)
- Onboarding: Welcome -> Create Password -> Backup/Verify Mnemonic
- Import: mnemonic or private key import
- Unlock screen and auto-lock
- Dashboard: account summary + chain switch + assets placeholder
- Send / Receive / Swap pages (UI only, no real RPC yet)
- Settings: language, theme, auto-lock minutes, password change
- Wallet management: list wallets, add/import, export mnemonic/private key

### Manifest highlights
- MV3 service worker background
- Content scripts on all URLs
- Permissions include storage, activeTab, notifications, sidePanel

---

## 6) Cross-Package Integration Notes

- wallet-extension uses wallet-core for all cryptographic operations
- wallet-chain-interaction could be integrated into wallet-extension for live RPC data
- wallet-kit could be used in a future web app or as a modular connection layer

---

## 7) Development and Build

### Workspace setup
```
pnpm install
```

### wallet-core
```
cd packages/wallet-core
pnpm test
pnpm build
```

### wallet-chain-interaction
```
cd packages/wallet-chain-interaction
pnpm build
```

### wallet-kit
```
cd packages/wallet-kit
pnpm build
```

### wallet-extension
```
cd packages/wallet-extension
pnpm dev
pnpm build
```

### Loading the extension
- Build via pnpm build in wallet-extension
- Load dist/ as unpacked extension in Chrome or Edge

---

## 8) Known Gaps and Next Integration Opportunities

- wallet-extension does not yet wire chain RPCs for balances, token lists, or swap quotes
- wallet-extension DApp providers are partially implemented (only basic EVM request routing)
- wallet-chain-interaction Bitcoin sendTransaction is a placeholder (requires UTXO building + signing)
- wallet-kit lacks automated tests

---

## 9) Reference Files

- wallet-core README.md and FEATURE_CHECKLIST.md
- wallet-chain-interaction readme.md
- wallet-extension README.md and PRD-v3.md
- wallet-kit README.md
