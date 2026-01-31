Developers
Accounts Types
Account Types
Petra supports a number of different account types, including: Secp256k1, Ed25519, and Keyless. Depending on the account type, the wallet may return different information when you sign transactions, request connections, or sign messages. This page will describe the different return types for each account type that the wallet may return. We recommend that all dApps should understand this behavior and handle it gracefully.

Ed25519
Majority of accounts that are created on Petra are Ed25519 accounts. These accounts are those that were created using:

A private key
A secret recovery phrase
A hardware wallet (e.g. Ledger, Arculus, etc.)
When you sign a message, request a connection, or sign a transaction, the wallet will return Ed25519 instances of the Signature, PublicKey, and AccountAuthenticator.

Return Type	Instance Type
Signature	Ed25519Signature
PublicKey	Ed25519PublicKey
AccountAuthenticator	AccountAuthenticatorEd25519
Keyless
Some accounts may be created as a Keyless account which are created using social logins:

Sign in with Google
Sign in with Apple
These accounts are represented as single key accounts which are use generalized authentication scheme supporting functions schemes like Keyless.

When you sign a message, request a connection, or sign a transaction, the wallet will return single key instances of the Signature, PublicKey, and AccountAuthenticator.

Return Type	Instance Type
Signature	AnySignature
PublicKey	AnyPublicKey
AccountAuthenticator	AccountAuthenticatorSingleKey
Secp256k1
A small number of accounts are created as Secp256k1 accounts which are created using a private key.

Likewise to Keyless, Secp256k1 accounts are represented as single key accounts which are use generalized authentication scheme.

When you sign a message, request a connection, or sign a transaction, the wallet will return single key instances of the Signature, PublicKey, and AccountAuthenticator.

Return Type	Instance Type
Signature	AnySignature
PublicKey	AnyPublicKey
AccountAuthenticator	AccountAuthenticatorSingleKey
Wallet Adapter Supported
Given that you are on a versions >=4.0.0 of the @aptos-labs/wallet-adapter-react package, calling functions such as signMessage, signTransaction, or connect will return the appropriate instance of the Signature, PublicKey, and AccountAuthenticator. You can handle these different account instance types by using the instanceof operator in your code.

const { account } = useWallet();

if (account.publicKey instanceof Ed25519PublicKey) {
console.log('Account is an Ed25519 account');
} else if (account.publicKey instanceof AnyPublicKey) {
const innerPublicKey = account.publicKey.publicKey;
if (innerPublicKey instanceof KeylessPublicKey) {
console.log('Account is a Keyless account');
} else if (innerPublicKey instanceof Secp256k1PublicKey) {
console.log('Account is a Secp256k1 account');
}
}




Developers
Connecting to Petra Wallet
Connecting to Petra
To use Petra with your dApp, your users must first install the Petra Chrome extension in their browser. Petra injects an aptos object into the window of any web app the user visits.

To check if the user has installed Petra, perform the below check:

const isPetraInstalled = window.aptos;

If Petra is not installed, you can prompt the user to first install Petra and provide the below installation instructions. For example, see below:

const getAptosWallet = () => {
if ('aptos' in window) {
return window.aptos;
} else {
window.open('https://petra.app/', `_blank`);
}
};
Installing Petra
To install Petra on your Chrome browser, download the latest stable version from the Chrome Web Store.

Connecting to Petra
After confirming that the web app has the aptos object, we can connect to Petra by calling wallet.connect().

When you call wallet.connect(), it prompts the user to allow your web app to make additional calls to Petra, and obtains from the user basic information such as the address and public key.

See the example code below:

const wallet = getAptosWallet();
try {
const response = await wallet.connect();
console.log(response); // { address: string, address: string }

const account = await wallet.account();
console.log(account); // { address: string, address: string }
} catch (error) {
// { code: 4001, message: "User rejected the request."}
}
NOTE: After the user has approved the connnection for the first time, the web app's domain will be remembered for the future sessions.

Disconnecting Petra
When you want the web app to forget about the connection status with Petra, you can do this by calling wallet.disconnect() in your web app. See below:

await wallet.disconnect();
NOTE: After disconnecting, the web app must reconnect to Petra to make requests.



Developers
Deep Linking to Mobile App
Deep Linking to Mobile App
A deep link is a specialized URL that directs users to a specific location or content within a mobile app. It enables smooth navigation, allowing users to move seamlessly from a website, email, or another app directly to a particular section or page within a mobile app.

Supported Deep Links
Petra mobile app supports the following deep links:

1. Open a dApp
   Redirect users to a specific dApp within the Explore tab of the Petra app. If your dApp is a mobile app, see the Mobile 2 Mobile communication section.

Format:

https://petra.app/explore?link=<dapp_url>
Ensure the <dapp_url> is a valid and accessible URL.

Example:

https://petra.app/explore?link=https://app.ariesmarkets.xyz
In this example, users are redirected to the Aries Markets dApp (https://app.ariesmarkets.xyz) within the Explore tab of the Petra app.

2. Send Coins
   Redirect users to the Petra app to select the coin and amount to send to the specified wallet address.

Format:

https://petra.app/receive?address=<wallet_address>
Ensure the <wallet_address> is a valid wallet address.

Example:

https://petra.app/receive?address=0x0000000000000000000000000000000000000000000000000000000000000001
In this example, users are redirected to the Petra app to select the coin and amount to send to the wallet address 0x0000000000000000000000000000000000000000000000000000000000000001.

Mobile 2 Mobile Communication
If your dApp is a mobile app and you want to sign transactions through Petra wallet, you can use deep links to establish a secure connection between your dApp and the Petra wallet. This provides a comprehensive guide for implementing deep link connections between your mobile decentralized application (dApp) and the Petra wallet. The goal is to enable secure interactions such as connecting, disconnecting, and signing transactions with the Petra wallet. While the provided example is in React Native, the concepts and steps are applicable to any language.

Prerequisites
Petra Wallet: Make sure you have the Petra mobile wallet installed and configured on your device.
Deep Links: Ensure you are familiar with how deep linking works on your target platform and make sure it's already working on your dApp. Here's a comprehensive guide for React Native deep linking setup.
Cryptography: Basic understanding of public-private key pairs, encryption, and decryption.
Petra Deep Link Structure
Petra utilizes a specific deep link format to handle communication between your dApp and the wallet. Here's the breakdown:

Base URL:
petra://api/v1: This is the base URL used for all Petra deep link interactions.
Endpoints:
/connect: Initiates a connection request between your dApp and the Petra wallet.
/disconnect: Terminates the existing connection between your dApp and the Petra wallet.
/signAndSubmit: Allows your dApp to send a transaction for signing and submission through the Petra wallet.
Data Parameter:
Petra expects data to be passed as a base64 encoded JSON string attached to the deep link using the data parameter. This data provides context and instructions for the specific action.
Constants
The following constants are used throughout the implementation and mentioned in the example code:

Deep Link Base URLs: The base URLs for initiating connections and transactions.
PETRA_LINK_BASE: The base URL for the Petra wallet - petra://api/v1.
DAPP_LINK_BASE: The base URL for your dApp - <your-dapp-domain>:///api/<version>.
App Info: Information about your dApp, serving as an identifier for Petra.
APP_INFO: An object containing your dApp's domain and name. Note that users will see this information in the Petra wallet when approving requests.
domain: Your dApp's domain name.
name: A descriptive name for your dApp.
Format:

const PETRA_LINK_BASE = 'petra://api/v1';
const DAPP_LINK_BASE = '<your-dapp-domain>:///api/<version>';

const APP_INFO = {
domain: 'https://your-dapp-domain.com',
name: 'your-dapp-name',
};
Example:

const PETRA_LINK_BASE = 'petra://api/v1';
const DAPP_LINK_BASE = 'mobile2mobile-example:///api/v1';

const APP_INFO = {
domain: 'https://mobile2mobile-example.petra.app',
name: 'mobile2mobile-example',
};
Generate Key Pair
Create a key pair using a cryptographic library like tweetnacl. This key pair consists of a secret key (private) and a public key. The secret key is essential for secure communication and should be stored securely within your dApp. The public key will be shared with Petra to establish a secure connection.

Example:

import nacl from 'tweetnacl';

const generateAndSaveKeyPair = () => {
const keyPair = nacl.box.keyPair();

setSecretKey(keyPair.secretKey);
setPublicKey(keyPair.publicKey);

return keyPair;
};
Connect
To initiate a connection, create a deep link with the PETRA_LINK_BASE at the /connect endpoint, where the data parameter is a base64 encoded JSON object. The data should include your dApp's information, a redirect link, and your dApp's public encryption key as a hex string.

Example:

const connect = async () => {
const keyPair = generateAndSaveKeyPair();

const data = {
appInfo: APP_INFO,
redirectLink: `${DAPP_LINK_BASE}/connect`,
dappEncryptionPublicKey: Buffer.from(keyPair.publicKey).toString('hex'),
};

await Linking.openURL(
`${PETRA_LINK_BASE}/connect?data=${btoa(JSON.stringify(data))}`,
);
};
When the function above is called, it will open the Petra wallet with the connection request, and users will see your dApp's information. They can then approve or reject the connection request. If the user rejects the request, Petra will discard the connection and redirect back to your dApp through the provided redirect link with the response set to "rejected". If the user approves the request, Petra will generate a shared encryption key, encrypt it with the dApp's public key, and save it for future encrypted communication. Then Petra will redirect back to your dApp through the provided redirect link with the response set to "approved" and the shared encryption key encrypted with the dApp's public key.

Handling Petra Response
When Petra redirects back to your dApp through the deep link, you need to handle the URL.

Example:

useEffect(() => {
const handleConnectionApproval = (data: string | null) => {...};

const handleConnectionRejection = () => {...};

const handleConnection = (params: URLSearchParams) => {...};

const handleUrl = (url: string | null) => {...};

Linking.getInitialURL().then(handleUrl);

Linking.addEventListener('url', ({url}) => handleUrl(url));

return () => {
Linking.removeAllListeners('url');
};
}, [secretKey]);
The above code snippet is a React Native example that uses the Linking API to handle deep links.

When connecting to Petra, you need to handle the response parameter to determine if the connection was approved or rejected. If approved, you should parse the base64 encoded data parameter to extract the petraPublicEncryptedKey and decrypt it using your dApp's secret key to get the shared encryption key. This shared key will be used for secure communication between your dApp and Petra for subsequent actions, so make sure to store it securely. If rejected, you should handle the rejection accordingly, such as displaying an error message or taking appropriate action.

Example:

const handleConnectionApproval = (data: string | null) => {
if (data === null) {
throw new Error('Missing data from Petra response');
}

if (!secretKey) {
throw new Error('Missing key pair');
}

const { petraPublicEncryptedKey } = JSON.parse(atob(data));

const sharedEncryptionSecretKey = nacl.box.before(
Buffer.from(petraPublicEncryptedKey.slice(2), 'hex'),
secretKey,
);
setSharedPublicKey(sharedEncryptionSecretKey);
};

const handleConnectionRejection = () => {
// TODO: Handle rejection
};

const handleConnection = (params: URLSearchParams) => {
if (params.get('response') === 'approved') {
handleConnectionApproval(params.get('data'));
} else {
handleConnectionRejection();
}
};

const handleUrl = (url: string | null) => {
if (!url) {
return;
}

const urlObject = new URL(url);
const params = new URLSearchParams(urlObject.search);

switch (urlObject.pathname) {
case '/api/v1/connect': {
handleConnection(params);
break;
}
default:
break;
}
};
Sign and Submit Transaction
To sign and submit a transaction through the Petra mobile wallet, create a deep link with the PETRA_LINK_BASE at the /signAndSubmit endpoint, where the data parameter is a base64 encoded JSON object. The data should include your dApp's information, a redirect link, your dApp's public encryption key as a hex string, the transaction payload, and a nonce. The payload should be a hex string of an entry function or script payload encrypted using the shared encryption key generated during the connection process and the nonce. The nonce is a unique identifier for the transaction and should be generated randomly for each transaction.

Example:

const signAndSubmitTransaction = () => {
if (!sharedPublicKey) {
throw new Error('Missing shared public key');
}

if (!publicKey) {
throw new Error('Missing public key');
}

const payload = btoa(
JSON.stringify({
arguments: [
'0x0000000000000000000000000000000000000000000000000000000000000001',
10000000, // 0.1 APT
],
function: '0x1::coin::transfer',
type: 'entry_function_payload',
type_arguments: ['0x1::aptos_coin::AptosCoin'],
}),
);

const nonce = nacl.randomBytes(24);

const encryptedPayload = nacl.box.after(
Buffer.from(JSON.stringify(payload)),
nonce,
sharedPublicKey,
);

const data = btoa(
JSON.stringify({
appInfo: APP_INFO,
payload: Buffer.from(encryptedPayload).toString('hex'),
redirectLink: `${DAPP_LINK_BASE}/response`,
dappEncryptionPublicKey: Buffer.from(publicKey).toString('hex'),
nonce: Buffer.from(nonce).toString('hex'),
}),
);

Linking.openURL(`${PETRA_LINK_BASE}/signAndSubmit?data=${data}`);
};
The above code snippet demonstrates how to sign and submit a transaction to transfer 0.1 APT to 0x0000000000000000000000000000000000000000000000000000000000000001 using the coin::transfer entry function.

When the function above is called, it will open the Petra wallet with the transaction request, and users will see your dApp's information, the transaction details, and the amount to be signed.

Sign Message
To sign an arbitrary message through the Petra mobile wallet, create a deep link with the PETRA_LINK_BASE at the /signMessage endpoint. The data parameter should be a base64-encoded JSON object containing your dApp's information, a redirect link, your dApp's public encryption key, the message payload (as a hex string), and a unique nonce. The payload should be encrypted using the shared encryption key established during the connection step.

Example
const signMessage = () => {
if (!sharedPublicKey) {
throw new Error('Missing shared public key');
}

if (!publicKey) {
throw new Error('Missing public key');
}

const message = 'I am signing this message with Petra Wallet!';
const nonce = nacl.randomBytes(24);

const encryptedPayload = nacl.box.after(
Buffer.from(message),
nonce,
sharedPublicKey,
);

const data = btoa(
JSON.stringify({
appInfo: APP_INFO,
payload: Buffer.from(encryptedPayload).toString('hex'),
redirectLink: `${DAPP_LINK_BASE}/response`,
dappEncryptionPublicKey: Buffer.from(publicKey).toString('hex'),
nonce: Buffer.from(nonce).toString('hex'),
}),
);

Linking.openURL(`${PETRA_LINK_BASE}/signMessage?data=${data}`);
};
Disconnect
To terminate the connection, create a deep link with the PETRA_LINK_BASE at the /disconnect endpoint, where the data parameter is a base64 encoded JSON object. The data should include your dApp's information, a redirect link, and your dApp's public encryption key as a hex string, exactly like the connect function. Petra will disconnect with the dApp, clearing the shared encryption key, and redirect back to your dApp through the provided redirect link. You should also clear the saved secret key, public key, and shared public key from your dApp as they are no longer valid.

Example:

const disconnect = () => {
if (!publicKey) {
throw new Error('Missing public key');
}

const data = {
appInfo: APP_INFO,
redirectLink: `${DAPP_LINK_BASE}/disconnect`,
dappEncryptionPublicKey: Buffer.from(publicKey).toString('hex'),
};

Linking.openURL(
`${PETRA_LINK_BASE}/disconnect?data=${btoa(JSON.stringify(data))}`,
);

setSecretKey(null);
setPublicKey(null);
setSharedPublicKey(null);
};


Developers
Event Listening
Event Listening
onNetworkChange() and network()
A dApp may want to make sure a user is on the right network. In this case, you will need to check what network the wallet is using.

Default networks provided by the Petra wallet:

// default networks in the wallet
enum Network {
Testnet = 'Testnet',
Mainnet = 'Mainnet',
Devnet = 'Devnet',
}

// Current network
let network = await window.aptos.network();

// event listener for network changing
window.aptos.onNetworkChange((newNetwork) => {
network = newNetwork;
});
onAccountChange()
In Petra, a user may change accounts while interacting with your app. To check for these events, listen for them with: onAccountChange

// get current account
let currentAccount = await window.aptos.account();

// event listener for disconnecting
window.aptos.onAccountChange((newAccount) => {
// If the new account has already connected to your app then the newAccount will be returned
if (newAccount) {
currentAccount = newAccount;
} else {
// Otherwise you will need to ask to connect to the new account
currentAccount = window.aptos.connect();
}
});
onDisconnect()
A user may choose to disconnect from your dApp. In that case, you will want to update your state.

// get current connection status
let connectionStatus = await window.aptos.isConnected();

// event listener for disconnecting
window.aptos.onDisconnect(() => {
connectionStatus = false;
});


Developers
Identifying Errors
Errors
When making requests to Petra API, you may receive an error. The following is a partial list of the possible errors and their corresponding codes:

Code 4000
Code: 4000
Name: No Accounts
Message: No accounts found.
Code 4001
Code: 4001
Name: User rejection
Message: The user rejected the request.
Code 4100
Code: 4100
Name: Unauthorized
Message: The requested method and/or account has not been authorized by the user.



Developers
Sending a Transaction
Sending a Transaction
After your web app is connected to Petra, the web app can prompt the user to sign and send transactions to the Aptos blockchain.

Petra API handles the transactions in two ways:

Sign a transaction and submit it to the Aptos blockchain. Return a pending transaction to the web app.
Sign a transaction but do not submit the transaction to the Aptos blockchain. Return the signed transaction to the web app for the web app to submit the transaction.
See the below examples for both the options.

For more on Aptos transactions, see the Aptos SDKs and Transactions guide from Aptos.

Sign and submit
The below code example shows how to use the signAndSubmitTransaction() API to sign the transaction and send it to the Aptos blockchain.

const wallet = getAptosWallet(); // see "Connecting"

// Example Transaction, following an [EntryFunctionPayload](https://github.com/aptos-labs/aptos-core/blob/main/ecosystem/typescript/sdk/src/generated/models/EntryFunctionPayload.ts#L8-L21)
const transaction = {
arguments: [address, '717'],
function: '0x1::coin::transfer',
type: 'entry_function_payload',
type_arguments: ['0x1::aptos_coin::AptosCoin'],
};

try {
const pendingTransaction = await(
window as any,
).aptos.signAndSubmitTransaction(transaction);

// In most cases a dApp will want to wait for the transaction, in these cases you can use the typescript sdk
const client = new AptosClient('https://testnet.aptoslabs.com');
const txn = await client.waitForTransactionWithResult(
pendingTransaction.hash,
);
} catch (error) {
// see "Errors"
}
Sign only
IMPORTANT: We don't recommend using this because in most cases you don't need it, and it isn't super safe for users. They will receive an extra warning for this.

The below code example shows how to use the signTransaction() API to only sign the transaction, without submitting it to the Aptos blockchain.

const wallet = getAptosWallet(); // see "Connecting"

// Example Transaction
const transaction = {
arguments: [address, '717'],
function: '0x1::coin::transfer',
type: 'entry_function_payload',
type_arguments: ['0x1::aptos_coin::AptosCoin'],
};

try {
const signTransaction = await (window as any).aptos.signTransaction(
transaction,
);
} catch (error) {
// see "Errors"
}


Developers
Signing Messages
Signing Messages
A web app can also request the user to sign a message, by using Petra API: wallet.signMessage(payload: SignMessagePayload)

Web apps can write their own message and then send it to Petra. The user will be prompted to sign that message, and then the signed message will be returned to the web app.

The following is provided for additional security.

signMessage(payload: SignMessagePayload) prompts the user with the payload.message to be signed
returns Promise<SignMessageResponse>
Types:

export interface SignMessagePayload {
address?: boolean; // Should we include the address of the account in the message
application?: boolean; // Should we include the domain of the dapp
chainId?: boolean; // Should we include the current chain id the wallet is connected to
message: string; // The message to be signed and displayed to the user
nonce: string; // A nonce the dapp should generate
}

export interface SignMessageResponse {
address: string;
application: string;
chainId: number;
fullMessage: string; // The message that was generated to sign
message: string; // The message passed in by the user
nonce: string;
prefix: string; // Should always be APTOS
signature: string; // The signed full message
}
Example message and response
signMessage({nonce: 1234034, message: "Welcome to dapp!" })

This would generate the fullMessage to be signed and returned as the signature:

APTOS
nonce: 1234034
message: Welcome to dapp!
Verifying a signature
The most common use case for signing a message is to verify ownership of a private resource.

import nacl from 'tweetnacl';
import { HexString } from 'aptos';

const message = 'hello';
const nonce = 'random_string';

try {
const response = await window.aptos.signMessage({
message,
nonce,
});
const { publicKey } = await window.aptos.account();
// Remove the 0x prefix
const key = publicKey!.slice(2, 66);
const verified = nacl.sign.detached.verify(
new TextEncoder().encode(response.fullMessage),
new HexString(response.signature).toUint8Array(),
new HexString(key).toUint8Array(),
);
console.log(verified);
} catch (error) {
console.error(error);
}