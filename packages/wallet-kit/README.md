# WalletKit

A production-ready, multi-chain React component library and Web3 hooks suite designed for seamless DApp connectivity.

## Features

- 🌐 **Multi-Chain Architecture**: Native support for EVM, Solana, Bitcoin, Aptos, Sui, TRON, and Starknet.
- 🎨 **Luxury UI Components**: Ready-to-use `ConnectButton` and modal with responsive layout and customizable themes.
- ⚡ **Full Hook Ecosystem**: High-level hooks for account state, wallet connectivity, chain switching, message signing, and EIP-712 typed data.
- 🔌 **Standard Compliant**: Compatible with EIP-1193, EIP-6963 (multi-injected discovery), and modern Web3 adapters.

## Installation

```bash
pnpm add wallet-kit
```

## Quick Start

### 1. Setup Provider

Wrap your application tree with `WalletKitProvider`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletKitProvider, ChainType } from 'wallet-kit';
import 'wallet-kit/dist/style.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletKitProvider
      defaultChainType={ChainType.EVM}
      defaultChainId={1}
      language="en"
    >
      <App />
    </WalletKitProvider>
  </React.StrictMode>
);
```

### 2. Add Connect Button

```tsx
import { ConnectButton } from 'wallet-kit';

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1 className="font-bold">My DApp</h1>
      <ConnectButton />
    </header>
  );
}
```

### 3. Use Web3 Hooks

```tsx
import {
  useAccount,
  useDisconnect,
  useSwitchChain,
  useSignMessage,
  useSignTypedData,
} from 'wallet-kit';

export function Dashboard() {
  const account = useAccount();
  const { disConnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  if (!account.address) {
    return <p>Please connect your wallet.</p>;
  }

  return (
    <div>
      <p>Connected Address: {account.address}</p>
      <p>Chain Type: {account.chainType}</p>
      <p>Chain ID: {account.chainId}</p>

      <button onClick={() => switchChain({ chainId: 137 })}>
        Switch to Polygon
      </button>

      <button onClick={async () => {
        const sig = await signMessageAsync({ message: 'Login confirmation' });
        console.log('Signature:', sig);
      }}>
        Sign Message
      </button>

      <button onClick={disConnect}>Disconnect</button>
    </div>
  );
}
```

## Available Hooks

| Hook | Purpose |
| :--- | :--- |
| `useAccount()` | Reads connected address, chain type, chain ID, and connection status |
| `useConnectedProvider()` | Retrieves the active provider instance for the connected chain |
| `useDisconnect()` | Disconnects the currently active session |
| `useOpenConnectModal()` | Programmatically opens the wallet selection dialog |
| `useSwitchChain()` | Requests chain/network switch with automatic prompt handling |
| `useSignMessage()` | Requests standard text message signature across any chain |
| `useSignTypedData()` | Signs structured EIP-712 typed data payloads |
| `useSendTransaction()` | Submits native or token transactions to the network |

## License

MIT
