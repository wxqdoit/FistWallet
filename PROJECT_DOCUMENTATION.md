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

---

## 9. 极致分包、硬件钱包与账户抽象落地 (Phase 3 Enterprise Production Features)

### 9.1 打包体积与极致分包 (Chunk Splitting & Bundle Optimization)
- **问题与挑战**：此前 `wallet-extension` 的 `popup.js` 达 805 kB，`wallet-example` 的主 bundle 达 582 kB，均触发 Vite `chunkSizeWarningLimit` 告警。
- **分包落地方案**：
  - 在 `wallet-extension/vite.config.ts` 中针对 `node_modules` 进行精细化正则分流：
    - `vendor-icons`（@phosphor-icons）
    - `vendor-ui`（@radix-ui, framer-motion, sonner）
    - `vendor-query`（@tanstack/react-query）
    - `vendor-react-dom` 与 `vendor-react`
    - `vendor-crypto`（@noble, @scure, bip39）
  - 产物效果：`popup.js` 从 805 kB 骤降至 208 kB，所有 chunk 单个均 < 270 kB，彻底消除警告，插件秒开性能显著提升。
  - 在 `wallet-example/vite.config.ts` 中同步实现 `vendor-icons`、`vendor-react-dom`、`vendor-radix` 分包，主包体积减少 40%。

### 9.2 硬件钱包 (Ledger / WebHID / WebUSB) 原生集成
- **`wallet-apdater` 协议接入**：
  - 抽象并导出 `LedgerAdapter` 与 `isHardwareWalletSupported()`。
  - 自动检测浏览器环境对 WebHID / WebUSB 标准接口的支持性。
  - 兼容 EVM、Solana 与 Bitcoin 硬件派生路径。
- **`wallet-extension` 插件硬件纳管**：
  - 扩展底层钱包类型，原生支持 `type: 'hardware'`。
  - 新增 `ConnectHardware.tsx` 独立连接与配对引导流程，支持设备过滤选择、派生地址实时预览与硬件钱包纳管。

### 9.3 账户抽象（AA - ERC-4337 & EIP-7702）端到端闭环
- **RPC 节点与 Bundler 互通 (`wallet-chain-interaction`)**：
  - 封装 `estimateUserOperationGas`、`sendUserOperation`、`getUserOperationReceipt` 与 `sponsorUserOperation`。
  - 支持无私钥 Paymaster Gas 代付与模拟。
- **React dApp 套件 (`wallet-kit`)**：
  - 导出开箱即用的 [`useAccountAbstraction`](file:///Users/wxqdoit/Documents/dev/FistWallet/packages/wallet-kit/src/hooks/useAccountAbstraction.ts) Hook。
- **参考 dApp 交互实机演示 (`wallet-example`)**：
  - 新增 "Account Abstraction (ERC-4337 & EIP-7702)" 实操卡片，支持 1-Click 构建 UserOp、Paymaster 赞助、Bundler 广播与 EIP-7702 签名。

### 9.4 浏览器插件弹窗首屏加载与运行时韧性 (Extension Popup Initialization & Polyfills)
- **原因剖析**：
  - 原先 `wallet-extension` 静态全量引入 `wallet-chain-interaction`（含 Solana、Tron、Sui、Aptos、Near 等全部跨链重型 SDK，达 6.6MB）。
  - 各链 SDK 模块在文件顶层执行时直接读取了 Node 全局变量 `Buffer`，而此时 React 挂载代码尚未执行 `globalThis.Buffer = Buffer`，抛出未捕获的 `ReferenceError: Buffer is not defined`，导致 HTML 的首屏 `.boot-loader` 旋转动画无法被 React 组件替换，造成无限转圈。
- **治理与优化措施**：
  1. **独立 Polyfills 前置载入**：抽离 [`polyfills.ts`](file:///Users/wxqdoit/Documents/dev/FistWallet/packages/wallet-extension/src/popup/polyfills.ts)，在 `index.html` 顶层以 module script 前置加载，并在 Vite 构建配置中注入 `define: { global: 'globalThis', 'process.env': {} }`，确保任何依赖在 ESM evaluation 阶段即可安全访问 `Buffer` 与 `global`。
  2. **多链 SDK 异步动态加载 (Lazy Dynamic Splitting)**：重构 `wallet-extension/src/services/rpc.ts`，首屏只保留原生轻量 EVM 实现与原生文本编码解码，将 6.6MB 的 `wallet-chain-interaction` 重型链 SDK 改为按需 `await import()`，首屏主弹窗 Bundle 降至 187 kB，实现毫秒级首屏加载。
  3. **状态初始化看门狗机制 (Watchdog Timeout)**：在 `fetchUnlockStatus` 与 `App.tsx` 中增加超时保护和 fallback 兜底，防止 Background 通信异常时前端挂起。

### 9.5 品牌视觉 2.0 与高质感 SVG Logo 系统 (Brand Identity 2.0 & High-End SVG Vector System)
- **品牌设计概念 (Brand Semiotics)**：
  - **赛博铁拳 (The Clenched Fist)**：紧握的机械晶体铁拳，贯彻“Not your keys, not your coins”密码朋克核心信条，坚决捍卫去中心化资产自持主权。
  - **金库盾形 (Vault Metacarpal Shield)**：手背化为立体几何盾牌，抵御一切网络攻击、钓鱼合约与链上漏洞。
  - **神圣晶核 (Cryptographic Core Gem)**：拳心中央镶嵌发光八面体钻石与电路树，象征受 MPC / 硬件加密保护的数字黄金资产。
  - **多链骨节 (Multi-Chain Knuckles)**：四指分别代表 EVM、Solana、Bitcoin 与 Move 生态，顶部 45° 钛金高光倒角呈现顶级质感。
- **交付资产矩阵**：
  - **透明矢量徽章 (`fistwallet-icon.svg`)**：纯矢量无背景，适合暗色 UI、水印、周边印刷。
  - **应用圆角图标 (`fistwallet-app-icon.svg`)**：黑曜石圆角卡片、边缘流光渐变与径向光晕。
  - **横版全标 (`fistwallet-logo-full.svg` / `fistwallet-logo-full-light.svg`)**：徽章 + 专有字标 + 品牌 Tagline（分别适配暗色与浅色背景）。
  - **插件位图图标 (`icon16.png`, `icon48.png`, `icon128.png`)**：通过高保真下采样与边缘锐化，在 Chrome 扩展栏极清呈现。
- **React 组件与实装落地**：
  - 封装 [`FistWalletLogo.tsx`](file:///Users/wxqdoit/Documents/dev/FistWallet/packages/wallet-extension/src/components/FistWalletLogo.tsx)，支持自定义尺寸、徽标变体与辉光效果。
  - 在扩展欢迎页 ([`Welcome.tsx`](file:///Users/wxqdoit/Documents/dev/FistWallet/packages/wallet-extension/src/pages/Onboarding/Welcome.tsx))、解锁页 ([`Unlock.tsx`](file:///Users/wxqdoit/Documents/dev/FistWallet/packages/wallet-extension/src/pages/Unlock.tsx)) 以及参考 dApp ([`wallet-example`](file:///Users/wxqdoit/Documents/dev/FistWallet/packages/wallet-example/src/App.tsx)) 中全面替换并实装新品牌 Logo。
- **交互式展示台 Artifact**：
  - 创建 [`fistwallet-logo-showcase.html`](file:///Users/wxqdoit/.gemini/antigravity/brain/cdc6566e-3cce-4ca7-a1c4-fdadf959cc9b/fistwallet-logo-showcase.html)，支持深色/霓虹/深蓝/浅色实时主题切换、多分辨率渲染检视与一键复制 SVG 源码。

