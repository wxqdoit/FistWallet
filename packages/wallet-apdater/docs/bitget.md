# Bitget Wallet

## Supported chains (used in adapters)
- EVM
- Solana
- Bitcoin

## Injected providers
- EVM: window.bitkeep.ethereum
- Solana: window.bitkeep.solana
- Bitcoin: window.bitkeep.unisat

## Connect
- EVM: provider.request({ method: 'eth_requestAccounts' })
- Solana: window.bitkeep.solana.connect()
- Bitcoin: window.bitkeep.unisat.requestAccounts()

## Notes
- Bitget docs recommend detecting providers via window.bitkeep[namespace]

## Sources
- https://docs.bitkeep.com/en/docs/guide/wallet/ethereum.html
- https://web3.bitget.com/en/docs/provider-api/solana.html
- https://web3.bitget.com/en/docs/provider-api/btc.html
