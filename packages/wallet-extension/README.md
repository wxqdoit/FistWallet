# FistWallet Browser Extension

A production-grade multi-chain Web3 wallet browser extension supporting 9+ blockchain ecosystems with high-availability RPC fallback, EIP-1193/EIP-6963 DApp injection, and AES-256-GCM encrypted local storage.

## 🚀 Key Features

- 🔐 **Secure Cryptographic Vault**: AES-256-GCM encryption with PBKDF2 (100,000 rounds) key derivation.
- 🌐 **9+ Blockchain Networks**:
  - **EVM**: Ethereum, Polygon, BNB Smart Chain, Arbitrum One, Optimism, Base, Sepolia.
  - **Non-EVM**: Bitcoin (Native SegWit), Solana, Tron, Aptos, Sui, TON, NEAR, Filecoin.
- ⚡ **High-Availability RPC Failover**:
  - Multi-endpoint fallback architecture across major EVM networks.
  - Automatic retry and failover if primary RPC encounters rate limiting or downtime.
  - BigInt-precise balance calculation without decimal truncation.
- 🔑 **Robust Key & Account Management**:
  - Full support for 12/24-word BIP-39 mnemonic recovery phrases.
  - Flexible private key import with automatic \`0x\`/\`0X\` prefix normalization and format validation.
  - Multi-account derivation and fast switching.
- 🔌 **Web3 Provider Injection & DApp Standards**:
  - **EIP-1193** compatible \`window.ethereum\` provider with full \`EventEmitter\` support.
  - **EIP-6963** multi-injected provider discovery (\`io.fistwallet\`).
  - **Solana Standard** (\`window.solana\`, \`window.fistwallet.solana\`).
  - **UniSat / Bitcoin Standard** (\`window.unisat\`, \`window.fistwallet.bitcoin\`).
- 💸 **On-Chain Operations**:
  - Native token transfers with real-time balance queries and gas fee estimation.
  - QR Code generation for receiving crypto.

---

## 📦 Installation & Loading into Browsers

### 1. Build the Extension

From the root of the repository:

```bash
pnpm install
pnpm --filter wallet-extension build
```

This compiles TypeScript, bundles React popup, background service worker, and content scripts into `packages/wallet-extension/dist`.

### 2. Load into Chrome / Brave / Edge / Arc

1. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`).
2. Toggle on **Developer mode** in the top right corner.
3. Click the **Load unpacked** button.
4. Select the folder: `packages/wallet-extension/dist` (within this repo).
5. FistWallet is now installed! Pin it to your browser toolbar for quick access.

### 3. Reloading After Code Updates

When you make changes to the source code or rebuild via `pnpm build`:
- Return to `chrome://extensions/`.
- Click the **Reload (↻)** icon on the FistWallet extension tile.
- Open the extension popup; your latest changes will take effect immediately.

---

## 🛠️ Development & Testing

```bash
# Run unit tests
pnpm --filter wallet-extension test

# Watch mode for testing
pnpm --filter wallet-extension test:watch

# Type check
pnpm --filter wallet-extension type-check

# Start local dev server
pnpm --filter wallet-extension dev
```

---

## 📐 Architecture

- `src/background/`: Background service worker managing vault state, locking, and communication.
- `src/content/`: Content scripts for bridging page scripts to extension service worker.
- `src/content/injected.ts`: In-page injected Web3 providers (EIP-1193, EIP-6963, Solana, UniSat).
- `src/core/`:
  - `wallet.ts`: Multi-chain key derivation and signing orchestrated via \`wallet-core\`.
  - `storage.ts`: Encrypted Chrome local storage driver.
  - `networks.ts`: Network definitions and fallback RPC cluster configurations.
- `src/services/rpc.ts`: RPC query service with multi-node failover and balance formatting.
- `src/pages/`: React UI views (Dashboard, Send, Receive, Chains, Wallets, Settings, Onboarding).

---

## 📄 License

ISC
