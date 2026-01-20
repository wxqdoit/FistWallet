# FistWallet 商业级全流程产品需求文档 (PRD) V3.0

> **版本 (Version)**: 3.0 (Detailed Commercial Edition)
> **状态 (Status)**: Final Draft
> **适用范围**: Wallet Extension (Browser Plugin)
> **参考基准**: MetaMask, Phantom, OKX Wallet, Rabby
> **核心目标**: 打造全场景、全链通用、商业化闭环的 Web3 超级入口。

---

## 1. 产品概述与战略定位

### 1.1 产品定义
FistWallet 是一个**基于异构多链架构的非托管加密钱包**。它打破了 EVM 钱包的局限性，原生支持 Bitcoin、Solana、Move 系（Aptos/Sui）及 TON/TRON 等高性能公链，为用户提供统一的资产管理、交易和 DApp 交互体验。

### 1.2 商业模式 (Monetization Strategy)
1.  **Swap 聚合手续费**: 在聚合最优报价的基础上，通过智能合约或路由层加收 **0.3% - 0.8%** 的手续费（动态调整）。
2.  **跨链桥 (Bridge) 返佣**: 整合 LayerZero, Stargate, Orbiter 等底层，赚取 B 端返佣。
3.  **法币出入金 (Fiat On/Off Rampp)**: 集成 MoonPay/Banxa，赚取流量分层。
4.  **推荐返佣 (Referral)**: 邀请用户赚取积分（Points），未来转化为 Token 空投预期。

---

## 2. 全链支持矩阵 (Chain & Feature Matrix)

基于 `wallet-core` 能力，本版本 **必须** 支持以下 9 大链系。所有交互流程必须适配各链特性。

| 链系 (Chain Family) | 支持网络 (Networks) | 地址格式 | 交易特性 | 关键差异化需求 |
| :--- | :--- | :--- | :--- | :--- |
| **EVM** | ETH, BSC, Polygon, Arb, Op, Base | 0x... (Hex) | EIP-1559, Typed Data | 自动切换网络，多路 RPC 竞速 |
| **Bitcoin** | Mainnet, Testnet | P2PKH(1..), Segwit(bc1q..), Taproot(bc1p..) | UTXO 模型, Fee Rate (sat/vB) | **防烧毁机制** (保护铭文/符文) |
| **Solana** | Mainnet, Devnet | Base58 | Versioned Tx, Priority Fee | 极速确认，代币账户租金管理 |
| **Move** | Aptos, Sui | 0x... (Hex) | Resource 模型 | Coin 注册 (Aptos), Object 管理 (Sui) |
| **TRON** | Mainnet | T... (Base58) | Bandwidth/Energy | 能量租赁提示 (降低 USDT 成本) |
| **TON** | Mainnet | EQ... (Base64) | Memo/Tag 必须 | 极其依赖 Memo 转账到 CEX |
| **NEAR** | Mainnet | .near (Named) / Hex | Access Keys | 隐式账户 vs 命名账户 |
| **Filecoin**| Mainnet | f1/f3/f4 (ID/BLS) | Actor 模型 | 存储交易识别 |

---

## 3. 全场景详细流程设计 (Detailed User Flows)

### 3.1 用户引导与账户初始化 (User Onboarding)

#### 场景 A: 新用户创建 (Create Wallet)
1.  **启动**: 点击 "Create New Wallet"。
2.  **隐私协议**: 可选 "Help Improve FistWallet" (无隐私数据上传)。
3.  **密码设置**: 设置本地解锁密码 (AES-256 加密存本地)。
    *   *交互*: 强度检测条（弱/中/强）。支持 FaceID/TouchID (如设备支持)。
4.  **助记词生成 (核心)**:
    *   生成 12 或 24 位助记词 (BIP-39)。
    *   **UI 强制**: 模糊遮罩，点击 "Reveal" 显示。禁止截图（检测到截图行为弹出系统警告）。
5.  **助记词验证**:
    *   *严谨模式*: 填空验证第 3, 7, 12 个单词。
6.  **多链地址派生**: 
    *   后台静默生成所有支持链的 Account 1 地址。
    *   *成功反馈*: "All Wallets Ready" 撒花动效。

#### 场景 B: 导入钱包 (Import)
1.  **助记词导入**: 支持 12/15/18/21/24 词。
    *   *自动探测*: 输入无效单词时实时红框报错。
2.  **私钥/JSON 导入**: 
    *   识别格式 (Hex/WIF/Base58) 自动判断链类型。
3.  **硬件钱包连接 (Ledger/Trezor)**:
    *   通过 WebHID 协议直连，不暴露私钥。
    *   支持选择派生路径 (Legacy/BIP44/BIP84)。

---

### 3.2 资产看板与管理 (Dashboard & Assets)

此页面是高频入口，需极度流畅。

#### 布局设计
1.  **Total Balance (顶部)**:
    *   聚合所有链资产，折算为法币 (USD/CNY)。
    *   **隐私模式**: 点击 "眼睛" 图标隐藏金额 (****)。
2.  **功能栏 (Action Bar)**: Send, Receive, Swap, Buy, History。
3.  **资产列表 (Token List)**:
    *   **分组逻辑**: 按 "链" 分组 或 按 "资产价值" 排序。
    *   **垃圾币过滤**: 自动隐藏价值 < $0.1 或在黑名单合约中的代币。
    *   **手动管理**: 搜索合约地址添加 Custom Token。
4.  **NFT Tab**:
    *   **多链聚合**: 混合展示 ETH, SOL, BTC (Ordinals) NFT。
    *   **媒体支持**: 支持 Video/Audio/GIF 直接播放。

---

### 3.3 全能转账流程 (Unified Send Flow) - 核心复杂度所在

必须处理好各链差异。

1.  **选择资产**: 点击 Token -> 点击 Send。
2.  **输入地址 (Recipient)**:
    *   **智能识别**: 输入地址后，右上角 Icon 自动显示所属链 (如输入 `1A1z...` 显示 Bitcoin 图标)。
    *   **域名解析**: 输入 `vitalik.eth` 或 `toly.sol` 自动解析为地址。
    *   **跨链纠错**: 如果在 ETH 链输入了 Solana 地址，**强阻断**并提示 "格式错误，检测到这是 Solana 地址"。
    *   **地址簿**: 快捷选择常用联系人。
3.  **输入金额 (Amount)**:
    *   "Max" 按钮: 自动扣除预估 Gas 费后的最大值。
    *   法币/Crypto 切换输入。
4.  **填写 Memo/Tag (链特有)**:
    *   *触发条件*: 目标链是 **TON, EOS, Cosmos, XRP** 等。
    *   *交易所风控*: 如果识别到目标地址是常见交易所热钱包，**强制**弹窗要求填写 Memo，否则无法下一步。
5.  **Gas 费用设置 (Fee Settiing)**:
    *   **EVM**: 调节 `Max Priority Fee` (Gwei)。低/中/高三档。
    *   **BTC**: 调节 `sat/vB`。
    *   **Solana**: 增加 `Priority Fee` (Micro-lamports) 防止交易失败。
6.  **Utxo 控制 (BTC 特有)**:
    *   **高级选项**: "Safe Spend" 模式开启（默认）。
    *   *逻辑*: 排除包含 Inscription/Rune 的 UTXO，防止误烧珍贵资产。
7.  **签名与发布 (Sign & Broadcast)**:
    *   本地签名 -> RPC 广播 -> 获取 TxHash。
    *   *反馈*: 进入 "Pending" 列表，轮询链上状态。

---

### 3.4 智能交易聚合 (Swap Aggregator)

让用户像 CEX 一样交易。

1.  **询价 (Quoting)**:
    *   用户输入: "Sell 1 ETH for USDC"。
    *   **后端**: 并发查询 Uniswap V3, Curve, 1inch, Jupiter (Solana) 等。
    *   **跨链**: 如果选了 ETH -> SOL，调用 Bridge API (Stargate/Orbiter)。
2.  **路由展示 (Route Card)**:
    *   显示路径: `ETH -> WETH -> (Uniswap) -> USDC`。
    *   **Gas 预估**: 显示包含 Approval + Swap 的总 Gas。
    *   **价格影响**: 红字警告 "> 2% Price Impact"。
3.  **授权 (Approve)**:
    *   如果是 ERC20 且未授权: 按钮变为 "Approve & Swap"。
    *   *安全*: 默认授权金额 = 交易金额 (Exact Amount)，而非无限。
4.  **执行**:
    *   用户确认 -> 提交交易。
    *   *防失败*: 自动设置较高滑点 (Auto Slippage) 或 动态 Gas。

---

### 3.5 DApp 连接与交互 (DApp Integration)

#### 脚本注入 (Injection)
为了最大化兼容性，Content Script 需注入：
*   `window.ethereum` (EVM 标准)
*   `window.solana` (Phantom 标准)
*   `window.bitcoin` (UniSat 标准)
*   `window.fistwallet` (自家命名空间)

#### 签名确认窗 (Signature Request) 
这是安全的最前线。

**场景 A: 普通交易 (Send Transaction)**
*   **模拟执行 (Simulation)**:
    *   调用模拟 API (如 Tenderly/Blowfish)。
    *   **UI 展示**: "您将支付 1.5 ETH，收到 2000 DAI"。
    *   *风险*: 如果模拟结果是 "所有资产被转走"，全屏红色阻断。
*   **数据解码**:
    *   将 Hex `0x095ea7b3...` 解码为 `Approve(Spender: 0x..., Amount: 1000)`。

**场景 B: 签名消息 (Sign Message)**
*   **纯文本**: 显示原文。
*   **Personal Sign**: 显示 Hex 及 UTF-8 转换内容。
*   **Typed Data (EIP-712)**: 结构化展示 JSON 数据，方便用户核对。
*   **Solana/BTC 消息**: 适配各自标准。

---

## 4. UI/UX 详细规范 (Design System)

### 4.1 视觉风格 (Neo-Glassmorphism)
*   **背景**: 深色磨砂玻璃，透出底部页面模糊色块。
*   **色彩**:
    *   Primary: #6C5DD3 (紫色系, Web3 通用)
    *   Success: #00D68F
    *   Error: #FF4D4F
    *   Bitcoin: #F7931A (橙)
    *   Ethereum: #627EEA (蓝紫)
    *   Solana: Gradient (紫绿渐变)

### 4.2 交互状态
*   **骨架屏 (Skeleton)**: 数据加载绝对不显示 "Loading..." 文字，而是灰块闪烁。
*   **Toast 通知**: 右下角弹出，不阻挡操作。
*   **网络切换**:
    *   UI 顶部永久显示当前网络 Icon。
    *   点击可下拉切换。DApp 请求切换时自动弹出 Modal。

---

## 5. 核心非功能需求 (Non-Functional Requirements)

1.  **安全性**: 私钥必须加密存储在 `chrome.storage.local`，仅在用户输入密码后解密在内存中。并在 15 分钟无操作后自动清除内存中的私钥 (Auto-lock)。
2.  **性能**: 插件启动时间 < 500ms。RPC 请求超时自动重试 (Retry Strategy)。
3.  **兼容性**: 必须通过 Chrome Web Store, Firefox Add-ons, Edge Store 审核。Manifest V3 兼容。

---

## 技术栈
- React（ts） + CrxJS + tailwindcss


## 交付物清单
1.  FistWallet Extension 源代码 (React + TypeScript)。
2.  `wallet-core` 依赖包。
3.  自动化测试报告 (Unit + E2E)。



