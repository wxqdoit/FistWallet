
Connect Wallet
Quick Start
Integrate Bitget Wallet
Get Eth Provider

const provider = window.bitkeep.ethereum
Connect the wallet

window.bitkeep.ethereum.enable()
Construct Transaction Data

const transactionParameters = {
nonce: '0x00', // ignored by Bitkeep
gasPrice: '0x09184e72a000', // customizable by user during Bitkeep confirmation.
gas: '0x2710', // customizable by user during Bitkeep confirmation.
to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
from: Provider.selectedAddress, // must match user's active address.
value: '0x00', // Only required to send ether to the recipient from the initiating external account.
data:
'0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by Bitkeep.
};

Sign and BoardCast

const txHash = await Provider.request({
method: 'eth_sendTransaction',
params: [transactionParameters],
});


Connect Wallet
Mainnets
Aptos
Wallet Standard
Method	Parameters	Returns	Description
connect	None	Promise<{ publicKey: string; address: string }>	Connects to the wallet and returns account info
account	None	Promise<string>	Retrieves the current wallet address
isConnected	None	Promise<boolean>	Checks if the wallet is currently connected
network	None	Promise<string>	Retrieves the current network name or ID
onAccountChange	callback: (address: string) => void	void	Registers a callback for account changes
onNetworkChange	callback: (network: string) => void	void	Registers a callback for network changes
onDisconnect	callback: () => void	void	Registers a callback for disconnection
signTransaction	transaction: object, options?: object	Promise<string>	Signs a transaction and returns the signature
signMessage	msg: string	Promise<string>	Signs an arbitrary message with the wallet
disconnect	None	Promise<void>	Disconnects the wallet
Connect to Bitget Wallet
Provider

const provider = window.bitkeep.aptos
Connect
Return


interface ConnectResult {
publicKey: string; // your publicKey on aptos
address: string;  // your address on aptos
}
Usage


// @return ConnectResult
const response = await provider.connect();
Try It

"root":{}0 items

function Connect(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.aptos;
const res = await provider.connect();
console.log('res',res);
setRes(res);
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>get address</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Get Account
Returns


interface AccountResult {
publicKey: string; // your publicKey on aptos
address: string;  // your address on aptos
}
Usasge


// @return AccountResult
await provider.account();
Network
The user may change accounts while interacting with the DApp, and this can be monitored via onAccountChange.

Parameters


interface AptosAccountChangeCallback {
(newAccount: Account): void;
}
Usage


window.bitkeep.aptos.onAccountChange((newAccount) => {
console.log(newAccount)
});
Try It


function AccountChangeDemo(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.aptos;
const res = await provider.connect();
console.log('connect res',res);
}
async function disconnect() {
const provider = window.bitkeep.aptos;
await provider.disconnect();
console.log('disconnect res',res);
}
useEffect(() => {
window.bitkeep.aptos.onAccountChange(account => {
console.log('onAccountChange', account);
setRes({
account
})
});
}, [])
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>connect</Button>
<Button onClick={disconnect}>disconnect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

OnNetworkChange
The DApp needs to ensure that the user is connected to the target network, so it needs to get the current network, switch networks, and listen for network changes.

Usage


// Current network
let network = await window.bitkeep.aptos.network();

// event listener for network changing
window.bitkeep.aptos.onNetworkChange((newNetwork) => {
network = newNetwork; // { networkName: 'Mainnet' }
})
Sign Message
SignArbitrary
Parameters


interface SignMessagePayload {
address?: boolean; // Should we include the address of the account in the message
application?: boolean; // Should we include the domain of the dapp
chainId?: boolean; // Should we include the current chain id the wallet is connected to
message: string; // The message to be signed and displayed to the user
nonce: string; // A nonce the dapp should generate
}

Return


interface AptosSignatureOutput {
chainId: number;         // Aptos chain ID (1 = mainnet)
application: string;     // App origin URL
address: string;         // Wallet address (hex)
publicKey: string;       // Wallet public key
message: string;         // Message to be signed
nonce: number;           // Unique number to prevent replay
prefix: string;          // Message prefix (e.g., "APTOS")
fullMessage: string;     // Full message that was signed
signature: string;       // Signature of the full message
}
Usage


// @params AptosSignatureInput
// @return AptosSignatureOutput<Promise>
provider.signMessage({nonce: 1234034, message: "hello bitget wallet" })
Try It

hello bitget wallet
"root":{}0 items

function SignMessageDemo(){
const [res, setRes] = useState({});
const [message, setMessage] = useState('hello bitget wallet');
async function sign() {
const provider = window.bitkeep.aptos;
const res = await provider.signMessage({nonce: 1234034, message });
setRes(res);
}
return (
<div style={{marginTop: 12}}>
<Form layout='inline'>
<Form.Item>
<Input value={message} onChange={e => setMessage(e.target.value)} />
</Form.Item>
<Form.Item>
<Button  onClick={sign}>sign</Button>
</Form.Item>
</Form>
<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
</div>
)
}

Transaction
Sign Transaction
Sign a transaction but do not submit it to the Aptos blockchain. Returns the signed transaction, which the DApp then submits.

Parameters


interface TransactionInput {
arguments: (string | number)[];      // Parameters passed to the function
function: string;                    // Target function to call (module::function)
type: 'entry_function_payload';      // Payload type (fixed value)
type_arguments: string[];            // Generic type arguments (e.g., coin type)
}

Returns


interface TransactionOutput {

}

Usage



// Example Transaction
const transaction = {
arguments: [address, '717'],
function: '0x1::coin::transfer',
type: 'entry_function_payload',
type_arguments: ['0x1::aptos_coin::TestCoin'],
};

// @param TransactionInput
// @returns
const signTransaction = await provider.signTransaction(transaction)

Send Transaction
there are two ways to send transaction, send by wallet or by dapp


// send transaction by bitget wallet
const pendingTransaction = await window.bitkeep.aptos.signAndSubmitTransaction(transaction);

// or send transaction by dapp
const client = new AptosClient('https://testnet.aptoslabs.com');
client.waitForTransaction(pendingTransaction.hash);

Connect Wallet
Mainnets
Aptos-AIP-62
Aptos-AIP-62
AIP-62 standard is a new standard officially introduced by Aptos. It is a set of chain-agnostic interfaces and conventions designed to improve the interaction between applications and injected wallets. It uses the Wallet Standard method to detect installed wallets and automatically display a list of connectable wallets. AIP-62 also upgrades the data interfaces for interaction between DApps and wallets, such as the encapsulated RawTransaction, etc.

Tip
In the near future, as wallets adopt the new standard, wallet adapters will deprecate the old standard and only retain support for the AIP-62  wallet standard.

When running a DApp in the Bitget Wallet App or in the Chrome browser with the Chrome Extension installed, the app can achieve wallet injection by wrapping AptosWalletAdapterProvider.


import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

<AptosWalletAdapterProvider autoConnect>
  <App />
</AptosWalletAdapterProvider>;
Wallet Basic Method
Get wallet list
DApps can directly use hooks to get the list of wallets registered via registerWallet:


import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { wallets } = useWallet(); // [{name: 'Bitget Wallet', icon: '...'}]
Connect Wallet
Pass the wallet name to the connect method to connect to a specified wallet:

Parameters

name - string：wallet name

import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { connect } = useWallet(); // [{name: 'Bitget Wallet', icon: '...'}]

await connect("Bitget Wallet");
Get Wallet Address

import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { account } = useWallet(); // {address: '...', publicKey: '...'}
Get Network

import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { network } = useWallet();
Message
Sign Message
Parameters

options
message - string
nonce - string

import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { signMessage } = useWallet();

const res = await signMessage({
message: "The message to be signed and displayed to the user",
nonce: "1",
});
Verify Message
Signing information is intended to verify ownership of private resources.


import nacl from 'tweetnacl';
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { signMessage, account } = useWallet();

const message = "hello";
const nonce = "random_string"

try {
const response = await signMessage({
message,
nonce,
});
// Remove the 0x prefix
const key = account.publicKey!.slice(2, 66);
const verified = nacl.sign.detached.verify(Buffer.from(response.fullMessage),
Buffer.from(response.signature, 'hex'),
Buffer.from(key, 'hex'));
console.log(verified);
} catch (error) {
console.error(error);
}
Transaction
Sign Transaction

import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { signTransaction } = useWallet();

const transaction = {
arguments: ["100000", "330679"],
function:
"0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::router::swap_exact_input",
type: "entry_function_payload",
type_arguments: [
"0x1::aptos_coin::AptosCoin",
"0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT",
],
};
try {
const res = await signTransaction(transaction);
} catch (error) {
// see "Errors"
}
Sign and Send Transaction

import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { signAndSubmitTransaction } = useWallet();

try {
const pendingTransaction = await signAndSubmitTransaction({
data: transaction,
});
} catch (error) {
// see "Errors"
}

Connect Wallet
Mainnets
BTC
BTC
When running a DApp in the Bitget Wallet App or in the Chrome browser with the Chrome Extension installed, you can access the global object window.bitkeep.unisat for subsequent API calls.


const provider = window.bitkeep.unisat
Supported Version
Bitget Wallet only supports this feature in the following versions:

Platform	Version	Description
Chrome Extension	>=v2.1.1	mainnet
App(IOS)	>= 7.3.9	mainnet
App(Android)	>= 7.3.9	mainnet
Note
Note Some methods may have exceptions and will be supported in new versions.

Platform	Version	function
Chrome Extension	>=v2.2.0	getBalance, getInscriptions, pushTx
App(IOS)	>= 8.8.0	getBalance, getInscriptions, pushTx
App(Android)	>= 8.8.0	getBalance, getInscriptions, pushTx
Connect to Bitget Wallet
Request to Connect to Wallet

Parameters:

none
Return Value:

Promise returns string[]: Current account address

try {
let accounts = await unisat.requestAccounts();
console.log('connect success', accounts);
} catch (e) {
console.log('connect failed');
}
> connect success ['tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz']
Account
getAccounts
Get Current Account Address

Parameters:

none
Returns:

Promise - string: Current account address

try {
let res = await unisat.getAccounts();
console.log(res)
} catch (e) {
console.log(e);
}
> ["tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz"]
getPublicKey
Get Current User’s Public Key

Parameters:

none
Returns:

Promise - string: publicKey

try {
let res = await unisat.getPublicKey();
console.log(res)
} catch (e) {
console.log(e);
}
> "03cbaedc26f03fd3ba02fc936f338e980c9e2172c5e23128877ed46827e935296f"
getBalance
Get Account Balance

Parameters:

none
Returns:

Promise - Object
confirmed - number : the confirmed satoshis
unconfirmed - numbet: the unconfirmed satoshis
total - number: the total satoshis

try {
let res = await unisat.getBalance();
console.log(res)
} catch (e) {
console.log(e);
}

> {
"confirmed":0,
"unconfirmed":100000,
"total":100000
}
NetWork
getNetwork
Get Current Network

Parameters:

none
Returns:

Promise - string: the network. livenet | testnet | signet

try {
let res = await unisat.getNetwork();
console.log(res)
} catch (e) {
console.log(e);
}
> 'livenet'
switchNetwork
Switch Network

Parameters:

network - string: the network. livenet | testnet | signet
Returns

none

try {
let res = await unisat.switchNetwork("livenet");
console.log(res)
} catch (e) {
console.log(e);
}

> 'livenet'
Inscriptions
getInscriptions
Get Current Account’s Inscriptions

Parameters:

none
Returns:

Promise - Object
total - number : Total count
list - Object[] :
inscriptionId - string : Inscription ID
inscriptionNumber - string : Inscription Number
address - string : Inscription Address
outputValue - string : Inscription Output Value
content - string : Inscription Content URL
contentLength - string : Inscription Content Length
contentType - number : Inscription Content Type
preview - number : Preview link
timestamp - number : Inscription Block Time
offset - number : Inscription Offset
genesisTransaction - string : Genesis Transaction ID
location - string : Current Location

try {
let res = await unisat.getInscriptions(0,10);
console.log(res)
} catch (e) {
console.log(e);
}

> {
"total":10,
"list":[
{
inscriptionId: '6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531i0',
inscriptionNumber: 959941,
address: 'bc1q8h8s4zd9y0lkrx334aqnj4ykqs220ss735a3gh',
outputValue: 546,
preview: 'https://ordinals.com/preview/6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531i0',
content: 'https://ordinals.com/content/6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531i0',
contentLength: 53,
contentType: 'text/plain;charset=utf-8',
timestamp: 1680865285,
genesisTransaction: '6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531',
location: '6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531:0:0',
output: '6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531:0',
offset: 0
}
]
}
sendInscription
Send Inscription

Parameters:

address - string: Recipient Address
inscriptionId - Inscription id
options - Object: (optional)
feeRate - number: Network Fee Rate
Returns:

Promise - Object:
txid - string : the txid

try {
let { txid } = await unisat.sendInscription("tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny","e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0",{feeRate:15});
console.log("send Inscription 204 to tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny",{txid})
} catch (e) {
console.log(e);
}
Sign And Vefify Message
signMessage
sign message

Parameters:

msg - string: String to be Signed
type - string: (Optional) “ecdsa” | “bip322-simple”. default is “ecdsa”. Optional Parameters for Signing
Returns:

Promise - string: Signature Result


// sign by ecdsa
try {
let res = await provider.signMessage("abcdefghijk123456789");
console.log(res)
} catch (e) {
console.log(e);
}

bip322-simple Sign

try {
let res = await window.unisat.signMessage("abcdefghijk123456789","bip322-simple");
console.log(res)
} catch (e) {
console.log(e);
}


Verify Message

import { verifyMessage } from "@unisat/wallet-utils";
const pubkey = "026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac";
const message = "abcdefghijk123456789";
const signature = "G+LrYa7T5dUMDgQduAErw+i6ebK4GqTXYVWIDM+snYk7Yc6LdPitmaqM6j+iJOeID1CsMXOJFpVopvPiHBdulkE=";
const result = verifyMessage(pubkey,message,signature);
console.log(result);
Trsansaction
sendBitcoin
Send BTC

Parameters:

toAddress - to: Address to send
satoshis - Amount of Satoshis Sent
options - object: (optional)
feeRate - number: Network Fee Rate
Returns:

Promise - string: Transaction id

try {
let txid = await unisat.sendBitcoin("tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz",1000);
console.log(txid)
} catch (e) {
console.log(e);
}
pushTx
Push Transaction

Parameters

options - Object:
rawtx - string: Broadcast Transaction
Returns

Promise - string: the txid

try {
let txid = await unisat.pushTx({
rawtx:"0200000000010135bd7d..."
});
console.log(txid)
} catch (e) {
console.log(e);
}
signPsbt
Sign PSBT This method will iterate through all inputs that match the current address for signing.

Parameters

psbtHex - string: Hexadecimal string of the PSBT to be signed.
options: object
autoFinalized - boolean: Whether to finalize the PSBT after signing, default is true.
toSignInputs - array:
index - number: Which input to sign.
address - string: (Specify at least address or public key) Corresponding private key used for signing.
publicKey - string: (Specify at least address or public key) Corresponding private key used for signing.
sighashTypes - number[]: (Optional) sighashTypes.
disableTweakSigner - boolean: (Optional) By default, tweakSigner is used to generate signatures when signing and unlocking Taproot addresses. Enabling this option allows signing with the raw private key.
Returns

Promise - string: Hexadecimal string of the signed PSBT.

try {
let res = await unisat.signPsbt(
"70736274ff01007d....",
{
autoFinalized:false,
toSignInputs:[
{
index: 0,
address: "tb1q8h8....mjxzny",
},
{
index: 1,
publicKey: "tb1q8h8....mjxzny",
sighashTypes: [1]
},
{
index: 2,
publicKey: "02062...8779693f",
}
]
}
);
console.log(res)
} catch (e) {
console.log(e);
}

signPsbts
Sign Multiple PSBTs at once This method will iterate through all inputs that match the current address for signing.

Parameters

psbtHexs - string[]: Hexadecimal strings of the PSBTs to be signed.
options - object[]: Options for signing the PSBTs.
autoFinalized - boolean: Whether to finalize the PSBT after signing, default is true.
toSignInputs - array:
index - number: Which input to sign.
address - string: (Specify at least address or public key) Corresponding private key used for signing.
publicKey - string: (Specify at least address or public key) Corresponding private key used for signing.
sighashTypes - number[]: (Optional) sighashTypes.
disableTweakSigner - boolean: (Optional) By default, tweakSigner is used to generate signatures when signing and unlocking Taproot addresses. Enabling this option allows signing with the raw private key.
Returns

Promise - string[]: Hexadecimal strings of the signed PSBTs.

try {
let res = await unisat.signPsbts(["70736274ff01007d...","70736274ff01007d..."]);
console.log(res)
} catch (e) {
console.log(e);
}

pushPsbt
Broadcast PSBT

Parameters

psbtHex - string: Hexadecimal string of the PSBT to be broadcasted.
Returns

Promise - string: Transaction ID

try {
let res = await unisat.pushPsbt("70736274ff01007d....");
console.log(res)
} catch (e) {
console.log(e);
}


Connect Wallet
Mainnets
Cosmos
Cosmos
Wallet Standard
Method	Parameters	Return Value	Description
connect	chainId?: string	Promise<void>	Connect to the wallet
disconnect	None	Promise<void>	Disconnect from the wallet
getAccount	chainId: string	Promise<{address: string, pubkey: Uint8Array}>	Get account info for the specified chain
getOfflineSignerAuto	chainId: string	Promise<OfflineAminoSigner | OfflineDirectSigner>	Get an offline signer
signArbitrary	chainId: string, signer: string, data: string	Promise<StdSignature>	Sign arbitrary data
signDirect	chainId: string, signer: string, signDoc: SignDoc	Promise<DirectSignResponse>	Direct signing
signAmino	chainId: string, signer: string, signDoc: StdSignDoc	Promise<AminoSignResponse>	Amino signing
sendTx	chainId: string, tx: Uint8Array, mode: BroadcastMode	Promise<Uint8Array>	Send transaction
Supported Shains
Chain	Chain ID	Description
MANTRA	mantra-mainnet-1	A DeFi and staking protocol in the Cosmos ecosystem, focusing on compliant finance and cross-chain asset liquidity management.
Celestia	celestia-mainnet-1	Pioneering modular blockchain specializing in data availability layers to provide scalable infrastructure for other chains.
Coreum	coreum-mainnet-1	Enterprise-grade blockchain supporting WASM smart contracts, emphasizing interoperability and financial compliance.
Saga	saga-mainnet-1	Application-specific chain protocol for gaming/entertainment, offering one-click chain deployment and horizontal scalability.
Cosmos Hub	cosmoshub-4	Core hub of the Cosmos ecosystem, enabling cross-chain interoperability via IBC protocol. Native token: ATOM.
Xion	xion-mainnet-1	User-centric universal abstraction layer, providing end-to-end abstraction for accounts, fees, and interactions.
Nillion	nil-chain-mainnet-1	Privacy-focused compute network leveraging non-blockchain architecture (NMC) for high-speed confidential data processing.
Osmosis	osmosis-1	Leading DEX in Cosmos, specializing in cross-chain liquidity and innovative AMM mechanisms.
Connect to Bitget Wallet
Provider

const provider = window.bitkeep && window.bitkeep.keplr;
Account
get account info, such as address or public and so on

Usage


getKey(chainId: string): Promise<{
// Name of the selected Wallet.
name: string;
algo: string;
pubKey: Uint8Array;
address: Uint8Array;
bech32Address: string;
}>
Try It

"root":{}0 items

function GetAccountDemo(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.keplr;
const result = await provider.getKey('osmosis-1');
setRes({
result
});
}
return (
<div style={{marginTop:12}}>
<Button style={{margin: '12px 0'}} onClick={connect}>connect</Button>
<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
</div>
)
}

Enable
Usage


enable(chainId: string): Promise<void>
Try It


function Connect(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.keplr;
const result = await provider.enable('osmosis-1');
setRes({
result
});
}
return (
<Button style={{margin: '12px 0'}} onClick={connect}>connect</Button>
)
}

Account Change Event
监听账户变化事件。

Usage


provider.on('keplr_keystorechange', () => {
console.log('账户已变化')
})
Sign Message
Signs arbitrary data using the specified account and chain ID.
Commonly used for off-chain signing (e.g., user authentication or authorization).
Usage


interface StdSignature {
signature: string; // The actual signature string (typically base64-encoded)
pub_key: {
type: string;  // The type of public key (e.g., "tendermint/PubKeySecp256k1")
value: string; // The base64-encoded public key value
};
}
/**
* Verifies a previously generated signature against the original data and signer.
* @param chainId - The chain ID used during signing
* @param signer - The Bech32 address of the signer
* @param data - The original data that was signed
* @param signature - The StdSignature object to verify
* @returns A promise that resolves to a boolean indicating whether the signature is valid
  */
  function verifyArbitrary(
  chainId: string,
  signer: string,
  data: string | Uint8Array,
  signature: string
  ): Promise<boolean> {
  // Implementation goes here
  }

/**
* @param chainId - The chain ID (e.g., "cosmoshub-4")
* @param signer - The Bech32 address of the account performing the signature
* @param data - The raw data to be signed (as a string or byte array)
* @returns Promise<StdSignature> - A promise that resolves to a StdSignature object containing the signature and public key
  */
  function signArbitrary(
  chainId: string,
  signer: string,
  data: string | Uint8Array
  ): Promise<StdSignature> {
  // Implementation goes here
  }

Try It import from “@codes/Cosmos/SignArbitrary”;

"root":{}0 items

function SignMessageDemo(){
const [res, setRes] = useState({});
const message = 'hello bitget wallet'
const chainId = 'osmosis-1'
async function sign() {
const provider = window.bitkeep.keplr;
const signResult = await provider.signArbitrary(
'osmosis-1',
provider._state.address,
message
);
setRes({
signResult
});
}
async function verify() {
const provider = window.bitkeep.keplr;
const verifyResult = await provider.verifyArbitrary(
chainId,
provider._state.address,
message,
res.signResult.signature
);
setRes({
verifyResult
});
}
return (
<div style={{marginTop: 12}}>
<Button.Group>
<Button  onClick={sign}>sign</Button><Button  onClick={verify}>verify</Button>
</Button.Group>
<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
</div>
)
}

Transaction
SignAmino
signAmino is a method used to sign transactions using the Amino JSON format, which is a legacy serialization format used in the Cosmos ecosystem (especially with older Cosmos SDK versions and wallets like Keplr).

Usage


// Represents a single unit of currency and its amount
interface Coin {
denom: string;  // The unit of currency (e.g., "uatom")
amount: string; // The amount (as a string to support large integers)
}

// Represents the fee information for a transaction
interface StdFee {
amount: readonly Coin[]; // Array of fee amounts
gas: string;             // Gas limit
granter?: string;        // (Optional) Address of the fee granter
payer?: string;          // (Optional) Address of the fee payer
}

// Represents an Amino message used in signing documents
interface AminoMsg {
type: string; // The type of the message (e.g., "cosmos-sdk/MsgSend")
value: any;   // The actual message content (object structure depends on the message type)
}

// Represents the full document to be signed in Amino JSON format
interface StdSignDoc {
chain_id: string;                 // Chain ID
account_number: string;          // Account number of the signer
sequence: string;                // Sequence number for preventing replay
fee: StdFee;                     // Fee information
msgs: readonly AminoMsg[];       // Array of messages
memo: string;                    // Optional memo field for notes
timeout_height?: string;         // (Optional) Timeout height for transaction expiration
}

interface SignAminoResponse {
signed: StdSignDoc,
signature: {
signature: string,
pub_key: {
type: string,
value: string
}
}
}

function signAmino(
chainId: string,
signer: string,
signDoc: StdSignDoc
): Promise<SignAminoResponse>

Try It

"root":{}0 items


function SignMessageDemo(){
const [res, setRes] = useState({});
const message = 'hello bitget wallet'

	async function sign() {
			const provider = window.bitkeep.keplr;
			const chainId = 'osmosis-1';
			const address = provider._state.address
			const signDoc = {
				"chain_id": chainId,
				"account_number": "0",
				"sequence": "0",
				"fee": {
					"gas": "0",
					"amount": [
						{amount: '0', denom: 'uosmo'}
					]
				},
				"msgs": [
					{
						"type": "sign/MsgSignData",
						"value": {
							"signer": address, // address
							"data": btoa(message)
						}
					}
				],
				"memo": ""
			}
			const res = await provider.signAmino(
				chainId,
				address,
				signDoc
			);
			setRes(res);
	}
	return (
		<div style={{marginTop: 12}}>
			<Button  onClick={sign}>sign</Button>
			<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
		</div>
	)
}

SignDirect
Params


signDirect(chainId:string, signer:string, signDoc: {
/** SignDoc bodyBytes */
bodyBytes?: Uint8Array | null;
/** SignDoc authInfoBytes */
authInfoBytes?: Uint8Array | null;
/** SignDoc chainId */
chainId?: string | null;
/** SignDoc accountNumber */
accountNumber?: Long | null;
}): Promise<DirectSignResponse>
Usage


import { TxBody, AuthInfo, SignerInfo, Fee } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import {MsgSend} from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import {Any} from 'cosmjs-types/google/protobuf/any'
function getBodyBytes(from, to, v) {
const msgSend = MsgSend.fromPartial({
fromAddress: from,
toAddressL: to,
amount: [{ denom: "uosmo", amount: v}]
});
const msgSendAny = Any.fromPartial({
typeUrl: "/cosmos.bank.v1beta1.MsgSend",
value: MsgSend.encode(msgSend).finish()
});
const txBody = TxBody.fromPartial({
messages: [msgSendAny],
memo: "test",
timeoutHeight: '0',nonCriticalExtensionOptions: []
});
return TxBody.encode(txBody).finish();
}

function getAuthInfoBytes(pubKey, sequence) {
const pubKeyAny = Any.fromPartial({
typeUrl: '/cosmos.crypto.secp256k1.PubKey',
value: pubKey
})
const signerInfo = SignerInfo.fromPartial({
publicKey: pubKeyAny,
modeInfo: { single: { mode: 1 } },
sequence: sequence
})
const feeValue = Fee.fromPartial({
amount: [{ denom: "uosmo", amount: "600" }],
gasLimit: '200000',
"granter": "",
"payer": ""
})
const authInfo = AuthInfo.fromPartial({ signerInfos: [signerInfo], fee: feeValue })
return AuthInfo.encode(authInfo).finish()
}

interface SignAminoResponse {
signed: StdSignDoc,
signature: {
signature: string,
pub_key: {
type: string,
value: string
}
}
}

const signDoc = {
bodyBytes: getBodyBytes(),
authInfoBytes: authInfoBytes(),
chainId: 'osmosis-1',
accountNumber: ''  //
}

function signDirect(
chainId: string,
signer: string,
signDoc
): Promise<SignAminoResponse>
Try It

"root":{}0 items


function SignMessageDemo(){
const [res, setRes] = useState({});
function getBodyBytes(from, to, v) {
const msgSend = MsgSend.fromPartial({
fromAddress: from,
toAddressL: to,
amount: [{ denom: "uosmo", amount: v}]
});
const msgSendAny = Any.fromPartial({
typeUrl: "/cosmos.bank.v1beta1.MsgSend", // 直接指定 typeUrl
value: MsgSend.encode(msgSend).finish()  // 直接编码消息体
});
const txBody = TxBody.fromPartial({
messages: [msgSendAny],
memo: "test",
timeoutHeight: '0',nonCriticalExtensionOptions: []
});
return TxBody.encode(txBody).finish();
}

	function getAuthInfoBytes(pubKey, sequence) {
		const pubKeyAny = Any.fromPartial({
			typeUrl: '/cosmos.crypto.secp256k1.PubKey',
			value: pubKey
		})
		const signerInfo = SignerInfo.fromPartial({
			publicKey: pubKeyAny,
			modeInfo: { single: { mode: 1 } },
			sequence: ''
		})
		const feeValue = Fee.fromPartial({
			amount: [{ denom: "uosmo", amount: "600" }],
			gasLimit: '200000',
			"granter": "",
			"payer": ""
		})
		const authInfo = AuthInfo.fromPartial({ signerInfos: [signerInfo], fee: feeValue })
		return AuthInfo.encode(authInfo).finish()
	}
	async function sign() {
			const provider = window.bitkeep.keplr;
			const chainId = 'osmosis-1';
			const address = provider._state.address
			const {pubKey} = await provider.getKey(chainId);
			const signDoc = {
				bodyBytes: getBodyBytes(address, address, '500000'),
				authInfoBytes: getAuthInfoBytes(pubKey),
				chainId,
				accountNumber: ''
			}
			
			const res = await provider.signDirect(
				chainId,
				address,
				signDoc
			);
			
			setRes(res);
	}
	return (
		<div style={{marginTop: 12}}>
			<Button  onClick={sign}>sign</Button>
			<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
		</div>
	)
}

SignDirectAux
SignDirectAux interface

Attribute	Type	Description
bodyBytes	Uint8Array	Protobuf serialized representation of TxBody, matching TxRaw (required)
chainId	string	Unique identifier of the target chain to prevent signature replay attacks (required)
accountNumber	bigint	Account number in the state (required)
signDirectAux is a variant signing method API. It allows the wallet to sign a transaction but does not return a complete signature object. Instead, it returns partial signature data. This is particularly useful for multi-signature (multi-sig) accounts, as they require multiple different signers to sign the transaction separately before combining the signatures.

Similar to CosmJS OfflineDirectSigner’s signDirect, but bitkeep signDirect requires chain-id as a mandatory parameter. Signs Proto-encoded StdSignDoc.

sendTx
Request Transaction Broadcast


sendTx(
chainId: string,
tx: Uint8Array,
mode: BroadcastMode
): Promise<Uint8Array>;


Connect Wallet
Mainnets
Evm
Standard Wallet Methods
Method	Parameters	Return Type	Description
enable	()	Promise	Connection method, returns account information
isConnected	()	boolean	Gets connection status
addCurrency	()	Promise	Adds a token
switchChain	(method, data)	Promise	Switches blockchain network
disconnect	()	Promise	Disconnects the wallet
signPersonalMessage	(data)	Promise	Signs a personal message
signTypedMessage	(data)	Promise	Signs a typed message
request	(payload, callback)	Promise	General eth call method. payload.method can be eth_sign, personal_sign, eth_sendTransaction, eth_accounts, etc. callback is called after the method executes
Connect to Bitget Wallet
Provider

const provider = window.bitkeep.ethereum
enable

Preview
used to request account access from the user’s Ethereum wallet

Usage


/**
* @returns {*} [ address ] address list
  /
  await provider.enable()
  Try It

"root":{}0 items

function Connect(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.ethereum;
const address = await provider.enable();
setRes(address);
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>get address</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

isConnected
ethereum.isConnected() checks if the wallet is currently connected to the dApp.
Returns true if the provider is connected, and false otherwise.
Usage


/**
* @returns {*} Boolean : if connected the wallet
  /
  await provider.isConnected()
  Try It

"root":{}0 items

function Connect(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.ethereum;
const result = await provider.isConnected();
setRes({
result
});
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>Try It</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Manage networks
wallet_swithEthereumChain

Preview
wallet_switchEthereumChain is a method provided by Ethereum-compatible wallets (like Bitget) that allows decentralized applications (dApps) to request the user to switch their wallet to a different blockchain network.

Usage



interface SwitchEthereumChainParams {
method: 'wallet_switchEthereumChain';
params: {
chainId: string; // 例如 '0xA4B1'
}[];
}

/*
* @param SwitchEthereumChainParams
  */
  await provider.request(switchEthereumChainParams)
  Try It

ChainId
0xA4B1

function SwitchChainDemo(){
const [chainId, setChainId] = useState('0xA4B1');
async function switchChain() {
const provider = window.bitkeep.ethereum;
const res = await provider.request({
method: 'wallet_switchEthereumChain',
params: [{ chainId }],
});
console.log(res);
}
return (
<div style={{margin: '12px 0'}}>
<Form layout='inline'>
<Form.Item label='ChainId'>
<Input placholder='ChainId' value={chainId} onChange={e => setChainId(e.target.value)} />
</Form.Item>
<Form.Item>
<Button  onClick={switchChain}>Switch Ethereum Chain</Button>
</Form.Item>
</Form>
</div>
)
}

wallet_AddEthereumChain
wallet_addEthereumChain is a method used by Ethereum-compatible wallets (like Bitget) that allows a decentralized application (dApp) to programmatically request the user to add a new blockchain network to their wallet.

Usage



interface AddEthereumChainParams {
method: 'wallet_switchEthereumChain';
params: {
chainId: string; // 例如 '0xA4B1'
}[];
}

/*
* @param SwitchEthereumChainParams
  */
  await provider.request(addEthereumChainParams)
  Try It


function AddChainDemo(){
async function addChain() {
const provider = window.bitkeep.ethereum;
const res = await provider.request({
method: 'wallet_addEthereumChain',
params: [{
chainId: '0x89',
chainName: 'Polygon Mainnet',
nativeCurrency: {
name: 'MATIC',
symbol: 'MATIC',
decimals: 18
},
rpcUrls: ['https://polygon-rpc.com/'],
blockExplorerUrls: ['https://polygonscan.com/']
			  }]
});
console.log(res);
}
return (
<Button style={{margin: '12px 0'}} onClick={addChain}>Add Ethereum Chain</Button>
)
}

Sign Data
SignPersonalMessage
Chrome
App

Preview

Preview
personal_sign (commonly referred to as signPersonalMessage) is used to sign arbitrary text messages with a user’s Ethereum private key.

Usage



interface PersonalSignMessage {
method: string;
params: {
msgHex: string; // the message you sign, must convert to hex
from: string;   // user account address
};
}


/**
* @param   {*} PersonalSignMessage :
* @returns {*} Boolean : if connected the wallet
  /
  await provider.signPersonalMessage(message)
  Try It

hello bitget wallet
"root":{}0 items

function SignMessageDemo(){
const [res, setRes] = useState({});
const [message, setMessage] = useState('hello bitget wallet');
async function sign() {
const provider = window.bitkeep.ethereum;
const [address] = await provider.enable()
const messageObj = {
method: 'personal_sign',
params: {
msgHex: web3.utils.utf8ToHex(message),
from: address
}
}
const signature = await provider.signPersonalMessage(messageObj);
setRes({signature});
}
return (
<div>
<Form layout='inline'>
<Form.Item>
<Input value={message} onChange={e => setMessage(e.target.value)} />
</Form.Item>
<Form.Item>
<Button  onClick={sign}>sign</Button>
</Form.Item>
</Form>
<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
</div>
)
}

SignTypedData
Chrome
App

Preview

Preview
The eth_signTypedData function (or eth_signTypedData_v4 specifically) is used to sign structured data according to the EIP-712 standard. This standard allows applications to create cryptographic signatures for complex and structured data, ensuring that the signature is both human-readable and verifiable.

Usage


interface EIP712Domain {
name: string;
version: string;
chainId: number;
verifyingContract: string;
}

interface Person {
name: string;
wallet: string;
}

interface Mail {
from: Person;
to: Person;
contents: string;
}

interface TypedDataField {
name: string;
type: string;
}

interface TypedData {
types: {
EIP712Domain: TypedDataField[];
[key: string]: TypedDataField[];
};
domain: EIP712Domain;
primaryType: string;
message: Record<string, any>;
}

interface SignTypedDataV4Param {
method: 'eth_signTypedData_v4';
params: [string, string]  // account and JSON.stringify(typedData)
}

/*
*  @param signTypedDataV4Param
*  @returns string : signature
   */
   provider.request({
   method: 'eth_signTypedData_v4',
   params: [account, data ],
   });
   Try It


function SignTypedDataDemo() {
const [chainId, setChainId] = useState('0xA4B1');
async function sign() {
const provider = window.bitkeep.ethereum;
const domain = {
name: 'MyDApp',
version: '1',
chainId: 1, // Ethereum Mainnet
verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', // fake address
};

		  const types = {
		    Person: [
		      { name: 'name', type: 'string' },
		      { name: 'wallet', type: 'address' },
		    ],
		    Mail: [
		      { name: 'from', type: 'Person' },
		      { name: 'to', type: 'Person' },
		      { name: 'contents', type: 'string' },
		    ],
		  };
		
		  const message = {
		    from: {
		      name: 'Alice',
		      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',  // mock address
		    },
		    to: {
		      name: 'Bob',
		      wallet: '0xAaaAaAaaAaAaAaaAaAaAaaAaAaAaAaAaAaAaAaAa', // mock address
		    },
		    contents: 'Hello Bob!',
		  };
		
		  const data = JSON.stringify({
		    types: {
		      EIP712Domain: [
		        { name: 'name', type: 'string' },
		        { name: 'version', type: 'string' },
		        { name: 'chainId', type: 'uint256' },
		        { name: 'verifyingContract', type: 'address' },
		      ],
		      ...types,
		    },
		    domain,
		    primaryType: 'Mail',
		    message,
		  });
			const [account] = await provider.enable()
			const res = await provider.request({
		    method: 'eth_signTypedData_v4',
		    params: [account, data ],
		  });
			console.log(res);
	}
	return (
		<div style={{margin: '12px 0'}}>
			<Button  onClick={sign}>Sign Typed Data</Button>
		</div>
	)
}

wallet_watchAsset
EIP-747

Specified by the EIP-747  standard.

Parameters

WatchAssetParams - Metadata of the asset to be watched.

interface WatchAssetParams {
type: 'ERC20'; // In the future, other standards will be supported
options: {
address: string; // The address of the token contract
'symbol': string; // A ticker symbol or shorthand, up to 11 characters
decimals: number; // The number of token decimals
image: string; // A string url of the token logo
};
}
Returns

boolean - True if the token is added, otherwise false.

Description

Requests the user to track a token in Bitget Wallet. Returns a boolean indicating whether the token was successfully added.

Ethereum wallets support a set of tokens, usually from a centrally managed token registry. wallet_watchAsset allows web3 application developers to request their users to track tokens in their wallet at runtime. Once added, the token is indistinguishable from tokens added through traditional methods (e.g., centralized registries).



Provider
.request({
method: 'wallet_watchAsset',
params: {
type: 'ERC20',
options: {
address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
symbol: 'FOO',
decimals: 18,
image: 'https://foo.io/token-image.svg',
},
},
})
.then((success) => {
if (success) {
console.log('FOO successfully added to wallet!');
} else {
throw new Error('Something went wrong.');
}
})
.catch(console.error);
Transaction
Chrome
App

Preview

Preview


const transactionParameters = {
nonce: '0x00', // ignored by Bitkeep
gasPrice: '0x09184e72a000', // customizable by user during Bitkeep confirmation.
gas: '0x2710', // customizable by user during Bitkeep confirmation.
to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
from: Provider.selectedAddress, // must match user's active address.
value: '0x00', // Only required to send ether to the recipient from the initiating external account.
data:
'0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by Bitkeep.
};

// txHash is a hex string
// As with any RPC call, it may throw an error
const txHash = await Provider.request({
method: 'eth_sendTransaction',
params: [transactionParameters],
});

// if used web3
const accounts = await Provider.request({ method: 'eth_requestAccounts' });
const web3 = new Web3(Provider);
const result = await web3.eth.sendTransaction({
from: Provider.selectedAddress,
to: '0x0000000000000000000000000000000000000000',
value: web3.utils.toWei('1', 'ether'),
});

Connect Wallet
Mainnets
Near
Near
Wallet Standard
When running a DApp in the Bitget Wallet App or in the Chrome browser with the Chrome Extension installed, you can access the global object window.bitkeep.near for subsequent API calls.

Injected object properties and methods

Method	Parameters	Return Type	Description
getAccountId	()	string	Get the account ID
getPublicKey	()	string	Get the public key
requestSignIn	(params)	Promise	Request user sign-in
isSignedIn	()	boolean	Check if the user is signed in
signOut	()	Promise	Sign out the current user
signAndSendTransaction	(param)	Promise	Sign and send a transaction
verifyOwner	(message, accountId)	Promise	Verify account ownership
requestSignTransactions	({ transactions })	Promise	Request multiple transaction signatures
Collect to Bitget Wallet
requestSignIn
Triggers the NEAR Wallet login flow, requesting the user to sign in.

Usage


/**
* request signin the contract, with the view and change methods provided, return the access key
* @param {*} contractId contract account id
* @param {*} methodNames the method names on the contract that should be allowed to be called. Pass null for no method names and '' or [] for any method names.
* @param {*} createNew if need create new access key, set createNew = true. Default is false
* @returns { accessKey } signed in access key
  */
  provider.requestSignIn({ contractId, methodNames, createNew = false }): Promise<Result>
  Try It

"root":{}0 items

function Connect(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.near
const contractId = 'guest-book.testnet';
const methodNames = ['addMessage'];
const res = await provider.requestSignIn({ contractId, methodNames });
console.log(res);
// const address = await provider.getAccount();

	}
	return (
		<div >
			<Button style={{margin: '12px 0'}} onClick={connect}>Connect</Button>
			<ReactJsonView theme="monokai" src={res}/>
		</div>
	)
}

isSignedIn
Checks whether the user is currently signed in to the NEAR wallet.

Usage


window.bitkeep.isSignedIn()
Try It


function IsSignedInDemo() {
const [res, setRes] = useState({});
async function isSignedIn() {
const provider = window.bitkeep.near
const result = await provider.isSignedIn();
setRes({result})
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>Connect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

SignOut
disconnect current near wallet

Usage


window.bitkeep.signOut()
Try It


function SignOutDemo() {
const [res, setRes] = useState({});
async function signOut() {
const provider = window.bitkeep.near
const result = await provider.signOut();
setRes({result})
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>Connect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Account Method
Provider
When running a DApp in the Bitget Wallet App or in the Chrome browser with the Chrome Extension installed, you can access the global object window.bitkeep.near for subsequent API calls.


const provider = window.bitkeep.near
getAccountId
Returns the account ID (username) of the currently signed-in user.

Usage


window.bitkeep.getAccountId()
Try It

"root":{}0 items

function GetAccountIdDemo(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.near
const result = await provider.getAccountId()
setRes({result})
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>Connect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

getPublicKey
Retrieves the public key associated with the user’s account.

Usage


window.bitkeep.getPublicKey()
Try It

"root":{}0 items

function GetAccountIdDemo(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.near
const result = await provider.getAccountId()
setRes({result})
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>Connect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

VerifyOwner
Verifies that the current user is the real owner of a NEAR account by signing a message or making a secure call.

Usage


window.bitkeep.verifyOwner()
Try It

"root":{}0 items

function VerifyOwnerDemo(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.near
const res = await provider.verifyOwner({ accountId, message });
console.log(res);
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>Connect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Transaction
signAndSendTransaction

near.signAndSendTransaction({ receiverId: string, actions: Action}): Response;
signAndSendTransactions
Sign and Send Multiple Transaction RPC Requests


near.signAndSendTransactions({ receiverId: string, actions: Action}): Response;


Connect Wallet
Mainnets
Solana
Solana
When running a DApp in the Bitget Wallet App or in the Chrome browser with the Chrome Extension installed, you can access the global object window.bitkeep.solana for subsequent API calls.

Wallet Standard
connect(params?) - Connect to the wallet, returns Promise with accounts array
getAccount() - Get account information, returns Promise<string>
disconnect() - Disconnect, returns Promise<void>
signMessage(message) - Sign a message (supports Uint8Array or string), returns signature result array
getTransactionVersion(transaction) - Get transaction version, returns string
signTransaction(transaction) - Sign a transaction (supports Transaction, VersionedTransaction or Uint8Array), returns signed transaction array
signAllTransactions(transactions) - Sign multiple transactions, returns signed transaction array
signAndSendTransaction(transaction, sendOptions?) - Sign and send a transaction, returns transaction signature array
Connect to BitgetWallet
Provider

const provider = window.bitkeep.solana;
Connect

Preview
Usage


try {
// Connect to wallet, returns Wallet Standard format
const result = await provider.connect();
// result = { accounts: [{ address: string, publicKey: Uint8Array }] }

// Method 1: Get address from result
const address = result.accounts[0].address;

// Method 2: Use provider properties
const publicKeyString = await provider.getAccount(); // Returns base58 format public key string
const addressFromProvider = provider.publicKey.toString(); // Once connected
} catch (error) {
console.error('Connection error:', error);
alert("connected error");
}
Try It

"root":{}0 items

function Connect(){
const [res, setRes] = useState({});
async function connect() {
const provider = window.bitkeep.solana;
// connect() returns { accounts: [{ address: string, publicKey: Uint8Array }] }
const result = await provider.connect();
const address = await provider.getAccount();
setRes({
connectResult: {
accounts: result.accounts.map(acc => ({
address: acc.address,
publicKey: Array.from(acc.publicKey) // Convert Uint8Array to array for display
}))
},
address,
publicKey: provider.publicKey.toString()
});
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>Connect Wallet</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Connection Status

// Check connection status
const isConnected = provider.connected; // Returns boolean

// If connected, you can get account information
if (isConnected) {
const publicKeyString = await provider.getAccount(); // Returns base58 format public key string
const address = provider.publicKey.toString(); // String representation of PublicKey object
}
Sign Message
Chrome
App

Preview

Preview
Usage


//string
const result1 = await provider.signMessage("020006106e655af38ff7324bbf1d4e16b06084763269b9");
// Return format: [{ signedMessage: Uint8Array, signature: Uint8Array, signatureType: 'ed25519' }]

// uint8Array
const message = `You can use uint8array to verify`;
const encodedMessage = new TextEncoder().encode(message);
const result = await provider.signMessage(encodedMessage);
// result is an array containing the signature result
const { signedMessage, signature, signatureType } = result[0];

const nacl = require("tweetnacl");
const { PublicKey } = require("@solana/web3.js");
// Verify signature
nacl.sign.detached.verify(
signedMessage,
signature,
new PublicKey(address).toBytes()
);
Try It

Hello Bitget Wallet
"root":{}0 items

function SignMessageDemo(){
const [res, setRes] = useState({});
const [message, setMessage] = useState('Hello Bitget Wallet');
async function sign() {
const provider = window.bitkeep.solana;
// signMessage returns [{ signedMessage: Uint8Array, signature: Uint8Array, signatureType: 'ed25519' }]
const result = await provider.signMessage(new TextEncoder().encode(message));

			// Convert Uint8Array to array for display
			const formattedResult = result.map(item => ({
				signedMessage: Array.from(item.signedMessage),
				signature: Array.from(item.signature),
				signatureType: item.signatureType
			}));
			
			setRes(formattedResult);
	}
	return (
		<div>
			<Form layout='inline'>
				<Form.Item>
					<Input value={message} onChange={e => setMessage(e.target.value)} />
				</Form.Item>
				<Form.Item>
					<Button  onClick={sign}>Sign Message</Button>
				</Form.Item>
			</Form>
			<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
		</div>
	)
}

Event listeners
Use eventemitter3


provider.on("connect", () => console.log("connected!"));
Transaction
Versioned Transaction
Chrome
App

Preview

Preview
Solana introduced Versioned Transactions  with v0 transactions on October 10, 2022.

The goal of v0 is to increase the maximum capacity of transactions, thereby increasing the number of accounts that can fit in a single atomic transaction. Using LUTs, developers can now build transactions containing up to 256 accounts, whereas Legacy Transactions without LUTs can only contain up to 35 accounts.

Transactions containing Address Lookup Tables (LUTS)

1. Construct a Versioned Transaction

Versioned Transactions are constructed in a very similar way to legacy transactions, with the only difference being that developers should use the VersionedTransaction class instead of the Transaction class.

The following example demonstrates how to construct a simple transfer instruction. After sending the transfer instruction, construct a transaction message in MessageV0 format using the transfer instruction, and finally, create a new VersionedTransaction to parse the v0-compatible message.


import {
TransactionMessage,
VersionedTransaction,
SystemProgram,
} from "@solana/web3.js";

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
** 2. Sign Versioned Transaction**

Versioned transactions can be signed directly using the signTransaction method. This method call will return a Promise  of the signed Transaction. This is the same as the signing method for legacy transactions.


const provider = getProvider();
const network = "<NETWORK_URL>";
const connection = new Connection(network);

// Sign transaction, returns Wallet Standard format
const result = await provider.signTransaction(transactionV0);
// result is an array: [{ signedTransaction: Uint8Array }]
const { signedTransaction } = result[0];

// Send the signed transaction
const signature = await connection.sendRawTransaction(signedTransaction);
Legacy Transaction
1. Construct a Legacy Transaction


const pubKey = new PublicKey(publicKey.pubkey);
const transaction = new Transaction().add(
SystemProgram.transfer({
fromPubkey: publicKey,
toPubkey: publicKey,
lamports: 100,
})
);
transaction.feePayer = pubKey;

const anyTransaction: any = transaction;
anyTransaction.recentBlockhash = (
await connection.getLatestBlockhash()
).blockhash;

return transaction;
** 2. Sign Legacy Transaction**


const provider = getProvider();
const network = "<NETWORK_URL>";
const connection = new Connection(network);

// Sign transaction, returns Wallet Standard format
const result = await provider.signTransaction(transaction);
// result is an array: [{ signedTransaction: Uint8Array }]
const { signedTransaction } = result[0];

// Send the signed transaction
const signature = await connection.sendRawTransaction(signedTransaction);
3. Sign and Send Transaction

If you want to sign and send in one step, you can use the signAndSendTransaction method:


const provider = getProvider();
const network = "<NETWORK_URL>";
const connection = new Connection(network);

// Sign and send transaction
const result = await provider.signAndSendTransaction(transaction);
// result is an array: [{ signature: Uint8Array }]
const { signature } = result[0];

// signature is in Uint8Array format, can be converted to base58 string
const bs58 = require('bs58');
const signatureString = bs58.encode(signature);
console.log('Transaction signature:', signatureString);
4. Sign Multiple Transactions


const transactions = [transaction1, transaction2, transaction3];

// Sign all transactions
const results = await provider.signAllTransactions(transactions);
// results is an array: [{ signedTransaction: Uint8Array }, ...]
// Each element corresponds to a signed transaction

// Send all signed transactions
for (const { signedTransaction } of results) {
const signature = await connection.sendRawTransaction(signedTransaction);
console.log('Transaction signature:', signature);
}

Connect Wallet
Mainnets
StarkNet
StarkNet
When running a DApp in the Bitget Wallet App or Chrome browser with the installed Chrome Extension, you can obtain the global object window.bitkeep.starkstarknet_bitkeepnet and make subsequent API calls.


const provider = window.starknet_bitkeep; // Recommended method
const provider = window.starknet;
Injected Object Properties and Methods

name - string: Wallet name, value is ‘Bitget Wallet’.
icon - string: Wallet icon
version - string: Version number
chainId - string: Only supports mainnet, value is SN_MAIN
isConnected - boolean: Whether the current wallet is connected
selectedAddress - string: The currently selected wallet address
account - Account: Access the account object, inherited from starknet.js’s Account. For specific properties and methods on the instance, refer to starknet.js  documentation.
provider - Provider: Access the provider object, using starknet.js’s RpcProvider. For specific properties and methods on the instance, refer to starknet.js  documentation.
enable - () => [string]: Used to connect the wallet. After a successful call, it will bring up the Bitget Wallet connection wallet page. Users can decide whether to connect the current DApp. If the user agrees, a single item array of the selected address will be returned.
on - (event, callback) => void: Add event listener
accountsChanged event: Triggered when the user switches accounts, returning an array of new addresses; when disconnected, an empty array is returned.
off - (event, callback) => void: Remove event listener
disconnect - Disconnect the wallet
Connect to Bitget Wallet
Parameters

options - object: Optional
starknetVersion - v4 | v5: Default is v5

const [public_address] = await provider.enable();
//const [public_address] = await provider.enable({ starknetVersion: 'v4' });

const account = provider.account;
// account = {
//     address: "0x04a6f...52f4d801c84",
//     cairoVersion: "0",
//     sdkVersion: "v5",
//     ...
// }

provider.on("accountsChanged", (event) => {
// cb(event)...
});
Add Token
Parameters

type - string: wallet_watchAsset
params - object: Token information

const res = await provider.request({
type: 'wallet_watchAsset',
params: {
type: 'ERC20',
options: {
address: '0x0A4E1BdFA75292A98C15870AeF24bd94BFFe0Bd4',
symbol: 'FOTA',
name: 'FOTA'
}
}
})
Signature
Parameters

typedData - object: The object to be signed, refer to the EIP-712  standard Return Value
signature - string[]: The result of the signature, containing two items

const typedData = {
domain: {
name: "Starknet demo app",
version: "1",
chainId: 'SN_MAIN',
},
types: {
StarkNetDomain: [
{ name: "name", type: "felt" },
{ name: "version", type: "felt" },
{ name: "chainId", type: "felt" },
],
Message: [{ name: "message", type: "felt" }],
},
message: {
message: 'sign message test',
},
primaryType: "Message",
};
const [r, s] = await provider.signMessage(typedData);
Contract Call
Execute one or more calls. If there is only one call, transactions is an object with properties described below. If there are multiple calls, it is an array of objects. Parameters

transactions - object:
contractAddress - string: Contract address
entrypoint - string: Contract entry point
calldata - array: Call data
signature - array: Signature
abi - Contract ABI, optional Return Value
result - object
transaction_hash - string: Transaction hash

// Using StarkGate: ETH Token as an example
const transactions = {
contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
entrypoint: 'transfer',
calldata: CallData.compile({
recipient: '0x05b98d6ccbb660c3ca3c699f8dc0d2c8f58c539feac4fe2d57def7d2fa7312d1',
amount: cairo.uint256(1000000000n)
})
}
// "transactions": {
//     "contractAddress": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
//     "entrypoint": "transfer",
//     "calldata": [
//         "2589407029262891725723779965976037245771646239489440786683818579381309346513",
//         "1000000000",
//         "0"
//     ]
// },
const res = await provider.execute(transactions);
For other properties and methods on starknet.account and starknet.provider, please refer to the starknet.js  documentation.


Connect Wallet
Mainnets
Sui
Wallet Standard Features
Attribute	Type
connect	✅
disconnect	yes
signPersonalMessage	yes
signMessage	yes
signTransaction	yes
signTransactionBlock	yes
signAndExecuteTransaction	yes
signAndExecuteTransactionBlock	yes
Connect to Bitget Wallet
Provider
The Sui wallet is based on wallet-standard . Unlike other heterogeneous chains, the provider is obtained through events.


const chainName = 'suiMainnet';
const GlobalWallet = {
register: (wallet) => {
GlobalWallet[chainName] = wallet
}
}
const event = new CustomEvent('wallet-standard:app-ready', { detail: GlobalWallet });
window.dispatchEvent(event);

const provider = GlobalWallet[chainName]
Connect

Preview
Establishes a connection between the dApp and the user’s Sui wallet. This method typically prompts the user to authorize access to their wallet and returns account-related information upon approval.

Usage


	window.bitkeep.suiWallet.connect()
Returns

An array of wallet addresses/accounts the user granted access to.

interface ConnectResult {
accounts: Account[];
}
Try It

"root":{}0 items

function Connect(){
const [res, setRes] = useState({});
async function connect() {
const res = await window.bitkeep.suiWallet.connect();
setRes(res);
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>connect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Sign Message

Preview
Used to prompt the user to sign a personal message and return the signed message to the dApp. This is used to verify the user’s public key. if you use @mysten/sui < 1.0, please use signMessage, otherwise use signPersonalMessage instead

Note
If you’re using the latest version of the official Sui SDK, it’s recommended to use signPersonalMessage. Otherwise, fall back to signMessage.
Parameters

message: The message to be signed (string or Uint8Array).

interface SignMessageInput {
message: string | Uint8Array;
}
Returns

signature: The signed message in base64 or hex format.
publicKey: The public key used to generate the signature.
message: The original message that was signed.

interface SignMessageResult {
message: string;
signature: string;
publicKey: string;
}
Usage


const signature = await window.bitkeep.suiWallet.signPersonalMessage({message: "hello bitget wallet"});
Try It

hello bitget wallet
"root":{}0 items

function SignMessageDemo(){
const [res, setRes] = useState({});
const [message, setMessage] = useState('hello bitget wallet');
async function sign() {
const res = await window.bitkeep.suiWallet.signPersonalMessage({message});
setRes(res);
}
return (
<div>
<Form layout='inline'>
<Form.Item>
<Input value={message} onChange={e => setMessage(e.target.value)} />
</Form.Item>
<Form.Item>
<Button  onClick={sign}>sign</Button>
</Form.Item>
</Form>
<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
</div>
)
}

Sign Transaction
Chrome
App

Preview

Preview
Used to prompt the user to sign a personal message and return the signed message to the dApp. This is used to verify the user’s public key. if you use @mysten/sui < 1.0, please use signTransaction, otherwise use signTransactionBlock instead

Parameters

message: The message to be signed (string or Uint8Array).

import {Transaction} from "@mysten/sui/transactions";
interface signTransactionInput {
transaction: Transaction
}

// or

import {TransactionBlock} from "@mysten/sui.js/transactions";
interface signTransactionBlockInput {
transactionBlock: TransactionBlock
}
Returns

signature: The signed message in base64 or hex format.
bytes: The signed message in base64 format.

interface SignTransactionResult {
bytes: string;
signature: strin


Connect Wallet
Mainnets
Ton
Ton
When running a DApp in the Bitget Wallet App and in the Chrome browser with the installed Chrome Extension, you can obtain the global object window.bitkeep.ton for subsequent API calls.


const provider = window.bitkeep.ton;
Wallet Standard
send - (payload, callback) => any: Call different methods by using different payload.method (e.g., eth_accounts, eth_coinbase, net_version, eth_chainId)
isConnected - () => string: Get the connection status
_sendAsync - (payload) => Promise: Call different chain methods by using different payload.method (e.g., ton_connect, ton_disconnect, ton_requestAccounts, ton_requestWallets, ton_getBalance, ton_sendTransaction, ton_rawSign, ton_personalSign, ton_getChain, wallet_switchChain)
walletSwitchChain - (network) => void: Switch chain
signTransaction - (data) => object: Sign a transaction
disconnect - () => void: Disconnect
Support version
Platform	Version
Chrome Extension	>=v2.4.1
App(IOS)	>= 8.10.0
App(Android)	>= 8.10.0
Connect to Bitget Wallet
Provider

window.bitkeep.ton
Connect

// The type of the callback function triggered when accounts change
interface AccountsChangedCallback {
(accounts: string[]): void; // Receives an array of new account addresses
}

// The interface representing a provider that emits the 'accountsChanged' event
interface EthereumProvider {
on(event: 'accountsChanged', callback: AccountsChangedCallback): void;
}

provider.on('accountsChanged', (accounts) => {
console.log("New accounts:", accounts);
});

Try It

TypeError: Cannot read properties of undefined (reading 'ton')
aa

function AccountDemo(){
const [res, setRes] = useState({});
async function connect() {
window.bitkeep.ton.send('ton_requestAccounts');
}
async function getBalance() {
const balance = await window.bitkeep.ton.send('ton_getBalance');
setRes({
balance
});
}
useEffect(() => {
window.bitkeep.ton.on('accountsChanged', function (accounts) {
console.log(accounts);
setRes({
accounts
});
});
}, [])
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>connect</Button>
<Button onClick={getBalance}>balance</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Get Account

send('ton_requestAccounts'): Promise<[
string // current ton address
]>
Get Balance

send("ton_getBalance", address?: string): Promise<string>
Manage Network
mainnet or testnet

Get Chain

send( "ton_getChain"): Promise<ChainName: string>
Switch Network

send("wallet_switchChain", "mainnet"): Promise<void>;
On NetworkChange

// Callback type for chainChanged event
type ChainChangedCallback = (chainId: string) => void;

// Interface for provider event listening
interface TonProvider {
on(event: "chainChanged", callback: ChainChangedCallback): void;
}
Try It

TypeError: Cannot read properties of undefined (reading 'ton')

function OnAccountChangeDemo(){
const [chains, setChains] = useState([]);
const [res, setRes] = useState({});
useEffect(() => {
window.bitkeep.ton.on('chainChanged', function (chain) {
console.log('chainChanged', chain);
})
}, [])
async function getChain(chain) {
const chains = await window.bitkeep.ton.send('ton_getChain');
console.log('chains',chains);
setRes({
chains
});
}
async function switchChain(name) {
const switchChainResult = await window.bitkeep.ton.send('wallet_switchChain', name);
setRes({
switchChainResult
})
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={getChain}>Get Chain</Button>
<Button style={{margin: '12px 0'}} onClick={e => switchChain('mainnet')}>Switch Main Mainnet</Button>
<Button style={{margin: '12px 0'}} onClick={e => switchChain('testnet')}>Switch T Testnet</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Send Transaction

const seqNo = provider.send("ton_sendTransaction", [
{
to: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
value: "10000", // 10000 nanotons = 0.00001 TONs
data: "dapp for bitget",
dataType: "text",
},
]);


Connect Wallet
Mainnets
Tron
Wallet Standard
Method	Supported
sign	✅
setAddress	✅
setNode	✅
isConnected	✅
signMessageV2	✅
multiSign	✅
disconnect	✅
getVersion	✅
Connect to Bitget Wallet
Provider

const tronLink = window.bitkeep.tronLink;
const tronWeb = window.bitkeep.tronWeb;
SetAddress
Sets the default wallet address to be used (for sending transactions, checking balances, signing messages, etc.).

This does not set the private key — it only sets the default “from” address.
If you call methods like tronWeb.trx.sendTransaction() without explicitly specifying an address, this default one will be used.
Commonly used alongside a private key or a wallet like TronLink.

tronWeb.setAddress('TXXXXXXX...');
SetNode
Dynamically sets or replaces the current node configuration — for example, switching between FullNode, SolidityNode, or EventServer URLs.

Usually, setting just the fullNode is enough — TronWeb will use the same URL for other nodes if not explicitly defined.
Especially useful when connecting to a private chain or custom node.

// Set FullNode
tronWeb.setNode('fullNode', 'https://api.trongrid.io');

// Set SolidityNode
tronWeb.setNode('solidityNode', 'https://api.trongrid.io');

// Set EventServer
tronWeb.setNode('eventServer', 'https://api.trongrid.io');

Connect

Preview
Parameters


interface TronConnectInput {
method: 'tron_requestAccounts'
}
Returns


interface TronConnectResult {
code: number;
message: string
}
Usage


// @param TronConnectInput
// @return TronConnectResult
await tronLink.request({ method: "tron_requestAccounts" });
Try It

"root":{}0 items

function Connect(){
const [res, setRes] = useState({});
async function connect() {
const tronLink = window.bitkeep.tronLink;
const res = await tronLink.request({ method: "tron_requestAccounts" });
console.log('res',res);
setRes(res);
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>connect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Disconect
Returns


interface TronConnectResult {
code: number;
message: string
}
Usage


// @param TronConnectInput
// @return TronConnectResult
await tronLink.disconnect();
Try It

"root":{}0 items

function Dicconnect(){
const [res, setRes] = useState({});
async function connect() {
const tronLink = window.bitkeep.tronLink;
const res = await tronLink.disconnect();
console.log('res',res);
setRes(res);
}
return (
<div >
<Button style={{margin: '12px 0'}} onClick={connect}>disconnect</Button>
<ReactJsonView theme="monokai" src={res}/>
</div>
)
}

Sign Message

Preview
Parameters


type signedMessageV2Input string;
Returns


type signedMessageV2Output string;
Usage


// @param signedMessageV2Input
// @return signedMessageOutput
await tronWeb.trx.signMessageV2(message);
Try It

hello bitget wallet
"root":{}0 items

function SignMessageDemo(){
const [res, setRes] = useState({});
const [message, setMessage] = useState('hello bitget wallet');
async function sign() {
const provider = window.bitkeep.tronLink;
const result = await provider.signMessageV2(message);
setRes({
result
});
}
return (
<div style={{marginTop: 12}}>
<Form layout='inline'>
<Form.Item>
<Input value={message} onChange={e => setMessage(e.target.value)} />
</Form.Item>
<Form.Item>
<Button  onClick={sign}>sign</Button>
</Form.Item>
</Form>
<ReactJsonView style={{marginTop:12}} theme="monokai" src={res} />
</div>
)
}

Sign And Send Transaction
Chrome
App

Preview

Preview

var tx = await tronweb.transactionBuilder.sendTrx(
"TW8u1VSwbXY7o7H9kC8HmCNTiSXvD69Uiw",
1000000,
tronWeb.defaultAddress.base58
);
var signedTx = await tronweb.trx.sign(tx);
var broadcastTx = await tronweb.trx.sendRawTransaction(signedTx);
console.log(broadcastTx);
console.log(broadcastTx.txid);

// Token
let decimal = 18;
let Contract = await tronWeb
.contract()
.at("TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7"); // WIN
const decimalCall = Contract.decimals || Contract.DECIMALS;
if (decimalCall) {
decimal = await decimalCall().call();
}
let broadcastTx = await Contract.transfer(
"TW8u1VSwbXY7o7H9kC8HmCNTiSXvD69Uiw",
// "0xde0b6b3a7640000"
tronWeb.toHex(2 * Math.pow(10, decimal))
).send(); // { feeLimit: 10000000 }

console.log(broadcastTx);


Configurations
Deeplink
Deeplink
BKConnect is a Deeplink-based technology implementation that helps developers open the Bitget mobile wallet from a Dapp and jump to a specified location (portable parameters) to achieve fast and stable interaction with the Bitget mobile wallet.

Bitget Mobile Apps support Deeplink URL

Tip
Tips：Android only support https://bkcode.vip?{params} .

bitkeep://bkconnect?{params}
https://bkcode.vip?{params}
Common Pramas
Request Pramas

version -string BKConnect version
dappName -string DApp Name
dappIcon -string DApp Icon
action-string-Require
actionID-string-Require Action UUID
redirectUrl -string Callback URL
Response Pramas

status-string 0 success，1 fail
actionID-string Action UUID, same as Request
Open DApp
action = DApp
name	value type	Require	note
url	string	Require	DApp link
No Response


Uri uri = new Uri.Builder()
.scheme("bitkeep")
.authority("bkconnect")
.appendQueryParameter("action", "dapp")
.appendQueryParameter("url", url)
.appendQueryParameter("version", "1") ///
.build();
try {
Intent intent1 = new Intent(
Intent.ACTION_VIEW,
uri
);
startActivity(intent1);
}catch (Exception e){
Log.e("startActivityFail",e.toString());
}
Switch Network
Add _needChain=xxxx in url：

ETH：{DAppLink}?_needChain=eth
BSC：{DAppLink}?_needChain=bnb
Heco：{DAppLink}?_needChain=ht
Tips：need reload page

Get Account
action = getAccount
name	value type	Require	note
chain	string	Require	Chain name, Select from Chain Config
Response: address-string


Uri uri = new Uri.Builder()
.scheme("bitkeep")
.authority("bkconnect")
.appendQueryParameter("action", "getAccount")
.appendQueryParameter("dappIcon", icon)
.appendQueryParameter("actionId", actionId)
.appendQueryParameter("redirectUrl", redirectUrl)
.appendQueryParameter("dappName", name)
.appendQueryParameter("chain", chain)
.appendQueryParameter("version", "1")
.build();

try {
Intent intent1 = new Intent(
Intent.ACTION_VIEW,
uri
);
startActivity(intent1);
}catch (Exception e){

Log.e("startActivityFail",e.toString());
}
Add Token
action = addAsset
name	value type	Require	note
chain	string	Require	Chain name, Select from Chain Config
contract	string	Require	default 0x
symbol	string	Require	token symbol
Response: status-string 0 success, 1 fail


Uri uri = new Uri.Builder()
.scheme("bitkeep")
.authority("bkconnect")
.appendQueryParameter("action", "send")
.appendQueryParameter("from", from)
.appendQueryParameter("to", to)
.appendQueryParameter("contract", contract)
.appendQueryParameter("amount", amount)
.appendQueryParameter("redirectUrl", redirectUrl)
.appendQueryParameter("dappName", name)
.appendQueryParameter("dappIcon", icon)
.appendQueryParameter("chain", chain)
.appendQueryParameter("memo", "xxxxxmemo")
.appendQueryParameter("actionId", actionId)
.appendQueryParameter("version", "1")
.build();

try {
Intent intent1 = new Intent(
Intent.ACTION_VIEW,
uri
);
startActivity(intent1);
}catch (Exception e){

Log.e("startActivityFail",e.toString());
}
Send Transaction
action = send
name	value type	Require	note
chain	string	Require	Chain name, Select from Chain Config
contract	string	Require	default 0x
to	string	Require	receiver address
amount	string	Require
memo	string	optional	tx note
Response: hash-string hash


Uri uri = new Uri.Builder()
.scheme("bitkeep")
.authority("bkconnect")
.appendQueryParameter("action", "send")
.appendQueryParameter("from", from)
.appendQueryParameter("to", to)
.appendQueryParameter("contract", contract)
.appendQueryParameter("amount", amount)
.appendQueryParameter("redirectUrl", redirectUrl)
.appendQueryParameter("dappName", name)
.appendQueryParameter("dappIcon", icon)
.appendQueryParameter("chain", chain)
.appendQueryParameter("memo", "xxxxxmemo")
.appendQueryParameter("actionId", actionId)
.appendQueryParameter("version", "1")
.build();

try {
Intent intent1 = new Intent(
Intent.ACTION_VIEW,
uri
);
startActivity(intent1);
}catch (Exception e){

Log.e("startActivityFail",e.toString());
}
Sign
action = sign
name	value type	Require	note
chain	string	Require	Chain name, Select from Chain Config
signType	string	Require	[eth_sign/personal_sign/eth_signTypedData/eth_signTypedData_v3,/eth_signTypedData_v4]
msg	string	Require	sign message
Response: sign-string


//signType: personal_sign eth_signTypedData eth_sign eth_signTypedData_v3 eth_signTypedData_v4
String signType = 'personal_sign';
Uri uri = new Uri.Builder()
.scheme("bitkeep")
.authority("bkconnect")
.appendQueryParameter("action", "sign")
.appendQueryParameter("redirectUrl", redirectUrl)
.appendQueryParameter("dappName", name)
.appendQueryParameter("dappIcon", icon)
.appendQueryParameter("actionId", actionId)
.appendQueryParameter("msg", signMsg)
.appendQueryParameter("chain", chain) ///optional
.appendQueryParameter("signType", signType)
.appendQueryParameter("version", "1")
.build();

try {
Intent intent1 = new Intent(
Intent.ACTION_VIEW,
uri
);
startActivity(intent1);
}catch (Exception e){

Log.e("startActivityFail",e.toString());
}