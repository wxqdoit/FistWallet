# Petra (Aptos) - Developers (Summary)

## Overview
- Petra is a Chrome extension wallet for Aptos; developer docs cover detection, connect, signing, events, errors, and user flows.
- Integration steps include: check for extension, connect, sign/submit tx, sign messages, listen to events, handle errors, and user navigation.

## Provider detection & install
- Petra injects `window.aptos` into the page.
- Detect install: `const isPetraInstalled = window.aptos;`
- If missing, prompt install and open `https://petra.app/` (or Chrome Web Store).

## Connect / account / disconnect
- Connect: `wallet.connect()` prompts user permission and returns address + public key.
- Account: `wallet.account()` returns current account.
- Disconnect: `wallet.disconnect()` clears the connection; app must reconnect to make requests.
- After first approval, Petra remembers the dApp domain for future sessions.

## Events
- Network:
  - `window.aptos.network()` returns current network.
  - `window.aptos.onNetworkChange((newNetwork) => { ... })` listens for changes.
  - Default networks: Testnet, Mainnet, Devnet.
- Account:
  - `window.aptos.onAccountChange((newAccount) => { ... })` fires on account changes.
  - If `newAccount` is null, prompt the user to reconnect.
- Disconnect:
  - `window.aptos.isConnected()` to check connection status.
  - `window.aptos.onDisconnect(() => { ... })` fires when user disconnects.

## Errors
- 4000: No Accounts
- 4001: User rejection
- 4100: Unauthorized (method/account not authorized)

## Sending a transaction
- Petra supports two flows:
  - **Sign and submit**: `signAndSubmitTransaction(transaction)` returns pending tx.
  - **Sign only**: `signTransaction(transaction)` returns signed tx (not submitted).
- Sign-only is not recommended; it warns users and is less safe.
- Example tx uses Aptos `entry_function_payload` (e.g., `0x1::coin::transfer`).

## Signing messages
- `wallet.signMessage(payload)` requests a message signature.
- Payload fields:
  - `message` (required), `nonce` (required)
  - optional `address`, `application`, `chainId` flags
- Response fields:
  - `fullMessage`, `signature`, `prefix` (APTOS)
  - `address`, `application`, `chainId`, `message`, `nonce`
- Verification commonly uses the returned `fullMessage` and the account public key.

## Account types
- Petra supports three account types:
  - **Ed25519** (most common; created via private key / recovery phrase / hardware wallet)
  - **Keyless** (social login, single-key generalized authentication)
  - **Secp256k1** (single-key generalized authentication)
- Return types differ by account type for `Signature`, `PublicKey`, and `AccountAuthenticator`.
- Wallet Adapter >= 4.0.0 returns concrete instance types; use `instanceof` to branch.

## Mobile deep links
### Web-to-mobile links
- Open dApp in Petra Explore:
  - `https://petra.app/explore?link=<dapp_url>`
- Send coins to address:
  - `https://petra.app/receive?address=<wallet_address>`

### Mobile-to-mobile flow
- Base URL: `petra://api/v1`
- Endpoints: `/connect`, `/disconnect`, `/signAndSubmit`, `/signMessage`
- Data parameter: base64-encoded JSON, passed as `data` query param.
- Connect flow:
  - Generate a key pair and send `appInfo`, `redirectLink`, `dappEncryptionPublicKey`.
  - Handle redirect with `response=approved|rejected` and `data`.
  - Derive shared encryption key using Petra returned `petraPublicEncryptedKey`.
- Signing & submit / sign message:
  - Build deep link with encrypted payload using the shared secret.

## Using Petra (user flows)
- Guides cover creating wallets/accounts, importing accounts, network switching, finding addresses/keys, faucet usage, sending coins, and viewing balances/transactions.

## Raw source files (local)
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_ba1046ad58b7.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_accounts-types_4c5df8a6bc81.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_connect-to-petra_6a5f770a42b5.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_mobile-deeplinks_c6e18021669c.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_event-listening_8a28371f55c2.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_errors_692cd0ec6f68.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_sending-a-transaction_ab74de5de7fb.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_signing-a-message_990c61dc7837.html`
- `packages/wallet-apdater/docs/_raw/petra/petra.app_docs_use_284aa8dc13f8.html`
