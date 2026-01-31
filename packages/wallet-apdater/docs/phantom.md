Solana
Get started with Solana

Open in ChatGPT

Learn how to integrate Phantom wallet with your Solana web application using direct integration or the Solana Wallet Adapter.

The Phantom browser extension and mobile in-app browser are both designed to interact with web applications. For mobile apps, we recommend integrating via universal links or deeplinks.
There are two main ways to integrate Phantom into your web application:
​
Direct integration
The most direct way to interact with Phantom is via the provider that Phantom injects into your web application. This provider is globally available at window.phantom and its methods will always include Phantom’s most up-to-date functionality. This documentation is dedicated to covering all aspects of the provider.
​
Solana Wallet Adapter
Another quick and easy way to get up and running with Phantom is via the Solana Wallet Adapter package. The wallet adapter is a set of modular TypeScript components that allow developers to easily integrate multiple Solana wallets into their applications. This package includes starter files, setup and usage instructions, and a live demo showcasing multiple UI frameworks.

Solana
Detect the provider

Open in ChatGPT

To detect if a user has already installed Phantom, a web application should check for the existence of a phantom object.

To detect if a user has already installed Phantom, a web application should check for the existence of a phantom object. Phantom’s browser extension and mobile in-app browser will both inject a phantom object into the window of any web application the user visits, provided that site is using https://, on localhost, or is 127.0.0.1. Phantom will not inject the provider into iframes or sites that use http://.
If a phantom object exists, Solana apps can interact with Phantom via the API found at window.phantom.solana. This solana object is also available at window.solana to support legacy integrations.
To detect if Phantom is installed, an application should check for an additional isPhantom flag.
const isPhantomInstalled = window.phantom?.solana?.isPhantom
If Phantom is not installed, we recommend you redirect your users to https://phantom.com/. Altogether, this may look like the following:
const getProvider = () => {
if ('phantom' in window) {
const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
}

window.open('https://phantom.app/', '_blank');
};
For an example of how a React application can detect Phantom, refer to getProvider in our sandbox.


Solana
Establish a connection

Open in ChatGPT

Once an application has detected the provider, it can then request to connect to Phantom. This connection request will prompt the user for permission to share their public key, indicating that they are willing to interact further. Users must approve a connection request before the app can make additional requests such as signing a message or sending a transaction.
Once permission is established for the first time, the web application’s domain will be whitelisted for future connection requests. After a connection is established, it is possible to terminate the connection from both the application and the user side.
​
Connect
The recommended and easiest way to connect to Phantom is by calling window.phantom.solana.connect(). However, the provider also exposes a request JSON RPC interface.
​
connect()
const provider = getProvider(); // see "Detecting the Provider"
try {
const resp = await provider.connect();
console.log(resp.publicKey.toString());
// 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
} catch (err) {
// { code: 4001, message: 'User rejected the request.' }
}
​
request()
const provider = getProvider(); // see "Detecting the Provider"
try {
const resp = await provider.request({ method: "connect" });
console.log(resp.publicKey.toString());
// 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
} catch (err) {
// { code: 4001, message: 'User rejected the request.' }
}
The connect() call will return a Promise that resolves when the user accepts the connection request, and reject (throw when awaited) when the user declines the request or closes the pop-up. See Errors for a breakdown of error messages Phantom may emit.
When the user accepts the request to connect, the provider will also emit a connect event.
provider.on("connect", () => console.log("connected!"));
Once the web application is connected to Phantom, it will be able to read the connected account’s public key and prompt the user for additional transactions. It also exposes a convenience isConnected boolean.
console.log(provider.publicKey.toString());
// 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
console.log(provider.isConnected);
// true
​
Eagerly connecting
After a web application connects to Phantom for the first time, it becomes trusted. Once trusted, it’s possible for the application to automatically connect to Phantom on subsequent visits or page refreshes, without prompting the user for permission. This is referred to as “eagerly connecting”.
To implement this, applications should pass an onlyIfTrusted option into the connect() call.
​
connect()
provider.connect({ onlyIfTrusted: true });
​
request()
window.solana.request({ method: "connect", params: { onlyIfTrusted: true }});
If this flag is present, Phantom will only eagerly connect and emit a connect event if the application is trusted. If the application is not trusted, Phantom will throw a 4001 error and remain disconnected until the user is prompted to connect without an onlyIfTrusted flag. In either case, Phantom will not open a pop-up window, making this convenient to use on all page loads.
The following is an example of how a React application can eagerly connect to Phantom.
import { useEffect } from "react";

useEffect(() => {
// Will either automatically connect to Phantom, or do nothing.
provider.connect({ onlyIfTrusted: true })
.then(({ publicKey }) => {
// Handle successful eager connection
})
.catch(() => {
// Handle connection failure as usual
})
}, []);
For a live demo, refer to the handleConnect function in our sandbox.
If a wallet disconnects from a trusted app and then attempts to reconnect at a later time, Phantom will still eagerly connect. Once an app is trusted, Phantom will only require the user to approve a connection request if the user revokes the app from within their Trusted Apps settings.
​
Disconnect
Disconnecting mirrors the same process as connecting. However, it is also possible for the wallet to initiate the disconnection, rather than the application itself.
​
disconnect()
provider.disconnect();
​
request()
provider.request({ method: "disconnect" });
The following is an example of how a React application can gracefully handle a disconnect event.
import { useState, useEffect } from "react";

const [pubKey, setPubKey] = useState(null);

useEffect(() => {
// Store user's public key once they connect
provider.on("connect", (publicKey) => {
setPubKey(publicKey);
});

// Forget user's public key once they disconnect
provider.on("disconnect", () => {
setPubKey(null);
});
}, [provider]);
​
Change accounts
Phantom allows users to seamlessly manage multiple accounts (such as keypairs) from within a single extension or mobile app. Whenever a user switches accounts, Phantom will emit an accountChanged event.
If a user changes accounts while already connected to an application, and the new account had already whitelisted that application, then the user will stay connected and Phantom will pass the PublicKey of the new account:
provider.on('accountChanged', (publicKey) => {
if (publicKey) {
// Set new public key and continue as usual
console.log(`Switched to account ${publicKey.toBase58()}`);
}
});
If Phantom does not pass the public key of the new account, an application can either do nothing or attempt to reconnect:
provider.on('accountChanged', (publicKey) => {
if (publicKey) {
// Set new public key and continue as usual
console.log(`Switched to account ${publicKey.toBase58()}`);
} else {
// Attempt to reconnect to Phantom
provider.connect().catch((error) => {
// Handle connection failure
});
}
});

Solana
Send a legacy transaction

Open in ChatGPT

Once a web application is connected to Phantom, it can prompt the user for permission to send transactions on their behalf.
In order to send a transaction, a web application must:
Create an unsigned transaction.
Have the transaction be signed and submitted to the network by the user’s Phantom wallet.
Optionally await network confirmation using a Solana JSON RPC connection.
For more information about the nature of Solana transactions, refer to the solana-web3.js documentation and the Solana Cookbook.
For a sample Phantom transaction, check out our sandbox.
​
Sign and send a transaction
Once a transaction is created, the web application may ask the user’s Phantom wallet to sign and send the transaction. If accepted, Phantom will sign the transaction with the user’s private key and submit it via a Solana JSON RPC connection. By far the easiest and most recommended way of doing this is by using the signAndSendTransaction method on the provider, but it is also possible to do with request. In both cases, the call will return a Promise for an object containing the signature.
​
signAndSendTransaction()
const provider = getProvider(); // see "Detecting the Provider"
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const transaction = new Transaction();
const { signature } = await provider.signAndSendTransaction(transaction);
await connection.getSignatureStatus(signature);
​
request()
const provider = getProvider(); // see "Detecting the Provider"
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const transaction = new Transaction();
const { signature } = await provider.request({
method: "signAndSendTransaction",
params: {
message: bs58.encode(transaction.serializeMessage()),
},
});
await connection.getSignatureStatus(signature);
You can also specify a SendOptions object as a second argument into signAndSendTransaction or as an options parameter when using request.
For a live demo of signAndSendTransaction, refer to handleSignAndSendTransaction in our sandbox.
​
Sign and send multiple transactions
It is also possible to sign and send multiple transactions at once. This is exposed through the signAndSendAllTransactions method on the provider. This method accepts an array of Solana transactions, and will optionally accept a SendOptions object as a second parameter. If successful, it will return a Promise for an object containing the array of string signatures and the publicKey of the signer.
​
signAndSendAllTransactions()
const provider = getProvider(); // see "Detecting the Provider"
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const transactions = [new Transaction(), new Transaction()];
const { signatures, publicKey } = await provider.signAndSendAllTransactions(transactions);
await connection.getSignatureStatuses(signatures);
​
Other signing methods
The following methods are also supported, but are not recommended over signAndSendTransaction. It is safer for users, and a simpler API for developers, for Phantom to submit the transaction immediately after signing it instead of relying on the application to do so.
The following methods are not supported in the wallet standard implementation and may be removed in a future release. These methods are only available via the window.solana object.
​
Sign a transaction (without sending)
Once a transaction is created, a web application may ask the user’s Phantom wallet to sign the transaction without also submitting it to the network. The easiest and most recommended way of doing this is via the signTransaction method on the provider, but it is also possible to do via request. In both cases, the call will return a Promise for the signed transaction. After the transaction has been signed, an application may submit the transaction itself using sendRawTransaction in web3.js.
​
signTransaction()
const provider = getProvider();
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const transaction = new Transaction();
const signedTransaction = await provider.signTransaction(transaction);
const signature = await connection.sendRawTransaction(signedTransaction.serialize());
​
request()
const provider = getProvider();
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const transaction = new Transaction();
const signedTransaction = await provider.request({
method: "signTransaction",
params: {
message: bs58.encode(transaction.serializeMessage()),
},
});
const signature = await connection.sendRawTransaction(signedTransaction.serialize());
For an example of signTransaction, refer to handleSignTransaction in our sandbox.
​
Sign multiple transactions
For legacy integrations, Phantom supports signing multiple transactions at once without sending them. This is exposed through the signAllTransactions method on the provider. This method is not recommended for new integrations. Instead, developers should make use of signAndSendAllTransactions.
​
signAllTransactions()
const signedTransactions = await provider.signAllTransactions(transactions);
​
request()
const message = transactions.map(transaction => {
return bs58.encode(transaction.serializeMessage());
});
const signedTransactions = await provider.request({
method: "signAllTransactions",
params: { message },
});
For an example of signAllTransactions, refer to handleSignAllTransactions in our sandbox.

Solana
Send a versioned transaction

Open in ChatGPT

The Solana runtime supports two types of transactions: legacy (see Send a legacy transaction) and v0 (transactions that can include Address Lookup Tables or LUTs).
The goal of v0 is to increase the maximum size of a transaction, and hence the number of accounts that can fit in a single atomic transaction. With LUTs, developers can now build transactions with a maximum of 256 accounts, as compared to the limit of 35 accounts in legacy transactions that do not utilize LUTs.
For a dive deep on versioned transactions, LUTs, and how the above changes affect the anatomy of a transaction, see Versioned Transactions - Anvit Mangal’s Blog.
On this page, we’ll go over the following:
Building a versioned tansaction.
Signing and sending a versioned transaction.
Building an Address LUT.
Extending an Address LUT.
Signing and sending a versioned transaction using a LUT.
​
Build a versioned transaction
Versioned transactions are built in a very similar fashion to legacy transactions. The only difference is that developers should use the VersionedTransaction class rather than the Transaction class.
The following example shows how to build a simple transfer instruction. Once the transfer instruction is made, a MessageV0 formatted transaction message is constructed with the transfer instruction. Finally, a new VersionedTransaction is created, parsing in the v0 compatible message.
​
createTransactionV0()
// create array of instructions
const instructions = [
SystemProgram.transfer({
fromPubkey: publicKey,
toPubkey: publicKey,
lamports: 10,
}),
];

// create v0 compatible message
const messageV0 = new TransactionMessage({
payerKey: publicKey,
recentBlockhash: blockhash,
instructions,
}).compileToV0Message();

// make a versioned transaction
const transactionV0 = new VersionedTransaction(messageV0);
For a live example of creating a versioned transaction, refer to createTransferTransactionV0 in our sandbox.
​
Sign and send a versioned transaction
Once a Versioned transaction is created, it can be signed and sent via Phantom using the signAndSendTransaction method on the provider. The call will return a Promise for an object containing the signature. This is the same way a legacy transaction is sent via the Phantom provider.
​
signAndSendTransaction()
const provider = getProvider(); // see "Detecting the Provider"
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const versionedTransaction = new VersionedTransaction();
const { signature } = await provider.signAndSendTransaction(versionedTransaction);
await connection.getSignatureStatus(signature);
You can also specify a SendOptions object as a second argument into signAndSendTransaction() or as an options parameter when using request.
For a live demo of signing and sending a versioned transaction, refer to handleSignAndSendTransactionV0 in our sandbox.
​
Build an Address LUT
Address LUTs can be used to load accounts into table-like data structures. These structures can then be referenced to significantly increase the number of accounts that can be loaded in a single transaction.
This lookup method effectively “compresses” a 32-byte address into a 1-byte index value. This “compression” enables storing up to 256 address in a single LUT for use inside any given transaction.
With the @solana/web3.js createLookupTable method, developers can construct the instruction needed to create a new LUT, as well as determine its address. Once we have the LUT instruction, we can construct a transaction, sign it, and send it to create a LUT on-chain. Address LUTs can be created with either a v0 transaction or a legacy transaction. However, the Solana runtime can only retrieve and handle the additional addresses within a LUT while using v0 transactions.
The following is a code snippet that creates a LUT.
​
createAddressLookupTable()
// create an Address Lookup Table
const [lookupTableInst, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
authority: publicKey,
payer: publicKey,
recentSlot: slot,
});

// To create the Address Lookup Table on chain:
// send the `lookupTableInst` instruction in a transaction
const lookupMessage = new TransactionMessage({
payerKey: publicKey,
recentBlockhash: blockhash,
instructions: [lookupTableInst],
}).compileToV0Message();

const lookupTransaction = new VersionedTransaction(lookupMessage);
const lookupSignature = await signAndSendTransaction(provider, lookupTransaction);
For a live demo of creating a LUT, refer to handleSignAndSendTransactionV0WithLookupTable in our sandbox.
​
Extend an Address LUT
Once an Address LUT is created, it can then be extended, which means that accounts can be appended to the table. Using the @solana/web3.js library, you can create a new extend instruction using the extendLookupTable method. Once the extend instruction is created, it can be sent in a transaction.
​
extendAddressLookupTable()
// add addresses to the `lookupTableAddress` table via an `extend` instruction
const extendInstruction = AddressLookupTableProgram.extendLookupTable({
payer: publicKey,
authority: publicKey,
lookupTable: lookupTableAddress,
addresses: [
publicKey,
SystemProgram.programId,
// more `publicKey` addresses can be listed here
],
});

// Send this `extendInstruction` in a transaction to the cluster
// to insert the listing of `addresses` into your lookup table with address `lookupTableAddress`
const extensionMessageV0 = new TransactionMessage({
payerKey: publicKey,
recentBlockhash: blockhash,
instructions: [extendInstruction],
}).compileToV0Message();

const extensionTransactionV0 = new VersionedTransaction(extensionMessageV0);
const extensionSignature = await signAndSendTransaction(provider, extensionTransactionV0);
For a live demo of extending a LUT, refer to the handleSignAndSendTransactionV0WithLookupTable function in our sandbox.
​
Sign and send a versioned transaction using a LUT
Up until now, we have:
Learned how to create a VersionedTransaction.
Created an Address LUT.
Extended the Address LUT.
At this point, we are now ready to sign and send a VersionedTransaction using an Address LUT.
First, we need to fetch the account of the created Address LUT.
​
getAddressLookupTable()
// get the table from the cluster
const lookupTableAccount = await connection.getAddressLookupTable(lookupTableAddress).then((res) => res.value);
// `lookupTableAccount` will now be a `AddressLookupTableAccount` object
console.log('Table address from cluster:', lookupTableAccount.key.toBase58());
We can also parse and read all the addresses currently stores in the fetched Address LUT.
​
Parse and read addresses
// Loop through and parse all the address stored in the table
for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
const address = lookupTableAccount.state.addresses[i];
console.log(i, address.toBase58());
}
We can now create the instructions array with an arbitrary transfer instruction, just the way we did while creating the VersionedTransaction earlier. This VersionedTransaction can then be sent using the signAndSendTransaction() provider function.
// create an array with your desired `instructions`
// in this case, just a transfer instruction
const instructions = [
SystemProgram.transfer({
fromPubkey: publicKey,
toPubkey: publicKey,
lamports: minRent,
}),
];

// create v0 compatible message
const messageV0 = new TransactionMessage({
payerKey: publicKey,
recentBlockhash: blockhash,
instructions,
}).compileToV0Message([lookupTableAccount]);

// make a versioned transaction
const transactionV0 = new VersionedTransaction(messageV0);
const signature = await signAndSendTransaction(provider, transactionV0);
For a live demo of of signing and sending a versioned transaction using an Address LUT, refer to the handleSignAndSendTransactionV0WithLookupTable in our sandbox.


Solana
Sign a message

Open in ChatGPT

When a web application is connected to Phantom, it can also request that the user signs a given message. Applications are free to write their own messages which will be displayed to users from within Phantom’s signature prompt. Message signatures do not involve network fees and are a convenient way for apps to verify ownership of an address.
In order to send a message for the user to sign, a web application must:
Provide a hex or UTF-8 encoded string as a Uint8Array.
Request that the encoded message is signed via the user’s Phantom wallet.
For an example of signing a message, refer to handleSignMessage in our sandbox.
Phantom uses Ed25519 signatures for Solana message signatures. To verify a message signature, you can use the tweetnacl npm package.
​
signMessage()
const provider = getProvider(); // see "Detecting the Provider"
const message = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
const encodedMessage = new TextEncoder().encode(message);
const signedMessage = await provider.signMessage(encodedMessage, "utf8");
​
request()
const provider = getProvider(); // see "Detecting the Provider"
const message = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
const encodedMessage = new TextEncoder().encode(message);
const signedMessage = await provider.request({
method: "signMessage",
params: {
message: encodedMessage,
display: "hex",
},
});
​
Sign-In with Solana (SIWS)
Developers who use signMessage to authenticate users can now take advantage of Phantom’s new Sign-In with Solana feature. For more information, refer to our specification on GitHub.
​
Support for other “Sign-In with” Standards
Phantom supports a range of “Sign-In with” (SIW) message standards. You can read more about them in Sign a message.


Solana
Error messages and codes

Open in ChatGPT

When making requests to Phantom in establishing a connection, sending a transaction, or signing a message, Phantom may respond with an error. The following is a list of all possible error codes and their meanings. These error messages are inspired by Ethereum’s EIP-1474 and EIP-1193.
Code	Title	Description
4900	Disconnected	Phantom could not connect to the network.
4100	Unauthorized	The requested method and/or account has not been authorized by the user.
4001	User Rejected Request	The user rejected the request through Phantom.
-32000	Invalid Input	Missing or invalid parameters.
-32002	Requested resource not available	This error occurs when a dapp attempts to submit a new transaction while Phantom’s approval dialog is already open for a previous transaction. Only one approve window can be open at a time. Users should approve or reject their transaction before initiating a new transaction.
-32003	Transaction Rejected	Phantom does not recognize a valid transaction.
-32601	Method Not Found	Phantom does not recognize the method.
-32603	Internal Error	Something went wrong within Phantom.
Typically, these errors will be easily parseable and have both a code and an explanation. For example:
try {
await window.solana.signMessage();
} catch (err) {
//  {code: 4100, message: 'The requested method and/or account has not been authorized by the user.'}
}
Was this page helpful?


Ethereum, Monad, Base, and Polygon
Get started with EVM networks

Open in ChatGPT

The Phantom browser extension and mobile in-app browser are both designed to interact with web applications. EVM web apps can interact with Phantom via the provider that is injected at window.phantom.ethereum. This provider conforms to the EIP-1193 standard and is also injected at window.ethereum to support legacy integrations. Phantom also supports EIP-6963 for ease of integration.
Additionally, Phantom has enabled support for the Monad Testnet, allowing developers and users to interact with the Monad network before its mainnet launch.
Developers can integrate Monad Testnet support using Phantom’s existing EVM provider by adding the relevant network parameters and referring to the Monad documentation for any special considerations.
Users must enable the Monad Testnet in Phantom’s settings before interacting with it. Once Monad mainnet support is enabled by default, this step will no longer be necessary.
This documentation is dedicated to covering all aspects of the provider.
Was this page helpful?





Ethereum, Monad, Base, and Polygon
Detect the provider

Open in ChatGPT

To detect if a user has already installed Phantom, a web application should check for the existence of a phantom object. Phantom’s browser extension and mobile in-app browser will both inject a phantom object into the window of any web application the user visits, provided that site is using https://, on localhost, or is 127.0.0.1. Phantom will not inject the provider into iframes or sites using http://.
If a phantom object exists, EVM dApps can interact with Phantom via the API found at window.phantom.ethereum. This ethereum provider is also made available at window.ethereum but is prone to namespace collisions from other injected wallets.
To detect if Phantom is installed, an application should check for an additional isPhantom flag.
const isPhantomInstalled = window?.phantom?.ethereum?.isPhantom
If Phantom is not installed, we recommend you redirect your users to our website https://phantom.com/. Altogether, this may look like the following:
​
window.phantom
const getProvider = () => {
if ('phantom' in window) {
const anyWindow: any = window;
const provider = anyWindow.phantom?.ethereum;

    if (provider) {
      return provider;
    }
}

window.open('https://phantom.com/', '_blank');
};
​
window.ethereum
const getProvider = () => {
if ('ethereum' in window) {
const anyWindow: any = window;
const provider = anyWindow.ethereum;

    if (provider?.isPhantom) {
      return provider;
    }
}

window.open('https://phantom.com/', '_blank');
};
For an example of how a React application can detect Phantom, refer to getProvider in our sandbox.

Ethereum, Monad, Base, and Polygon
Establish a connection

Open in ChatGPT

Once an application has detected the provider, it can then request to connect to Phantom. This connection request will prompt the user for permission to share their public key, indicating that they are willing to interact further. Users must approve a connection request before the app can make additional requests such as signing a message or sending a transaction.
Once permission is established for the first time, the web application’s domain will be whitelisted for future connection requests. After a connection is established, it is possible to terminate the connection from both the application and the user side.
​
Connect
The default way to connect to Phantom is by calling window.ethereum.request() function.
const provider = getProvider(); // see "Detecting the Provider"
try {
const accounts = await provider.request({ method: "eth_requestAccounts" });
console.log(accounts[0]);
// 0x534583cd8cE0ac1af4Ce01Ae4f294d52b4Cd305F
} catch (err) {
// { code: 4001, message: 'User rejected the request.' }
}
The eth_requestAccounts method will return a Promise. If it resolves, it is an array where the connected address is in the 0th index, and rejects (throw when awaited) when the user declines the request or closes the pop-up. See Errors for a breakdown of error messages Phantom may emit.
When the user accepts the request to connect, the provider will also emit a connect event that contains the chainId of the network the user is connected to.
provider.on("connect", (connectionInfo: { chainId: string }) => console.log(`Connected to chain: ${connectionInfo.chainId}`));
Once the web application is connected to Phantom, it will be able to read the connected account’s address and prompt the user for additional transactions. It also exposes a convenience isConnected boolean.
console.log(provider.selectedAddress);
// 0x534583cd8cE0ac1af4Ce01Ae4f294d52b4Cd305F
console.log(provider.isConnected());
// true
​
Disconnect
There is no way to programmatically disconnect a user from their connection once they have established one.

Once a user has established a connection, Phantom will add the website they opened a connection with to a list of “trusted apps.” The user can then revoke access through the UI at any time, and will then need to reconnect. Phantom will attempt to reconnect to any application that is added to the users’ “trusted apps” automatically.
​
Change accounts
Phantom allows users to seamlessly manage multiple accounts (addresses) from within a single extension or mobile app. Whenever a user switches accounts, Phantom will emit an accountsChanged event.
If a user changes accounts while already connected to an application, and the new account had already whitelisted that application, then the user will stay connected and Phantom will pass the public key of the new account:
provider.on('accountsChanged', (publicKeys: String[]) => {
if (publicKeys) {
// Set new public key and continue as usual
console.log(`Switched to account ${publicKeys[0]}`);
}
});
If Phantom does not pass the public key of the new account, an application can either do nothing or attempt to reconnect:
provider.on('accountsChanged', (publicKeys: String[]) => {
if (publicKeys) {
// Set new public key and continue as usual
console.log(`Switched to account ${publicKeys[0].toBase58()}`);
} else {
// Attempt to reconnect to Phantom
provider.request({ method: "eth_requestAccounts" }).catch((error) => {
// handle connection failure
});
}
});

Ethereum, Monad, Base, and Polygon
Send a transaction

Open in ChatGPT

Once a web application is connected to Phantom, it can prompt the user for permission to send transactions on their behalf.
To send a transaction, you will need to have a valid transaction object. It should look a little like this:
{
from: "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
to: "0xac03bb73b6a9e108530aff4df5077c2b3d481e5a",
gasLimit: "21000",
maxFeePerGas: "300",
maxPriorityFeePerGas: "10",
nonce: "0",
value: "10000000000"
}
However, this transaction object needs to be signed using the sender’s private key. This ensures that only the person that holds the private key can send transactions from the public address.
To prompt Phantom to send a transaction to the network, refer to the following code snippet:
const result = await provider.request({
method: 'eth_sendTransaction',
params: [        
{
from: accounts[0],
to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
value: '0x0',
gasLimit: '0x5028',
gasPrice: '0x2540be400',
type: '0x0',
},
],
});
This is the building blocks of what you will need to send a transaction. However, if you were to copy/paste this, it would likely fail. There are several pieces of a transaction that are best provided in a dynamic manner. For details, refer to the sendTransaction function in our sandbox.
Ethereum, Monad, Base, and Polygon
Sign a message

Open in ChatGPT

When a web application is connected to Phantom, it can also request that the user signs a given message. Applications are free to write their own messages which will be displayed to users from within Phantom’s signature prompt. Message signatures do not involve network fees and are a convenient way for apps to verify ownership of an address. To learn how you can use libraries such as ethers.js to abstract away some of these intricacies, see handleSignMessage in our sandbox.
const message = 'To avoid digital dognappers, sign below to authenticate with CryptoCorgis.';
const from = accounts[0];
const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
const sign = await provider.request({
method: 'personal_sign',
params: [msg, from, 'Example password'],
});
​
Support for “Sign-In with” standards
Applications that rely on signing messages to authenticate users can choose to opt-in to one of the various “Sign-In with” (SIW) standards. For more details, see Sign-In with (SIW) standards.
Was this page helpful?


Yes

No
Send a transaction

Properties
Properties

Open in ChatGPT

Here you will find a list of all of the properties available to you once the window.phantom.ethereum object has been injected.

These are all exactly the same as the window.ethereum object. However, we recommend using the window.phantom.ethereum object to prevent namespace collisions.
{
chainId: HexString
networkVersion: String
selectedAddress: HexString
_events: Object
_eventsCount: Number
}
Was this page helpful?


Provider API reference
Provider API reference

Open in ChatGPT

Phantom’s provider API is exposed to the user through the window.ethereum object that is injected into the browser. This same provider is made available at window.phantom.ethereum to prevent namespace collisions.
This API is how a dapp will make requests to the user; reading account data, connecting to the website, signing messages, and sending transactions will all be done through this provider object.
This provider API is specified in greater detail in EIP-1193.
This area of the documentation will contain information about the API’s properties, events, and methods.

Properties
Properties

Open in ChatGPT

Here you will find a list of all of the properties available to you once the window.phantom.ethereum object has been injected.

These are all exactly the same as the window.ethereum object. However, we recommend using the window.phantom.ethereum object to prevent namespace collisions.
{
chainId: HexString
networkVersion: String
selectedAddress: HexString
_events: Object
_eventsCount: Number
}

Properties
isPhantom

Open in ChatGPT

​
window.phantom.ethereum.isPhantom
A boolean that identifies if Phantom is installed.
const isPhantomInstalled = window.phantom?.ethereum?.isPhantom;
console.log(isPhantomInstalled);
// true

Properties
chainId

Open in ChatGPT

​
window.phantom.ethereum.chainId
The chainId of the network you are currently connected to, returned as a hexadecimal string.
const chainId = window.phantom.ethereum.chainId;
console.log(chainId);
// "0x1"
// hexidecimal representation of Ethereum Mainnet

Properties
networkVersion

Open in ChatGPT

​
window.ethereum.networkVersion
The network number of the blockchain that you are connected to. This property is available for legacy purposes. It is recommended that modern dapps refer to the chainId property to determine what chain a user is connected to currently.
const networkVersion = window.phantom.ethereum.networkVersion;
console.log(networkVersion);
// "1"
// Ethereum Mainnet's Network Version

Properties
selectedAddress

Open in ChatGPT

​
window.phantom.ethereum.selectedAddress
The address of the wallet that is currently connected to the dapp. This value will update upon accountsChanged and connect events.
Returns a hexadecimal string.
const address = window.phantom.ethereum.selectedAddress;
console.log(address);
// "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5"

Properties
events

Open in ChatGPT

​
window.phantom.ethereum._events
An object containing all of the events that the provider has emitted or logged.
const events = window.phantom.ethereum._events;
console.log(events);
// Events {chainChanged: Array(2), accountsChanged: EE}
This is not a recommended way to keep track of different events. The provider implements a Node.js EventEmitter API to emit different events happening within the wallet and/or dapp. For more details, see Events.
Was this page helpful?

Properties
eventsCount

Open in ChatGPT

​
window.phantom.ethereum._eventsCount
An object containing the number of events that have happened
const eventsCount = window.phantom.ethereum._eventsCount;
console.log(eventsCount);
// 2



Events
Events

Open in ChatGPT

Phantom’s provider API available at window.ethereum implements a Node.js style EventEmitter API, that allows you to hook into different events that are emitted upon certain actions that take place in either the dapp, or the wallet. Each page in this section will be an isolated piece of information that informs you of all the technical details you need to know about each event Phantom supports.
Was this page helpful?


Connect

Open in ChatGPT

Event emitted upon connecting to a dapp.
interface connectionInfo {
chainId: string;
}

window.ethereum.on('connect', (connectionInfo: connectionInfo) => {
console.log(connectionInfo.chainId);
// "0x1" On Ethereum
});
window.ethereum.on('accountsChanged', (newAccounts: String[]) => {
// "newAccounts" will always be an array, but it can be empty.      
if (newAccounts) {
console.log(`switched to new account: ${newAccounts}`);
accounts = newAccounts;
} else {
/**
* In this case dApps could...
*
* 1. Not do anything
* 2. Only re-connect to the new account if it is trusted
*
* ```
         * provider.send('eth_requestAccounts', []).catch((err) => {
         *  // fail silently
         * });
         * ```
*
* 3. Always attempt to reconnect
*/
}
})

Events
Disconnect

Open in ChatGPT

Event emitted upon the wallet losing connection to the RPC provider.
This is not a user “disconnecting” from a dapp, or otherwise revoking access between the dapp and the wallet.
window.ethereum.on('disconnect', () => {
console.log('lost connection to the rpc)
});
You can see an example of hooking into this event in our sandbox.

Events
Chain changed

Open in ChatGPT

Event emitted upon the dapp or wallet changing the network/chain you are connected to.
Phantom abstracts the concept of networks, and network switching. So there is no action required on your end as a dapp developer.
ethereum.on('chainChanged', (chainId: string) => {
console.log(chainId);
// "0x1" on Ethereum
/* Phantom will handle all of the internal changes needed to handle the new chain.
* As the dapp developer,
* you just need to make sure all of your transaction requests
* populate the correct chainId
  */
  });
  window.phantom.ethereum.isConnected()
  Methods
  request

Open in ChatGPT

Sends a JSON RPC request to the wallet.
​
Params
method: string; params?: unknown[] | object;
​
Returns
Promise<unknown>
​
Example
const accounts = await window.phantom.ethereum.request({
method: "eth_requestAccounts", params: []
})
console.log(accounts)
// ["0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5"]
The code above demonstrates how you can use the request method to ask the user to connect to your dapp.

The request method is the go to way for you to interface with the wallet in your dapp. It accepts most JSON RPC requests that would need to interact with the wallet.

However it will not work for methods that don’t make sense for a wallet. For example, you can’t use the provider object Phantom injects to call something like eth_getTransactionByHash. If you send a method that the provider object does not support, it will throw an error. For a full list of errors, see Error messages and codes.


Bitcoin
Get started with Bitcoin

Open in ChatGPT

The Phantom browser extension and mobile in-app browser both support interacting with Bitcoin and Ordinals dapps.
There are two main ways to integrate Phantom into your web application:
​
Direct integration
The most direct way to interact with Phantom is via the provider that Phantom injects into your web application. This provider is globally available at window.phantom and its methods will always include Phantom’s most up-to-date functionality. This documentation is dedicated to covering all aspects of the provider.
When adding a Phantom button to your dapp’s wallet modal, we recommend using the name “Phantom” with an SVG/PNG icon, which you can find in Logos and assets.
An example Phantom button in a wallet modal
​
Wallet Standard
Applications can also integrate Phantom by adding support for Wallet Standard. You can find the Bitcoin-specific extensions for Wallet Standard on GitHub.
Was this page helpful?


Bitcoin
Detect the provider

Open in ChatGPT

To detect if a user has already installed Phantom, a web application should check for the existence of a phantom object.

Phantom’s browser extension and mobile in-app browser will both inject a phantom object into the window of any web application the user visits, provided that site is using https://, on localhost, or is 127.0.0.1. Phantom will not inject the provider into iframes or sites using http://.
If a phantom object exists, Bitcoin and Ordinals dapps can interact with Phantom via the API found at window.phantom.bitcoin. To detect if Phantom is installed, an application should check for an additional isPhantom flag like so:
const isPhantomInstalled = window?.phantom?.bitcoin?.isPhantom
If Phantom is not installed, we recommend you redirect your users to our website https://phantom.com/. Altogether, this may look like the following:
const getProvider = () => {
if ('phantom' in window) {
const anyWindow: any = window;
const provider = anyWindow.phantom?.bitcoin;

    if (provider && provider.isPhantom) {
      return provider;
    }
}

window.open('https://phantom.com/', '_blank');
};


Bitcoin
Establish a connection

Open in ChatGPT

​
Connect
Once an application has detected the provider, it can then request to connect to Phantom by invoking the requestAccounts method. This connection request will prompt the user for permission to share their Bitcoin addresses, indicating that they are willing to interact further. Users must approve a connection request before the app can make additional requests such as signing a message or sending a transaction.
Phantom popup triggered when user connects to an app for the first time
The requestAccounts method returns a Promise that resolves if the user approves the connection request. Once resolved, it contains an array of the user’s BtcAccount objects. If the user declines the request or closes the pop-up, it will reject (throw when awaited).
The array of BtcAccount objects represent the possible addresses that can be used when a user connects with Phantom. This is defined as:
type BtcAccount = {
address: string;
addressType: "p2tr" | "p2wpkh" | "p2sh" | "p2pkh";
publicKey: string;
purpose: "payment" | "ordinals";
};
Where:
address: The Bitcoin address owned by the user.
addressType: The address’s format. For details, see Bitcoin Design Glossary.
publicKey: A hex string representing the bytes of the public key of the account.
purpose: The general purpose of the address. If ordinals, the user prefers to store Ordinals on this address. If payment, the user prefers to store bitcoin on this address.
The purpose fields represent user preferences and do not represent a guarantee that there will only be Bitcoin on payment addresses or only Ordinals on ordinals addresses. When submitting a transaction, make sure to carefully select UTXOs such that you do not cause the user to accidentally spend a rare or inscribed satoshi.
The following is an example of how to connect to Phantom:

const phantomProvider = getProvider(); // see "Detecting the Provider"
const accounts = await phantomProvider.requestAccounts();
console.log(accounts);
/**
[
{
"address": "bc1phajtersv55fwud5xr0t70p5234swy396a6avqhuny0qf83zssvrsm7tl4q",
"publicKey": "02435c68c1f20522946e46bcc39f8a19088095939db840e874e1ad2c18f0f2361c"
"addressType": "p2tr"
"purpose": "ordinals"
},
{
"address": "bc1qqy4emmf7q623vlf2z4j3pvgfyjkaffx2u3fkpk",
"publicKey": "0279f5b4123030accae6c4ca9a17263753a21df2142bbf0ced940d28ca613e87f9"
"addressType": "p2wpkh"
"purpose": "payment"
}
]
**/
​
Disconnect
There is no way for dapps to programmatically disconnect a user. Once a user has established a connection, Phantom will add the website they opened a connection with to a list of Connected Apps. When a user returns to one of these whitelisted sites, Phantom will attempt to reconnect the application automatically. At any time, the user can revoke access to the dapp through their UI by navigating to Settings > Connected Apps. If a user disconnects from a dapp, they will need to reconnect on the subsequent visit before signing a message or sending a transaction.
Disconnecting a dApp in Connected Apps settings in Phantom extension
​
Change accounts
Phantom allows users to manage multiple accounts from within a single extension or mobile app. Whenever a user switches accounts, Phantom will emit an accountsChanged event.
phantomProvider.on('accountsChanged', (accounts: BtcAccount[]) => {
console.log('Accounts changed:', accounts);
});
If Phantom passes an empty array on accountsChanged, it implies that the user has switched to an account that has not connected to the dapp before (that is, not already in Connected Apps) or does not support Bitcoin (for example, a Solana private key account). In this case, the application can either do nothing or attempt to reconnect:
phantomProvider.on('accountsChanged', (accounts: BtcAccount[]) => {
if (accounts.length > 0) {
// Set new address and continue as usual
} else {
// Attempt to reconnect to Phantom
phantomProvider.requestAccounts().catch((error) => {
// handle connection failure
});
}
});

Bitcoin
Send a transaction

Open in ChatGPT

Phantom supports signing transactions using the Partially Signed Bitcoin Transaction (PSBT) format. The signPSBT method takes in a serialized PSBT, and returns a serialized PSBT where the user’s inputs have been signed.
// function signature
signPSBT(
psbt: Uint8Array,
options: {inputsToSign: {sigHash?: number | undefined, address: string, signingIndexes: number[]}[]}
): Promise<Uint8Array>;
We recommend using bitcoinjs-lib for constructing and serializing PSBTs.
const fromHexString = (hexString) =>
Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const signedPSBTBytes = await phantomProvider.signPSBT(
fromHexString("70736274ff0100fd940102000000048a841e4104389e3b5b04c1522ed7bfc0e64c3760cb801a2ee2406d1c2373d81d0300000000ffffffff8a841e4104389e3b5b04c1522ed7bfc0e64c3760cb801a2ee2406d1c2373d81d0400000000ffffffffaf3341cffbd7ce8b4a51dec0f358a21809fad67be1a11bf70b86e83ec4567ace0100000000ffffffff8eceb072b7c47ebd9c1aa2e17c2541145835c70a8667eb21fa2ff3cac503170e0600000000ffffffff07b004000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed04a01000000000000225120b1a548f1672b6bc666e23943b0b138a4216e2ce5f9bc687469e0f52a917bbf274b0100000000000017a91433ab469b293fa7700f0954c96ec630895892f189874402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc3655802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed072fe050000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed000000000000100fdf50102000000000101a1f8bb2bde4e13b2f397a82a8a101b378e90af13354710b93742be79b773e3840000000000ffffffff0b5802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed00d4c070000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed00247304402204d2e9da8a14537a1c37b59e6a7eb828816249747dbec041315ade14a181c826a022044dcc381227cef6ab18431e692dccc7c27e2a10fed4d3131e0523094819d1dda0121028b8437ac47a4434d4b86d19ab7eeb255887f75cfa43ca135168bfc8281ae8bb90000000001011f5802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed0000100fdf50102000000000101a1f8bb2bde4e13b2f397a82a8a101b378e90af13354710b93742be79b773e3840000000000ffffffff0b5802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed00d4c070000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed00247304402204d2e9da8a14537a1c37b59e6a7eb828816249747dbec041315ade14a181c826a022044dcc381227cef6ab18431e692dccc7c27e2a10fed4d3131e0523094819d1dda0121028b8437ac47a4434d4b86d19ab7eeb255887f75cfa43ca135168bfc8281ae8bb90000000001011f5802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed0000100fd6f0302000000000104a81c37519eca22bd78a4705230dcc471fb59f285bb2f22165c803de5bbe10b4c08000000171600147e3a872889766d0e3aebacf19f7936fd659b2605ffffffffa81c37519eca22bd78a4705230dcc471fb59f285bb2f22165c803de5bbe10b4c03000000171600147e3a872889766d0e3aebacf19f7936fd659b2605ffffffff33ec9dbdfa3ecb3654683b54855eac430d41b9b87b028f8cc84c6766bf7cc3870100000000ffffffff14e64f84c47029f5b8687519707c6e18080f675f37323746c695a681b0fdfece06000000171600147e3a872889766d0e3aebacf19f7936fd659b2605ffffffff07b00400000000000017a91433ab469b293fa7700f0954c96ec630895892f189874a01000000000000225120a9af1fae42dbe9b0604e0ed64ae6e26d56d1c9bbcc4e1e66326914bdb5149606591a000000000000225120cfb72754409e197bce4ea0670bd4f977104bcc86f7ea65d8981609dc66e984454402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc365580200000000000017a91433ab469b293fa7700f0954c96ec630895892f18987580200000000000017a91433ab469b293fa7700f0954c96ec630895892f18987d8c300000000000017a91433ab469b293fa7700f0954c96ec630895892f189870247304402204c291efdec8e7442aef45ad4751938ae21b847bedde8ce8c9eb208f7a29537880220247a6767215d12c0c5ebc751b6386c50c3a9d5ba0792e0396e2ae420b736a5ab0121032765788cbacba654f3cdf679026db3cdb5a5d0310f870f4da223926a2813259902483045022100bceed8f98e1fbed310cfc01e2bdd3dcbd146064c6fc9d423e787367602d8df7c02204e300e2c9e6c4be50f2c9db54c2f6aeb5eae1897db38bf6406f16ee2e3de4f5e0121032765788cbacba654f3cdf679026db3cdb5a5d0310f870f4da223926a2813259901414045d5e077660865bde16a0af320b426f636b49ea7674f1cc1a9d7c86643638cdbb21c9a281c79aeaa118d833840eca4ec0b3cc6a807f1900bb7395ab4eb72ff830247304402204fdc2e31b88b42081c42dc6c249297aeffe1147071fa6994f95ded6257d93d9602205bf9c30fc7cf0d2b78a1e0027e1cc4eae6e45aef7281017fac932058ee1674d70121032765788cbacba654f3cdf679026db3cdb5a5d0310f870f4da223926a281325990000000001012b4a01000000000000225120a9af1fae42dbe9b0604e0ed64ae6e26d56d1c9bbcc4e1e66326914bdb51496060117207f003df863d4c17579f7b22f7498e39525b81c947aef234859b0466d3dd8dfb3000100fd2603020000000001048a841e4104389e3b5b04c1522ed7bfc0e64c3760cb801a2ee2406d1c2373d81d0800000000ffffffff8a841e4104389e3b5b04c1522ed7bfc0e64c3760cb801a2ee2406d1c2373d81d0500000000ffffffff9584f0b205109f6790fbf08f782166892f22facb8e2598b705cd9136b25aabc30000000000ffffffff4f4b0bbc053b9e3cb6261cb83c063481eba8a8a32a448c63f1c1218d6fe330380600000000ffffffff07b004000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed02202000000000000225120b1a548f1672b6bc666e23943b0b138a4216e2ce5f9bc687469e0f52a917bbf2775120000000000002251208ef171ead3a8f91d9dca9ae4b645537aafada16559f9f714cbe524ef672ab4144402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc3655802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed05802000000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed04057060000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed002483045022100a5cf71b0115db7980055fa9158c24fca9e3cc09cca0d1a0c54f17e8fa92d3e2402201b7dce27ff09e06c40a87b54aa2db693f49291e2f1a32f055155a3750607d01e0121028b8437ac47a4434d4b86d19ab7eeb255887f75cfa43ca135168bfc8281ae8bb902473044022049edbc2650ed737bad10d567c072da54c6b592fcfe2240fabcd49d8aa176422102206c8101ba6f8d6a155ed916ca7b25bf69395d76c020cb6ed9cf8293d65870346e0121028b8437ac47a4434d4b86d19ab7eeb255887f75cfa43ca135168bfc8281ae8bb901410a4a56764a5f9ed3fee4a869f6edee7b9b72f87bdba96d08310191a6df94bcf56f32152e63a836844cea71611886e3f96f74a2cc06d88ddf508184857f5fb4138302473044022075b779781668f4a487c2308aca9217125b897d089f617d831122612db02a672402200ef61ec6ddb6cac999e528e9e4fe27acb0a1cba4f8b33204b180ee458a8d82790121028b8437ac47a4434d4b86d19ab7eeb255887f75cfa43ca135168bfc8281ae8bb90000000001011f4057060000000000160014b2c9b35e4b02e8b16236ae5c0540cf2d56605ed00000000000000000"),
{
inputsToSign: [
{
address: "bc1qktymxhjtqt5tzc3k4ewq2sx094txqhksgy8hsw",
signingIndexes: [0, 1, 3],
sigHash: 0,
},
],
},
);
Was this page helpful?


Bitcoin
Sign a message

Open in ChatGPT

When a dapp is connected to Phantom, it can also request that the user signs a given message. Applications are free to write their own messages which will be displayed to users from within Phantom’s signature prompt. Message signatures do not involve network fees and are a convenient way for apps to verify ownership of an address.
Signing a message in the Phantom browser extension
Phantom’s signMessage function accepts two parameters: an encoded message and an address that should be used to sign the message. It returns a Promise that resolves if the user approves the signature request. Once resolved, it contains the resulting signature.
// function signature
function signMessage(
address: string,
message: Uint8Array,
): Promise<{
signature: Uint8Array;
}>;
The following is an example of how to construct and sign a message with Phantom:
const message = new TextEncoder().encode('hello world');
const address = "bc1phajtersv55fwud5xr0t70p5234swy396a6avqhuny0qf83zssvrsm7tl4q"; // see "Establishing a Connection"
const { signature } = await phantomProvider.signMessage(address, message);
To verify that a message was signed by a given address, we recommend using the bip322-js library like so:
import { Verifier } from "bip322-js";

// helper method
function bytesToBase64(bytes) {
const binString = String.fromCodePoint(...bytes);
return btoa(binString);
}

const isValidSignature = Verifier.verifySignature(
address,
new TextDecoder().decode(message),
bytesToBase64(signature),
);
console.log(isValidSignature);
// true


Bitcoin
Provider API reference

Open in ChatGPT

​
Methods
​
requestAccounts
​
Description
Connects to the user’s Phantom account.
​
Parameters
None
​
Response
​
Promise<BtcAccount[]>
array
Array of the connected user’s BtcAccount objects.
​
BtcAccount response object properties
​
address
string
The Bitcoin address owned by the user.
​
addressType
p2tr, p2wpkh, p2sh, p2pkh
The address’s format. For details, see Bitcoin Design Glossary.
​
publicKey
string
A hex string representing the bytes of the public key of the account.
​
purpose
payment, ordinals
The general purpose of the address. If ordinals, the user prefers to store Ordinals on this address. If payment, the user prefers to store Bitcoin on this address.
​
signMessage
​
Description
Signs a message with the user’s Phantom account.
​
Parameters
​
message
Uint8array
The message to be signed.
​
address
string
One of the user’s addresses that should be used to sign the message.
​
Response
​
Promise<{ signature: Uint8Array; }>
object
Object containing the signature.
​
signPSBT
​
Description
Signs a Partially-Signed Bitcoin Transaction (PSBT).
​
Parameters
​
psbtHex
Uint8Array
A serialized PSBT.
​
options
object
Configuration options for signing the PSBT.
​
options parameters
An array containing the indexes of which transaction inputs to sign, and how to sign them.
​
Response
​
Promise<string>
string
A serialized PSBT where the inputs belonging to the user’s account have been signed.
​
Events
​
accountsChanged
​
Description
The event that is emitted when a user changes their connected Phantom account.
type AccountsChangedEvent = (accounts: BtcAccount[]) => void;
​
Properties
​
accounts
BtcAccount[]
The array of BtcAccount objects of the newly connect Phantom account.
​
BtcAccount response object properties
​
address
string
The Bitcoin address owned by the user.
​
addressType
p2tr, p2wpkh, p2sh, p2pkh
The address’s format. For details, see Bitcoin Design Glossary.
​
publicKey
string
A hex string representing the bytes of the public key of the account.
​
purpose
payment, ordinals
The general purpose of the address. If ordinals, the user prefers to store Ordinals on this address. If payment, the user prefers to store Bitcoin on this address.

Sui
Get started with Sui

Open in ChatGPT

The Phantom browser extension and mobile in-app browser now have full support for Sui dapps.
Was this page helpful?


Yes

No
Provider API reference


Sui
Detect the provider

Open in ChatGPT

To detect if a user has already installed Phantom, a web application should check for the existence of a phantom object. Phantom’s browser extension and mobile in-app browser will both inject a phantom object into the window of any web application the user visits, provided that site is using https://, on localhost, or is 127.0.0.1. Phantom will not inject the provider into sites using http://.
If a phantom object exists, Sui apps can interact with Phantom via the API found at window.phantom.sui.
To detect if Phantom is installed, an application should check for an additional isPhantom flag.
const isPhantomInstalled = window.phantom?.sui?.isPhantom
If Phantom is not installed, we recommend you redirect your users to our website https://www.phantom.com/. Altogether this may look like the following:
const getProvider = () => {
if ('phantom' in window) {
const provider = window.phantom?.sui;

    if (provider?.isPhantom) {
      return provider;
    }
}
window.open('https://phantom.com/', '_blank');
};

Sui
Establish a connection

Open in ChatGPT

Once an application has detected the provider, it can then request to connect to Phantom. This connection request will prompt the user for permission to share their public key, indicating that they are willing to interact further. Users must approve a connection request before the app can make additional requests such as signing a message or sending a transaction.
Once permission is established for the first time, the web application’s domain will be whitelisted for future connection requests. After a connection is established, it is possible for the user to terminate the connection from the Phantom settings UI.
​
Connect
The recommended and easiest way to connect to Phantom is by calling window.phantom.sui.requestAccount().
const provider = getProvider(); // see "Detecting the Provider"
try {
const resp = await provider.requestAccount();
console.log(resp.publicKey.toString());
} catch (err) {
// { code: 4001, message: 'User rejected the request.' }
}

Sui
Send a transaction

Open in ChatGPT

Once a dapp is connected to Phantom, it can request user permission to send transactions on their behalf. To initiate a transaction, ensure you have the necessary parameters. For details on constructing transactions, refer to Sui developer documentation.
const transactionParams = {
transaction: await tx.toJSON(), // Replace with actual transaction
address: address.toString(), // Sender address
networkID: SupportedSuiChainIds.SuiMainnet, // or your network ID
};
To prompt Phantom to send a transaction to the network, refer to the following code snippet:
try {
const signature = await provider.signTransaction(params);
return signature;
} catch (error) {
throw new Error(error instanceof Error ? error.message : 'Failed to sign transaction');
}

Sui
Sign a message

Open in ChatGPT

When a web application is connected to Phantom, it can also request that the user signs a given message. Applications are free to write their own messages which will be displayed to users from within Phantom’s signature prompt. Message signatures do not involve network fees and are a convenient way for apps to verify ownership of an address.
try {
const encodedMessage = new TextEncoder().encode(message);
const signature = await provider.signMessage(encodedMessage, address);
return signature;
} catch (error) {
throw new Error(error instanceof Error ? error.message : 'Failed to sign message');
}
Was this page helpful?


Mobile deep links
Phantom deep links

Open in ChatGPT

As of Phantom v22.04.11, iOS and Android apps can now natively interact with Phantom through either universal links (recommended) or deeplinks. We refer to both of these workflows collectively as “deeplinks”.
Currently only Solana is supported for deeplinks.
All provider methods follow a protocol format of:
https://phantom.app/ul/<version>/<method>
It is also possible (but not recommended) to call these methods using Phantom’s custom protocol handler:
phantom://<version>/<method>
In addition to these provider methods, Phantom also supports other methods that are accessible via deeplinks. Specifically, users can open web apps within Phantom’s in-app browser via the Browse deeplink.


Mobile deep links
Handle sessions

Open in ChatGPT

When a user connects to Phantom for the first time, Phantom will return a session param that represents the user’s connection. The app should pass this session param back to Phantom on all subsequent provider methods. It is the app’s responsibility to store this session.
Sessions do not expire. Once a user has connected with Phantom, the corresponding app can indefinitely make requests such as SignTransaction and SignMessage without prompting the user to re-connect with Phantom. Apps will still need to re-connect to Phantom after a disconnect event or an invalid session.
​
Session structure
The entire session param is encoded in base58. A session should contain the following data:
JSON Data Signature: A base58 signature of the JSON data that is 64 bytes. Phantom will check the signature against the actual message that was signed.
JSON Data: A JSON object with the following fields:
app_url (string): A URL that was provided during the initial connection request. This URL is stored in the session for validation purposes and can be checked against the blocklist.
timestamp (number): The timestamp at which the user approved the connection. At the time of this writing, sessions do not expire.
chain (string): The chain that the user connected to at the start of the session. Sessions can’t be used across two different chains with the same keypair (for example, the user can’t connect to Solana and then sign on Ethereum). At the time of this writing, Phantom only supports solana.
cluster (string) (optional): The approved cluster that the app and user initially connected to. Solana-only. Can be either: mainnet-beta, testnet, or devnet. Defaults to mainnet-beta.
About app_url in sessions: The app_url stored in the session token is used for validation purposes only. App metadata (such as title, icon, and favicon) is fetched from the redirect_link parameter during the initial connection request, not from the app_url stored in the session. For more information, see the Connect method documentation.
​
Decode sessions
Phantom will decode and validate the session param on every request. To decode the session, we decode it with bs58, slice off the first 64 bytes of the signature, and the treat the rest as JSON data. We then sign the JSON data again with the same keypair and compare that signature against the signature in the session. If the signatures are the same, the session is valid. Otherwise, we conclude that the session has been faked, as the signature does not belong to the keypair it claims it does.
Calling nacl.sign.open conveniently verifies and returns the original object. For more information, please review Encryption resources.
After we determine that the session is valid, we still need to ensure that the JSON fields line up with what we expect. An app could give a session for pubkey A when the user is currently using pubkey B in Phantom. In such a scenario, that session should not allow an app to request signatures. Instead, the app must issue a new connect request or use the correct session.
// Encoding a session
const privateKey = ...;
const sessionData = JSON.stringify({
"app_id": "APP_ID",
"chain": "CHAIN",
"cluster": "CLUSTER",
"timestamp": 1644954984,
});
const bytes = Buffer.from(sessionData, "utf-8");

// tweetnacl-js formats signature in format <signature><sessionData>
const signature = bs58.encode(nacl.sign(bytes, privateKey));

// Decoding ja session
const publicKey = ...;
const verifiedSessionData = nacl.sign.open(bs58.decode(signature), publicKey.toBytes());
if (!verifiedSessionData) throw new Error(`This session was not signed by ${publicKey}`);
​
Invalid sessions
While sessions do not expire, there are a number of reasons why a sessions could still be deemed invalid:
It was not signed by the current wallet keypair. This could mean that the session is entirely fake, or that it was signed by another keypair in the user’s wallet.
It was signed by the current wallet keypair, but the session’s JSON data does not pass muster. There are a few reasons why this might occur:
The user switched chains (or possibly networks).
The app_url could be blocked if malicious. For more information, see Blocklist.
You must pass the session token for all requests or Phantom will redirect the user back to your app and a new session will be created.

Mobile deep links
Specifying redirects

Open in ChatGPT

All methods support a redirect_link= param that lets Phantom know how to get back to the original app. The URI specified by this param should be URL encoded.
If the deeplink request to Phantom comes with a response, Phantom will append the results as query parameters in the redirect_link= upon redirecting.
​
Redirect link types
You can use either HTTPS URLs or custom scheme URIs for redirect_link, but each has different behavior:
​
HTTPS URLs
When using an HTTPS URL (e.g., https://yourapp.com/callback):
App metadata displays correctly: Logo, title, and favicon are fetched and shown in the connection approval dialog
Opens in browser: The redirect opens in the mobile browser instead of redirecting back to your app
Example:
redirect_link=https%3A%2F%2Fyourapp.com%2Fcallback
​
Custom scheme URIs
When using a custom scheme URI (e.g., mydapp://onPhantomConnected):
Redirects back to app: Properly redirects back to your mobile app
No app metadata: Logo, title, and favicon are not displayed in the connection approval dialog
Example:
redirect_link%3Dmydapp%3A%2F%2FonPhantomConnected
After redirect with response data:
redirect_link=mydapp://onPhantomConnected?data=...
Choosing a redirect link type:
Use HTTPS URLs if displaying your app’s branding in the connection dialog is important, but be aware that users will be redirected to the browser instead of your app.
Use custom scheme URIs if seamless app redirection is critical, but note that your app’s branding will not appear in the connection dialog.

Mobile deep links
Encryption

Open in ChatGPT

Deeplinks are encrypted using symmetric key encryption generated from a Diffie-Hellman key exchange. While deeplink sessions will be created in plaintext, an encrypted channel will be created to prevent session tokens from getting hijacked.
​
Encryption and decryption workflow
Phantom deeplinks are encrypted with the following workflows:
​
Connect
[dapp]: On the initial connect deeplink, dapps should include a dapp_encryption_public_key query parameter. It’s recommended to create a new x25519 keypair for every session started with connect. In all methods, the public key for this keypair is referred to as dapp_encryption_public_key.
[phantom]: Upon handling a connect deeplink, Phantom will also generate a new x25519 keypair.
Phantom will return this public key as phantom_encryption_public_key in the connect response.
Phantom will create a secret key using Diffie-Hellman with dapp_encryption_public_key and the private key associated with phantom_encryption_public_key.
Phantom will locally store a mapping of dapp_encryption_public_key to shared secrets for use with decryption in subsequent deeplinks.
[dapp]: Upon receiving the connect response, the dapp should create a shared secret by using Diffie-Hellman with phantom_encryption_public_key and the private key associated with dapp_encryption_public_key. This shared secret should then be used to decrypt the data field in the response. If done correctly, the user’s public key will be available to share with the dapp inside the data JSON object.
​
Subsequent deeplinks
[dapp]: For any subsequent methods (such as SignTransaction and SignMessage), dapps should send a dapp_encryption_public_key (the public key side of the shared secret) used with Phantom along with an encrypted payload object.
[phantom]: Upon approval, Phantom will encrypt the signed response as a JSON object with the encryption sent as a data= query param.
[dapp]: Upon receiving the deeplink response, dapps should decrypt the object in the data= query param to view the signature.
​
Encryption resources
To learn more about encryption and decryption, please refer to the following libraries:
​
JavaScript
TweetNaCl.js
​
iOS
TweetNaCl SwiftWrap
​
Android
Tink
TweetNaCl Java


Mobile deep links
Limitations

Open in ChatGPT

​
Android
Android has a 500kb transaction limit when passing data between services and apps. The requesting app may crash with a TransactionTooLarge exception when requesting a string over 500kb (over 31k characters). This tends to happen with significantly large intents.
​
iOS
iOS is not known to have a 500kb transaction and allows transmissions up to 1 MB.


Provider methods
Provider methods

Open in ChatGPT

All provider methods follow a protocol format of:
https://phantom.app/ul/<version>/<method>
The following provider methods are accessible via deeplinks:
Connect
Disconnect
SignAndSendTransaction
SignAllTransactions
SignTransaction
SignMessage


Provider methods
Connect

Open in ChatGPT

In order to start interacting with Phantom, an app must first establish a connection. This connection request will prompt the user for permission to share their public key, indicating that they are willing to interact further.
Once a user connects to Phantom, Phantom will return a session param that should be used on all subsequent methods. For more information on sessions, see Handle sessions.
​
Base URL
https://phantom.app/ul/v1/connect
​
Query string parameters
app_url (required): A URL that is stored in the session token for validation purposes. This URL is used during session validation and can be checked against the blocklist. URL-encoded.
dapp_encryption_public_key (required): A public key used for end-to-end encryption. This will be used to generate a shared secret. For more information on how Phantom handles shared secrets, see Encryption.
redirect_link (required): The URI where Phantom should redirect the user upon connection. This URL is also used to fetch app metadata (such as title, icon, and favicon) for display in the connection approval dialog, using the same properties found in Display your app. The origin from this URL is also used for trusted app management. For more details, see Specify redirects. URL-encoded.
cluster (optional): The network that should be used for subsequent interactions. Can be either: mainnet-beta, testnet, or devnet. Defaults to mainnet-beta.
Important distinction between redirect_link and app_url:
redirect_link is used to fetch app metadata (title, icon, favicon) for display in the connection approval dialog and for trusted app management. This is what users see when approving the connection.
app_url is stored in the session token for validation purposes and is not used for fetching metadata or display purposes.
Redirect link behavior:
HTTPS URLs: App metadata (logo, title, favicon) displays correctly in the connection dialog, but the redirect opens in the mobile browser instead of redirecting back to your app.
Custom scheme URIs: Properly redirects back to your mobile app, but app metadata is not displayed in the connection dialog.
For more details on choosing a redirect link type, see Specify redirects.
​
Returns
​
Approve
phantom_encryption_public_key: An encryption public key used by Phantom for the construction of a shared secret between the connecting app and Phantom, encoded in base58.
nonce: A nonce used for encrypting the response, encoded in base58.
data: An encrypted JSON string. Refer to Encryption to learn how apps can decrypt data using a shared secret. Encrypted bytes are encoded in base58.
// content of decrypted `data`-parameter
{
// base58 encoding of user public key
"public_key": "BSFtCudCd4pR4LSFqWPjbtXPKSNVbGkc35gRNdnqjMCU",

// session token for subsequent signatures and messages
// dapps should send this with any other deeplinks after connect
"session": "..."
}
public_key: The public key of the user, represented as a base58-encoded string.
session: A string encoded in base58. This should be treated as opaque by the connecting app, as it only needs to be passed alongside other parameters. Sessions do not expire. For more details, see Handle sessions.
​
Reject
An errorCode and errorMessage as query parameters. For a full list of possible error codes, see Errors.
{
"errorCode": "...",
"errorMessage": "..."
}

Provider methods
Disconnect

Open in ChatGPT

After an initial Connect event has taken place, an app may disconnect from Phantom at anytime. Once disconnected, Phantom will reject all signature requests until another connection is established.
​
Base URL
https://phantom.app/ul/v1/disconnect
​
Query string parameters
dapp_encryption_public_key (required): The original encryption public key used from the app side for an existing Connect session.
nonce (required): A nonce used for encrypting the request, encoded in base58.
redirect_link (required): The URI where Phantom should redirect the user upon completion. For more details, see Specify redirects. URL-encoded.
payload (required): An encrypted JSON string with the following fields:
{
"session": "...", // token received from the connect method
}
session (required): The session token received from the Connect method. For more details, see Handle sessions.
​
Returns
​
Approve
No query params returned.
​
Reject
An errorCode and errorMessage as query parameters. For a full list of possible error codes, see Errors.
{
"errorCode": "...",
"errorMessage": "..."
}
​
Example
Refer to the disconnect method implemented in our React Native demo application.


Provider methods
SignAllTransactions

Open in ChatGPT

Once an app is connected, it is also possible to sign multiple transactions at once. Phantom will not submit these transactions to the network. Applications can submit signed transactions using sendRawTransaction in web3.js.
​
Base URL
https://phantom.app/ul/v1/signAllTransactions
​
Query string parameters
dapp_encryption_public_key (required): The original encryption public key used from the app side for an existing Connect session.
nonce (required): A nonce used for encrypting the request, encoded in base58.
redirect_link (required): The URI where Phantom should redirect the user upon completion. For more details, see Specify redirects. URL-encoded.
payload (required): An encrypted JSON string with the following fields:
{
"transactions": [
"...", // serialized transaction, bs58-encoded
"...", // serialized transaction, bs58-encoded
],
"session": "...", // token received from connect-method
}
transactions (required): An array of transactions that Phantom will sign, serialized and encoded in base58.
session (required): The session token received from the Connect method. For more details, see Handle sessions.
​
Returns
​
Approve
nonce: A nonce used for encrypting the response, encoded in base58.
data: An encrypted JSON string. Refer to Encryption to learn how apps can decrypt data using a shared secret. Encrypted bytes are encoded in base58.
// content of decrypted `data`-parameter
{
transactions: [
"...", // signed serialized transaction, bs58-encoded
"...", // signed serialized transaction, bs58-encoded
]
}
transactions: An array of signed, serialized transactions that are base58 encoded. Phantom will not submit these transactions. Applications can submit these transactions themselves using sendRawTransaction in web3.js.
​
Reject
An errorCode and errorMessage as query parameters. For a full list of possible error codes, see Errors.
{
"errorCode": "...",
"errorMessage": "..."
}


Provider methods
SignTransaction

Open in ChatGPT

Request Phantom to sign the prepared transaction and return the signature. After receiving the signature, your app can broadcast the transaction itself with sendRawTransaction in web3.js, giving you full control over timing, batching, or custom error handling.
​
Base URL
https://phantom.app/ul/v1/signTransaction
​
Query string parameters
dapp_encryption_public_key (required): The original encryption public key used from the app side for an existing Connect session.
nonce (required): A nonce used for encrypting the request, encoded in base58.
redirect_link (required): The URI where Phantom should redirect the user upon completion. For more details, see Specify redirects. URL-encoded.
payload (required): An encrypted JSON string with the following fields:
{
"transaction": "...", // serialized transaction, base58 encoded
"session": "...", // token received from connect-method
}
transaction (required): The transaction that Phantom will sign, serialized and encoded in base58.
session (required): The session token received from the Connect method. For more details, see Handle sessions.
​
Returns
​
Approve
nonce: A nonce used for encrypting the response, encoded in base58.
data: An encrypted JSON string. Refer to Encryption to learn how apps can decrypt data using a shared secret. Encrypted bytes are encoded in base58.
// content of decrypted `data`-parameter
{
transaction: "...", // signed serialized transaction, base58 encoded
}
transaction: The signed, serialized transaction that is base58 encoded. Phantom will not submit this transactions. An application can submit this transactions itself using sendRawTransaction in web3.js.
​
Reject
An errorCode and errorMessage as query parameters. For a full list of possible error codes, see Errors.
{
"errorCode": "...",
"errorMessage": "..."
}


Provider methods
SignMessage

Open in ChatGPT

Once it’s connected to Phantom, an app can request that the user signs a given message. Applications are free to write their own messages which will be displayed to users from within Phantom’s signature prompt. Message signatures do not involve network fees and are a convenient way for apps to verify ownership of an address.
In order to send a message for the user to sign, an application must:
Provide a hex or UTF-8 encoded string as a Uint8Array and then base58-encoded it.
Request that the encoded message is signed via the user’s Phantom wallet.
The deeplinking demo app provides an example of signing a message.
The message to be signed must be passed as a base58-encoded string. For more information on how to verify the signature of a message, please refer to Encryption resources.
​
Base URL
https://phantom.app/ul/v1/signMessage
​
Query string parameters
dapp_encryption_public_key (required): The original encryption public key used from the app side for an existing Connect session.
nonce (required): A nonce used for encrypting the request, encoded in base58.
redirect_link (required): The URI where Phantom should redirect the user upon completion. For more details, see Specify redirects. URL-encoded.
payload (required): An encrypted JSON string with the following fields:
{
"message": "...", // the message, base58 encoded
"session": "...", // token received from connect-method
"display": "utf8" | "hex", // the encoding to use when displaying the message
}
message (required): The message that should be signed by the user, encoded in base58. Phantom will display this message to the user when they are prompted to sign.
session (required): The session token received from the Connect method. For more details, see Handle sessions.
display (optional): How you want us to display the string to the user. Defaults to utf8.
​
Returns
​
Approve
nonce: A nonce used for encrypting the response, encoded in base58.
data: An encrypted JSON string. Refer to Encryption to learn how apps can decrypt data using a shared secret. Encrypted bytes are encoded in base58.
// content of decrypted `data`-parameter
{
signature: "...", // message-signature
}
signature: The message signature, encoded in base58. For more information on how to verify the signature of a message, see Encryption resources.
​
Reject
An errorCode and errorMessage as query parameters. For a full list of possible error codes, see Errors.
{
"errorCode": "...",
"errorMessage": "..."
}
​
Example
Refer to the signMessage method implemented in our React Native demo application.

Other methods
Other methods

Open in ChatGPT

In addition to its provider methods, Phantom also supports other methods that are accessible via deeplinks. Specifically, users can open web apps within Phantom’s in-app browser via the Browse deeplink.
Was this page helpful?


Other methods
Browse

Open in ChatGPT

Deeplinks provide a convenient way for users to open web apps within Phantom. Using their phone’s camera, users can scan a QR code to open a page directly within Phantom’s in-app browser. If a web app detects that a user is on mobile, it can also prompt the user to open a specific page within Phantom’s in-app browser.
The browse deeplink can be used before a Connect event takes places, as it does not require a session param.
The browse deeplinks are not intended to be pasted into mobile web browsers. These deeplinks must either be handled by an app or clicked on by an end user.
​
URL structure
https://phantom.app/ul/browse/<url>?ref=<ref>
​
Parameters
url (required): The URL that should open within Phantom’s in-app browser, URL-encoded.
ref (required): The URL of the requesting app, URL-encoded.
​
Example
The following is an example request to open an NFT listed on Magic Eden:
https://phantom.app/ul/browse/https%3A%2F%2Fmagiceden.io%2Fitem-details%2F8yjN8iRuoiYi

Other methods
Fungible

Open in ChatGPT

Phantom supports deeplinking directly to a fungible token detail page. Developers can specify which chain and token detail page to navigate to. The fungible deeplink can be used at anytime. It does not need to be proceeded by a Connect event, as it does not require a session param.
​
URL structure
https://phantom.app/ul/v1/fungible?token=<fungible>
​
Parameters
fungible (required): The CAIP-19 address of the token page to be viewed, URL-encoded. Defaults to SOL if omitted.
​
Example
https://phantom.app/ul/v1/fungible?token=solana%3A101%2Faddress%3AFoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq
Fungible Example Gi
Was this page helpful?

Other methods
Swap

Open in ChatGPT

Watch Swap demo on YouTube.
Phantom supports deeplinking directly to the in-app swapper. Developers can specify which tokens should be prefilled in the buy and sell fields. In addition to swapping tokens on a single chain, the swapper can also be used to bridge stablecoins across chains, such as USDT on Ethereum to USDC on Solana.
The swap deeplink can be used at anytime. It does not need to be proceeded by a Connect event, as it does not require a session param.
The swap deeplinks are not intended to be pasted into mobile web browsers. These deeplinks must either be handled by an app or tapped on by an end user.
​
URL structure
https://phantom.app/ul/v1/swap?buy=<buy>&sell=<sell>
​
Parameters
buy: The CAIP-19 address of the token that should be bought, URL-encoded. Defaults to SOL if omitted.
sell: The CAIP-19 address of the token that should be sold, URL-encoded. Defaults to SOL if omitted.
​
Examples
Using a mobile device, tap the following links to try out the swap deeplink:
​
Swap SOL to WIF
https://phantom.app/ul/v1/swap/?buy=solana%3A101%2Faddress%3AEKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm&sell=
​
Bridge USDC on Solana to USDT on Ethereum
https://phantom.app/ul/v1/swap/?buy=eip155%3A1%2Faddress%3A0xdAC17F958D2ee523a2206206994597C13D831ec7&sell=solana%3A101%2Faddress%3AEPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
Was this page helpful?


Yes

No
Fungible
Wallet Standard
Ask a question...

website
github
