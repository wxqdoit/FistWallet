# FistWallet 生产级功能完备性演进清单 (Feature Checklist)

本项目对标 OKX Web3 钱包生产级能力，以下列出所有子包的功能清单。每实现并验证一项，将在清单中标记为 `[x]`。

---

## 1. wallet-core（底层密码学与多链签名引擎）

- [x] **EVM EIP-1559 (Type 2) 交易签名**：实现支持 \`maxFeePerGas\`, \`maxPriorityFeePerGas\`, \`accessList\` 的 EIP-2718 / RLP 编码与哈希签名
- [x] **EVM EIP-712 结构化数据签名 (Typed Data v4)**：实现 \`hashStruct\`, \`typeHash\`, 结构化数据签名与验签算法
- [x] **Solana Versioned Transaction (v0 Message) 支持**：支持 Address Lookup Tables (ALTs) 格式版本化消息序列化与 Ed25519 签名
- [x] **Bitcoin Taproot (P2TR / BIP-86) 与 Schnorr 签名**：支持 BIP-340 Schnorr 签名与 Taproot 地址验证
- [x] **各链自定义推导路径 (Custom HD Derivation Path)**：支持全链动态传入自定义推导路径

---

## 2. wallet-chain-interaction（统一多链 RPC 交互层）

- [x] **合约只读调用封装 (Contract Read Methods)**：实现通用的 \`callContract\` 及 ERC-20 \`balanceOf\`, \`decimals\`, \`symbol\`, \`allowance\`
- [x] **EIP-1559 动态 Gas 费率分级查询**：通过节点历史费率或基准算法，输出 Slow, Standard, Fast 三档费率与预估
- [x] **Solana SPL Token 批量余额拉取**：基于 \`getTokenAccountsByOwner\` 自动解析用户所有 SPL 代币与余额
- [x] **交易模拟预执行 (Transaction Simulation / Dry Run)**：广播前执行模拟校验，检测 Revert 错误原因与 Gas 消耗

---

## 3. wallet-apdater（多链钱包适配器与发现机制）

- [x] **WalletConnect v2 协议适配器**：新增 \`WalletConnectAdapter\`，支持 URI 扫码与移动端钱包 (OKX, Trust, MetaMask Mobile) 连接规范
- [x] **连接断开与网络事件双向通知规范化**：标准化各适配器底层网络切换与账户断开事件分发

---

## 4. wallet-kit（React dApp 连接组件库）

- [x] **网络切换提示与一键切链引导 (Switch Network Modal)**：dApp 所需 chainId 不匹配时弹出引导切换提示
- [x] **已连接账户卡片与快捷操作面板 (Connected Account Popover)**：展示地址、复制、区块浏览器跳转、断开连接
- [x] **多语言包扩充 (i18n)**：增加韩语 (ko), 日语 (ja), 繁体中文 (zh-TW) 语言包

---

## 5. wallet-extension（浏览器插件核心）

- [x] **DApp 交互确认独立通知弹窗 (Notification Approval Popup)**：外部调用签名/转账/连接时呼出独立审批窗口
- [x] **ERC-20 / SPL 代币管理与转账**：支持自定义代币添加、资产列表展示与代币转账构造
- [x] **Swap 闪兑路由报价与聚合兑换**：输入金额实时报价、滑点设置与兑换确认逻辑
- [x] **交易活动历史列表 (Activity / History)**：本地与链上交易历史记录与状态展示
- [x] **地址簿 (Address Book)**：常用联系人与地址别名管理
- [x] **多语言切换与法币计价汇率展示**：设置多语言即时生效与 USD/CNY 汇率换算

---

## 6. wallet-example（演示与联调 dApp）

- [x] **多链签名与交互演示面板**：增加 \`personal_sign\`、EIP-712 签名测试与发起测试转账控件
- [x] **多链网络切换演示**：增加链选择与适配器动态测试控件


---

## 7. 第二阶段：OKX 级全生态深度完备性清单 (Phase 2 Advanced Production Features)

### 7.1 wallet-core（底层密码学与助记词安全扩展）
- [x] **BIP-39 Passphrase (第 25 助记词密语盐) 支持**：全链支持可选 `passphrase` 盐值推导，实现与 OKX、Ledger 密语钱包完全兼容
- [x] **EVM 签名地址恢复 (`recoverPersonalSignature` & `recoverTypedSignature`)**：从 EIP-191 签名和 EIP-712 结构化数据签名中解析公钥并恢复出以太坊地址
- [x] **Solana 消息签名校验 (`verifyMessage`)**：支持 Ed25519 签名与 Base58 公钥的离线验签

### 7.2 wallet-chain-interaction（链上交互与 DeFi 协议扩展）
- [x] **ERC-20 标准编码器与解码器 (`encode/decode ERC20 Transfer & Approve`)**：提供无依赖的十六进制 ABI 编解码工具
- [x] **代币授权方法 (`approveToken` / `sendTokenApproval`)**：支持主流 DEX / 聚合路由交易前的前置 Token Allowance 授权广播
- [x] **完整交易收据与日志查询 (`getTransactionReceipt`)**：获取链上状态、Gas 消耗、区块确认数与合约事件日志
- [x] **多代币批量余额并发查询 (`getBatchBalances`)**：单次并发拉取多个 ERC-20 / SPL 代币余额

### 7.3 wallet-extension（高级钱包与账户安全管理）
- [x] **多账户推导与切换 (Account 1, 2, 3...)**：同一助记词下支持一键生成并管理多个派生账户
- [x] **私钥与助记词导出安全面板 (Export Private Key & Seed Phrase)**：输入密码后安全解密并展示当前链私钥与助记词，支持一键复制与风险提示
- [x] **自定义 EVM 网络与 RPC 添加 (Custom Network Management)**：支持用户手动添加自定义链 ID、RPC 节点、符号与区块浏览器
- [x] **EIP-712 结构化签名后台路由支持**：扩展 Background Service Worker，自动识别并调用 `signTypedData`

### 7.4 wallet-kit & wallet-example（dApp 接入层与联调工具）
- [x] **`useSwitchChain` 与 `useSignTypedData` 便捷 Hooks**：提供开箱即用的链切换与 EIP-712 签名 React Hooks
- [x] **EIP-712 验签与账户推导联调卡片**：在 `wallet-example` 中演示签名并实时恢复验证签名者地址

---

## 8. 第三阶段：生态极致性能与高阶扩展清单 (Phase 3 Enterprise Hardening)

### 8.1 打包体积与极致分包 (Chunk Splitting & Bundle Optimization)
- [x] **`wallet-extension` 极速分包**：基于 Vite manualChunks 将 React、Radix UI、Phosphor 图标、Crypto 与 TanStack Query 进行原子分包，将扩展主包从 805 kB 骤降至 201 kB，彻底消除 Vite chunk 尺寸超限告警。
- [x] **`wallet-example` 依赖分包**：为参考 dApp 增加原子 manualChunks 优化，构建产物体积缩减至 350 kB 且首屏加载速度大幅提升。

### 8.2 硬件钱包原生支持 (Hardware Wallet Integration)
- [x] **`wallet-apdater` Ledger 适配器**：新增 `LedgerAdapter`，原生探测 WebHID / WebUSB 支持并支持 EVM、Solana 与 Bitcoin 硬件派生。
- [x] **`wallet-extension` 硬件钱包连接面板**：新增 `/connect-hardware` 路由与配对界面，支持将 Ledger/Trezor 硬件钱包一键配对并纳管为独立 Hardware 账户。

### 8.3 账户抽象（AA - ERC-4337 & EIP-7702）端到端闭环
- [x] **`wallet-chain-interaction` Bundler & Paymaster 封装**：实现 `estimateUserOperationGas`、`sendUserOperation`、`getUserOperationReceipt` 与 `sponsorUserOperation`。
- [x] **`wallet-kit` 专用 Hook (`useAccountAbstraction`)**：为 Web3 前端开发者提供便捷的智能合约账户 UserOp 构建、代付与广播能力。
- [x] **`wallet-example` 账户抽象联调卡片**：提供可视化的 UserOperation 构建、Paymaster 赞助代付、Bundler 广播与 EIP-7702 授权签名演示。

### 8.4 浏览器插件弹窗首屏秒开与运行时韧性 (Extension Popup Initialization & Polyfills)
- [x] **Polyfill 独立前置注入**：提取 `polyfills.ts` 并在 `index.html` 顶层前置引入，注入 `globalThis.Buffer`、`globalThis.global` 与 `process.env`，彻底根除跨链 SDK 模块顶层执行时抛出 `ReferenceError: Buffer is not defined` 阻断 React 挂载的问题。
- [x] **多链 SDK 动态懒加载 (Lazy Dynamic Splitting)**：重构 `wallet-extension/src/services/rpc.ts`，将 6.6MB 的非 EVM 多链交互提供者移至按需 `await import('wallet-chain-interaction')`，将首屏主弹窗 Bundle 体积降至 187 kB，弹窗界面毫秒级秒开。
- [x] **状态初始化看门狗机制 (Watchdog Timeout)**：在 `fetchUnlockStatus` 与 `App.tsx` 中建立 2~2.5 秒看门狗保护机制，防止 Background 通信异常时前端一直停留在 `.boot-loader` 旋转动画。

### 8.5 品牌视觉 2.0 与高质感 SVG Logo 系统 (Brand Identity 2.0 & High-End SVG Vector System)
- [x] **赛博晶体铁拳与金库护盾徽章 (`fistwallet-icon.svg`)**：融合“铁拳（自持主权）、金库护盾、发光私钥晶核、多链骨节”四大意象，打造 3D 钛金切面与顶级多级渐变质感。
- [x] **全场景品牌矢量套件**：交付透明徽标 (`fistwallet-icon.svg`)、圆角应用大图标 (`fistwallet-app-icon.svg`)、暗黑横版字标 (`fistwallet-logo-full.svg`) 与白银模式横版标 (`fistwallet-logo-full-light.svg`)。
- [x] **跨尺寸超清像素适配**：生成浏览器插件 16px、48px、128px 高清防锯齿图标，在工具栏与扩展列表极清呈现。
- [x] **React 原生组件与应用集成**：封装 `<FistWalletLogo />`，并集成至扩展欢迎页 (`Welcome.tsx`)、解锁页 (`Unlock.tsx`) 及参考 dApp (`wallet-example`)。
- [x] **交互式品牌展示台 Artifact (`fistwallet-logo-showcase.html`)**：提供实时深色/霓虹/深蓝/浅色主题切换、跨尺寸渲染检测与 SVG 源码一键导出。

