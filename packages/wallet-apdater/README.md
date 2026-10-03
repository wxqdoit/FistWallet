# @fistwallet/wallet-apdater

A modular and lightweight multi-chain wallet adapter layer supporting EIP-6963 discovery and custom wallet adapters across EVM, Solana, Bitcoin, Tron, Aptos, Sui, and StarkNet.

## ✨ Features

- **EIP-6963 Auto Discovery**: Standard `window.ethereum` conflict-free wallet discovery via `mipd`.
- **Pre-built Adapters**: Built-in support for 13+ leading Web3 wallets:
  - MetaMask (`io.metamask`)
  - OKX Wallet (`com.okex.wallet`)
  - Phantom (`app.phantom`)
  - Bitget Wallet (`com.bitget.wallet`)
  - UniSat (`io.unisat`)
  - TronLink (`org.tronlink`)
  - Petra (`app.petra`)
  - Pontem (`network.pontem`)
  - Martian (`app.martian`)
  - Suiet (`app.suiet`)
  - Slush (`app.slush`)
  - Braavos (`wallet.braavos`)
  - Razor (`wallet.razor`)
- **Unified Adapter Lifecycle**: Consistent `connect`, `disconnect`, `switchNetwork`, `sendTransaction`, and reactive event subscriptions (`accountChanged`, `networkChanged`).
- **Standardized Errors**: Typed `AdapterError` with granular error codes (`WALLET_NOT_INSTALLED`, `UNSUPPORTED_CHAIN`, `USER_REJECTED`, etc.).

---

## 📦 Installation

```bash
pnpm add wallet-apdater
```

---

## 🛠 Usage Example

```typescript
import { createDefaultAdapterRegistry, ChainType } from 'wallet-apdater';

// 1. Initialize registry with auto-discovery
const { registry, stop } = createDefaultAdapterRegistry();

// 2. Query available wallets
const adapters = registry.list();
console.log('Detected wallets:', adapters.map((a) => a.info.name));

// 3. Connect to a wallet (e.g. MetaMask on EVM)
const metamask = adapters.find((a) => a.info.rdns === 'io.metamask');
if (metamask) {
  const account = await metamask.connect({ chainType: ChainType.EVM, chainId: 1 });
  console.log('Connected EVM address:', account.address);

  // Listen to account changes
  const unsubscribe = metamask.onAccountChanged((accounts) => {
    console.log('Account switched:', accounts);
  });
}

// 4. Teardown event listeners when done
stop();
```

---

## 🧪 Testing & Building

```bash
# Run tests
pnpm test

# Build package
pnpm build
```
