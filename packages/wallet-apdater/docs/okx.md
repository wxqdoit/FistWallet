# OKX Wallet

## Supported chains (used in adapters)
- EVM
- Solana
- Bitcoin

## Injected providers
- EVM: window.okxwallet (EIP-1193 style)
- Solana: window.okxwallet.solana
- Bitcoin: window.okxwallet.bitcoin

## Connect
- EVM: provider.request({ method: 'eth_requestAccounts' })
- Solana: window.okxwallet.solana.connect()
- Bitcoin: okxwallet.bitcoin.connect() or okxwallet.bitcoin.requestAccounts()

## Sources
- https://web3.okx.com/build/dev-docs/sdks/chains/evm/provider
- https://web3.okx.com/build/dev-docs/sdks/chains/solana/provider
- https://web3.okx.com/build/dev-docs/sdks/chains/bitcoin/provider
