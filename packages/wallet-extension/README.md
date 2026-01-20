# FistWallet Browser Extension

A multi-chain Web3 wallet browser extension supporting 9+ blockchain networks.

## Features

- 🔐 Secure HD wallet with BIP39 mnemonic
- 🌐 Multi-chain support (EVM, Bitcoin, Solana, Aptos, Sui, TRON, TON, NEAR, Filecoin)
- 💱 Built-in token swap aggregator
- 🎨 Modern glassmorphism UI
- 🔒 AES-256-GCM encryption
- 🔄 Auto-lock mechanism
- 🌉 DApp integration (window.ethereum, window.solana, window.bitcoin)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Loading the Extension

### Chrome/Edge

1. Run `pnpm dev` or `pnpm build`
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` directory

### Firefox

1. Run `pnpm build`
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `dist` directory

## Architecture

- **Popup**: React app for wallet UI
- **Background**: Service worker for message handling
- **Content Script**: Injected into web pages for DApp communication
- **Injected Script**: Provides window.ethereum and other providers

## Security

- Private keys encrypted with AES-256-GCM
- Password-based key derivation with PBKDF2 (100,000 iterations)
- Auto-lock after 15 minutes of inactivity
- Never stores unencrypted sensitive data

## License

ISC
