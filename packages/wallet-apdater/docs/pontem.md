

👛
01. Wallet
    Getting Started
    ❗You are reviewing an outdated version of the Pontem Wallet documentation! We recommend switching to the most recent version from the new official website! ⚠️

Getting Started
Use the v1.3.0 or higher version of Pontem Wallet to go through the current docs.

Wallets Adapter
If you want to use Aptos Wallet Adapter, navigate to the Wallet Adapter documentation and skip the current doc.

Provider Browser Detection
When the page is loaded, the provider is integrated into the site page. You can check it this way:


Copy
if (typeof window.pontem !== 'undefined') {
console.log('Pontem Wallet is installed!');
}
After that, you need to request access to the site from the user, for this use the connect method:


Copy
window.pontem.connect()
.then(address => console.log(`Access for address ${address} allowed by user`))
.catch(e => console.log('Access denied by user', e))
After that, you can fully interact with all wallet methods.

Previous
Introduction

👛
01. Wallet
    API Reference
    ❗You are reviewing an outdated version of the Pontem Wallet documentation! We recommend switching to the most recent version from the new official website! ⚠️

API Reference
Extension Version
To get the installed extension version, use the following code.


Copy
const extensionVersion = window.pontem.version;
console.log(`Pontem Wallet v${extensionVersion}`); // 2.0.0
Connect
For the initial connection to the wallet, use the connect method. It requests access to the site from the user and returns the current account address. If you already have access to the site, it will also return the current account address.


Copy
window.pontem.connect()
.then(address => console.log(`Access for address ${address} allowed by user`))
.catch(e => console.log('Access denied by user', e))
Check Connection Status API Check Connection Status
To check if any wallet is connected to the page, use the isConnected method.


Copy
window.pontem.isConnected()
.then(result => {
console.log('isConnected', result) // true or false
})
.catch(e => console.log('Error', e))
Disconnecting API Disconnecting
To disconnect the current account from the site, use the disconnect method.

Important: all methods that require permission from the user will stop working, but the entry in the "Connected Sites" list of the account will not disappear. Only the user can remove access completely through the UI.
If you call the disconnect() method and then connect(), the user will not be asked for permission again. This will only happen if the user manually removes access through the UI


Copy
window.pontem.disconnect()
.catch(e => console.log('Error', e))
Change Active Account Event
To keep track of when a user changed their account, use the onChangeAccount method. When the account is changed, it calls the method you passed in the first argument. If the user at some point revokes the extension's access to the site, then this method will also be called.


Copy
window.pontem.onChangeAccount((address) => {
if(address) {
console.log('New selected account: ', address);
} else {
console.log('The user has selected an account that is not allowed to access');
}
})
Change Active Network Event API Change Active Network Event
To keep track of when a user changed network, use the onChangeNetwork method. When the network is changed, it calls the method you passed in the first argument.


Copy
window.pontem.onChangeNetwork((network) => {
console.log(network);
// { api: 'https://fullnode.devnet.aptoslabs.com/v1/', chainId: '31', name: 'Aptos devnet' }
})
Get Current Network API Get Current Network
To get the current connected network, use the network method.


Copy
window.pontem.network()
.then(network => {
console.log(network);
// { api: 'https://fullnode.devnet.aptoslabs.com/v1/', chainId: '31', name: 'Aptos devnet' }
})
Get Current ChainId API Get Current Network
To get the current chainId, use the chainId method.


Copy
window.pontem.chainId()
.then(chainId => {
console.log(chainId); // 31
})
Get Current Account
To get the address of the current account, use the account method.


Copy
window.pontem.account()
.then(address => {
if(address) {
console.log('Account address: ', address);
} else {
console.log('The user has selected an account that is not allowed to access');
}
})
Get Public Key of the Current Account API Get Public Key
To get the public key of the current account , use the publicKey method.


Copy
window.pontem.publicKey()
.then(key => {
console.log('Public key: ', key);
})
Sign and Submit Transaction
To request a signature and send a transaction to the blockchain, use the signAndSubmit method.

payload - mandatory parameter containing the transaction body.
otherOptions - optional parameter that overrides transaction parameters.

Included in >=1.7.0.
You can also pass a UInt8Array as transaction arguments, or an array with a UInt8Array. This forms a vector, or a vector of vectors.


Copy
const payload = {
function: "0x1::coin::transfer",
type_arguments: ["0x1::aptos_coin::AptosCoin"],
arguments: ["0xeb442855143ce3e26babc6152ad98e9da7db7f0820f08be3d006535b663a6292", "1000"]
};
const otherOptions = {
max_gas_amount: '1000',
gas_unit_price: '1',
expiration_timestamp_secs: '1646793600',
sequence_number: '10'
}
window.pontem.signAndSubmit(payload, otherOptions)
.then(tx => {
console.log('Transaction', tx)
})
.catch(e => console.log('Error', e))
Sign Transaction API Sign Transaction
To request a signature of transaction, use the signTransaction method.

payload - mandatory parameter containing the transaction body.
otherOptions - optional parameter that overrides transaction parameters.

You can also pass a UInt8Array as transaction arguments, or an array with a UInt8Array. This forms a vector, or a vector of vectors.


Copy
const payload = {
function: "0x1::coin::transfer",
type_arguments: ["0x1::aptos_coin::AptosCoin"],
arguments: ["0xeb442855143ce3e26babc6152ad98e9da7db7f0820f08be3d006535b663a6292", "1000"]
};
const otherOptions = {
max_gas_amount: '1000',
gas_unit_price: '1',
expiration_timestamp_secs: '1646793600',
sequence_number: '10'
}
window.pontem.signTransaction(payload, otherOptions)
.then(tx => {
console.log('Transaction', tx)
})
.catch(e => console.log('Error', e))
Sign Message API Sign Message
To request a signature of message, use the signMessage method.


Copy
window.pontem.signMessage({
address: true, // set true if you want include current address to message
application: true, // // set true if you want include current application to message
chainId: true, // set true if you want include current chain id to message
message: 'a message i trust', // message like string or Uint8Array
nonce: 'random nonce' // random nonce like string
})
.then(result => {
console.log('Signed Message', result)
})
.catch(e => console.log('Error', e))


👛
01. Wallet
    Wallet Adapter
    ❗You are reviewing an outdated version of the Pontem Wallet documentation! We recommend switching to the most recent version from the new official website! ⚠️

The wallet adapter helps you to integrate many different wallets at once and use the same interface to interact with any supported wallet.

Developed by Hippo team, main repository - https://github.com/hippospace/aptos-wallet-adapter.

Supports:

Pontem Wallet

Aptos official wallet

Martian wallet

Fewcha wallet

Hippo wallet

Hippo web wallet

Installation
With yarn


Copy
yarn add @manahippo/aptos-wallet-adapter
With npm


Copy
npm install @manahippo/aptos-wallet-adapter
Examples
Add Pontem Wallet to an existing codebase (React Provider)

Copy
import React from "react";
import {
PontemWalletAdapter, // Import Pontem Wallet Adapter.
HippoWalletAdapter,
...
WalletProvider,
} from '@manahippo/aptos-wallet-adapter';

const wallets = () => [
new PontemWalletAdapter(),
new HippoWalletAdapter(),
// Add Pontem Wallet Adapter to list of supported wallets.
...
new HippoExtensionWalletAdapter(),
];

...
Use React Provider

Copy
import React from "react";
import {
PontemWalletAdapter,
HippoWalletAdapter,
AptosWalletAdapter,
HippoExtensionWalletAdapter,
MartianWalletAdapter,
FewchaWalletAdapter,
WalletProvider,
} from '@manahippo/aptos-wallet-adapter';

const wallets = () => [
new PontemWalletAdapter(),
new MartianWalletAdapter(),
new AptosWalletAdapter(),
new FewchaWalletAdapter(),
new HippoWalletAdapter(),
new HippoExtensionWalletAdapter(),
];

const App: React.FC = () => {
return (
<WalletProvider
wallets={wallets}
onError={(error: Error) => {
console.log('Handle Error Message', error)
}}>
{/* your website */}
</WalletProvider>
);
};

export default App;
Web3 Hook

Copy
import { useWallet } from '@manahippo/aptos-wallet-adapter';

const { connected, account, ...rest } = useWallet();

/*
** Properties available: **

wallets: Wallet[]; - Array of wallets
wallet: Wallet | null; - Selected wallet
account(): AccountKeys | null; - Wallet info: address, publicKey, authKey
connected: boolean; - check the website is connected yet
connecting: boolean; - true while adapter waits connect() to finish
disconnecting: boolean; - true while adapter waits disconnect() to finish
connect(walletName: string): Promise<void>; - trigger connect popup
disconnect(): Promise<void>; - trigger disconnect action
signAndSubmitTransaction(
transaction: TransactionPayload
): Promise<PendingTransaction>; - function to sign and submit the transaction to chain
signTransaction(transaction: TransactionPayload): Promise<SubmitTransactionRequest>;
- function to sign the transaction, but not submit
  signMessage(message: string): Promise<string> - function to sign message

*/
Connect & Disconnect

Copy
const { wallets, connect, disconnect, isConnected } = useWallet();
const wallet = 'PontemWallet';

if (!isConnected) {
return (
<Button
onClick={() => {
connect(wallet);
}}
>
Connect
</Button>
);
} else {
return (
<Button
onClick={() => {
disconnect();
}}
>
Disconnect
</Button>
);
}

👛
01. Wallet
    Demo
    ❗You are reviewing an outdated version of the Pontem Wallet documentation! We recommend switching to the most recent version from the new official website! ⚠️

Wallet Demo
We prepared two demos: one with a wallet adapter and another one just using native Pontem Wallet integration.


Pontem Wallet Demo
It contains basic features like:

Choose wallet to connect

Connect wallet

Show address

Sign transaction

But still good enough for a good start with Pontem Wallet and Wallet Adapter.

Try demo using the following links:

Integrations Demo