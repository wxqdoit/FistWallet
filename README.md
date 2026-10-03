# FistWallet

> A production-ready, modular multi-chain Web3 wallet ecosystem built as a pnpm workspace monorepo.

FistWallet covers the full spectrum of Web3 wallet engineering: from low-level cryptography, hierarchical deterministic (HD) key derivation, and multi-chain RPC interactions, to standard browser wallet adapters (EIP-6963), reusable React dApp connection components (`wallet-kit`), and an end-user Chromium browser extension (Manifest V3).

---

## 🏗 Architecture & Workspace Layout

```
                               ┌─────────────────────────┐
                               │     wallet-example      │  (Interactive Demo dApp)
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │       wallet-kit        │  (React Multi-chain Modal & Hooks)
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │     wallet-apdater      │  (EIP-6963 & Multi-chain Adapters)
                               └─────────────────────────┘

┌─────────────────────────┐                                 ┌─────────────────────────┐
│    wallet-extension     │                                 │wallet-chain-interaction │
│ (Chrome MV3 Extension)  │                                 │ (Unified Multi-chain RPC)│
└────────────┬────────────┘                                 └─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│       wallet-core       │  (BIP39/BIP32/Noble Crypto, 9+ Blockchains Signing Engine)
└─────────────────────────┘
```

### Packages Matrix

| Package | Version | Description | Test Suite |
| :--- | :--- | :--- | :--- |
| [`wallet-core`](./packages/wallet-core) | `1.0.0` | Cryptographic engine: BIP39/BIP32, SECP256k1 & Ed25519 signing for 9+ chains | Jest (ESM) |
| [`wallet-chain-interaction`](./packages/wallet-chain-interaction) | `1.0.0` | Unified RPC interaction layer for balances, gas estimation, simulation & broadcast | Jest (ESM) |
| [`wallet-apdater`](./packages/wallet-apdater) | `0.0.1` | EIP-6963 standard discovery and FistWallet native adapter and 13+ third-party wallet integrations | Vitest |
| [`wallet-kit`](./packages/wallet-kit) | `0.0.1` | Ready-to-use React UI component library & hooks for dApps connecting to multi-chain wallets | Vitest (JSDOM) |
| [`wallet-extension`](./packages/wallet-extension) | `1.0.0` | Chrome Manifest V3 multi-chain wallet extension with AES-256 encrypted vault | Vitest |
| [`wallet-example`](./packages/wallet-example) | `0.0.1` | Showcase dApp demonstrating end-to-end integration of `wallet-kit` and `wallet-apdater` | Vitest (JSDOM) |

---

## 🌐 Supported Blockchains

FistWallet provides end-to-end support for 9+ major blockchain ecosystems:

- **EVM Ecosystem**: Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Base, Avalanche, and all EVM-compatible networks.
- **Bitcoin (BTC)**: P2PKH (Legacy), P2SH, P2WPKH (Native SegWit), and P2TR (Taproot).
- **Solana (SOL)**: Ed25519 key derivation, SPL Token balance/transfer, and Transaction signing.
- **Tron (TRX)**: Base58 address derivation, TRC-20 balance/transfer, and TronWeb integration.
- **Aptos**: Move VM SDK, Ed25519 derivation, payload signing, and simulation.
- **Sui**: Sui Move SDK, Bech32 `suiprivkey` key formats, and programmable transaction blocks.
- **TON**: Raw & Friendly user-friendly address formats, Bag-of-Cells message serialization.
- **NEAR Protocol**: Implicit and named accounts, NEP-141 token standard.
- **Filecoin**: SECP256K1 (`f1`/`t1`), Actor (`f2`), BLS (`f3`), and ID (`f0`) address families.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >= 18.0.0 (Node 20+ or 22+ recommended)
- **pnpm**: >= 9.0.0

### Installation
```bash
git clone https://github.com/username/FistWallet.git
cd FistWallet

# Install all workspace dependencies
pnpm install
```

### Build Everything
```bash
# Builds all packages across the workspace
pnpm build
```

### Run All Tests
```bash
# Executes 269+ automated tests across all 6 packages across all packages
pnpm test
```

### Individual Package Commands
```bash
# Test individual modules
pnpm test:core          # wallet-core
pnpm test:interaction   # wallet-chain-interaction
pnpm test:adapter       # wallet-apdater
pnpm test:kit           # wallet-kit
pnpm test:extension     # wallet-extension
pnpm test:example       # wallet-example

# Run demo dApp locally
pnpm --filter wallet-example dev

# Run Chrome extension in development mode
pnpm --filter wallet-extension dev
```

---


---

## 🧩 浏览器插件安装指引 (Chrome Extension Installation)

FistWallet 浏览器插件已完成构建并达到生产级标准，安装步骤如下：

### 快速安装方法 (macOS)
1. **生成构建产物**（已构建完成）：
   ```bash
   pnpm --filter wallet-extension build
   ```
   构建产物位于：`packages/wallet-extension/dist`

2. **在浏览器中加载**：
   - 打开 **Google Chrome** 或 Chromium 内核浏览器（Brave、Edge、Arc 等）。
   - 在地址栏输入并回车：`chrome://extensions/`
   - 打开右上角的 **“开发者模式” (Developer mode)** 开关。
   - 点击左上角的 **“加载已解压的扩展程序” (Load unpacked)** 按钮。
   - 在弹出的文件选择器中，选择本项目的目录：
     `<项目绝对路径>/packages/wallet-extension/dist`
   - 安装完成后，在浏览器扩展列表和工具栏中即可点击锁定/打开 **FistWallet** 插件！

---

## 🔒 Security Architecture

1. **Vault Encryption**:
   - Master vault data is encrypted using **AES-256-GCM**.
   - Encryption keys are derived via **PBKDF2-HMAC-SHA256** with **100,000 iterations** and cryptographically secure random 16-byte salts.
   - Plaintext private keys and mnemonics are strictly transient in memory and are never written to unencrypted persistent storage.

2. **Session Security & Auto-Lock**:
   - The MV3 background worker enforces configurable auto-lock timers (default: 15 minutes).
   - In-memory session credentials automatically expire upon inactivity or window close.

3. **EIP-6963 Standard**:
   - Eliminates `window.ethereum` race conditions and extension collision attacks by using standard two-way event discovery (`eip6963:announceProvider` / `eip6963:requestProvider`).

---

## 📄 License

MIT
