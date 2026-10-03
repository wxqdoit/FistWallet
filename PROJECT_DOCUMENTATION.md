# FistWallet Technical Architecture & Engineering Documentation

This repository is a pnpm workspace monorepo hosting a modular, production-grade Web3 wallet ecosystem:
- **`wallet-core`**: Pure TypeScript multi-chain cryptographic engine and key derivation library.
- **`wallet-chain-interaction`**: Unified RPC interaction layer abstracting state, balances, simulation, and broadcasting across 9+ blockchains.
- **`wallet-apdater`**: EIP-6963 discovery layer and standardized adapter implementations for 13+ browser wallets.
- **`wallet-kit`**: Production React component and hook library for dApps connecting to multi-chain wallets.
- **`wallet-extension`**: End-user multi-chain Chromium extension wallet (Manifest V3) with AES-256 encrypted vault.
- **`wallet-example`**: Interactive testbed and reference dApp validating `wallet-kit` and multi-chain adapter connectivity.

---

## 1. Monorepo Structure & Dependency Topology

```
/
├─ packages/
│  ├─ wallet-core/                 (Zero internal dependencies, pure crypto library)
│  ├─ wallet-chain-interaction/    (RPC abstraction layer)
│  ├─ wallet-apdater/              (Adapter and wallet discovery standard layer)
│  ├─ wallet-kit/                  (Depends on wallet-apdater)
│  ├─ wallet-extension/            (Depends on wallet-core)
│  └─ wallet-example/              (Depends on wallet-kit)
├─ pnpm-workspace.yaml
├─ package.json
└─ pnpm-lock.yaml
```

---

## 2. Package Breakdown

### 2.1 `wallet-core`
- **Role**: Foundational cryptographic layer.
- **Supported Chains**: EVM, Bitcoin (Legacy, SegWit, Taproot), Solana, Aptos, Sui, Tron, TON, NEAR, Filecoin.
- **Standard Interface**:
  - `createWallet(params?)`
  - `getPrivateKeyByMnemonic(mnemonic, path)`
  - `getAddressByPrivateKey(privateKey, format?)`
  - `getPublicKey(privateKey)`
  - `signTransaction(privateKey, tx)`
  - `signMessage(privateKey, message)`
  - `verifySignature(message, signature, expectedAddress)`
  - `validateAddress(address)`
- **Cryptography Stack**: `@noble/curves`, `@noble/hashes`, `@scure/bip32`, `bip39`. Pure JS/TS implementation with zero native C++ bindings for deterministic cross-platform execution.
- **Private Key Resilience**: Universal tolerance for `0x`/`0X` prefixes, leading/trailing whitespace trimming, dual format support for Sui (`suiprivkey` Bech32 & 32-byte hex), and dual format for Solana (32-byte secret / 64-byte keypair in both Base58 and hex).
- **Advanced Capabilities**: EIP-1559 Type 2 transaction signing, EIP-712 Typed Data v4 hashing and signing, Solana Versioned Transactions (v0 Message) with Ed25519 signing, Bitcoin Taproot (P2TR / BIP-86) address derivation and BIP-340 Schnorr signatures, and dynamic custom HD derivation paths.
- **Testing**: 15 ESM Jest test suites (220 passing tests) covering key derivation, address encoding, prefix resilience, EIP-1559, EIP-712, Schnorr, and Solana v0 transactions across all 9 chains.

### 2.2 `wallet-chain-interaction`
- **Role**: Unified RPC interaction layer for 9+ chains.
- **Core Abstraction**: Abstract `ChainProvider` base class providing:
  - `getNativeBalance(address)` & `getTokenBalance(address, tokenAddress)`
  - `sendTransaction(privateKey, params)` & `sendTokenTransfer(privateKey, params)`
  - `estimateGas(params, from)` & `simulateTransaction(params, from)`
  - `getBlockNumber()` & `getChainInfo()` & `getNonce(address)`
  - `isValidAddress(address)`: Regular expression and checksum validators tailored per chain.
  - `formatBalance(raw, decimals)` & `parseBalance(formatted, decimals)`: Precision-safe balance manipulation.
- **Bitcoin Provider**: Supports broadcasting signed raw transactions via `broadcastTransaction(rawTxHex)` or passing `data` in `sendTransaction`.
- **Testing**: Jest suite validating provider instantiation across all 9 chains, balance parsing, address format validations, and transaction polling timeouts.

### 2.3 `wallet-apdater`
- **Role**: Normalizes interactions across disparate Web3 browser wallets.
- **Discovery**: EIP-6963 provider announcement and subscription via `mipd`.
- **Supported Wallets**: MetaMask, OKX, Phantom, Bitget, Pontem, Petra, Slush, Suiet, Martian, TronLink, Unisat, Braavos, Razor.
- **Architecture**:
  - `BaseAdapter`: Abstract handler with provider map, connection lifecycle, and event emitting.
  - `AdapterRegistry`: Dynamic registry providing `list()`, `refresh()`, and `subscribe()`.
  - Typed `AdapterError` with granular error codes (`WALLET_NOT_INSTALLED`, `UNSUPPORTED_CHAIN`, `USER_REJECTED`, etc.).
- **Testing**: Vitest suite covering default factory registrations, RDNS detection, event listeners, and chain routing.

### 2.4 `wallet-kit`
- **Role**: dApp integration UI component and hook suite.
- **Tech Stack**: React 18, Zustand with persisted local storage, Tailwind CSS, Radix UI Dialog, i18next.
- **Public API**:
  - Components: `<WalletKitProvider />`, `<ConnectButton />`.
  - Hooks: `useAccount()`, `useDisconnect()`, `useConnectedProvider()`, `useOpenConnectModal()`, `useCloseConnectModal()`.
- **Testing**: Vitest + JSDOM suite validating state transitions, theme/locale settings, modal toggles, and localStorage persistence.

### 2.5 `wallet-extension`
- **Role**: Multi-chain Chrome extension (Manifest V3).
- **Security & Storage**:
  - AES-256-GCM encryption with PBKDF2 (100,000 iterations, SHA-256).
  - Background Service Worker with auto-lock timer session management.
- **DApp Injected Bridge**:
  - Complete OKX/MetaMask/Phantom/UniSat standard providers: `window.ethereum` (EIP-1193 EventEmitter), `window.solana` (Phantom standard), `window.bitcoin` (UniSat standard), `window.fistwallet`.
  - EIP-6963 multi-injected provider discovery announcement (`io.fistwallet`).
  - Background router handles multi-chain `REQUEST_ACCOUNTS`, `SIGN_MESSAGE` (with personal_sign parameter decoding), `UNLOCK_WALLET`, and session status queries.
- **Testing**: Vitest suite with mocked browser extension runtime verifying storage encryption/decryption, PBKDF2 salt uniqueness, multi-chain derivation, and vault management.

### 2.6 `wallet-example`
- **Role**: Interactive playground demonstrating real-world usage of `wallet-kit`.
- **Features**: Multi-chain selector, mainnet/testnet switching, account status monitoring, personal_sign, EIP-712 typed data signing, quick test transfers, token addition, custom network config, and 1-click quick chain switcher presets.
- **Testing**: Vitest + React Testing Library render smoke tests.

---

## 3. Development Workflow & Commands

| Target | Command | Description |
| :--- | :--- | :--- |
| **All** | `pnpm build` | Builds all packages across the workspace |
| **All** | `pnpm test` | Runs the full test suite (303+ tests across all 6 packages) |
| **wallet-core** | `pnpm --filter wallet-core test` | Runs Jest crypto tests |
| **wallet-chain-interaction** | `pnpm --filter wallet-chain-interaction test` | Runs Jest RPC tests |
| **wallet-apdater** | `pnpm --filter wallet-apdater test` | Runs Vitest adapter tests |
| **wallet-kit** | `pnpm --filter wallet-kit test` | Runs Vitest kit tests |
| **wallet-extension** | `pnpm --filter wallet-extension test` | Runs Vitest extension tests |
| **wallet-example** | `pnpm --filter wallet-example test` | Runs Vitest example tests |
| **Dev Extension** | `pnpm --filter wallet-extension dev` | Starts Vite CRX development server |
| **Dev dApp** | `pnpm --filter wallet-example dev` | Starts Vite dApp development server |

---

## 4. Production Readiness Checklist

- [x] All 6 packages build cleanly without TypeScript errors.
- [x] All 303+ automated tests pass with 0 failures across all 6 packages.
- [x] Robust private key import with 0x prefix tolerance and deduplication.
- [x] EIP-1193, EIP-6963, Solana, and Bitcoin dApp provider injection.
- [x] ESM and CJS bundle exports configured with matching `.d.ts` declaration maps.
- [x] AES-256-GCM vault security with PBKDF2 key derivation (100,000 iterations).
- [x] Multi-chain derivation paths implemented and verified across 9 distinct blockchain architectures.
- [x] EIP-6963 provider discovery and multi-chain adapter registry with typed errors.
- [x] Complete documentation: root README, per-package READMEs, and technical documentation.


---

## 8. RPC 高可用性与余额实时同步方案 (RPC High Availability & Resilient Balance Sync)

### 8.1 根本原因排查与修复 (Root Cause Analysis)
- **Polygon 公共 RPC 禁用问题**：官方及早期公用端点 `https://polygon-rpc.com` 已关闭免密访问，直接返回 HTTP 401 `{"error":"message: API key disabled, reason: tenant disabled"}`，导致请求静默失败。
- **Ethereum / Sepolia 端点拦截**：原配置的部分端点受 Cloudflare 拦截或已下线。
- **多节点自动容灾机制 (Multi-RPC Fallback)**：
  - 在 `Network` 接口中引入 `fallbackRpcUrls?: string[]` 配置。
  - 为 Polygon (137) 预置了 `https://polygon-bor-rpc.publicnode.com`、`https://polygon.drpc.org`、`https://polygon.gateway.tenderly.co`。
  - 为 Ethereum (1) 预置了 `https://ethereum-rpc.publicnode.com`、`https://eth.drpc.org`、`https://1rpc.io/eth`。
  - 为 Sepolia, BSC, Arbitrum, Optimism, Base 等主要链均配置了主备双线或三线节点。
  - 在 `fetchNativeBalance`、`estimateFee` 与 `sendNativeTransfer` 内部实现了自动轮询重试逻辑，确保任意主节点宕机或限流时平滑切换。
- **高精度余额格式化 (Precision Balance Formatting)**：
  - 提取 `formatUnits` 通用方法，支持 BigInt 大整数精确运算，杜绝浮点数截断问题。
  - 支持微额代币展示，避免微量资产被归零。
