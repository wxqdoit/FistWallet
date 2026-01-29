# Chain Interaction

Unified blockchain RPC interaction library for 9+ chains.

## Installation

```bash
pnpm install
```

## Supported Chains

| Chain | Provider | Library |
|-------|----------|---------|
| EVM (Ethereum, BSC, etc.) | `EVMProvider` | viem |
| Solana | `SolanaProvider` | @solana/web3.js |
| TRON | `TronProvider` | tronweb |
| TON | `TonProvider` | @ton/ton |
| Aptos | `AptosProvider` | @aptos-labs/ts-sdk |
| Sui | `SuiProvider` | @mysten/sui |
| NEAR | `NearProvider` | near-api-js |
| Bitcoin | `BitcoinProvider` | JSON-RPC |
| Filecoin | `FilecoinProvider` | Lotus RPC |

## Usage

```typescript
import { createProvider, EVMProvider } from 'wallet-chain-interaction';

// Using factory function
const provider = createProvider('evm', {
  rpcUrl: 'https://eth.llamarpc.com',
  chainId: 1,
});

// Or create directly
const ethProvider = new EVMProvider({
  rpcUrl: 'https://eth.llamarpc.com',
  chainId: 1,
});

// Get balance
const balance = await provider.getNativeBalance('0x...');
console.log(balance.formatted, balance.symbol); // "1.5" "ETH"

// Get token balance
const tokenBalance = await provider.getTokenBalance(
  '0x...',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
);

// Send transaction
const result = await provider.sendTransaction(privateKey, {
  to: '0x...',
  value: '1000000000000000000', // 1 ETH in wei
});

// Estimate gas
const gas = await provider.estimateGas(
  { to: '0x...', value: '1000000000000000000' },
  '0x...' // from address
);
```

## API Reference

All providers implement the `ChainProvider` interface:

### Balance Methods
- `getNativeBalance(address)` - Get native token balance
- `getTokenBalance(address, tokenAddress)` - Get token balance
- `getTokenBalances(address, tokenAddresses)` - Get multiple token balances

### Transaction Methods
- `sendTransaction(privateKey, params)` - Send a native transfer
- `sendTokenTransfer(privateKey, params)` - Send a token transfer
- `simulateTransaction(params, from)` - Simulate a transaction
- `estimateGas(params, from)` - Estimate transaction gas
- `getTransactionStatus(hash)` - Get transaction status
- `waitForTransaction(hash, confirmations)` - Wait for confirmation

### Chain State Methods
- `getBlockNumber()` - Get current block number
- `getBlock(blockNumber)` - Get block information
- `getChainInfo()` - Get chain metadata

### Account Methods
- `getAccountInfo(address)` - Get account information
- `getNonce(address)` - Get account nonce

### Utility Methods
- `isValidAddress(address)` - Validate address format
- `formatBalance(balance, decimals)` - Format balance to human-readable
- `parseBalance(formatted, decimals)` - Parse human-readable to smallest unit