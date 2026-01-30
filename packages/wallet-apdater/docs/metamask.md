# MetaMask

## Supported chains
- EVM

## Injected provider
- window.ethereum (EIP-1193 provider)
- MetaMask supports EIP-6963 for wallet discovery

## Connect / accounts
- provider.request({ method: 'eth_requestAccounts' })
- Only request accounts in response to a user action

## Send transaction (EVM)
- provider.request({ method: 'eth_sendTransaction', params: [tx] })

## Events / errors
- events: accountsChanged, chainChanged, connect, disconnect
- user rejection error code: 4001

## Sources
- https://docs.metamask.io/wallet/reference/provider-api
- https://docs.metamask.io/wallet/how-to/access-accounts
- https://docs.metamask.io/wallet/how-to/send-transactions
