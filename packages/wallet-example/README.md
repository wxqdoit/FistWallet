# @fistwallet/wallet-example

A demonstration dApp built with React, Vite, and Tailwind CSS, showcasing how to integrate and use `@fistwallet/wallet-kit` and `@fistwallet/wallet-apdater` in production.

## 🚀 Features Demonstrated

- **Multi-Chain Wallet Connection**: One-click connection to EVM (Ethereum, BSC, Polygon, Arbitrum, Base), Solana, Bitcoin, Aptos, Sui, Tron, and StarkNet.
- **Network Switcher**: Interactive UI to switch between Mainnet and Testnet environments.
- **Transaction & Message Playground**: Sign messages and test transaction payload generation live.
- **Theme & Locale Customization**: Demonstrates dynamic Dark/Light theme toggles and i18n switching.

---

## 🛠 Running Locally

```bash
# In repository root
pnpm --filter wallet-example dev

# Or inside this package directory
cd packages/wallet-example
pnpm dev
```

Visit `http://localhost:5173` to interact with the demo.

---

## 🧪 Testing & Production Build

```bash
pnpm test
pnpm build
```
