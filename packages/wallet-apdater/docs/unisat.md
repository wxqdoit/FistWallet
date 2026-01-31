Developer Support
Open API Documentation
UniSat Wallet
UniSat Wallet API
Welcome to UniSat's Developer Documentation. This documentation is for learning to develop applications for UniSat Wallet.

Getting Started
To develop for UniSat Wallet, install UniSat Wallet on your development machine. Download here.

Once UniSat Wallet is installed and running, you should find that new browser tabs have a window.unisat object available in the developer console. This is how your website will interact with UniSat Wallet.

Browser Detection
To verify if the browser is running UniSat Wallet, copy and paste the code snippet below in the developer console of your web browser:


Copy
if (typeof window.unisat !== 'undefined') {
console.log('UniSat Wallet is installed!');
}
You can review the full API for the window.unisat object here.

Connecting to UniSat Wallet
"Connecting" or "logging in" to UniSat Wallet effectively means "to access the user's Bitcoin account(s)".

You should only initiate a connection request in response to direct user action, such as clicking a button. You should always disable the "connect" button while the connection request is pending. You should never initiate a connection request on page load.

We recommend that you provide a button to allow the user to connect UniSat Wallet to your dapp. Clicking this button should call the following method:


Copy
unisat.requestAccounts()
Demo
Online Demo

Demo source code

Methods
requestAccounts

Copy
unisat.requestAccounts()
Connect the current account.

Parameters

none

Returns

Promise returns string[] : Address of current account.

Example


Copy
try {
let accounts = await window.unisat.requestAccounts();
console.log('connect success', accounts);
} catch (e) {
console.log('connect failed');
}
> connect success ['tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz']
getAccounts

Copy
unisat.getAccounts()
Get address of current account

Parameters

none

Returns

Promise - string: address of current account

Example


Copy
try {
let res = await window.unisat.getAccounts();
console.log(res)
} catch (e) {
console.log(e);
}
> ["tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz"]
getNetwork

Copy
unisat.getNetwork()
get network

Please note that this method only supports bitcoin mainnet and bitcoin testnet. Due to the support for more networks, please switch to the getChain method.

Parameters

none

Returns

Promise - string: the network. livenet and testnet

Example


Copy
try {
let res = await window.unisat.getNetwork();
console.log(res)
} catch (e) {
console.log(e);
}

> 0
switchNetwork

Copy
unisat.switchNetwork(network)
switch network

Please note that this method only supports bitcoin mainnet and bitcoin testnet. Due to the support for more networks, please switch to the switchChain method.

Parameters

network - string: the network. livenet and testnet

Returns

none

Example


Copy
try {
let res = await window.unisat.switchNetwork("livenet");
console.log(res)
} catch (e) {
console.log(e);
}

> 0
getChain

Copy
unisat.getChain()
get chain

( Requires extension version greater than 1.4.0 )

Supported Chains
Parameters

none

Returns

Promise - Object:

enum - string : the enum of chain

name - string : the name of chain

network - string :  livenet or testnet

Example


Copy
try {
let res = await window.unisat.getChain();
console.log(res)
} catch (e) {
console.log(e);
}

>  {enum: 'BITCOIN_MAINNET', name: 'Bitcoin Mainnet', network: 'livenet'}
switchChain

Copy
unisat.switchChain(chain)
switch chain

( Requires extension version greater than 1.4.0 )

Parameters

chain - string: the chain. BITCOIN_MAINNET or BITCOIN_TESTNET or FRACTAL_BITCOIN_MAINNET

Returns

Promise - Object:

enum - string : the enum of chain

name - string : the name of chain

network - string :  livenet or testnet

Example


Copy
try {
let res = await window.unisat.switchChain("BITCOIN_MAINNET");
console.log(res)
} catch (e) {
console.log(e);
}

> {enum: 'BITCOIN_MAINNET', name: 'Bitcoin Mainnet', network: 'livenet'}
getPublicKey

Copy
unisat.getPublicKey()
Get publicKey of current account.

Parameters

none

Returns

Promise - string: publicKey

Example


Copy
try {
let res = await window.unisat.getPublicKey();
console.log(res)
} catch (e) {
console.log(e);
}
> 03cbaedc26f03fd3ba02fc936f338e980c9e2172c5e23128877ed46827e935296f
getBalance

Copy
unisat.getBalance()
Get BTC balance

Parameters

none

Returns

Promise - Object:

confirmed - number : the confirmed satoshis

unconfirmed - number : the unconfirmed satoshis

total - number : the total satoshis

Example


Copy
try {
let res = await window.unisat.getBalance();
console.log(res)
} catch (e) {
console.log(e);
}

> {
"confirmed":0,
"unconfirmed":100000,
"total":100000
}
getInscriptions

Copy
unisat.getInscriptions(cursor,size)
List inscriptions of current account

Parameters

none

Returns

Promise - Object:

total - number : the total count

list - Object[] :

inscriptionId - string : the id of inscription.

inscriptionNumber - string : the number of inscription.

address - string : the address of inscription.

outputValue - string : the output value of inscription.

content - string : the content url of inscription.

contentLength - string : the content length of inscription.

contentType - number : the content type of inscription.

preview - number : the preview link

timestamp - number : the blocktime of inscription.

offset - number : the offset of inscription.

genesisTransaction - string : the txid of genesis transaction

location - string : the txid and vout of current location

Example


Copy
try {
let res = await window.unisat.getInscriptions(0,10);
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
sendBitcoin

Copy
unisat.sendBitcoin(toAddress, satoshis, options)
Send BTC

Parameters

toAddress - string: the address to send

satoshis - number: the satoshis to send

options - object:  (optional)

feeRate - number: the network fee rate

memo - string: (optional)  The data content of OP_RETURN, which needs to be in UTF-8 or HEX encoded format.

memos - string[]: (optional) The data content of OP_RETURN, which needs to be in UTF-8 or HEX encoded format, provided in the form of an array.

Returns

Promise - string: txid

Example


Copy
try {
let txid = await window.unisat.sendBitcoin("tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz",1000);
console.log(txid)
} catch (e) {
console.log(e);
}
sendRunes

Copy
unisat.sendRunes(address, runeid, amount, options)
Send Runes

Parameters

address - string: the receiver address.

runeid - string: the runeid

amount - string: the amount to send

options - Object:  (optional)

feeRate - number: the network fee rate

Returns

Promise - Object:

txid - string : the txid

Example


Copy
try {
let txid = await window.unisat.sendRunes("tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny","63104:1",10,{feeRate:15});
console.log(txid)
} catch (e) {
console.log(e);
}
sendInscription

Copy
unisat.sendInscription(address, inscriptionId, options)
Send Inscription

Parameters

address - string: the receiver address.

inscriptionId - string: the id of Inscription

options - Object:  (optional)

feeRate - number: the network fee rate

Returns

Promise - Object:

txid - string : the txid

Example


Copy
try {
let txid = await window.unisat.sendInscription("tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny","e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0",{feeRate:15});
console.log("send Inscription 204 to tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny",txid)
} catch (e) {
console.log(e);
}
inscribeTransfer

Copy
unisat.inscribeTransfer(ticker, amount)
Inscribe BRC-20  TRANSFER Inscription

Parameters

ticker - string:  BRC-20 ticker

amount - string: the amount to inscribe

Returns

Promise - void:

Example


Copy

window.unisat.inscribeTransfer("ordi","100");
signMessage

Copy
unisat.signMessage(msg[, type])
sign message

Parameters

msg - string: a string to sign

type - string:  (Optional) "ecdsa" | "bip322-simple". default is "ecdsa"

Returns

Promise - string: the signature.

Example


Copy
// sign by ecdsa
try {
let res = await window.unisat.signMessage("abcdefghijk123456789");
console.log(res)
} catch (e) {
console.log(e);
}

> G+LrYa7T5dUMDgQduAErw+i6ebK4GqTXYVWIDM+snYk7Yc6LdPitmaqM6j+iJOeID1CsMXOJFpVopvPiHBdulkE=

// verify by ecdsa
import { verifyMessage } from "@unisat/wallet-utils";
const pubkey = "026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac";
const message = "abcdefghijk123456789";
const signature = "G+LrYa7T5dUMDgQduAErw+i6ebK4GqTXYVWIDM+snYk7Yc6LdPitmaqM6j+iJOeID1CsMXOJFpVopvPiHBdulkE=";
const result = verifyMessage(pubkey,message,signature);
console.log(result);

> true


// sign by bip322-simple
try {
let res = await window.unisat.signMessage("abcdefghijk123456789","bip322-simple");
console.log(res)
} catch (e) {
console.log(e);
}

> AkcwRAIgeHUcjr0jODaR7GMM8cenWnIj0MYdGmmrpGyMoryNSkgCICzVXWrLIKKp5cFtaCTErY7FGNXTFe6kuEofl4G+Vi5wASECaIeVi8xMtvjATqSSYPDRDjEsQbr0hSUpU7FHJNtVKqw=

pushTx

Copy
unisat.pushTx(options)
Push Transaction

Parameters

options - Object:

rawtx - string: rawtx to push

Returns

Promise - string: txid

Example


Copy
try {
let txid = await window.unisat.pushTx({
rawtx:"0200000000010135bd7d..."
});
console.log(txid)
} catch (e) {
console.log(e);
}
signPsbt

Copy
unisat.signPsbt(psbtHex[, options])
Sign PSBT

This method will traverse all inputs that match the current address to sign.

Parameters

psbtHex - string: the hex string of psbt to sign

options

autoFinalized - boolean: whether finalize psbt after signing, default is true

toSignInputs - array:

index - number: which input to sign

address - string: (at least specify either an address or a publicKey) Which corresponding private key to use for signing

publicKey - string: (at least specify either an address or a publicKey) Which corresponding private key to use for signing

sighashTypes - number[]: (optionals) sighashTypes

disableTweakSigner - boolean :(optionals)  Default value is false. Setting it true allows the use of the original private key when signing taproot inputs.

useTweakedSigner - boolean :(optionals)  . By setting useTweakedSigner, you can forcibly decide whether or not to use tweakedSigner. It has a higher priority than disableTweakSigner.

Returns

Promise - string: the hex string of signed psbt

Example


Copy
try {
let res = await window.unisat.signPsbt(
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

unisat.signPsbt("xxxxxxxx",{toSignInputs:[{index:0,publicKey:"xxxxxx",disableTweakSigner:true}],autoFinalized:false})
signPsbts

Copy
unisat.signPsbts(psbtHexs[, options])
Sign Multiple PSBTs at once

This method will traverse all inputs that match the current address to sign.

Parameters

psbtHexs - string[]: the hex strings of psbt to sign

options - object[]: the options of signing psbt

autoFinalized - boolean: whether finalize psbt after signing, default is true

toSignInputs - array:

index - number: which input to sign

address - string: (at least specify either an address or a publicKey) Which corresponding private key to use for signing

publicKey - string: (at least specify either an address or a publicKey) Which corresponding private key to use for signing

sighashTypes - number[]: (optionals) sighashTypes

useTweakedSigner - boolean :(optionals)  . By setting useTweakedSigner, you can forcibly decide whether or not to use tweakedSigner. It has a higher priority than disableTweakSigner.

Returns

Promise - string[]: the hex strings of signed psbt

Example


Copy
try {
let res = await window.unisat.signPsbts(["70736274ff01007d...","70736274ff01007d..."]);
console.log(res)
} catch (e) {
console.log(e);
}
pushPsbt

Copy
unisat.pushPsbt(psbtHex)
Push transaction

Parameters

psbtHex - string: the hex string of psbt to push

Returns

Promise - string: txid

Example


Copy
try {
let res = await window.unisat.pushPsbt("70736274ff01007d....");
console.log(res)
} catch (e) {
console.log(e);
}
Events
accountsChanged

Copy
unisat.on('accountsChanged', handler: (accounts: Array<string>) => void);
unisat.removeListener('accountsChanged', handler: (accounts: Array<string>) => void);
The accountsChanged will be emitted whenever the user's exposed account address changes.

networkChanged

Copy
unisat.on('networkChanged', handler: (network: string) => void);
unisat.removeListener('networkChanged', handler: (network: string) => void);
The networkChanged will be emitted whenever the user's network changes.