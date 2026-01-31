Connect to the MetaMask extension
Building a cross-platform or mobile dapp?
For cross-platform development, mobile integration, or advanced features like QR codes and deeplinking, connect to MetaMask using MetaMask SDK instead.

You can connect your dapp to users' MetaMask wallets by detecting MetaMask in their browsers and connecting to their accounts. This page provides instructions for connecting to MetaMask using the wallet detection mechanism introduced by EIP-6963. This approach allows you to detect multiple installed wallets and connect to them without conflicts.

You can connect to the MetaMask browser extension using third-party libraries or directly using Vite.

note
Using the Wallet API enables your dapp to work both with the MetaMask extension and in the in-app browser of the MetaMask mobile app. However, we recommend using the SDK for a more consistent mobile connection.

Connect to MetaMask using third-party libraries
You can connect to MetaMask using the following third-party libraries that support EIP-6963:

Wagmi 2+
Reown AppKit
MIPD Store
RainbowKit
Web3-Onboard
ConnectKit
Connect to MetaMask directly using Vite
To connect to MetaMask directly, we recommend implementing support for EIP-6963 using the Vite build tool with vanilla TypeScript or React TypeScript.

Vanilla TypeScript
Follow these steps for creating a vanilla TypeScript project to connect to MetaMask:

1. Create a project
   Create a Vite project using the template for vanilla TypeScript:

npm create vite@latest vanilla-ts-6963 -- --template vanilla-ts
2. Set up the project
   In your Vite project, update src/vite-env.d.ts with the EIP-6963 interfaces:

vite-env.d.ts
/// <reference types="vite/client" />

interface EIP6963ProviderInfo {
rdns: string
uuid: string
name: string
icon: string
}

interface EIP6963ProviderDetail {
info: EIP6963ProviderInfo
provider: EIP1193Provider
}

type EIP6963AnnounceProviderEvent = {
detail: {
info: EIP6963ProviderInfo
provider: Readonly<EIP1193Provider>
}
}

interface EIP1193Provider {
isStatus?: boolean
host?: string
path?: string
sendAsync?: (
request: { method: string; params?: Array<unknown> },
callback: (error: Error | null, response: unknown) => void
) => void
send?: (
request: { method: string; params?: Array<unknown> },
callback: (error: Error | null, response: unknown) => void
) => void
request: (request: {
method: string
params?: Array<unknown>
}) => Promise<unknown>
}
note
In addition to the EIP-6963 interfaces, you need a EIP1193Provider interface (defined by EIP-1193), which is the foundational structure for Ethereum wallet providers, and represents the essential properties and methods for interacting with MetaMask and other Ethereum wallets in JavaScript.

3. Update main.ts
   Update src/main.ts with the following code:

main.ts
import "./style.css"
import { listProviders } from "./providers.ts"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="providerButtons"></div>
  </div>
`

listProviders(document.querySelector<HTMLDivElement>("#providerButtons")!)
The querySelector finds and returns the first HTML element that matches the CSS selector app, and sets its innerHTML. You need to include a basic HTML structure with an inner div to inject a list of buttons, each representing a detected wallet provider.

You'll create the listProviders function in the next step, and pass an argument which represents the div element.

4. Connect to wallets
   Create a file src/providers.ts with the following code:

providers.ts
declare global {
interface WindowEventMap {
"eip6963:announceProvider": CustomEvent
}
}

// Connect to the selected provider using eth_requestAccounts.
const connectWithProvider = async (
wallet: EIP6963AnnounceProviderEvent["detail"]
) => {
try {
await wallet.provider.request({ method: "eth_requestAccounts" })
} catch (error) {
console.error("Failed to connect to provider:", error)
}
}

// Display detected providers as connect buttons.
export function listProviders(element: HTMLDivElement) {
window.addEventListener(
"eip6963:announceProvider",
(event: EIP6963AnnounceProviderEvent) => {
const button = document.createElement("button")

      button.innerHTML = `
        <img src="${event.detail.info.icon}" alt="${event.detail.info.name}" />
        <div>${event.detail.info.name}</div>
      `

      // Call connectWithProvider when a user selects the button.
      button.onclick = () => connectWithProvider(event.detail)
      element.appendChild(button)
    }
)

// Notify event listeners and other parts of the dapp that a provider is requested.
window.dispatchEvent(new Event("eip6963:requestProvider"))
}
The connectWithProvider function connects the user to the selected provider using eth_requestAccounts. The wallet object is passed as an argument to the function, indicating the argument type.

The listProviders function uses a simplified approach. Instead of mapping and joining an entire block of HTML, it directly passes the event.detail object to the connectWithProvider function when a provider is announced.

5. View the project
   Run the following command to view and test the Vite project in your browser:

npm run dev
Example
See the vanilla TypeScript example for more information. You can clone the repository and run the example locally using npm i && npm run dev.

React TypeScript
Follow these steps for creating a React TypeScript project to connect to MetaMask:

1. Create a project
   Create a Vite project using the template for React TypeScript:

npm create vite@latest react-ts-6963 -- --template react-ts
2. Set up the project
   In your Vite project, update src/vite-env.d.ts with the EIP-6963 interfaces:

vite-env.d.ts
/// <reference types="vite/client" />

interface EIP6963ProviderInfo {
rdns: string
uuid: string
name: string
icon: string
}

interface EIP6963ProviderDetail {
info: EIP6963ProviderInfo
provider: EIP1193Provider
}

type EIP6963AnnounceProviderEvent = {
detail: {
info: EIP6963ProviderInfo
provider: Readonly<EIP1193Provider>
}
}

interface EIP1193Provider {
isStatus?: boolean
host?: string
path?: string
sendAsync?: (
request: { method: string; params?: Array<unknown> },
callback: (error: Error | null, response: unknown) => void
) => void
send?: (
request: { method: string; params?: Array<unknown> },
callback: (error: Error | null, response: unknown) => void
) => void
request: (request: {
method: string
params?: Array<unknown>
}) => Promise<unknown>
}
note
In addition to the EIP-6963 interfaces, you need a EIP1193Provider interface (defined by EIP-1193), which is the foundational structure for Ethereum wallet providers, and represents the essential properties and methods for interacting with MetaMask and other Ethereum wallets in JavaScript.

3. Update App.tsx
   Update src/App.tsx with the following code:

App.tsx
import "./App.css"
import { DiscoverWalletProviders } from "./components/WalletProviders"

function App() {
return (
<DiscoverWalletProviders/>
)
}

export default App
This code renders the WalletProviders component that you'll create in the next step, which contains the logic for detecting and connecting to wallet providers.

4. Detect and connect to wallets
   Create a src/components directory and add a file WalletProviders.tsx with the following code:

WalletProviders.tsx
import { useState } from "react"
import { useSyncProviders } from "../hooks/useSyncProviders"
import { formatAddress } from "../utils"

export const DiscoverWalletProviders = () => {
const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
const [userAccount, setUserAccount] = useState<string>("")
const providers = useSyncProviders()

// Connect to the selected provider using eth_requestAccounts.
const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
const accounts: string[] | undefined =
await (
providerWithInfo.provider
.request({ method: "eth_requestAccounts" })
.catch(console.error)
) as string[] | undefined;

    if (accounts?.[0]) {
      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    }
}

// Display detected providers as connect buttons.
return (
<>
<h2>Wallets Detected:</h2>
<div>
{
providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
<button key={provider.info.uuid} onClick={() => handleConnect(provider)} >
<img src={provider.info.icon} alt={provider.info.name} />
<div>{provider.info.name}</div>
</button>
)) :
<div>
No Announced Wallet Providers
</div>
}
</div>
<hr />
<h2>{userAccount ? "" : "No "}Wallet Selected</h2>
{userAccount &&
<div>
<div>
<img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
<div>{selectedWallet.info.name}</div>
<div>({formatAddress(userAccount)})</div>
</div>
</div>
}
</>
)
}
In this code:

selectedWallet is a state variable that holds the user's most recently selected wallet.
userAccount is a state variable that holds the user's connected wallet's address.
useSyncProviders is a custom hook that returns the providers array (wallets installed in the browser).
The handleConnect function takes a providerWithInfo, which is an EIP6963ProviderDetail object. That object is used to request the user's accounts from the provider using eth_requestAccounts.

If the request succeeds, the selectedWallet and userAccount local state variables are set.

Then, the component maps over the providers array and renders a button for each detected provider.

Finally, if the userAccount state variable is not empty, the selected wallet icon, name, and address are displayed.

5. Add React hooks
   Create a src/hooks directory and add a file store.ts with the following code:

hooks/store.ts
declare global {
interface WindowEventMap {
"eip6963:announceProvider": CustomEvent
}
}

// An array to store the detected wallet providers.
let providers: EIP6963ProviderDetail[] = []

export const store = {
value: () => providers,
subscribe: (callback: () => void) => {
function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
if (providers.map((p) => p.info.uuid).includes(event.detail.info.uuid))
return
providers = [...providers, event.detail]
callback()
}

    // Listen for eip6963:announceProvider and call onAnnouncement when the event is triggered.
    window.addEventListener("eip6963:announceProvider", onAnnouncement)

    // Dispatch the event, which triggers the event listener in the MetaMask wallet.
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    // Return a function that removes the event listener.
    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement)
},
}
Also, add a file useSyncProviders.ts with the following code to the hooks directory:

hooks/useSyncProviders.ts
import { useSyncExternalStore } from "react"
import { store } from "./store"

export const useSyncProviders = () =>
useSyncExternalStore(store.subscribe, store.value, store.value)
This hook allows you to subscribe to MetaMask events, read updated values, and update components. It uses the store.value and store.subscribe methods defined in the store.ts hook.

6. Create utility functions
   Create a src/utils directory and add a file index.ts with the following code:

index.ts
export const formatBalance = (rawBalance: string) => {
const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2)
return balance
}

export const formatChainAsNum = (chainIdHex: string) => {
const chainIdNum = parseInt(chainIdHex)
return chainIdNum
}

export const formatAddress = (addr: string) => {
const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2)
return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(39)}`
}
This is a good place to store utility functions that you might need to reuse throughout your dapp. This example only uses the formatAddress function, but the others might be useful for other applications


Access a user's accounts
User accounts are used in a variety of contexts in Ethereum, including as identifiers and for signing transactions. To request a signature from a user or have a user approve a transaction, your dapp can access the user's accounts using the eth_requestAccounts RPC method.

note
eth_requestAccounts internally calls wallet_requestPermissions to request permission to call the restricted eth_accounts method.

When accessing a user's accounts:

Only initiate a connection request in response to direct user action, such as selecting a connect button.
Always disable the connect button while the connection request is pending.
Never initiate a connection request on page load.
note
You can also access users' accounts on some non-EVM networks.

Create a connect button
Important
This section describes how to create a single connect button. When connecting to multiple wallets, use the Connect to the MetaMask extension guide to create multiple connect buttons.

We recommend providing a button to allow users to connect MetaMask to your dapp. Selecting this button should call eth_requestAccounts to access the user's accounts.

For example, the following JavaScript code accesses the user's accounts when they select a connect button:

index.js
// You should only attempt to request the user's account in response to user interaction, such as
// selecting a button. Otherwise, you pop-up spam the user like it's 1999. If you fail to retrieve
// the user's account, you should encourage the user to initiate the attempt.
const ethereumButton = document.querySelector(".enableEthereumButton")
const showAccount = document.querySelector(".showAccount")

ethereumButton.addEventListener("click", () => {
getAccount()
})

// While awaiting the call to eth_requestAccounts, you should disable any buttons the user can
// select to initiate the request. MetaMask rejects any additional requests while the first is still
// pending.
async function getAccount() {
const accounts = await provider // Or window.ethereum if you don't support EIP-6963.
.request({ method: "eth_requestAccounts" })
.catch((err) => {
if (err.code === 4001) {
// EIP-1193 userRejectedRequest error.
// If this happens, the user rejected the connection request.
console.log("Please connect to MetaMask.")
} else {
console.error(err)
}
})
const account = accounts[0]
showAccount.innerHTML = account
}
The following HTML code displays the button and the current account:

index.html
<!-- Display a connect button and the current account -->
<button class="enableEthereumButton">Enable Ethereum</button>
<h2>Account: <span class="showAccount"></span></h2>
Handle accounts
Use the eth_accounts RPC method to handle user accounts. Listen to the accountsChanged provider event to be notified when the user changes accounts.

The following code handles user accounts and detects when the user changes accounts:

index.js
let currentAccount = null
provider // Or window.ethereum if you don't support EIP-6963.
.request({ method: "eth_accounts" })
.then(handleAccountsChanged)
.catch((err) => {
// Some unexpected error.
// For backwards compatibility reasons, if no accounts are available, eth_accounts returns an
// empty array.
console.error(err)
})

// Note that this event is emitted on page load. If the array of accounts is non-empty, you're
// already connected.
provider // Or window.ethereum if you don't support EIP-6963.
.on("accountsChanged", handleAccountsChanged)

// eth_accounts always returns an array.
function handleAccountsChanged(accounts) {
if (accounts.length === 0) {
// MetaMask is locked or the user has not connected any accounts.
console.log("Please connect to MetaMask.")
} else if (accounts[0] !== currentAccount) {
// Reload your interface with accounts[0].
currentAccount = accounts[0]
// Update the account displayed (see the HTML for the connect button)
showAccount.innerHTML = currentAccount
}
}
note
eth_accounts now returns the full list of accounts for which the user has permitted access to. Previously, eth_accounts returned at most one account in the accounts array. The first account in the array will always be considered the user's "selected" account.

Disconnect a user's accounts
Since eth_requestAccounts internally calls wallet_requestPermissions for permission to call eth_accounts, you can use wallet_revokePermissions to revoke this permission, revoking your dapp's access to the user's accounts.

This is useful as a method for users to log out (or disconnect) from your dapp. You can then use wallet_getPermissions to determine whether the user is connected or disconnected to your dapp.

See how to revoke permissions for an example.

Detect a user's network
It's important to keep track of the user's network chain ID because all RPC requests are submitted to the currently connected network.

Use the eth_chainId RPC method to detect the chain ID of the user's current network. Listen to the chainChanged provider event to detect when the user changes networks.

For example, the following code detects a user's network and when the user changes networks:

index.js
const chainId = await provider // Or window.ethereum if you don't support EIP-6963.
.request({ method: "eth_chainId" })

provider // Or window.ethereum if you don't support EIP-6963.
.on("chainChanged", handleChainChanged)

function handleChainChanged(chainId) {
// We recommend reloading the page, unless you must do otherwise.
window.location.reload()
}


Add a network
In some cases, such as when interacting with smart contracts, your dapp must connect a user to a new network in MetaMask. Instead of the user adding a new network manually, which requires them to configure RPC URLs and chain IDs, your dapp can use the wallet_addEthereumChain and wallet_switchEthereumChain RPC methods to prompt the user to add a specific, pre-configured network to their MetaMask wallet.

These methods are specified by EIP-3085 and EIP-3326, and we recommend using them together.

wallet_addEthereumChain creates a confirmation asking the user to add the specified network to MetaMask.
wallet_switchEthereumChain creates a confirmation asking the user to switch to the specified network.
The confirmations look like the following:

Add network confirmation
Switch network confirmation
Development and non-EVM networks
To add a local development network such as Hardhat to MetaMask, see Run a development network.
To add a non-EVM network such as Starknet to MetaMask, see Use non-EVM networks.
Example
The following is an example of using wallet_addEthereumChain and wallet_switchEthereumChain to prompt a user to add and switch to a new network:

try {
await provider // Or window.ethereum if you don't support EIP-6963.
.request({
method: "wallet_switchEthereumChain",
params: [{ chainId: "0xf00" }],
})
} catch (switchError) {
// This error code indicates that the chain has not been added to MetaMask.
if (switchError.code === 4902) {
try {
await provider // Or window.ethereum if you don't support EIP-6963.
.request({
method: "wallet_addEthereumChain",
params: [
{
chainId: "0xf00",
chainName: "...",
rpcUrls: ["https://..."] /* ... */,
},
],
})
} catch (addError) {
// Handle "add" error.
}
}
// Handle other "switch" errors.
}
Sign in with Ethereum
You can set up Sign-In with Ethereum (SIWE) to enable users to easily sign in to your dapp by authenticating with their MetaMask wallet.

MetaMask supports the SIWE standard message format as specified in ERC-4361. When your dapp prompts a user to sign a message that follows the SIWE format, MetaMask parses the message and gives the user a friendly interface prompting them to sign in to your dapp:

Sign-in with Ethereum request

Domain binding
MetaMask supports domain binding with SIWE to help prevent phishing attacks. When a site asks a user to sign a SIWE message, but the domain in the message doesn't match the site the user is on, MetaMask displays a warning in the sign-in interface. The user must explicitly select to proceed, accepting the risk of a phishing attack.

important
MetaMask displays a prominent warning for mismatched domains, but does not block users from bypassing the warning and accepting the sign-in request. This is to not break existing dapps that may have use cases for mismatched domains.

Sign-in bad domain
Sign-in bad domain pop-up
Example
The following is an example of setting up SIWE with MetaMask using personal_sign:

index.js
const siweSign = async (siweMessage) => {
try {
const from = accounts[0]
const msg = `0x${Buffer.from(siweMessage, "utf8").toString("hex")}`
const sign = await provider // Or window.ethereum if you don't support EIP-6963.
.request({
method: "personal_sign",
params: [msg, from],
})
siweResult.innerHTML = sign
} catch (err) {
console.error(err)
siweResult.innerHTML = `Error: ${err.message}`
}
}

siwe.onclick = async () => {
const domain = window.location.host
const from = accounts[0]
const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z`
siweSign(siweMessage)
}
The following HTML displays the SIWE button:

index.html
<h4>Sign-In with Ethereum</h4>
<button type="button" id="siwe">Sign-In with Ethereum</button>
<p class="alert">Result:<span id="siweResult"></span></p>

Sign data
You can use the following RPC methods to request cryptographic signatures from users:

eth_signTypedData_v4 - Use this method to request the most human-readable signatures that are efficient to process onchain. We recommend this for most use cases.
personal_sign - Use this method for the easiest way to request human-readable signatures that don't need to be efficiently processed onchain.
caution
eth_sign is deprecated.

note
MetaMask supports signing transactions using Trezor and Ledger hardware wallets. These wallets only support signing data using personal_sign. If you can't log in to a dapp when using a Ledger or Trezor, the dapp might be requesting you to sign data using an unsupported method, in which case we recommend using your standard MetaMask account.

Use eth_signTypedData_v4
eth_signTypedData_v4 provides the most human-readable signatures that are efficient to process onchain. It follows the EIP-712 specification to allow users to sign typed structured data that can be verified onchain. It renders the structured data in a useful way (for example, displaying known account names in place of addresses).

eth_signTypedData_v4


An eth_signTypedData_v4 payload uses a standard format of encoding structs, but has a different format for the top-level struct that is signed, which includes some metadata about the verifying contract to provide replay protection of these signatures between different contract instances.

We recommend using eth-sig-util to generate and validate signatures. You can use eip712-codegen to generate most of the Solidity required to verify these signatures onchain. It currently doesn't generate the top-level struct verification code, so you must write that part manually. See this example implementation.

caution
Since the top-level struct type's name and the domain.name are presented to the user prominently in the confirmation, consider your contract name, the top-level struct name, and the struct keys to be a user-facing security interface. Ensure your contract is as readable as possible to the user.

Example
The following is an example of using eth_signTypedData_v4 with MetaMask:

index.js
signTypedDataV4Button.addEventListener("click", async function (event) {
event.preventDefault()

// eth_signTypedData_v4 parameters. All of these parameters affect the resulting signature.
const msgParams = JSON.stringify({
domain: {
// This defines the network, in this case, Mainnet.
chainId: 1,
// Give a user-friendly name to the specific contract you're signing for.
name: "Ether Mail",
// Add a verifying contract to make sure you're establishing contracts with the proper entity.
verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
// This identifies the latest version.
version: "1",
},

    // This defines the message you're proposing the user to sign, is dapp-specific, and contains
    // anything you want. There are no required fields. Be as explicit as possible when building out
    // the message schema.
    message: {
      contents: "Hello, Bob!",
      attachedMoneyInEth: 4.2,
      from: {
        name: "Cow",
        wallets: [
          "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
          "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
        ],
      },
      to: [
        {
          name: "Bob",
          wallets: [
            "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
            "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
            "0xB0B0b0b0b0b0B000000000000000000000000000",
          ],
        },
      ],
    },
    // This refers to the keys of the following types object.
    primaryType: "Mail",
    types: {
      // This refers to the domain the contract is hosted on.
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      // Not an EIP712Domain definition.
      Group: [
        { name: "name", type: "string" },
        { name: "members", type: "Person[]" },
      ],
      // Refer to primaryType.
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person[]" },
        { name: "contents", type: "string" },
      ],
      // Not an EIP712Domain definition.
      Person: [
        { name: "name", type: "string" },
        { name: "wallets", type: "address[]" },
      ],
    },
})

var from = await web3.eth.getAccounts()

var params = [from[0], msgParams]
var method = "eth_signTypedData_v4"

provider // Or window.ethereum if you don't support EIP-6963.
.sendAsync(
{
method,
params,
from: from[0],
},
function (err, result) {
if (err) return console.dir(err)
if (result.error) {
alert(result.error.message)
}
if (result.error) return console.error("ERROR", result)
console.log("TYPED SIGNED:" + JSON.stringify(result.result))

        const recovered = sigUtil.recoverTypedSignature_v4({
          data: JSON.parse(msgParams),
          sig: result.result,
        })

        if (
          ethUtil.toChecksumAddress(recovered) ===
          ethUtil.toChecksumAddress(from)
        ) {
          alert("Successfully recovered signer as " + from)
        } else {
          alert(
            "Failed to verify signer when comparing " + result + " to " + from
          )
        }
      }
    )
})
The following HTML displays a sign button:

index.html
<h3>Sign typed data v4</h3>
<button type="button" id="signTypedDataV4Button">eth_signTypedData_v4</button>


Send transactions
You can send a transaction in MetaMask using the eth_sendTransaction RPC method.

note
To send batch transactions, use wallet_sendCalls.

For example, the following JavaScript gets the user's accounts and sends a transaction when they select each button:

index.js
const ethereumButton = document.querySelector(".enableEthereumButton");
const sendEthButton = document.querySelector(".sendEthButton");

let accounts = [];

sendEthButton.addEventListener("click", () => {
provider // Or window.ethereum if you don't support EIP-6963.
.request({
method: "eth_sendTransaction",
params: [
{
from: accounts[0], // The user's active address.
to: "0x0000000000000000000000000000000000000000", // Address of the recipient. Not used in contract creation transactions.
value: "0x0", // Value transferred, in wei. Only required to send ether to the recipient from the initiating external account.
gasLimit: "0x5028", // Customizable by the user during MetaMask confirmation.
maxPriorityFeePerGas: "0x3b9aca00", // Customizable by the user during MetaMask confirmation.
maxFeePerGas: "0x2540be400", // Customizable by the user during MetaMask confirmation.
},
],
})
.then((txHash) => console.log(txHash))
.catch((error) => console.error(error));
});

ethereumButton.addEventListener("click", () => {
getAccount();
});

async function getAccount() {
accounts = await provider // Or window.ethereum if you don't support EIP-6963.
.request({ method: "eth_requestAccounts" });
}
The following HTML displays the buttons:

index.html
<button class="enableEthereumButton btn">Enable Ethereum</button>
<button class="sendEthButton btn">Send ETH</button>
Transaction parameters
The transaction parameters depend on the transaction type. The following are examples of transaction objects for each type:

Legacy transaction
Access list transaction
EIP-1559 transaction
{
nonce: "0x0", // Number of transactions made by the sender before this one.
gasPrice: "0x09184e72a000", // Gas price, in wei, provided by the sender.
gasLimit: "0x2710", // Maximum gas provided by the sender.
to: "0x0000000000000000000000000000000000000000", // Address of the recipient. Not used in contract creation transactions.
value: "0x0", // Value transferred, in wei.
data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057", // Used for defining contract creation and interaction.
v: "0x1", // ECDSA recovery ID.
r: "0xa07fd6c16e169f0e54b394235b3a8201101bb9d0eba9c8ae52dbdf556a363388", // ECDSA signature r.
s: "0x36f5da9310b87fefbe9260c3c05ec6cbefc426f1ff3b3a41ea21b5533a787dfc", // ECDSA signature s.
}
Nonce
note
MetaMask ignores this field.

In Ethereum, every transaction has a nonce, so each transaction can only be processed by the blockchain once. To be a valid transaction, either:

The nonce must be 0.
A transaction with a nonce of the previous number, from the same account, must have been processed.
This means that transactions are always processed in order for a given account.

Nonces are easy to mess up, especially when a user is interacting with multiple applications with pending transactions using the same account, potentially across multiple devices. Because of this, MetaMask doesn't allow dapp developers to customize nonces. Instead, MetaMask assists the user in managing their transaction queue themselves.

Gas price
gasPrice is an optional parameter. It is used in legacy transactions and specifies the gas price the sender is willing to pay for the transaction. MetaMask automatically configures gas settings, but users can also customize these settings.

Gas limit
gasLimit is an optional parameter. It specifies the maximum amount of gas units the sender is willing to pay for the transaction. MetaMask automatically sets this parameter, but users can also customize their gas settings.

Max priority fee per gas
maxPriorityFeePerGas is an optional parameter. It is used in EIP-1559 transactions and specifies the maximum fee the sender is willing to pay per gas above the base fee, in order to get their transaction prioritized. MetaMask automatically sets this parameter, but users can also customize their gas settings.

Max fee per gas
maxFeePerGas is an optional parameter. It is used in EIP-1559 transactions and specifies the maximum total fee (base fee + priority fee) the sender is willing to pay per gas. MetaMask automatically sets this parameter, but users can also customize their gas settings.

To
The to parameter is a hex-encoded Ethereum address. It's required for transactions with a recipient (all transactions except for contract creation).

Contract creation occurs when there is no to value but there is a data value.

Value
The value parameter is a hex-encoded value of the network's native currency to send. On Mainnet, this is ether, which is denominated in wei.

These numbers are often far higher precision than native JavaScript numbers, and can cause unpredictable behavior if not anticipated. We recommend using BN.js when manipulating values intended for Ethereum.

Data
The data parameter is required for smart contract creation.

This field is also used for specifying contract methods and their parameters. See the Solidity ABI spec for more information on how the data is encoded.

Chain ID
note
MetaMask ignores this field.

The chain ID is derived from the user's current selected network. Use eth_chainId to get the user's chain ID. If you need the network version, use net_version.

In the future, MetaMask might allow connecting to multiple networks at the same time, at which point this parameter will become important, so it might be useful to be in the habit of including it now.




Send batch transactions
You can send and manage batch transactions in MetaMask, using the methods specified by EIP-5792:

wallet_getCapabilities - Query whether support for atomic batch transactions is available.
wallet_sendCalls - Submit multiple transactions to be processed atomically by MetaMask.
wallet_getCallsStatus - Track the status of your transaction batch.
About atomic batch transactions
An atomic batch transaction is a group of transactions that are executed together as a single unit. When a dapp requests to submit a batch of transactions atomically, MetaMask may prompt users to upgrade their externally owned account (EOA) to a MetaMask smart account. If the user accepts, MetaMask proceeds to upgrade the account and process the request as a single atomic transaction as specified by EIP-7702.

MetaMask Smart Accounts
MetaMask Smart Accounts are ERC-4337 smart contract accounts that support programmable account behavior and advanced features such as multi-signature approvals, transaction batching, and custom security policies.

See the Smart Accounts Kit documentation for more information about smart accounts and their capabilities.

The key benefits of atomic batch transactions include:

Fewer clicks and less friction - Users only need to review and approve a single wallet confirmation, instead of multiple confirmations. For example, users can confirm a spending cap and swap in one step instead of two.
Faster completion times - Only a single atomic transaction is confirmed onchain, instead of multiple individual transactions.
Reduced gas fees - When multiple transactions are executed atomically, users only need to pay a single gas fee.
You can send batch transactions using third-party libraries or directly in your dapp.

Use third-party libraries
You can send batch transactions using the following third-party libraries that support EIP-5792:

Wagmi
Viem
thirdweb
Send batch transactions
1. Query whether atomic batch is supported
   Use wallet_getCapabilities to query whether MetaMask supports atomic batch transactions for a specific address and specific chain IDs. For example:

index.js
const capabilities = await provider // Or window.ethereum if you don't support EIP-6963.
.request({
"method": "wallet_getCapabilities",
"params": [
"0xd46e8dd67c5d32be8058bb8eb970870f07244567", // The user's wallet address.
["0x1", "0xaa36a7"] // (Optional) A list of chain IDs to query for.
],
});
This method returns the status of the atomic capability for each chain ID. For example:

{
"0x1": {
"atomic": {
"status": "ready"
}
},
"0xaa36a7": {
"atomic": {
"status": "supported"
}
}
}
The atomic capability can have a status of supported or ready:

supported means MetaMask supports atomic batch transactions for the account and chain ID.
ready means MetaMask will prompt the user to upgrade their account to a MetaMask smart account. If the user approves, the status will upgrade to supported.
If the atomic capability is not supported or ready for a specified chain ID, MetaMask will not return anything for that chain ID. If you don't specify any chain IDs in wallet_getCapabilities, MetaMask will return all chains in the wallet where the atomic capability is supported or ready.

Supported networks
Atomic batch unsupported
If the user has already upgraded their account to a third-party smart contract account, MetaMask does not currently support atomic batch transactions for that account.
If atomic batch is not supported, fall back to eth_sendTransaction instead of wallet_sendCalls, and eth_getTransactionReceipt instead of wallet_getCallsStatus.
2. Submit a batch of transactions
   Use wallet_sendCalls to submit a batch of transactions. For example:

index.js
const result = await provider. // Or window.ethereum if you don't support EIP-6963.
request({
"method": "wallet_sendCalls",
"params": [
{
version: "2.0.0", // The version of the API format. This must be 2.0.0.
from: "0xd46e8dd67c5d32be8058bb8eb970870f07244567", // The sender's address.
chainId: "0xaa36a7", // The chain ID, which must match the currently selected network.
atomicRequired: true, // Whether or not atomicity is required.
calls: [ // The list of calls to send as a batch.
{
to: "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
value: "0x0"
},
{
to: "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
value: "0x0"
}
]
}
],
});
Atomic required parameter
MetaMask only supports using wallet_sendCalls to send atomic batch transactions (not sequential batch transactions), so atomicRequired can be set to either true or false. If the atomic capability is not supported, wallet_sendCalls will return an error.

This method returns a batch ID that you can use to track the status of the batch. For example:

{
"id": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331"
}
3. Track the status of the batch of transactions
   Use wallet_getCallsStatus to track the status of the submitted batch of transactions, using the batch ID returned by wallet_sendCalls. For example:

index.js
const status = await provider // Or window.ethereum if you don't support EIP-6963.
.request({
"method": "wallet_getCallsStatus",
"params": [
"0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331" // Batch ID.
],
});
This method returns status information about the batch of transactions, including:

The status code of the batch.
Whether the batch was executed atomically. Currently, this will always be true if the execution was successful.
A list of transaction receipts.
For example:

{
"version": "2.0.0",
"chainId": "0xaa36a7",
"id": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331",
"status": 200, // Status code. 200 means confirmed.
"atomic": true, // Whether the calls were executed atomically.
"receipts": [ // List of transaction receipts.
{
"logs": [
{
"address": "0xa922b54716264130634d6ff183747a8ead91a40b",
"topics": [
"0x5a2a90727cc9d000dd060b1132a5c977c9702bb3a52afe360c9c22f0e9451a68"
],
"data": "0xabcd"
}
],
"status": "0x1",
"blockHash": "0xf19bbafd9fd0124ec110b848e8de4ab4f62bf60c189524e54213285e7f540d4a",
"blockNumber": "0xabcd",
"gasUsed": "0xdef",
"transactionHash": "0x9b7bb827c2e5e3c1a0a44dc53e573aa0b3af3bd1f9f5ed03071b100bb039eaff"
}
]
}
note
If the calls were executed atomically in a single transaction, a single receipt is returned.

In some cases, calls can be executed atomically but in multiple transactions (for example, using eth_bundle on an L2 network resistant to reorgs). In these cases, atomic is true but multiple receipts are returned.


Manage permissions
To call a restricted RPC method, your dapp must request permission from the user using the wallet_requestPermissions RPC method. You can get the user's current permissions using wallet_getPermissions, and revoke permissions previously granted to your dapp using wallet_revokePermissions. These methods are specified by EIP-2255 and MIP-2.

wallet_requestPermissions creates a confirmation asking the user to connect to an account and allow the dapp to call the requested method. The confirmation screen describes the functions and data the requested method can access. For example, something like the following confirmation displays when you request permission to call the restricted method eth_accounts:

Request permissions confirmation 1
Request permissions confirmation 2
note
To access accounts, we recommend using eth_requestAccounts, which automatically asks for permission to use eth_accounts by calling wallet_requestPermissions internally. See how to access a user's accounts for more information. Granting permission for eth_accounts also grants access to eth_sendTransaction, personal_sign, and eth_signTypedData_v4.

Request permissions example
The following example uses wallet_requestPermissions to request permission from the user to call eth_accounts:

document.getElementById("requestPermissionsButton", requestPermissions)

function requestPermissions() {
provider // Or window.ethereum if you don't support EIP-6963.
.request({
method: "wallet_requestPermissions",
params: [{ eth_accounts: {} }],
})
.then((permissions) => {
const accountsPermission = permissions.find(
(permission) => permission.parentCapability === "eth_accounts"
)
if (accountsPermission) {
console.log("eth_accounts permission successfully requested!")
}
})
.catch((error) => {
if (error.code === 4001) {
// EIP-1193 userRejectedRequest error
console.log("Permissions needed to continue.")
} else {
console.error(error)
}
})
}
Revoke permissions example
The following example uses wallet_revokePermissions to revoke the dapp's permission to call eth_accounts:

await provider // Or window.ethereum if you don't support EIP-6963.
.request({
method: "wallet_revokePermissions",
params: [
{
eth_accounts: {},
},
],
})
Ethereum provider API
This page is a reference for the Ethereum provider API of MetaMask's Wallet API. MetaMask injects the provider API into websites visited by its users using the window.ethereum provider object. You can use the provider properties, methods, and events in your dapp.

Note
MetaMask supports EIP-6963, which introduces an alternative wallet detection mechanism to the window.ethereum injected provider. This alternative mechanism enables dapps to support wallet interoperability by discovering multiple injected wallet providers in a user's browser. We recommend using this mechanism to connect to MetaMask.

You can access the provider API using the selected EIP-6963 provider object. Throughout this documentation, we refer to the selected provider using provider.

Properties
isMetaMask
This property is true if the user has MetaMask installed, and false otherwise.

note
This property is non-standard. Non-MetaMask providers may also set this property to true.

Example
provider.isMetaMask // Or window.ethereum.isMetaMask if you don't support EIP-6963.
Methods
isConnected()
Indicates whether the provider is connected to the current chain. If the provider isn't connected, the page must be reloaded to re-establish the connection. See the connect and disconnect events for more information.

note
This method is unrelated to accessing a user's accounts. In the provider interface, "connected" and "disconnected" refer to whether the provider can make RPC requests to the current chain.

Parameters
None.

Returns
true if the provider is connected to the current chain, false otherwise.

Example
provider.isConnected() // Or window.ethereum.isConnected() if you don't support EIP-6963.
request()
This method is used to submit JSON-RPC API requests to Ethereum using MetaMask.

Parameters
An object containing:

method: string - The JSON-RPC API method name.
params: array or object - (Optional) Parameters of the RPC method. In practice, if a method has parameters, they're almost always of type array.
Returns
A promise that resolves to the result of the RPC method call. If the request fails, the promise rejects with an error.

Example
The following is an example of using request() to call eth_sendTransaction:

provider // Or window.ethereum if you don't support EIP-6963.
.request({
method: "eth_sendTransaction",
params: [
{
from: "0xb60e8dd61c5d32be8058bb8eb970870f07233155",
to: "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
gas: "0x76c0", // 30400
gasPrice: "0x9184e72a000", // 10000000000000
value: "0x9184e72a", // 2441406250
data: "0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
},
],
})
.then((result) => {
// The result varies by RPC method.
// For example, this method returns a transaction hash hexadecimal string upon success.
})
.catch((error) => {
// If the request fails, the Promise rejects with an error.
})
_metamask.isUnlocked()
caution
This method is experimental. Use it at your own risk.

Indicates if MetaMask is unlocked by the user. MetaMask must be unlocked to perform any operation involving user accounts. Note that this method doesn't indicate if the user has exposed any accounts to the caller.

Parameters
None.

Returns
A promise that resolves to true if MetaMask is unlocked by the user, and false otherwise.

Example
provider._metamask.isUnlocked() // Or window.ethereum._metamask.isUnlocked() if you don't support EIP-6963.
Events
The MetaMask provider emits events using the Node.js EventEmitter API. The following is an example of listening to the accountsChanged event.

You should remove listeners after you're done listening to an event (for example, on component unmount in React).

function handleAccountsChanged(accounts) {
// Handle new accounts, or lack thereof.
}

provider // Or window.ethereum if you don't support EIP-6963.
.on("accountsChanged", handleAccountsChanged)

// Later

provider // Or window.ethereum if you don't support EIP-6963.
.removeListener("accountsChanged", handleAccountsChanged)
accountsChanged
provider // Or window.ethereum if you don't support EIP-6963.
.on("accountsChanged", handler: (accounts: Array<string>) => void);
The provider emits this event when the return value of the eth_accounts RPC method changes. eth_accounts returns either an empty array, or an array that contains the addresses of the accounts the caller is permitted to access with the most recently used account first. Callers are identified by their URL origin, which means that all sites with the same origin share the same permissions.

This means that the provider emits accountsChanged when the user's exposed account address changes. Listen to this event to handle accounts.

chainChanged
provider // Or window.ethereum if you don't support EIP-6963.
.on("chainChanged", handler: (chainId: string) => void);
The provider emits this event when the currently connected chain changes. Listen to this event to detect a user's network.

connect
interface ConnectInfo {
chainId: string;
}

provider // Or window.ethereum if you don't support EIP-6963.
.on("connect", handler: (connectInfo: ConnectInfo) => void);
The provider emits this event when it's first able to submit RPC requests to a chain. We recommend listening to this event and using the isConnected() provider method to determine when the provider is connected.

disconnect
provider // Or window.ethereum if you don't support EIP-6963.
.on("disconnect", handler: (error: ProviderRpcError) => void);
The provider emits this event if it becomes unable to submit RPC requests to a chain. In general, this only happens due to network connectivity issues or some unforeseen error.

When the provider emits this event, it doesn't accept new requests until the connection to the chain is re-established, which requires reloading the page. You can also use the isConnected() provider method to determine if the provider is disconnected.

message
interface ProviderMessage {
type: string;
data: unknown;
}

provider // Or window.ethereum if you don't support EIP-6963.
.on("message", handler: (message: ProviderMessage) => void);
The provider emits this event when it receives a message that the user should be notified of. The type property identifies the kind of message.

RPC subscription updates are a common use case for this event. For example, if you create a subscription using eth_subscribe, each subscription update is emitted as a message event with a type of eth_subscription.

Remove event listeners
removeListener
Use the removeListener method to remove specific event listeners from an EventEmitter object. In the following example removeListener is used to remove the connect and accountsChanged events:

// Use window.ethereum instead of provider if EIP-6963 is not supported.

// Add listeners
provider.on("_initialized", updateWalletAndAccounts)
provider.on("connect", updateWalletAndAccounts)
provider.on("accountsChanged", updateWallet)
provider.on("chainChanged", updateWalletAndAccounts)
provider.on("disconnect", disconnectWallet)

// Remove individual listeners
provider.removeListener("connect", updateWalletAndAccounts)
provider.removeListener("accountsChanged", updateWallet)
The first argument of removeListener is the event name, and the second argument is a reference to the function passed to on for the event.

removeAllListeners
You can use removeAllListeners to remove all listeners from the event emitter at once. This method is helpful when you need to clean up all listeners simultaneously.

caution
Use removeAllListeners with caution. This method clears all event listeners associated with the emitter, not only the listeners set up by the application code. Using this method can unexpectedly clear important event handlers, interfere with scripts, and make debugging more complex. You can use the removeListener method to safely remove specific listeners.

// Use window.ethereum instead of provider if EIP-6963 is not supported.

// Add listeners
provider.on("_initialized", updateWalletAndAccounts)
provider.on("connect", updateWalletAndAccounts)
provider.on("accountsChanged", updateWallet)
provider.on("chainChanged", updateWalletAndAccounts)
provider.on("disconnect", disconnectWallet)

// Remove all listeners
provider.removeAllListeners()
In the provided code example, removeAllListeners is called to remove all event listeners attached to the provider object. This cleanup function deletes any event listeners that are no longer needed.

Errors
All errors returned by the MetaMask provider follow this interface:

interface ProviderRpcError extends Error {
message: string
code: number
data?: unknown
}
The request() provider method throws errors eagerly. You can use the error code property to determine why the request failed. Common codes and their meaning include:

4001 - The request is rejected by the user.
-32602 - The parameters are invalid.
-32603 - Internal error.
For the complete list of errors, see EIP-1193 and EIP-1474.

