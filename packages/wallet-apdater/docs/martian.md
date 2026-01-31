Introduction
Martian wallet is a crypto wallet that can be used to manage digital assets and access decentralized applications on the Sui and Aptos blockchain.

Currently available as a Chrome extension, Martian Wallet will soon also be available as an iOS app.

At its core, Martian Wallet works by creating and managing private keys on behalf of its users. These keys can then be used within the Martian wallet to store funds and sign transactions.

To interact with web applications on the Sui network and Aptos blockchain, the Martian wallet extension injects an martian object into the javascript context of every site the user visits. A given web app may then interact with Martian wallet, and ask for the user's permission to perform transactions, through this injected object.

This documentation is intended for developers who are building applications with Martian Wallet on the Sui network and Aptos blockchain. To get help with using Martian Wallet or for giving suggestions, please check out our developer discord or contact our developer support.

🏗️
Integration
Detecting the Provider
To detect if a user has already installed Martian wallet, a web application should check for the existence of an aptos object. Martian wallet browser extension will inject an aptos object into the window of any web application the user visits.


Copy
const isMartianWalletInstalled = window.martian
If Martian wallet is not installed, we recommend you redirect your users to our website. Altogether, this may look like the following.


Copy
const getProvider = () => {
if ("martian" in window) {
return(window.martian);
}
window.open("https://www.martianwallet.xyz/", "_blank");
};
Previous
Introduction

🏗️
Integration
Establishing a Connection
In order to start interacting with Martian Wallet for Sui & Aptos, an app must first establish a connection. This connection request will prompt the user for permission to share their address, indicating that they are willing to interact further. Once permission is established for the first time, the web application's domain will be whitelisted for future connection requests.

Similarly, it is possible to terminate the connection both on the application and the user side.

Connecting
The recommended and easiest way to connect to Martian wallet is by invoking window.martian.connect().

aptos
sui

Copy
await window.martian.connect();
The connect() call will return a Promise that resolves when the user accepts the connection request. An example of the response is given below:


Copy
{
address: "0x2d5b190a5261c3715c452b89d61549718503171356109805755e4590d1b74399"
method: "connected"
publicKey: "0x3d473ebb20ed4264a10083978af3f6cde9ed0d84ee285885c8e5f18f22773926"
status: 200
}
Once the web application is connected to Martian wallet, it will be able to read the connected account's address and publicKey by await window.martian.account()and will be able to prompt the user for additional transactions. It also exposes a convenience isConnected.

aptos
sui

Copy
await window.martian.account()
// {  
//    address: '0x2d5b190a5261c3715c452b89d61549718503171356109805755e4590d1b74399',
//    publicKey: '0x3d473ebb20ed4264a10083978af3f6cde9ed0d84ee285885c8e5f18f22773926'
// }
await window.martian.isConnected()
// true
After a web application connects to Martian wallet for the first time, it becomes whitelisted. Once whitelisted, it's possible for the application to automatically connect to Martian wallet on subsequent visits or page refreshes.

Disconnecting
Disconnecting mirrors the same process as connecting. However, it is also possible for the wallet to initiate the disconnection, rather than the application itself. For this reason, it's important for applications to gracefully handle a disconnect event.

aptos
sui

Copy
await window.martian.disconnect();


🏗️
Integration
Displaying Your App

Connection and Transaction request popup image
When an app is interacting with Martian wallet for Sui or Aptos, the wallet will present users with the above dialogs. In order to display the title and icon for these dialogs, Martian Wallet will inspect the application's HTML for the following items:


⚙️
methods
Aptos
Generate Transaction
Once an application is connected to Martian wallet via connect method, an app can generate a transaction request serialized byte string using window.martian.generateTransaction()and it will return a Promise that resolves when the request is successful and reject (throw when awaited) when the request is not valid/fails. It takes three parameter listed below

sender: Aptos Address of the owner

payload: function: EntryFunctionId; type_arguments: Array; arguments: Array;

options?: It allow to overwrite default transaction options.


Copy
// Default transaction Options
{
sender: senderAddress.hex(),
sequence_number: account.sequence_number,
max_gas_amount: "4000",
gas_unit_price: "1",
gas_currency_code: "XUS",
// Unix timestamp, in seconds + 10 seconds
expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + 10).toString(),
}
Below is an example code describing the way to generate a transaction.

generateTransaction()

Copy
// Generate a transaction
const response = await window.martian.connect();
const sender = response.address;
const payload = {
function: "0x1::coin::transfer",
type_arguments: ["0x1::aptos_coin::AptosCoin"],
arguments: ["0x96da8990a7230a82250e85d943ca95e2e9319e5558b0f544f2d7a6aad327e46f", 50]
};
// example to set custom gas amount, default options are mentioned above
const options = {
max_gas_amount: "10000"
}
const transactionRequest = await window.martian.generateTransaction(sender, payload, 

⚙️
methods
Aptos
Sign Transaction
Once an application is connected to Martian wallet via connect method, an app can request the user to sign a transaction using window.martian.signTransaction()and it will return a Promise that resolves when the user accepts the request and reject (throw when awaited) when the user declines the request or request is not valid/fails. It takes one parameter listed below

Aptos RawTransaction serialized string

Below is an example code describing the way to sign a transaction.

signTransaction()

Copy
// Create a transaction
const response = await window.martian.connect();
const sender = response.address;
const payload = {
function: "0x1::coin::transfer",
type_arguments: ["0x1::aptos_coin::AptosCoin"],
arguments: ["0x96da8990a7230a82250e85d943ca95e2e9319e5558b0f544f2d7a6aad327e46f", 50]
};
const transaction = await window.martian.generateTransaction(sender, payload);
const signedTxn = await window.martian.signTransaction(transaction);



⚙️
methods
Aptos
Submit Transaction
Once an application is connected to Martian wallet via connect method, an app can submit the signed transaction using window.martian.submitTransaction()and it will return a Promise that resolves when the request is successful and reject (throw when awaited) when the request fails. It takes one parameter listed below

signedTxn, signed transaction string can be obtained from signTransaction method.

Below is an example code describing the way to submit a transaction.

submitTransaction()

Copy
// Create a transaction
const response = await window.martian.connect();
const sender = response.address;
const payload = {
function: "0x1::coin::transfer",
type_arguments: ["0x1::aptos_coin::AptosCoin"],
arguments: ["0x997b38d2127711011462bc42e788a537eae77806404769188f20d3dc46d72750", 50]
};
const transaction = await window.martian.generateTransaction(sender, payload);
const signedTxn = await window.martian.signTransaction(transaction);
const txnHash = await window.martian.submitTransaction(signedTxn);


⚙️
methods
Aptos
Sign and Submit Transaction
Once an application is connected to Martian wallet via connect method, an app can request the user to sign and submit the transaction using window.martian.signAndSubmitTransaction()and it will return a Promise that resolves when the user accepts the request and reject (throw when awaited) when the user declines the request or request is not valid/fails. It takes one parameter listed below

Signed serialized Aptos RawTransaction serialized string

Below is an example code describing the way to sign and submit a transaction.

signAndSubmit()

Copy
// Create a transaction
const response = await window.martian.connect();
const sender = response.address;
const payload = {
function: "0x1::coin::transfer",
type_arguments: ["0x1::aptos_coin::AptosCoin"],
arguments: ["0x997b38d2127711011462bc42e788a537eae77806404769188f20d3dc46d72750", 50]
};
const transaction = await window.martian.generateTransaction(sender, payload);
const txnHash = await window.martian.signAndSubmitTransaction(transaction);

⚙️
methods
Aptos
Sign Generic Transaction
Once an application is connected to Martian wallet via connect method, an app can request the user to Sign a generic transaction using window.martian.signGenericTransaction()and it will return a Promise that resolves when the user accepts the request and reject (throw when awaited) when the user declines the request or request is not valid/fails. It takes one parameter listed below:

Object

Below is the object structure:


Copy
{
func: string,
args: [],
type_args: []
}
Here:

"func" should have function name, For e.g. 0x1::coin::transfer

"args" should have list of arguments for the specified function

"type_args" should have list of type arguments, For e.g. 0x1::aptos_coin::AptosCoin

Below is an example code describing the way to sign a generic transaction.

signGenericTransaction()

Copy
const genericTransactionArgument = {
func: "0x1::coin::transfer",
args: ["0x997b38d2127711011462bc42e788a537eae77806404769188f20d3dc46d72750", 500],
type_args: ["0x1::aptos_coin::AptosCoin"]
};
await window.martian.signGenericTransaction(genericTransactionArgument);

⚙️
methods
Aptos
Generate Sign and Submit Transaction
Once an application is connected to Martian wallet via connect method, an app can generate and submit the transaction using window.martian.generateSignAndSubmitTransaction()and it will return a Promise that resolves when the request is successful and reject (throw when awaited) when the request is not valid/fails. It takes three parameter listed below

sender: Aptos Address of the owner

payload: function: EntryFunctionId; type_arguments: Array; arguments: Array;

options?: It allow to overwrite default transaction options.


Copy
// Default transaction Options
{
sender: senderAddress.hex(),
sequence_number: account.sequence_number,
max_gas_amount: "1000",
gas_unit_price: "1",
gas_currency_code: "XUS",
// Unix timestamp, in seconds + 10 seconds
expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + 10).toString(),
}
Below is an example code describing the way to generate a transaction.

generateSignAndSubmitTransaction()

Copy
// Generate a transaction
const response = await window.martian.connect();
const sender = response.address;
const payload = {
function: "0x1::coin::transfer",
type_arguments: ["0x1::aptos_coin::AptosCoin"],
arguments: ["0x96da8990a7230a82250e85d943ca95e2e9319e5558b0f544f2d7a6aad327e46f", 50]
};
const transactionHash = await window.martian.generateSignAndSubmitTransaction(sender, payload);

⚙️
methods
Aptos
Add Network
Once an application is connected to Martian wallet via connect method, it can also request that user to add new network using given api. It takes two parameter listed below:

nodeUrl: Node endpoint.

faucetUrl?: Faucet endpoint.

Below is an example code describing the way to add a network.

addNetwork()

Copy
// Add a network
const nodeUrl = "https://fullnode.mainnet.aptoslabs.com";
const faucetUrl = "dummy";
const status = await window.martian.addNetwork(nodeUrl, faucetUrl);
// status: Node url added successfully


⚙️
methods
Aptos
Change Network
Once an application is connected to Martian wallet via connect method, it can also request that user to change network using given api. It takes one parameter listed below:

nodeUrl: Node endpoint.

Below is an example code describing the way to change a network.

changeNetwork()

Copy
// change network
const nodeUrl = "https://fullnode.mainnet.aptoslabs.com";
const status = await window.martian.changeNetwork(nodeUrl);

⚙️
methods
Aptos
Get Networks
Once an application is connected to Martian wallet via connect method, an app can fetch registered networks using window.martian.getNetworks()and it will return a Promise that resolves when the request is successful.

Below is an example code describing the way to get networks.

getNetworks()

Copy
const networks = await window.martian.getNetworks();
// networks
{
"Mainnet": [],
"Testnet": [],
"Devnet": [],
"Custom": []
}

⚙️
methods
Aptos
Get Transaction
Once an application is connected to Martian wallet via connect method, an app can fetch a transaction details using window.martian.getTransaction()and it will return a Promise that resolves when the request is successful and reject (throw when awaited) when the request is not valid/fails. It takes one parameter listed below

Transaction hash

Below is an example code describing the way to fetch a transaction.

getTransaction()

Copy
// Fetch transaction details
const data = await window.martian.getTransaction("0x1ad6e338ca0de42b2b9a2ff6f21081e2ceed975e55a493bebd8003fd4ba1d028");

⚙️
methods
Aptos
Get Transactions
Once an application is connected to Martian wallet via connect method, an app can fetch a transactions using window.martian.getTransactions()and it will return a Promise that resolves when the request is successful and reject (throw when awaited) when the request is not valid/fails. It takes one optional parameter listed below

query?: {start?: number, limit?: number}

query.start The start transaction version of the page. Default is the latest ledger version

query.limit The max number of transactions should be returned for the page. Default is 25

Below is an example code describing the way to fetch a transaction.

getTransactions()
getTransactions() Paginated

Copy
// Fetch blockchain transactions
const transactions = await window.martian.getTransactions()

Copy
// above code output
// https://fullnode.devnet.aptoslabs.com/transactions
[
{
"type": "state_checkpoint_transaction",
"version": "3801259",
"hash": "0xe1b55d299a4925dc15cca45853c1c7ce69ad450006a1c0e183aaa6b227b3a3ab",
"state_root_hash": "0x361b522c30b531419053ccf47049c3792f1a50b8e3fb6ad3f855c2b9289912c0",
"event_root_hash": "0x414343554d554c41544f525f504c414345484f4c4445525f4841534800000000",
"gas_used": "0",
"success": true,
"vm_status": "Executed successfully",
"accumulator_root_hash": "0xac7e0e8abc93d9287ba2145f596f25a80b6a0daa78eeb2a201a5d30cc16c13d5",
"changes": [],
"timestamp": "1658817506725410"
},
...
]


⚙️
methods
Sui
Sign Transaction Block
Once an application is connected to Martian wallet via connect method, an app can request the user to sign a transaction using window.martian.sui.signTransaction()and it will return a Promise that resolves when the user accepts the request and reject (throw when awaited) when the user declines the request or request is not valid/fails. It takes one parameter listed below

input: { transactionBlockSerialized: Serialized TransactionBlock, options: SuiTransactionBlockResponseOptions }

By using this method, users can securely sign transactions and ensure the safety of their assets on the Sui blockchain.

signTransactionBlock

Copy
// Create a transaction
const response = await window.martian.sui.connect();
const tx = new TransactionBlock();
tx.moveCall({
target: '0x2::devnet_nft::mint',
arguments: [
tx.pure('Hello'),
tx.pure('Martians'),
tx.pure('http://cdn.martianwallet.xyz/assets/icon.png'),
],
});
const input = {
transactionBlockSerialized: tx.serialize(),
options: {
showEffects: true,
}
}l
const transaction = await window.martian.sui.signTransactionBlock(input);

⚙️
methods
Sui
Sign and Execute Transaction
Once an application is connected to Martian wallet via the connect method, the app can request the user to sign and execute the transaction on the Sui Network using window.martian.sui.signAndExecuteTransaction()and it will return a Promise that resolves when the user accepts the request and rejects (throw when awaited) when the user declines the request or the request is not valid/fails. It takes one parameter listed below

input: { transactionBlockSerialized: Serialized TransactionBlock, options: SuiTransactionBlockResponseOptions }

Here is an example code that demonstrates how to call the signAndExecuteTransactionBlock API on the Sui Network using Martian Wallet:

signAndExecuteTransactionBlock

Copy
// Create a transaction
const response = await window.martian.sui.connect(['viewAccount', 'suggestTransactions']);
const tx = new TransactionBlock();
tx.moveCall({
target: '0x2::devnet_nft::mint',
arguments: [
tx.pure('Hello'),
tx.pure('Martians'),
tx.pure('http://cdn.martianwallet.xyz/assets/icon.png'),
],
});
const input = {
transactionBlockSerialized: tx.serialize(),
options: {
showEffects: true,
}
}l
const transaction = await window.martian.sui.signAndExecuteTransactionBlock(input);

⚙️
methods
Sui
Get Public Key
This method can be used to fetch the account's public key.

Note: returned string would not contain 0x prefix

This code demonstrates how to use the getPublicKey() method to fetch the public key of an account on the Sui network using Martian wallet.

getPublicKey()

Copy
// Fetch transaction details
await window.martian.sui.connect(['viewAccount', 'suggestTransactions']);
const publicKey = await window.martian.sui.getPublicKey();
console.log(publicKey);

Copy
// above code output
f97e2dcb3a73eff50b54e9270eb6ccdd2d6ca249c7311c9a6b58a4dd180c7757

Get Old Address
This method can be used to fetch old Sui address from a public key

Below is an example code describing the way to call getOldAddress API in Martian Wallet for the Sui network.

getOldAddress()

Copy
// Fetch transaction details
await window.martian.sui.connect(['viewAccount', 'suggestTransactions']);
const publicKey = "0xf73458a59ba9ba623e093835603954fd3efebed2c73797d8221b974579def32c"
const { oldAddress } = await window.martian.sui.getOldAddress(publicKey);
console.log(oldAddress);

Copy
// above code output
6dcd3d1023b975f68e6a8f9a854498bda9720b59

⚙️
methods
Sui
Get Accounts
This method can be used to fetch all Sui accounts present in the wallet

Below is an example code describing the way to call getAccounts API.

getAccount()

Copy
// Fetch transaction details
const response = await window.martian.sui.connect(['viewAccount', 'suggestTransactions']);
const details = await window.martian.getAccounts();
console.log(details);

Copy
// above code output
[
"e68a59b81e14ce084c91bad7726cc489e38b3940"
]


⚙️
methods
Sign Message
Once an application is connected to Martian wallet via connect method, it can also request that the user signs a given message using given api. Applications are free to write their own messages which will be displayed to users from within Martian's signature prompt. Message signatures do not involve network fees and are a convenient way for apps to verify ownership of an address. It takes one parameter listed below:

aptos
sui

Copy
{
address?: boolean; // Should we include the address of the account in the message
application?: boolean; // Should we include the domain of the dapp
chainId?: boolean; // Should we include the current chain id the wallet is connected to
message: string; // The message to be signed and displayed to the user
nonce: string; // A nonce the dapp should generate,
}
For more information on how to verify the signature of a message, please refer to tweetnacl-js.

Below is an example code describing the way to sign a message.

aptos
sui

Copy
const metadata = {
address: true,
application: true,
chainId: true,
message: "This is a sample message",
nonce: 12345,
};
const signature = await window.martian.signMessage(metadata);
console.log(signature)
// {
//     "address": "0x34c1e7efa0808b7b0113d71b722f483585e4c4b47ba2b0e703b090937f0c63a1",
//     "application": "main.d3c4qcdwu8dzdc.amplifyapp.com",
//     "chainId": 25,
//     "message": "This is a sample message",
//     "nonce": 12345,
//     "fullMessage": "APTOS\naddress: 0x34c1e7efa0808b7b0113d71b722f483585e4c4b47ba2b0e703b090937f0c63a1\napplication: main.d3c4qcdwu8dzdc.amplifyapp.com\nchainId: 25\nmessage: This is a sample message\nnonce: 12345",
//     "prefix": "APTOS",
//     "signature": "0x6f9ee0929285b83d385b93ac615784964269e64d756c9538d5fd8c999d9c5b4d3085c363cd034ecd537ea9e522ea0a2a8c7ab898b79b0eb4d7b3cb853291f801"
// }
Previous
Get Accounts

⚙️
methods
Get Network
This method can be used to fetch network name.

Below is an example code describing the way to fetch network name.

aptos
sui

Copy
// Fetch network info
const network = await window.martian.network();
console.log(network);

Copy
// above code output
Testnet or Devnet or Custom

⚙️
methods
Network Change Event
This method can be used to detect network change in the account. It takes one parameter listed below.

cb: callback function which will be called when network change occurs.

Below is an example code describing the way to check for network change.

aptos
sui

Copy
window.martian.onNetworkChange((name) => console.log(name));

Copy
// above code output
Testnet or Devnet or Custom

⚙️
methods
Account Change Event
This method can be used to detect for account change. It takes one parameter listed below.

cb: callback function which will be called when account change occurs.

Below is an example code describing the way to check for account change.

aptos
sui

Copy
window.martian.onAccountChange((address) => console.log("Changed address", address));

Copy
// above code output
Changed address: 0x34c1e7efa0808b7b0113d71b722f483585e4c4b47ba2b0e703b090937f0c63a1