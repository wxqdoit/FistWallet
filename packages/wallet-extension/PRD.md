浏览器插件钱包产品功能需求文档 (Web3 Wallet PRD/FRD)
1. 核心架构与多链支持 (Architecture & Chain Support)
这是钱包的基石。MetaMask 专注于 EVM，而 OKX Wallet 专注于“异构多链”。一个全面的钱包应具备 OKX 的多链能力。

多链兼容性:

EVM 链: 支持 Ethereum, BSC, Polygon, Arbitrum, Optimism, Base 等所有符合 EVM 标准的链。

非 EVM 链 (异构链): 支持 Bitcoin (BTC), Solana, Tron, Cosmos (IBC), Sui, Aptos 等。

Layer 2 & Layer 3: 自动识别并支持主流 L2 网络。

网络管理:

自动切换: 访问 DApp 时，根据 DApp 请求自动建议切换网络。

自定义 RPC: 允许用户手动添加/修改 RPC URL、Chain ID 和浏览器地址。

节点健康监测: 自动检测 RPC 延迟，优选最快节点。

2. 用户引导与账户体系 (Onboarding & Account System)
参考 MetaMask 的助记词体系和 OKX 的 MPC/AA 钱包概念。

创建钱包:

HD 钱包 (分层确定性): 生成 12/24 位助记词 (Seed Phrase)。

多账户派生: 单个助记词下可派生无限个子账户 (Account 1, Account 2...)。

MPC 无私钥钱包 (可选高级功能): 通过邮箱/云端备份分片恢复，降低用户门槛（参考 OKX）。

导入钱包:

导入助记词。

导入私钥 (Private Key)。

导入 Keystore JSON 文件。

观察钱包 (Watch-only): 仅输入地址查看资产，无法交易。

硬件钱包连接:

支持 Ledger, Trezor, Keystone 等主流硬件钱包（通过 HID 或 WebUSB 协议）。

3. 资产管理面板 (Asset Management Dashboard)
这是用户最常看到的界面，需要兼顾清晰度与信息密度。

首页概览:

总资产估值（法币计价，支持多币种切换 USD/CNY/EUR）。

多链资产聚合展示（All Networks 视图）。

代币管理 (Tokens):

自动发现: 扫描链上数据，自动添加用户持有的代币。

自定义添加: 输入合约地址手动添加代币。

代币详情: 价格走势图 (K线)、涨跌幅、合约地址检查。

NFT 与数字藏品:

多链展示: 支持 ERC-721, ERC-1155, Solana NFT, Bitcoin Ordinals (BRC-20/Inscriptions)。

媒体渲染: 支持图片、GIF、视频、音频 NFT 的直接播放/查看。

属性查看: 查看 NFT 的元数据、稀有度、Floor Price（地板价）。

DeFi 资产 (Portfolio):

展示在各大 DeFi 协议（如 Uniswap, Aave, Curve）中的质押、流动性挖矿余额（参考 OKX 的 DeFi 面板）。

4. 交易与交互系统 (Transaction & Interaction)
核心功能，要求极高的安全性和流畅度。

发送 (Send):

地址校验: 自动识别目标地址格式是否匹配当前网络（防止转错链）。

ENS/域名解析: 支持输入 vitalik.eth 或 .sol 等域名自动解析为地址。

Gas 估算: 提供 低/中/高 三档 Gas 费选项，并支持 EIP-1559 (Base Fee + Priority Fee) 手动微调。

接收 (Receive):

生成二维码。

一键复制地址。

DApp 交互 (Provider):

注入脚本: 向浏览器页面注入 window.ethereum, window.solana, window.okxwallet 等对象。

签名请求:

Message Sign: 纯文本签名。

Personal Sign: 个人签名。

Typed Data (EIP-712): 结构化数据签名（可读性更高，防止盲签）。

授权管理 (Allowance): 提示用户 DApp 正在请求代币使用额度，支持修改授权上限（防止无限授权）。

5. 内置交易聚合器 (Built-in DEX & Bridge Aggregator)
这是钱包的盈利核心（Swap 费用）。

Swap (兑换):

聚合路由: 接入 1inch, Uniswap, Jupiter (Solana) 等流动性，寻找最优价格。

滑点设置: 自动/手动设置滑点保护。

跨链 Swap (X-Routing): 允许用户直接将 ETH 链的 USDT 兑换为 Solana 链的 SOL（参考 OKX X-Routing）。

Bridge (跨链桥):

集成主流跨链桥（Stargate, Orbiter, Hop），提供跨链资金转移服务。

法币出入金 (Fiat On-ramp/Off-ramp):

集成 MoonPay, Transak 等第三方服务，支持信用卡买币。

6. 比特币生态特色功能 (Bitcoin Ecosystem Specials)
鉴于 OKX 在这方面的领先地位，这是现代钱包的必备差异化功能。

地址格式: 支持 Legacy, SegWit, Taproot (P2TR) 地址。

铭文支持:

查看 BRC-20 代币余额。

查看和发送 Ordinals NFT。

防烧毁机制: 在转账 BTC 时，自动锁定包含铭文的 UTXO，防止误将铭文当做矿工费花掉。

7. 安全与隐私 (Security & Privacy)
用户最关心的部分。

交易模拟 (Transaction Simulation):

在用户签名通过前，预执行交易，展示资产变化结果（如：资产将减少 1 ETH，获得 0 个 NFT），防止钓鱼攻击。

风险检测:

黑名单地址库: 检测到向诈骗/黑客地址转账时强制弹窗警告。

合约检测: 提示合约是否开源、是否有蜜罐（Honeypot）风险。

隐私保护:

RPC 隐私: 防止 RPC 节点收集用户 IP。

多账户隔离: 允许为不同 DApp 设置不同的连接账户。

本地安全:

自动锁定时间设置。

生物识别（如果浏览器/设备支持）。

8. 扩展性与设置 (Extensibility & Settings)
多语言/多货币: 支持全球主要语言和法币计价。

地址簿: 保存常用联系人。

消息通知: 链上交易成功/失败的浏览器弹窗通知。

开发者模式: 显示 Hex Data，详细的 Gas 参数。

WalletConnect: 支持扫描二维码连接移动端或其他 DApp。

模块P0 (MVP 必须具备)P1 (进阶/差异化)
链支持 Ethereum + L2sSolana, Bitcoin, Cosmos
账户 助记词, 私钥导入硬件钱包, MPC, 社交登录
资产 代币显示, 转账NFT 媒体展示, DeFi 聚合看板
交易 基础转账, DApp 连接签名交易预执行(防钓鱼), 跨链 Swap
比特币 基础 BTC 转账Ordinals/BRC-20 解析与交易
设置 语言, 货币, 网络切换自定义 RPC, 开发者工具



流程一：新用户创建钱包 (User Onboarding Flow)
设计目标：在确保最高安全级别（助记词备份）的同时，降低用户心理负担，防止用户流失。

1. 流程图 (Flowchart)
代码段

graph TD
    A[启动插件] --> B{已有钱包?}
    B -- 是 --> C[导入钱包流程]
    B -- 否 --> D[点击 创建新钱包]
    D --> E[设置解锁密码<br>本地加密用]
    E --> F[安全教育视频/提示<br>即使是简短的]
    F --> G[展示助记词<br>默认模糊处理]
    G --> H{备份验证}
    H -- 验证成功 --> I[完成创建<br>进入首页]
    H -- 验证失败 --> G
    
    subgraph 差异化功能 [OKX式 MPC 选项]
    D -.-> J[无私钥钱包创建<br>邮箱+云端备份]
    J -.-> I
    end
2. 详细页面拆解
页面 1: 欢迎页 (Welcome / Landing)
核心元素:

Logo + 品牌 Slogan (例如: "Gateway to Web3").

主按钮 (Primary Button): "创建新钱包 (Create a new wallet)".

次按钮 (Secondary Button): "我已有钱包 (Import an existing wallet)".

UX 细节: 页面应极其简洁，不要有干扰信息。

页面 2: 数据隐私与协议 (Opt-in & Privacy)
核心元素:

"帮助我们要改进钱包吗？" (MetaMask 经典页面).

明确列出：我们收集什么（匿名报错），不收集什么（IP、Keys、余额）.

按钮: "同意 (I Agree)" / "不，谢谢 (No Thanks)".

UX 细节: 这一步增加信任感，表明去中心化立场。

页面 3: 创建密码 (Create Password)
逻辑: 此密码仅用于加密存储在本地浏览器的私钥，与链上无关。

核心元素:

输入框: 新密码 / 确认密码 (最少 8 位).

复选框: "我已阅读并同意服务条款".

如果支持: 开启 FaceID/TouchID 选项.

错误状态: 密码不一致、强度太弱时实时红字提示。

页面 4: 助记词安全教育 (Secure Wallet)
核心元素:

标题: "保护您的钱包".

内容: 一段简短的文本或 15秒 动画，解释什么是助记词 (Seed Phrase)。

重点警告: "如果您丢失了助记词，我们无法帮您找回资金。"

按钮: "开始备份 (Secure my wallet now)" / "稍后提醒 (Remind me later)" (不推荐允许跳过，但在转换率优化上可以考虑).

页面 5: 备份助记词 (Reveal Seed Phrase)
核心元素:

遮罩区域: 点击眼睛图标或长按才能显示 12 个单词。防止旁人窥屏。

防截屏提示: 检测到用户尝试截屏时，弹出警告 "截图不安全，请手抄"。

按钮: "下一步 (Next)".

页面 6: 验证助记词 (Verify Seed Phrase)
交互方式:

严谨模式 (MetaMask): 要求用户按顺序点击下方打乱的单词，填入空缺的第 3、第 7、第 12 个位置。

宽松模式: 要求按顺序排列所有 12 个单词。

逻辑: 只有验证正确，"完成" 按钮才会高亮变更为可点击状态。

页面 7: 完成 (Completion)
核心元素: 撒花动画，提示 "一切就绪"。

下一步: 自动跳转至钱包首页。

流程二：发起 Swap (Token Swap Flow)
设计目标：提供类似 CEX 的丝滑体验，同时透明展示 Gas 费和滑点，通过聚合器（Aggregator）寻找最优报价。

1. 流程图 (Flowchart)
代码段

graph TD
    A[钱包首页] --> B[点击 Swap 按钮]
    B --> C[选择代币页面]
    C --> D[输入数量]
    D --> E{请求报价 API}
    E -- 获取最优路由 --> F[展示报价页<br>汇率/Gas/滑点]
    F --> G{代币是否已授权?}
    G -- 否 (需要 Approve) --> H[发起 Approve 交易]
    H -- 链上确认 --> I[发起 Swap 交易]
    G -- 是 --> I
    I --> J[交易提交成功页]
    J --> K[等待链上确认通知]
2. 详细页面拆解
页面 1: Swap 入口 (Entry)
用户在资产首页点击巨大的 "Swap" 图标。

页面 2: 交易参数设置 (Build Quote)
核心元素:

支付栏 (Pay):

选择代币 (Token A) - 点击弹出搜索框。

输入数量。

辅助功能: "Max" 按钮，点击自动填入最大可用余额（需预留 Gas）。

显示余额: "Balance: 1.5 ETH".

接收栏 (Receive):

选择代币 (Token B)。

数量: 禁止输入，显示 "Fetching quote..." 骨架屏动画。

链选择器 (如果是跨链 Swap): 允许在支付栏选 Ethereum，接收栏选 Solana。

UX 细节: 当用户停止输入 500ms 后，自动触发 API 请求报价。

页面 3: 报价确认 (Review Quote)
逻辑: 后端聚合器（如 1inch/Jupiter API）返回数据。

核心元素:

汇率: 1 ETH ≈ 3000 USDC (每 10 秒刷新一次，倒计时圈).

Gas 费预估: 显示法币价值 Network Fee: ~$5.00.

价格影响 (Price Impact): 如果池子深度不够，显示红色警告 "High Price Impact -2%".

路由路径 (Route): 可视化展示 ETH -> USDC 还是 ETH -> DAI -> USDC。

滑点设置 (Slippage): 默认 "Auto (0.5%)"，点击可手动修改。

操作按钮:

场景 A (原生代币，如 ETH 换 USDT): 按钮显示 "Swap".

场景 B (ERC20 代币，如 UNI 换 USDT): 按钮显示 "Approve UNI" (如果是第一次)。

页面 4: 授权流程 (Approval - 若需要)
痛点解决: 新手常以为 Approve 就是 Swap，导致只做了一半操作。

UX 设计:

点击 "Approve" 后，弹出系统级签名确认框。

关键改进: 允许用户编辑授权额度（默认是最大值，但为了安全应允许修改）。

交易发送后，按钮变为 "Approving..." 加载圈。

无需跳转: 授权成功后，按钮自动变为 "Swap"（无需刷新页面）。

页面 5: 最终确认与签名 (Sign & Submit)
点击 "Swap" 按钮。

系统弹窗: 再次展示最终花费（含 Gas）的总金额。

用户点击 "Confirm"。

页面 6: 交易进行中/结果 (Pending / Result)
核心元素:

动画: 旋转的 Loading 图标。

状态文本: "Transaction Submitted".

链接: "View on Explorer" (Etherscan 链接).

操作: "关闭" 按钮。用户关闭后，回到首页，首页资产列表旁应有一个小的 "Pending" 标记，直到链上确认。

UI 设计中的关键“魔法细节” (Magic Details)
自动网络切换:

如果在 Swap 页面选择了 Polygon 链的代币，而当前钱包连着 Ethereum，不要报错。直接在点击 Swap 时弹出 "允许切换网络到 Polygon 吗？"。

Gas 不足保护:

如果用户想把 全部 ETH 换成 USDT，点击 "Max" 时，不能填入 100% 余额。系统必须自动计算：总额 - 预估Gas = 实际输入额，否则交易必失败。

防钓鱼模拟 (Transaction Simulation):

在最终确认页，加入一行绿色小字："模拟执行成功：您将收到 +1000 USDT"。如果模拟失败（可能遇到貔貅盘），显示红色警告："交易可能失败，请勿继续"。


流程三：DApp 调起交易面板 (DApp Triggered Transaction)
场景：用户在网页（如 Uniswap）点击“Swap”，DApp 向插件发送 eth_sendTransaction 请求。

1. 流程图 (Flowchart)
代码段

graph TD
    A[用户在 DApp 点击操作按钮] --> B{钱包状态?}
    B -- 锁定中 --> C[弹出解锁界面]
    C --> D[输入密码解锁]
    B -- 未锁定 --> E{网络匹配?}
    
    E -- 不匹配 --> F[请求切换网络<br>Switch Chain]
    F -- 用户确认 --> D
    
    E -- 匹配 --> G[解析交易数据 (Decoding)]
    G --> H[安全扫描 & 模拟执行 (Simulation)]
    H --> I[展示交易确认弹窗]
    
    I --> J{用户行为}
    J -- 修改 Gas --> K[Gas 编辑面板]
    K --> I
    J -- 拒绝 --> L[返回 Error 给 DApp]
    J -- 确认 --> M[本地签名交易]
    
    M --> N[广播上链]
    N --> O[返回 TxHash 给 DApp]
    O --> P[弹窗自动关闭<br>右下角显示 Toast 通知]
2. 详细页面拆解
此流程通常在一个独立的、较小的弹出窗口（Notification Window, 360x600px 左右）中进行。

页面 1: 前置检查与加载 (Pre-check & Loading)
状态: 如果钱包已锁定，优先展示“输入密码解锁”。

网络检查:

如果 DApp 请求的是 Optimism 链，而钱包在 Ethereum 链。

UX 动作: 强制插入一个“切换网络”的确认页。

内容: "允许 site.com 切换网络到 Optimism 吗？"

页面 2: 交易确认主面板 (Transaction Confirmation)
这是最关键的页面，分为三个区域：头部（来源）、中部（核心逻辑）、底部（操作）。

A. 头部 - 来源校验 (Origin & Trust):

显示 DApp 的 Favicon 和 域名 (如 app.uniswap.org)。

安全胶囊:

如果域名在白名单（知名 DeFi）：显示绿色盾牌。

如果域名是新注册/未收录：显示灰色“Unverified”。

如果域名在黑名单：全屏红色警告，阻止交易。

B. 中部 - 资产变动模拟 (Asset Change / Simulation):

不要只显示十六进制数据！ 参考 Rabby/Phantom 的做法。

语义化展示:

Out (支出): -1 ETH (红色文本).

In (收入): + 3000 USDC (绿色文本).

交互合约: Interact with: Uniswap V3 Router.

NFT 场景: 显示即将购买的 NFT 缩略图和 ID。

授权场景: 如果是 approve 操作，必须高亮显示“授权 USDC 给 spender 0x123...”，并提供“编辑额度”的入口。

C. 底部 - 费用与操作 (Cost & Action):

Gas 费: 显示 Est. Fee: 0.002 ETH ($5.00)。

点击可弹出 Gas 设置面板（见下文）。

总计 (Total): 转账金额 + Gas 费。

按钮:

"拒绝 (Reject)": 灰色/白色按钮。

"确认 (Confirm)": 品牌色高亮按钮。

页面 3: Gas 编辑面板 (Gas Settings - Bottom Sheet)
入口: 点击主面板的 Gas 费用区域唤起。

选项:

Market: 当前标准费率（默认）。

Aggressive: 高费率（抢购 NFT 时用）。

Low: 低费率（不着急时用）。

Advanced: 允许手动输入 Max Base Fee 和 Priority Fee (EIP-1559)。

页面 4: 硬件钱包签名 (Hardware Wallet Flow - 可选)
逻辑: 如果当前账户绑定了 Ledger/Trezor。

UI 展示:

屏幕中心显示动画：一个 USB 连接图标或蓝牙图标。

文案: "请在您的 Ledger 设备上检查并确认交易"。

状态同步: 当用户在硬件上按下确认键后，UI 自动跳转到发送成功。

页面 5: 结果反馈 (Post-Interaction)
动作: 确认后，弹窗立即自动关闭，让用户视线回到 DApp 网页。

系统通知: 在浏览器右下角（或系统通知栏）弹出一个 Toast：

"交易已提交 (Pending)..."

几秒/几分钟后更新为 "交易成功 (Confirmed)" 或 "交易失败 (Failed)"。

UI 设计中的“魔法细节” (Magic Details)
反钓鱼高亮 (Anti-Phishing Highlight):

如果用户正在向一个全新的空地址转账巨额资金，或者合约代码未开源，在“确认”按钮上方增加一个强制勾选框：“我知晓此地址是新地址/未开源合约，存在风险”。

授权额度清理 (Allowance Attack Prevention):

当 DApp 请求 approve(USDT, 无限大) 时，钱包默认将输入框修改为用户实际想要 Swap 的金额（例如 100 USDT），而不是默认给无限大授权。用户需要手动改回无限大才能确权。

余额不足智能提示:

如果 Gas 费不足，不要禁用“确认”按钮（这会让用户困惑为什么点不动）。

UX 方案: 保持按钮可点击，但点击后弹出具体错误：“您的 ETH 余额不足以支付 Gas (缺 0.001 ETH)”。