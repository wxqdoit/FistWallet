# FistWallet Extension UI/UX Design & Architecture Specification

## 1. Vision & Design Philosophy
FistWallet Extension delivers a modern, high-end Web3 wallet experience rivaling OKX Web3 Wallet, Raycast, and Linear. The design emphasizes:
- **Dark Luxury & Tactile Glassmorphism**: Deep OLED background tones (`#090C15`), subtle surface elevation, precision 1px border lighting (`rgba(255, 255, 255, 0.08)`), and soft ambient drop shadows.
- **Fluid & Responsive Motion**: High-refresh-rate spring physics powered by `framer-motion`, giving every tap, hover, and page navigation tactile feedback.
- **Clear Information Hierarchy**: Immediate glanceability for total fiat balance, active network badge, current account address, and multi-chain asset distribution.
- **Adaptive Precision**: Full support for Dark & Light modes with automatic CSS variable interpolation and tokenized typography.

---

## 2. Design Tokens & Color Palette

### 2.1 Color Variables (HSL)
```css
/* Dark Luxury (Default) */
--background: 224 45% 6%;      /* #080B13 */
--foreground: 210 40% 98%;      /* #F8FAFC */
--card: 224 35% 10%;            /* #0F1424 */
--card-foreground: 210 40% 98%;
--popover: 224 35% 10%;
--popover-foreground: 210 40% 98%;
--primary: 245 75% 62%;         /* Vibrant Electric Indigo */
--primary-foreground: 0 0% 100%;
--secondary: 222 25% 16%;       /* #1B2236 */
--secondary-foreground: 210 40% 96%;
--muted: 222 20% 18%;
--muted-foreground: 215 20% 65%;
--accent: 245 75% 62%;
--accent-foreground: 0 0% 100%;
--destructive: 0 84% 60%;
--border: 220 20% 18%;          /* 1px subtle boundary */
--input: 220 20% 18%;
--ring: 245 75% 62%;
--radius: 1rem;                 /* 16px smooth squircle */

/* Glow & Accent Tokens */
--brand-gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
--glass-card-bg: rgba(18, 24, 40, 0.7);
--glass-card-border: rgba(255, 255, 255, 0.08);
--glass-card-highlight: inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
```

---

## 3. Technology Stack Integration

| Technology | Role | Implementation |
| :--- | :--- | :--- |
| **Tailwind CSS 3.4** | Utility styling & theme tokens | Custom classes for glassmorphic elevation, glow rings, and responsive scrollbars |
| **Shadcn/UI + Radix** | Accessible headless UI primitives | Custom styled `Card`, `Button`, `Input`, `Dialog`, `Select`, `Tabs`, `Badge` |
| **TanStack Query v5** | Server state caching & async queries | Handles asynchronous RPC balance fetching, token metadata, and gas fee polling |
| **Zustand 4.5** | Local client application state | Manages wallet auth session, active account, network switching, and app settings |
| **Framer Motion 11** | Physics-based animations | Page transitions, spring button clicks (`whileTap`), and staggered list items |

---

## 4. Motion & Micro-interaction System

1. **Page Transition**:
   - Subtly slides along the X-axis while fading opacity:
   ```tsx
   initial={{ opacity: 0, x: 10 }}
   animate={{ opacity: 1, x: 0 }}
   exit={{ opacity: 0, x: -10 }}
   transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
   ```
2. **Interactive Elements**:
   - Buttons and Action Pills: `whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}` with smooth CSS backdrop-blur.
3. **Asset Lists**:
   - Staggered child reveals with `delayChildren: 0.05, staggerChildren: 0.04`.
4. **Status & Feedback**:
   - Address copy chip with instant spring checkmark icon toggle and Sonner toast.

---

## 5. Screen Hierarchy & Experience Guidelines

### 5.1 Dashboard
- **Header**:
  - Left: Account avatar / name dropdown with quick switcher.
  - Center: Network pill button with chain icon, name, and glowing active indicator.
  - Right: Activity history & Settings shortcuts.
- **Hero Asset Card**:
  - Total USD valuation with privacy hide/show toggle.
  - Address copy chip with truncated hash and interactive tap feedback.
  - Action Bar: 4 balanced pills (`Send`, `Receive`, `Swap`, `Activity`) with custom icons and spring interactions.
- **Asset Tabs**:
  - Tab navigation for `Tokens` and `History` with animated motion indicator.
  - Native currency card followed by custom ERC-20 / SPL token rows.
  - One-click `+ Add Token` modal trigger.

### 5.2 Send & Transfer
- Recipient address input with automatic chain-specific validation badge and contact book picker.
- Amount input with `MAX` button and real-time USD approximation.
- Dynamic fee preview (Standard/Fast) with clear breakdown.

### 5.3 Swap & Exchange
- Interactive dual token input cards (From / To).
- Rotating direction toggle with 180-degree spring spin.
- Slippage tolerance selector pills (`0.1%`, `0.5%`, `1.0%`).
- Live quote simulation and breakdown.

### 5.4 Receive
- Prominent QR code centered within an elevated card.
- Full address with 1-click copy and network verification banner.
