# Phantom

## Supported chains
- Solana
- EVM
- Bitcoin

## Injected providers
- window.phantom.solana (also window.solana)
- window.phantom.ethereum (also window.ethereum)
- window.phantom.bitcoin
- Injected only on https/localhost, not in iframes

## Connect
- Solana: window.phantom.solana.connect()
- Bitcoin: window.phantom.bitcoin.requestAccounts()
- EVM: window.phantom.ethereum.request({ method: 'eth_requestAccounts' })

## Accounts / events
- Solana: accountChanged event
- Bitcoin: accountsChanged event

## Bitcoin provider methods
- requestAccounts
- signMessage
- signPSBT

## Sources
- https://docs.phantom.com/solana/detecting-the-provider
- https://docs.phantom.com/solana/establishing-a-connection
- https://docs.phantom.com/ethereum-monad-testnet-base-and-polygon/provider-api-reference
- https://docs.phantom.com/ethereum-monad-testnet-base-and-polygon/provider-api-reference/methods/request
- https://docs.phantom.com/bitcoin/establishing-a-connection
- https://docs.phantom.com/bitcoin/provider-api-reference
