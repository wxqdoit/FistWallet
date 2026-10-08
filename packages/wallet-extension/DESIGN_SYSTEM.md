# FistWallet 全套设计系统规范 (Fist Design System - FDS)
> **设计哲学**：黑曜石深空极简暗调 (Obsidian Deep Dark)、OKX Web3 级工程严谨度、严禁杂乱渐变与多色配置、单色品牌强调 (Electric Indigo)、全站零横向位移 (Zero-X Motion)。

---

## 一、 色彩系统 (Color Palette System)

### 1.1 背景层级规范 (Surface & Background Hierarchy)
为保证 OLED 设备的极致省电以及极具质感的黑曜石视觉纵深，背景色划分为 5 个清晰的物理层级：

| 层级名称 | Token / 颜色值 | 应用场景 | 说明 |
| :--- | :--- | :--- | :--- |
| **L0 Canvas (底板画布)** | `#070A12` | 插件全局背景、所有页面底板 | 深空纯黑，吸收所有杂光，作为基础容器 |
| **L1 Surface (模块卡片)** | `#14161E` | 资产总览卡片、设置行组、操作容器 | 黑曜石标准材质，承载各类信息块 |
| **L2 Inset (内嵌输入)** | `#0A0D14` | 表单输入框、助记词展示盒、协议背景 | 内凹沉浸质感，提示可编辑与安全区域 |
| **L3 Elevated (交互胶囊)** | `#1F2330` | 次级按钮、图标圆钮底座、切换药丸 | 悬浮微抬高，赋予极强的可点击感 |
| **L4 Overlay (浮层弹窗)** | `#14161E` + `backdrop-blur-xl` | 弹窗 (Dialog)、下拉菜单 (Select)、抽屉 | 结合 `bg-black/75` 高遮罩，最高层级聚焦 |

### 1.2 文字对比度规范 (Typography Contrast Hierarchy)
严格遵守 WCAG 2.1 AAA/AA 可读性标准，文字禁用多色杂色：

| 文本层级 | CSS Class / 颜色值 | 不透明度 | 应用场景 |
| :--- | :--- | :--- | :--- |
| **Primary (主文案)** | `text-white` (`#FFFFFF`) | 100% | 资产主金额、页面大标题、列表主标题、重点数据 |
| **Secondary (次文案)**| `text-white/70` | 70% | 辅助描述、功能说明、已选状态值、导航返回键 |
| **Tertiary (弱化文案)**| `text-white/40` | 40% | 分组大写标签、版本号、交易时间戳、单位符号 |
| **Placeholder (占位)**| `text-neutral-500` / `text-white/30` | 30% | 输入框未填状态提示文字 |
| **Disabled (禁用态)** | `text-white/20` | 20% | 不可用项文案 |

### 1.3 品牌色与语义色彩规范 (Brand & Status System)
坚决贯彻「**单色品牌强调**」与「**严禁多色杂配**」原则：

| 角色 | 颜色名 | Hex / Tailwind | 辅助背景与边框 | 应用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **品牌主色 (Brand)** | Electric Indigo | `#6366F1` (`indigo-500`)<br>`#4F46E5` (`indigo-600`) | 浅底: `bg-indigo-500/10`<br>边框: `border-indigo-500/30` | 全局 CTA 主按钮、所有核心前导图标、焦点状态 |
| **安全/成功 (Success)**| Emerald | `#34D399` (`emerald-400`) | `bg-emerald-500/10`<br>`border-emerald-500/20` | 交易成功标签、网络连通绿点、安全验证通过 |
| **注意/警示 (Warning)**| Amber | `#FBBF24` (`amber-400`) | `bg-amber-500/10`<br>`border-amber-500/20` | 助记词备份安全提示、滑点偏高警示 |
| **危险/破坏 (Danger)** | Rose | `#F43F5E` (`rose-500`) | `bg-rose-500/10`<br>`border-rose-500/25` | 交易失败、不匹配网络报错、删除钱包操作 |

> [!IMPORTANT]
> **色彩红线 (Strict Rules)**：
> 1. 列表项前导图标（Settings, Wallets, AddWallet 等）**严禁使用彩虹配色**（不可一会儿黄色、一会儿红色、一会儿青色），统一使用品牌色 `text-indigo-400`。
> 2. 页面中禁止使用杂色渐变背景（`linear-gradient`），统一采用纯粹暗调表面 + 极细半透明边框。

---

## 二、 排版与字体阶梯 (Typography Hierarchy)

### 2.1 字体家族 (Font Family)
- **常规 UI 文本**：`-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, sans-serif`
- **数值与链上数据**：`'SF Mono', 'JetBrains Mono', 'Fira Code', monospace`（用于余额、Gas费、钱包地址、交易哈希、助记词序号）

### 2.2 字阶规范表 (Type Scale)

| 样式名 | Tailwind Class | 像素大小 | 字重 (Weight) | 行高/间距 | 应用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `text-3xl` | 30px | `font-black` (900) | `leading-none tracking-tight` | 主页面资产大额总览（如 `$12,850.00`） |
| **Title 1** | `text-2xl` | 24px | `font-black` (900) | `leading-tight tracking-tight` | 引导页主标题、开屏核心标语 |
| **Title 2** | `text-base` | 16px | `font-bold` (700) | `leading-snug` | 弹窗 Header 标题、卡片核心标题 |
| **Title 3 / Nav** | `text-sm` | 14px | `font-semibold` (600) | `tracking-tight` | 顶部导航栏标题、重要操作按钮文案 |
| **Section Overline**| `text-xs` | 12px | `font-semibold` (600) | `uppercase tracking-wider text-white/40` | 分组标头（如 `通用偏好`、`安全与备份`） |
| **Body Normal** | `text-xs` / `text-sm` | 12px / 14px | `font-medium` (500) | `leading-normal text-white` | 列表项标题、表单输入字、常规正文 |
| **Body Small** | `text-xs` | 12px | `font-normal` (400) | `leading-relaxed text-white/60` | 副标题说明、提示文字 |
| **Caption** | `text-[11px]` / `text-[10px]` | 10px-11px | `font-medium` (500) | `text-white/40` | 时间戳、网络协议标签、辅助角标 |
| **Mono Data** | `font-mono text-xs` | 12px | `font-medium` (500) | `select-all` | 链上地址（`0x12...34`）、交易 Hash |

---

## 三、 边框与阴影规范 (Borders & Shadows)

### 3.1 边框阶梯 (Borders)
- **标准卡片边框**：`border border-white/10`（在深黑底色上提供恰到好处的轮廓划分）
- **轻量分割线**：`border-b border-white/5` 或 `divide-y divide-white/5`（列表内各条目之间的细线）
- **交互悬停高亮**：`hover:border-white/20` 或 `hover:border-indigo-500/40`
- **表单聚焦状态**：`focus-visible:outline-none focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20`
- **危险报错边框**：`border-rose-500/30`

### 3.2 阴影与景深 (Elevation & Shadows)
- **基础卡片 (L1 Surface)**：`shadow-sm`（暗色下依靠边缘明度对比，避免脏光晕）
- **浮动胶囊 (L3 Elevated)**：`shadow-sm shadow-black/40`
- **弹窗与下拉框 (L4 Overlay)**：`shadow-2xl shadow-black/80`
- **品牌强操作 (CTA Button)**：`shadow-lg shadow-indigo-600/20`（适度的品牌光感增强点击欲）

---

## 四、 圆角系统规范 (Corner Radius)

| Token | 像素值 | Tailwind Class | 典型应用组件 |
| :--- | :--- | :--- | :--- |
| **Full Pill** | 9999px | `rounded-full` | 主操作按钮 (CTA)、胶囊切换钮、圆形图标按钮、地址复制 Chip、状态 Badge |
| **Container** | 16px | `rounded-2xl` | 主卡片容器、设置分组框、弹窗面板 (Modal)、资产总览卡片 |
| **Field/Item** | 12px | `rounded-xl` | 文本输入框 (Input)、列表可点条目、代币选择槽、操作小卡片 |
| **Small Tag** | 8px | `rounded-lg` | 下拉菜单条目 (SelectItem)、快捷标签、微型按钮 |

---

## 五、 按钮与交互状态全套规范 (Buttons & States)

### 5.1 Primary Button (品牌主行动按钮)
- **外观**：`h-12 w-full rounded-full bg-indigo-600 text-white font-bold text-[15px] shadow-lg shadow-indigo-600/20`
- **Hover**：`hover:bg-indigo-500`（明度提升）
- **Active**：`active:opacity-85`（瞬时按压透明度反馈，**严禁 X 轴晃动**）
- **Disabled**：`disabled:bg-[#1A1D26] disabled:text-neutral-500/50 disabled:border disabled:border-white/[0.04] disabled:cursor-not-allowed`

### 5.2 Secondary Button (黑曜石次级按钮)
- **外观**：`h-12 rounded-full bg-[#14161E] hover:bg-[#1A1D26] border border-white/10 text-white font-semibold text-[14px]`
- **Hover**：`hover:border-white/20 hover:bg-[#1A1D26]`
- **Active**：`active:opacity-80`
- **Disabled**：`disabled:opacity-40 disabled:cursor-not-allowed`

### 5.3 Ghost / Utility Button (圆形图标按钮)
- **外观**：`w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors`
- **Hover**：`hover:bg-white/[0.08] hover:border-white/20 text-white`
- **Active**：`active:scale-95`

### 5.4 Quick Action Button (Dashboard 4 大快捷金刚位)
- **图标底座**：`w-11 h-11 rounded-full bg-[#1F2330] group-hover:bg-[#252A3A] border border-white/10 group-hover:border-indigo-500/40 text-indigo-400 flex items-center justify-center transition-colors shadow-sm`
- **标签文本**：`text-xs font-medium text-white/80 group-hover:text-white mt-1.5 transition-colors`
- **Active**：`active:opacity-75`

---

## 六、 图标规范 (Iconography System)

- **主色统一**：列表项、核心入口的前导图标统一使用 **`text-indigo-400`**。
- **指示箭头**：折叠/进入详情箭头统一使用 **`text-white/30`**，尺寸统一为 `16px`。
- **返回与关闭**：顶部左侧返回箭头统一置于 `w-8 h-8 rounded-full` 容器中，`text-white/70 hover:text-white`。
- **图标尺寸梯度**：
  - `14px`：状态指示（网络类型小标、Check 勾选）
  - `16px`：导航返回、小箭头、复制按钮
  - `18px`：列表前置主图标（Moon, Translate, Key, Clock, Shield）
  - `20px`：主操作大图标（Send, Receive, Swap, Activity）
  - `28px - 36px`：空状态插画、操作成功完成状态

---

## 七、 动效规范 (Zero-X Motion System)

> [!CAUTION]
> **绝对禁令**：全站所有 Framer Motion、CSS Transition 严禁包含任何 `x: 20`、`x: -20`、`translateX` 水平移动动画！

- **页面级切换 (Page Transitions)**：
  ```tsx
  <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="h-full flex flex-col bg-[#070A12] text-white select-none relative"
  >
  ```
- **折叠面板/微弹窗 (Accordion/Panel)**：
  ```tsx
  <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
  >
  ```
- **响应速度**：一律采用 `duration: 0.15` (150ms)，保证 Web3 扩展瞬时响应的高性能手感。
