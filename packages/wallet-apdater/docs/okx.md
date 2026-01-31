# OKX Wallet

DApp 连接钱包
连接浏览器插件钱包
EVM
获取钱包地址
获取钱包地址#
钱包地址被用于多种场景，包括作为标识符和用于签名交易。

以以太坊为例，以太坊地址是账户的唯一公开标识符，每个账户都有一个对应的地址，地址用于在网络上进行交互和识别，而账户则包含了与该地址相关的所有状态信息和功能。

如果想请求用户的签名或让用户批准一笔交易，DApp 必须使用 eth_requestAccounts RPC 方法来访问用户的账户。

创建连接#
此处建议提供一个按钮，允许用户将OKX Wallet连接到 DApp。选择此按钮可调用 eth_requestAccounts 方法来访问用户帐户地址。

在下方的示例项目代码中，JavaScript 代码在用户点击连接按钮时访问用户的帐户地址，HTML 代码显示按钮和当前帐户地址：

HTML
JavaScript
<button class="connectEthereumButton">Connect to Ethereum</button>
监听账户地址变化#
您可以使用事件来监听变化:

okxwallet.on('accountsChanged', handler: (accounts: Array<string>) => void);
每当 eth_accounts RPC 方法的返回值发生变化时，OKX Wallet都会发出对应事件提醒。 eth_accounts 会返回一个为空或包含单个账户地址的数组，返回的账户地址如果存在，即为允许调用者访问的最近使用的账户地址。

由于调用者由其 URL origin 标识，所以具有相同来源（origin）的站点会持有相同的权限。只要用户公开的账户地址发生变化，就会发出 accountsChanged。

DApp 连接钱包
连接浏览器插件钱包
EVM
获取 chainId
获取 chainId#
所有的远程过程调用 (RPC) 请求都会提交给当前连接的网络，所以准确地获取用户的链 ID 在 EVM 系的应用开发中至关重要。

使用eth_chainId 方法监测用户当前的链 ID。侦听chainChanged 事件以监测用户更改网络的时间。

下方示例代码可用来获取当前网络以及用户更改网络的时间：

const chainId = await window.ethereum.request({ method: 'eth_chainId' });

window.ethereum.on('chainChanged', handleChainChanged);

function handleChainChanged(chainId) {
// We recommend reloading the page, unless you must do otherwise.
window.location.reload();
}
链 ID#
这些是OKX Wallet默认支持的以太坊链的 ID。

更多信息请咨询 chainid.network
。

十六进制	十进制	网络
0x1	1	Ethereum Main Network (Mainnet)
0x2711	10001	ETHW
0x42	66	OKT Chain Mainnet
0x38	56	Binance Smart Chain Mainnet
0x89	137	Matic Mainnet
0xa86a	43114	Avax Mainnet
0xfa	250	Fantom Mainnet
0xa4b1	42161	Arbitrum Mainnet
0xa	10	Optimism Mainnet
0x19	25	Cronos Mainnet
0x2019	8217	Klaytn Mainnet
0x141	321	KCC Mainnet
0x440	1088	Metis Mainnet
0x120	288	Boba Mainnet
0x64	100	Gnosis Mainnet
0x505	1285	Moonriver Mainnet
0x504	1284	Moonbeam Mainnet
0x406	1030	Conflux eSpace

DApp 连接钱包
连接浏览器插件钱包
EVM
添加代币
添加代币#
当用户打开OKX Wallet时，钱包上会显示各种包括代币的资产。默认情况下，OKX Wallet会自动检测一些主流的代币并自动显示该代币，但是其他大多数的代币需要用户自行添加。

虽然使用界面上的”添加代币“按钮也能达到此效果，但过程较为繁琐，而且由于涉及到用户与合约地址的互动，成本和出错概率都会增加。 相反，使用 EIP-747
中定义的 wallet_watchAsset API 可以改善用户添加代币时的体验，同时增加安全性。

例子#
如果您想把推荐代币功能添加到自己的网络应用中，可以参考以下代码：

const tokenAddress = '0xd00981105e61274c8a5cd5a88fe7e037d935b513';
const tokenSymbol = 'TUT';
const tokenDecimals = 18;
const tokenImage = 'http://placekitten.com/200/300';
try {
// wasAdded is a boolean. Like any RPC method, an error may be thrown.
const wasAdded = await okxwallet.request({
method: 'wallet_watchAsset',
params: {
type: 'ERC20', // Initially only supports ERC20, but eventually more!
options: {
address: tokenAddress, // The address that the token is at.
symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
decimals: tokenDecimals, // The number of decimals in the token
image: tokenImage, // A string url of the token logo
},
},
});

if (wasAdded) {
console.log('Thanks for your interest!');
} else {
console.log('Your loss!');
}
} catch (error) {
console.log(error);
}


DApp 连接钱包
连接浏览器插件钱包
EVM
签名交易
签名交易#
eth_sendTransaction

描述#
交易是区块链上的一个正式动作，在OKX Wallet中必须通过调用 eth_sendTransaction 方法来发起交易。交易可以涉及到简单的以太坊的发送，并可能会发送代币，创建一个新的智能合约，或以任何方式改变区块链上的状态。这些交易一定是由一个来自外部账户的签名，或一个简单的密钥对进行发起的。

在OKX Wallet中，可以使用 okxwallet.request 方法来发起一笔交易。

参数#
本部分主要介绍关于该文档所涉及的交易参数。该文档中大多数所涉及的交易参数都将由OKX Wallet处理。交易分为传统交易和 EIP-1559 交易，接下来依次讨论。

传统交易#
const transactionParameters = {
gasPrice: '0x09184e72a000', // customizable by user during OKX confirmation.
gas: '0x2710', // customizable by user during OKX confirmation.
to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
from: okxwallet.selectedAddress, // must match user's active address.
value: '0x00', // Only required to send ether to the recipient from the initiating external account.
data:
'0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by OKX.
};
Gas 价格 [可选] 可选参数 – 建议在私链上使用。

在以太坊中，每笔交易所消耗的 Gas 都会有一个指定的价格。区块生产者在创建下一个区块时，为了达到利润最大化，会优先处理 Gas 价格较高的交易。这意味着，一个较高的 Gas 价格通常会让你的交易被更快地处理，但代价则是更高的交易费用。请注意，此参数可能不适用于 L2 网络，因为 L2 网络可能有一个恒定的 Gas 价格，甚至不存在 Gas 价格。

换句话说，虽然你可以在OKX Wallet的默认网络上忽略这个参数，但是你的应用程序可能会比我们更了解目标网络的参数设定。在我们的默认网络中，OKX Wallet允许用户在打包交易的时候进行"慢"、"中"和"快"的选择，相对应越来越高的 Gas 溢价。

Gas 限制 [可选] 可选参数，并且为 DApp 开发者较少用到的参数。 Gas 限制是一个可选参数，我们会自动计算出一个合理的 Gas 价格。你应该能了解到所部署的智能合约是否曾因某些原因而受益于该自定义参数。

To [可选] 一个十六进制编码的 Ethereum 地址。与收件人进行交易时所需提供的参数（除合约创建外的所有交易）。 当没有 To 值，但有 data 值时，新合约就会被创建。

Value [可选] 要发送的网络本地货币的十六进制编码值。在主 Ethereum 网络中，即 Ether
。此值以 wei 计价，即 1e-18ether。

请注意，这些在以太坊中经常使用的数字比本地 JavaScript 数字的精度要高得多。如果没有提前判定，可能会导致未知的情况。出于这个原因，我们强烈建议你在操作用于区块链的数值时使用 BN.js
。

Data [可选] 创建智能合约时需要此参数。

这个数值也用于指定合约方法和它们的参数。你可在 the solidity ABI spec
上了解更多关于该数据的编码方式。

链 ID [目前已忽略] 链 ID 目前由用户当前选择的网络的 okxwallet.networkVersion 中得出。

返回值 DATA，32 字节 - 交易哈希，如果交易尚不可用，则为零哈希。

当你创建合约时，交易被挖掘后，使用 eth_getTransactionReceipt
获取合约地址。

EIP-1559 交易#
const transactionParameters = {
maxPriorityFeePerGas: "0x0", // Maximum fee, in wei, the sender is willing to pay per gas above the base fee.
maxFeePerGas: "0x6f4d3132b", // Maximum total fee (base fee + priority fee), in wei, the sender is willing to pay per gas.
gas: '0x2710', // customizable by user during OKX confirmation.
to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
from: okxwallet.selectedAddress, // must match user's active address.
value: '0x00', // Only required to send ether to the recipient from the initiating external account.
data:
'0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by OKX.
};
对于 EIP-1559
交易来说，与传统交易最大的不同就是使用 maxPriorityFeePerGas 和 maxFeePerGas 代替了 gasPrice。

maxPriorityFeePerGas [可选]

用户愿意支付给打包该交易的矿工/验证者的额外小费，激励其优先打包交易。

maxFeePerGas [可选]

用户愿意为每单位 gas 支付的最高总费用，包含基础费用和优先费用的总和。



DApp 连接钱包
连接浏览器插件钱包
EVM
智能合约交互
智能合约交互#
要与智能合约交互，DApp 需要对应合约部署的：

区块链
地址
ABI
字节码
源码
区块链#
如果你的合约没有连接到正确的区块链网络，交易将无法发送。许多 DApp 开发人员首先将他们的合同部署到测试网，以避免在主网开发和测试过程中出现问题带来的超额费用。

无论在哪个区块链上部署 DApp，必须确保用户能够访问。以以太坊为例，你可以使用
wallet_addEthereumChain
和 wallet_switchEthereumChain 这些 RPC 方法提示用户添加与切换对应的链。

合约地址#
无论是外部密钥对账户还是智能合约，每个账户都有一个地址。只有明确合约的确切地址后，才能确保合约库与合约之间的正常交互。

合约 ABI#
以以太坊为例，ABI
定义了智能合约与外部系统之间的交互方式，它是一组方法描述对象，当将其与特定的合约地址一起输入到合约库时，ABI 会指示库提供哪些方法，并且指导如何构造事务以调用对应方法。这种机制使得外部应用能够与智能合约的接口对齐，实现与智能合约的交互。在以太坊中，ABI 的主要作用是将函数调用和参数转换为 EVM（以太坊虚拟机）可以理解的数据格式。

示例库包括：

Ethers
web3.js
Embark
ethjs
Truffle
合约字节码#
如果 DApp 需要部署一个新的预编译智能合约，它需要包含字节码。你必须先发布合约，在交易完成后才能知道合约的具体地址。

即使你是通过字节码发布的合约，你仍然需要一个 ABI 来与合约进行交互。因为字节码本身并不能描述与合约的交互方式。

合约源码#
如果 DApp 允许用户编辑并编译智能合约的源码（类似于 Remix ），那需要导入一个完整的编译器。通过这种方式，你可以从源码中生成字节码和 ABI ，并在发布后的交易信息中获取到最终的合约地址。

DApp 连接钱包
连接浏览器插件钱包
EVM
切换网络
切换网络#
wallet_switchEthereumChain

EIP-3326
此方法由 EIP-3326
指定。
描述

此方法询问用户是否要切换到具有指定 chainId 的链上，并返回一个确认值。

与任何确认值出现的场景一样，wallet_switchEthereumChain 只能作为直接用户操作的结果调用，例如用户单击按钮的时候。

OKX Wallet会在以下情况下自动拒绝请求：

链 ID 格式错误
指定链 ID 所属的链尚未添加到OKX Wallet
我们建议你与
wallet_addEthereumChain
一起使用：

try {
await okxwallet.request({
method: 'wallet_switchEthereumChain',
params: [{ chainId: '0xf00' }],
});
} catch (switchError) {
// This error code indicates that the chain has not been added to OKX.
if (switchError.code === 4902) {
try {
await okxwallet.request({
method: 'wallet_addEthereumChain',
params: [
{
chainId: '0xf00',
chainName: '...',
rpcUrls: ['https://...'] /* ... */,
},
],
});
} catch (addError) {
// handle "add" error
}
}
// handle other "switch" errors
}
参数

Array

SwitchEthereumChainParameter

interface SwitchEthereumChainParameter {
chainId: string; // A 0x-prefixed hexadecimal string
}
链 IDs

这些是OKX Wallet默认支持的以太坊链的 ID。 更多信息请咨询 chainid.network
。

十六进制	十进制	网络
0x1	1	Ethereum Main Network (Mainnet)
0x2711	10001	ETHW
0x42	66	OKT Chain Mainnet
0x38	56	Binance Smart Chain Mainnet
0x89	137	Matic Mainnet
0xa86a	43114	Avax Mainnet
0xfa	250	Fantom Mainnet
0xa4b1	42161	Arbitrum Mainnet
0xa	10	Optimism Mainnet
0x19	25	Cronos Mainnet
0x2019	8217	Klaytn Mainnet
0x141	321	KCC Mainnet
0x440	1088	Metis Mainnet
0x120	288	Boba Mainnet
0x64	100	Gnosis Mainnet
0x505	1285	Moonriver Mainnet
0x504	1284	Moonbeam Mainnet
0x406	1030	Conflux eSpace
返回值

null - 如果此方法请求成功，该方法会返回 null，否则将会返回一个错误值。

如果错误码（error.code）为 4902，说明请求的链没有被OKX Wallet添加，另需要通过 wallet_addEthereumChain 请求添加。

DApp 连接钱包
连接浏览器插件钱包
EVM
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

连接账户#
eth_requestAccounts

EIP-1102
此方法由 EIP-1102
指定。 在底层逻辑上，它调用 wallet_requestPermissions 以获得 eth_accounts 权限。由于目前来说 eth_accounts 是唯一的权限，所以你现在仅需此方法。
描述

此方法请求用户提供一个以太坊地址来识别。返回值为一个解析为单个以太坊地址字符串数组的 Promise。如果用户拒绝该请求，Promise 将被拒绝并返回 4001 错误。

该请求会导致一个OKX Wallet的弹窗出现。你应该只在响应用户操作时请求账户，比如一个用户在单击按钮的时候。在请求仍处于待处理状态时，你应该始终禁用导致请求被分派的按钮。

如果你无法检索用户的账户，你应该鼓励用户发起账户请求。

返回值

string[] - 单个十六进制以太坊地址字符串的数组。

例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectEthereumButton">Connect Ethereum</button>
添加代币#
Note: 该功能仅在OKX Wallet插件端支持。

wallet_watchAsset#
EIP-747
此方法由 EIP-747
指定。
描述

此方法请求用户在OKX Wallet中关注某代币。返回一个布尔值，这个布尔值代表着代币是否已成功添加。

大多数以太坊钱包都支持关注一组代币，这些代币通常来自集中管理的代币注册表。 wallet_watchAsset 让 Web3 应用程序开发人员能够在运行时询问他们的用户去关注他们钱包中的代币。新添加的代币与通过原始方法（例如集中式注册表）添加的代币没有任何区别。

参数

WatchAssetParams - 要关注的资产的元数据。
interface WatchAssetParams {
type: 'ERC20'; // In the future, other standards will be supported
options: {
address: string; // The address of the token contract
'symbol': string; // A ticker symbol or shorthand, up to 11 characters
decimals: number; // The number of token decimals
image: string; // A string url of the token logo
};
}
返回值

boolean - 如果添加了代币为 true，否则为 false。

例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectEthereumButton btn">Connect Ethereum</button>
<button class="addTokenButton btn">Add Token</button>
支持 EIP-5792#
钱包支持批量发送多笔调用，查询交易结果等。

由 EIP-5792
规范定义。

wallet_sendCalls#
请求钱包批量发送多笔调用。

入参

type Capability = {
[key: string]: unknown;
optional?: boolean;
}

type SendCallsParams = {
version: string;
id?: string;
from?: `0x${string}`;
chainId: `0x${string}`;
atomicRequired: boolean;
calls: {
to?: `0x${string}`;
data?: `0x${string}`;
value?: `0x${string}`;
capabilities?: Record<string, Capability>;
}[];
capabilities?: Record<string, Capability>;
};
version：固定值， "2.0.0"
id：可选，请求的唯一标识，如果没有传入，钱包会自动生成 id
from：可选，发起请求的钱包地址，没有传入的话，则是当前连接的钱包
chainId：发起交易的链 id
atomicRequired：是否必须是原子交易，当前，通过 okx 发送的交易都是原子交易
calls：批量调用的列表
to：调用的合约地址
data：交易 data
value：转移主币的数量
capabilities：暂不支持
capabilities：暂不支持
返回值

type SendCallsResult = {
id: string;
capabilities?: Record<string, any>;
};
调用示例

window.okxwallet.request({
"method": "wallet_sendCalls",
"params": [
{
version: "2.0.0",
from: "0x819d3f4c17d50004c165d06f22418c4f28010eda",
chainId: "0x1",
atomicRequired: true,
calls: [
{
to: "0x54f1C1965B355e1AB9ec3465616136be35bb5Ff7",
value: "0x0"
},
{
to: "0x2D48e6f5Ae053e4E918d2be53570961D880905F2",
value: "0x0"
}
],
}
],
})
wallet_getCallsStatus#
获取之前通过 wallet_sendCalls 发送的交易的状态。

入参

// 入参
type GetCallsParams = [string];
通过 id 查询交易。

返回值

type GetCallsResult = {
version: string;
id: `0x${string}`;
chainId: `0x${string}`;
status: number;
atomic: boolean;
receipts?: {
logs: {
address: `0x${string}`;
data: `0x${string}`;
topics: `0x${string}`[];
}[];
status: `0x${string}`;
blockHash: `0x${string}`;
blockNumber: `0x${string}`;
gasUsed: `0x${string}`;
transactionHash: `0x${string}`;
}[];
capabilities?: Record<string, any>;
};
version：发送交易的版本
id：唯一标识
chainId：发起交易的链 id
status：交易的状态，
100：确认中
200：已确认
400：链下失败
500：被拒绝
receipts：交易的详细信息
capabilities：暂不支持
调用示例

window.okxwallet.request({
"method": "wallet_getCallsStatus",
"params": [
"0x123456"
],
})
wallet_getCapabilities#
返回钱包对相应atomic功能的支持信息。

入参

type GetCapabilitiesParams = [`0x${string}`, [`0x${string}`]];
第一个参数是要查询的地址
第二个参数是要查询的链的列表
返回值

type GetCapabilitiesResult = Record<`0x${string}`, <Record<string, any>>;
如果某条链不支持发送批量交易，则不会出现在查询结果中。

调用示例

window.okxwallet.request({
"method": "wallet_getCapabilities",
"params": [
"0x00b909cefa36ab6bc26f5887a867e46ef162238f0a171b1c2974b665afd4237f",
[
"0x1",
"0xaa36a7"
]
],
});

// 响应示例
{
"0x1": {
"atomic": {
"status": "supported"
}
},
"0xaa36a7": {
"atomic": {
"status": "ready"
}
}
}
事件#
OKX Wallet提供者实现了 Node.js
EventEmitter
API。 本节详细介绍了通过该 API 发出的事件。 网络上有其他各式各样的 EventEmitter 指南可供参考，本指南列出了如下一些事件：

okxwallet.on('accountsChanged', (accounts) => {
// Handle the new accounts, or lack thereof.
// "accounts" will always be an array, but it can be empty.
});

okxwallet.on('chainChanged', (chainId) => {
// Handle the new chain.
// Correctly handling chain changes can be complicated.
// We recommend reloading the page unless you have a very good reason not to.
window.location.reload();
});
另外，一旦你使用完监听器，请不要忘记将其删除（例如在 React 中卸载组件时）：

function handleAccountsChanged(accounts) {
// ...
}

okxwallet.on('accountsChanged', handleAccountsChanged);

// Later
okxwallet.removeListener('accountsChanged', handleAccountsChanged);
okxwallet.removeListener 的第一个参数是事件名称，第二个参数是对已传递给第一个参数中提到的事件名称的 okxwallet.on 的同一函数的引用。

connect

interface ConnectInfo {
chainId: string;
}

okxwallet.on('connect', handler: (connectInfo: ConnectInfo) => void);
OKX Wallet提供者会在第一次能够向链提交 RPC 请求时发出此事件。我们建议使用 connect 事件处理程序和 okxwallet.isConnected() 方法来确定OKX Wallet提供者的连接状态和连接时间。

disconnect

okxwallet.on('disconnect', handler: (error: ProviderRpcError) => void);
如果OKX Wallet提供者无法向任何链提交 RPC 请求，则会发出此事件。通常，这只会发生在网络连接问题或某些其他不可预见的错误状态下。

一旦发出 disconnect，提供者直到重新建立与链的连接之前将不会接受任何新请求，建立新连接需要重新加载页面。你还可以使用 okxwallet.isConnected() 方法来确定提供程序是否已断开连接。

accountsChanged

okxwallet.on('accountsChanged', handler: (accounts: Array<string>) => void);
每当 eth_accounts RPC 方法的返回值发生变化时，OKX Wallet提供程序都会发出此事件。 eth_accounts 会返回一个为空或包含单个账户地址的数组。返回的地址（如果存在）即为允许调用者访问的最近使用的账户地址。由于调用者由其 URL origin 标识，所以具有相同来源(origin)的站点会持有相同的权限。

只要用户公开的账户地址发生变化，就会发出 accountsChanged.

提示
我们计划在不久的将来允许 eth_accounts 数组能够包含多个地址。
chainChanged

提示
OKX Wallet的默认链及其链 ID 请参见 Chain IDs section。
当前连接的链发生变化时，OKX Wallet提供者会发出此事件。

所有的 RPC 请求都提交到当前连接的链上。因此，通过侦听此事件来跟踪当前链 ID 是至关重要的。

我们强烈建议在链更改时重新加载页面，当然你也可以通过需求自行选择。

okxwallet.on('chainChanged', (_chainId) => window.location.reload());
message

interface ProviderMessage {
type: string;
data: unknown;
}

okxwallet.on('message', handler: (message: ProviderMessage) => void);
OKX Wallet提供者在有需要通知消费者的消息时发出此事件。消息的种类由 type 字符串标识。

RPC 订阅更新是 message 事件的常见用例。 例如，如果你使用 eth_subscribe 创建订阅，则每个订阅更新都将作为 message 事件发出，其 type 为 eth_subscription。




DApp 连接钱包
连接浏览器插件钱包
Bitcoin
Provider API
Provider API#
什么是 Injected provider API？#
OKX Injected Providers API 基于 JavaScript 模型，由 OKX 嵌入用户访问网站中。DApp 项目可以通过调用此 API 请求用户账户信息，从用户所连接的区块链中读取数据，并协助用户进行消息和交易的签署。

connect#
okxwallet.bitcoin.connect()

描述

连接钱包

参数

无

返回值

Promise - object
address - string：当前账户的地址
publicKey - string：当前账户的公钥
示例

const result = await okxwallet.bitcoin.connect()
// example
{
address: 'bc1pwqye6x35g2n6xpwalywhpsvsu39k3l6086cvdgqazlw9mz2meansz9knaq',
publicKey: '4a627f388196639041ce226c0229560127ef9a5a39d4885123cd82dc82d8b497'
}
requestAccounts#
此字段仅适用于插件端版本 2.77.1 或更高。
okxwallet.bitcoin.requestAccounts()

描述

请求连接当前账户

参数

无

返回值

Promise - string[]：当前账户的地址
示例

try {
let accounts = await okxwallet.bitcoin.requestAccounts();
console.log('connect success', accounts);
} catch (e) {
console.log('connect failed');
}
// example
['tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz'];
getAccounts#
此字段仅适用于插件端版本 2.77.1 或更高。
okxwallet.bitcoin.getAccounts()

描述

获取当前账户地址

参数

无

返回值

Promise - string[]：当前账户地址
示例

try {
let res = await okxwallet.bitcoin.getAccounts();
console.log(res);
} catch (e) {
console.log(e);
}
// example
['tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz'];
getNetwork#
注意
不支持测试网络。
此字段仅适用于插件端版本 2.77.1 或更高。
okxwallet.bitcoin.getNetwork()

描述

获取网络

参数

无

返回值

Promise - string：网络
示例

try {
let res = await okxwallet.bitcoin.getNetwork();
console.log(res);
} catch (e) {
console.log(e);
}
// example
livenet;
getPublicKey#
此字段仅适用于插件端版本 2.77.1 或更高。
okxwallet.bitcoin.getPublicKey()

描述

获取当前账户的公钥

参数

无

返回值

Promise - string：公钥
示例

try {
let res = await okxwallet.bitcoin.getPublicKey();
console.log(res)
} catch (e) {
console.log(e);
}
// example
03cbaedc26f03fd3ba02fc936f338e980c9e2172c5e23128877ed46827e935296f
getBalance#
此字段仅适用于移动端版本 6.51.0 或更高以及插件端版本 2.77.1 或更高。
okxwallet.bitcoin.getBalance()

描述

获取 BTC 余额

参数

无

返回值

Promise - object：
confirmed - number：已确认的聪数量
unconfirmed - number：未经确认的聪数量
total - number：总聪量
示例

try {
let res = await okxwallet.bitcoin.getBalance();
console.log(res)
} catch (e) {
console.log(e);
}
// example
{
"confirmed":0,
"unconfirmed":100000,
"total":100000
}
getInscriptions#
此字段仅适用于移动端版本 6.51.0 或更高以及插件端版本 2.77.1 或更高。
okxwallet.bitcoin.getInscriptions()

描述

获取当前账户的铭文列表

参数

cursor - number： (可选) 偏移量，从 0 开始，默认值是 0
size - number： (可选) 每页的数量，默认值是 20
返回值

Promise - object：
total - number：总数
list - object[]：
inscriptionId - string：铭文 ID
inscriptionNumber - string： 铭文编号
address - string：铭文地址
outputValue - string：铭文的输出值
contentLength - string：铭文的内容长度
contentType - number：铭文的内容类型
timestamp - number：铭文的区块时间
offset - number：铭文的偏移量
output - string：当前铭文所在 UTXO 的标识
genesisTransaction - string：创世交易的交易 ID
location - string：当前位置的 txid 和 vout
目前仅移动端版本不支持以上字段：inscriptionNumber、contentLength、contentType、timestamp、genesisTransaction。
示例

try {
let res = await okxwallet.bitcoin.getInscriptions(0, 20);
console.log(res)
} catch (e) {
console.log(e);
}
// example
{
"total":10,
"list":[
{
inscriptionId: '6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531i0',
inscriptionNumber: 55878989,
address: 'bc1q8h8s4zd9y0lkrx334aqnj4ykqs220ss735a3gh',
outputValue: 546,
contentLength: 53,
contentType: 'text/plain',
timestamp: 1705406294,
location: '6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531:0:0',
output: '6037b17df2f48cf87f6b6e6ff89af416f6f21dd3d3bc9f1832fb1ff560037531:0',
offset: 0,
genesisTransaction: '02c9eae52923fdb21fe16ee9eb873c7d66fe412a61b75147451d8a47d089def4'
}
]
}
sendBitcoin#
此字段仅适用于插件端版本 2.77.1 或更高。
okxwallet.bitcoin.sendBitcoin(toAddress, satoshis, options)

描述

发送比特币

参数

toAddress - string：发送地址
satoshis - number：1. 发送的聪数量
options - object： (可选)
feeRate - number：网络资费率
返回值

Promise- string：交易哈希
示例

try {
let txid = await okxwallet.bitcoin.sendBitcoin(
'tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz',
1000
);
console.log(txid);
} catch (e) {
console.log(e);
}
send#
okxwallet.bitcoin.send({ from, to, value, satBytes })

描述

转移比特币 (支持 memo 字段)

参数

from - string：当前连接的钱包的 BTC 地址
to - string：接受 BTC 的地址
value - string：发送 BTC 的数量
satBytes - string： (可选) 自定义费率
memo - string： (可选) 指定 outputs OP_RETURN 内容 示例
memoPos - number： (可选) 指定 outputs OP_RETURN 输出位置，如果传了 memo 则必须传入 memoPos 指定位置，否则 memo 不生效
返回值

Promise - object
txhash：交易哈希
示例

const result = await window.okxwallet.bitcoin.send({
from: 'bc1p4k9ghlrynzuum080a4zk6e2my8kjzfhptr5747afzrn7xmmdtj6sgrhd0m',
to: 'bc1plklsxq4wtv44dv8nm49fj0gh0zm9zxewm6ayzahrxc8yqtennc2s9udmcd',
value: '0.000012',
});

// example
{
txhash: 'd153136cd74512b69d24c68b2d2c715c3629e607540c3f6cd3acc1140ca9bf57';
}
sendInscription#
此字段仅适用于移动端版本 6.51.0 或更高以及插件端版本 2.77.1 或更高。此外，移动端版本的 Atomicals 协议目前暂不支持此字段。
okxwallet.bitcoin.sendInscription(address, inscriptionId, options)

描述

发送铭文

参数

address - string：接收者地址

inscriptionId - string：铭文 ID + 协议，没有传协议则默认是 Ordinals NFT ，目前仅支持 Ordinals 及 Atomicals 协议

协议	描述
Ordinals	Ordinals 协议
Atomicals	Atomicals 协议
options - object： (可选)

feeRate - number：自定义费率
返回值

Promise - string：交易哈希
示例

// 发送 Ordinals NFT
try {
let txid = await okxwallet.bitcoin.sendInscription(
'tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny',
'e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
{ feeRate: 15 }
);
console.log(
'send Ordinal NFT to tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny',
{ txid }
);
} catch (e) {
console.log(e);
}
// 发送 Atomicals NFT
try {
let txid = await okxwallet.bitcoin.sendInscription(
'tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny',
'ab12349dca49643fcc55c8e6a685ad0481047139c5b1af5af85387973fc7ceafi0-Atomicals',
{ feeRate: 15 }
);
console.log(
'send Atomicals NFT to tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny',
{ txid }
);
} catch (e) {
console.log(e);
}
transferNft#
此字段当前仅适用于插件端版本，不适用于移动端版本。
okxwallet.bitcoin.transferNft({ from, to, data })

描述

发送铭文

与 sendInscription 方法的不同点
transferNft 方法支持批量转移，sendInscription 方法只支持单个转移

参数

from - string：当前连接的钱包的 BTC 地址

to - string：接受 NFT 的地址

data - string | string[]：发送的 NFT tokenId + 协议，如果是数组，则是批量转移多个 NFT ， 没有传协议则默认是 Ordinals NFT ，目前仅支持 Ordinals 及 Atomicals 协议

协议	描述
Ordinals	Ordinals 协议
Atomicals	Atomicals 协议
返回值

Promise - object
txhash - string：交易哈希
示例

// 发送 Ordinals NFT
try {
let res = await window.okxwallet.bitcoin.transferNft({
from: 'bc1p8qfrmxdlmynr076uu28vlszxavwujwe7dus0r8y9thrnp5lgfh6qu2ctrr',
to: 'bc1p8qfrmxdlmynr076uu28vlszxavwujwe7dus0r8y9thrnp5lgfh6qu2ctrr',
data: [
'2f285ba4c457c98c35dcb008114b96cee7c957f00a6993690efb231f91ccc2d9i0-Ordinals',
'2f2532f59d6e46931bc84e496cc6b45f87966b149b85ed3199265cb845550d58i0-Ordinals',
],
});
console.log(res);
} catch (e) {
console.log(e);
}
// example
{
txhash: 'df409c3ce3c4d7d840b681fab8a3a5b8e32b1600636cc5409d84d2c06365a5fc';
}
// 发送 Atomicals NFT
try {
let res = await window.okxwallet.bitcoin.transferNft({
from: 'bc1p8qfrmxdlmynr076uu28vlszxavwujwe7dus0r8y9thrnp5lgfh6qu2ctrr',
to: 'bc1p8qfrmxdlmynr076uu28vlszxavwujwe7dus0r8y9thrnp5lgfh6qu2ctrr',
data: [
'ab12349dca49643fcc55c8e6a685ad0481047139c5b1af5af85387973fc7ceafi0-Atomicals',
],
});
console.log(res);
} catch (e) {
console.log(e);
}
// example
{
txhash: 'df409c3ce3c4d7d840b681fab8a3a5b8e32b1600636cc5409d84d2c06365a5fc';
}
signMessage#
okxwallet.bitcoin.signMessage(signStr[, type])

描述

签名消息

参数

signStr - string：需要签名的数据
type - string： (可选) "ecdsa" | "bip322-simple"，默认值是 "ecdsa"。(请注意：版本低于 6.51.0 的应用仅支持“ecdsa”签名算法，而版本为 6.51.0 或更高的应用可支持所有签名算法类型。)
返回值

Promise - string：签名结果
示例

const signStr = 'need sign string';
const result = await window.okxwallet.bitcoin.signMessage(signStr, 'ecdsa')
// example
INg2ZeG8b6GsiYLiWeQQpvmfFHqCt3zC6ocdlN9ZRQLhSFZdGhgYWF8ipar1wqJtYufxzSYiZm5kdlAcnxgZWQU=
pushTx#
此字段仅适用于移动端版本 6.51.0 或更高以及插件端版本 2.77.1 或更高。
okxwallet.bitcoin.pushTx(rawTx)

描述

推送交易

参数

rawTx - string：上链的原始交易
返回值

Promise - string：交易哈希
示例

try {
let txid = await okxwallet.bitcoin.pushTx('0200000000010135bd7d...');
console.log(txid);
} catch (e) {
console.log(e);
}
splitUtxo#
此字段当前仅适用于插件端版本，不适用于移动端版本。
okxwallet.bitcoin.splitUtxo({ from, amount })

描述

拆分 UTXO，初始化钱包

拆分是因为签名算法
需要

split utxo
参数

object
from - string：当前连接的钱包的 BTC 地址
amount - number： (可选) 拆分的数量，默认值是 2
返回值

Promise - {utxos: array}： UTXO 和签名
示例

try {
let { utxos } = await window.okxwallet.bitcoin.splitUtxo({
from: 'bc1pkrym02ck30phct287l0rktjjjnapavkl2qhsy78aeeeuk3qaaulqh90v6s',
});
console.log(utxos);
} catch (e) {
console.log(e);
}
// example
{
utxos: [
{
txId: '1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306',
vOut: 0,
amount: 546,
rawTransaction: 'xxxx',
},
{
txId: '1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306',
vOut: 1,
amount: 546,
rawTransaction: 'xxxx',
},
];
}
inscribe#
此字段当前仅适用于插件端版本，不适用于移动端版本。
okxwallet.bitcoin.inscribe({ type, from, tick, tid })

描述

铭刻可转移的 BRC-20

参数

type - number：交易类型，详情见下表

类型	描述
51	默认值，BRC-20 的转移铭刻
from - string：当前连接的钱包的 BTC 地址

tick - string：BRC-20 的代币名称 (来自于链上)

返回值

Promise - string：揭示交易的哈希
示例

try {
let txid = await okxwallet.bitcoin.inscribe({
from: 'bc1pkrym02ck30phct287l0rktjjjnapavkl2qhsy78aeeeuk3qaaulqh90v6s',
tick: 'ordi',
});
console.log(txid);
} catch (e) {
console.log(e);
}
mint#
此字段当前仅适用于插件端版本，不适用于移动端版本。
okxwallet.bitcoin.mint({ type, from, inscriptions })

描述

支持 Ordinal 协议的通用铭刻，支持批量铭刻

参数

type - number：要发送的铭刻交易类型，详情见下表

类型	描述
60	BRC-20 deploy 铭刻
50	BRC-20 mint 铭刻
51	BRC-20 transfer 铭刻
62	图片铭刻，需要将图片转换为图片字节流的 16 进制字符串表示
61	纯文本
from - string：当前连接钱包的 BTC 地址

inscriptions - object[]：铭刻的数组。单个数组项是对象类型，其拥有的字段及其含义，如下表所示：

字段	类型	默认值	描述
contentType	string	"text/plain;charset=utf-8"	所铭刻内容的类型， MIME 类型的值，Ordinals 协议规定，详情可查看：https://docs.ordinals.com/inscriptions.html
body	string	无	所铭刻的内容
不同铭刻类型传入的 contentType 和 body 入参：

铭刻类型	contentType	body
图片铭刻	"image/png" 、"image/jpeg" 等	需要将图片转换为图片字节流的 16 进制字符串表示
BRC-20	"text/plain;charset=utf-8"	通过 JSON.stringify 转换为字符串即可
纯文本	"text/plain;charset=utf-8"	直接传入纯文本即可
返回值

Promise - object，其拥有的字段及其含义，如下所示：
commitTx - string：铭刻时，commit 交易的哈希值
revealTxs - string[]：铭刻时，reveal 交易的哈希值。如果是批量铭刻，则分别对应于 reveal 交易的哈希值
commitTxFee - number：commit 交易花费的网络费用
revealTxFees - number[]：reveal 交易花费的网络费用。如果是批量铭刻，则分别对应于 reveal 交易的网路费用
commitAddrs - string[]：commit 交易的 to 地址，即代打地址
feeRate - number：铭刻时，网络费率
size - number：铭刻时，铭文的大小
示例

okxwallet.bitcoin.mint({
type: 61,
from: 'bc1p4k9ghlrynzuum080a4zk6e2my8kjzfhptr5747afzrn7xmmdtj6sgrhd0m',
inscriptions: [{
contentType: 'text/plain;charset=utf-8',
body: 'hello'
}, {
contentType: 'text/plain;charset=utf-8',
body: 'world'
}]
})

// response
{
"commitAddrs": [
"bc1p9trqtf68gfeq3f3hlktaapp0eapufh02ly8dr6swfwffflvncncqwvtuen",
"bc1p5ttl7q2mpvfhjq3wqffka4c05sv5jcfphcl5qeuj0pmsx7evfhcqhm60rk"
],
"commitTx": "453e126346bbaaef0aaaa208acd3426cd14a39f825bd76cb8d9892957e2a5bda",
"revealTxs": [
"526ff04e4ba34617ee28826412bdc8e22484890635320f880c5ec50f10d6b189",
"0f65f79456a59b3e0cd4ef00e279d0d6da57582e114eafbada95b51759a845b2"
],
"commitTxFee": 1379,
"revealTxFees": [
973,
973
],
feeRate: 80,
size: 546,
}
signPsbt#
okxwallet.bitcoin.signPsbt(psbtHex[, options])

描述

签名 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHex - string：要签名的 psbt 的十六进制字符串
注
构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。

示例：可参考下面的 txInput 和 publicKey。

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [
{
"masterFingerprint": "a22e8e32",
"pubkey": "tb1q8h8....mjxzny",
"path": "m/49'/0'/0'/0/0",
},
],
});
options

autoFinalized - boolean：签名后是否完成 psbt，默认为 true

toSignInputs - array：

index - number：要签名的输入
address - string：用于签名的相应私钥所对应的地址
publicKey - string：用于签名的相应私钥所对应的公钥
sighashTypes - number[]： (可选) sighashTypes
disableTweakSigner - boolean： (可选) 签名和解锁 Taproot 地址时， 默认使用 tweakSigner 来生成签名，启用此选项允许使用原始私钥进行签名
注意
对于移动端版本低于 6.51.0 和插件端版本低于 2.77.1 的情况：不支持options，并且 autoFinalized默认为 false。
对于移动端版本为 6.51.0 或更高以及插件端版本为 2.77.1 或更高的情况：支持 options，并且 autoFinalized 是布尔值, 默认为 true。
返回值

Promise - string：已签名 psbt 的十六进制字符串
示例

try {
let res = await okxwallet.bitcoin.signPsbt('70736274ff01007d....', {
autoFinalized: false,
toSignInputs: [
{
index: 0,
address: 'tb1q8h8....mjxzny',
},
{
index: 1,
publicKey: 'tb1q8h8....mjxzny',
sighashTypes: [1],
},
{
index: 2,
publicKey: '02062...8779693f',
},
],
});
console.log(res);
} catch (e) {
console.log(e);
}

okxwallet.bitcoin.signPsbt('xxxxxxxx', {
toSignInputs: [{ index: 0, publicKey: 'xxxxxx', disableTweakSigner: true }],
autoFinalized: false,
});
signPsbts#
此字段仅适用于移动端版本 6.51.0 或更高以及插件端版本 2.77.1 或更高。
okxwallet.bitcoin.signPsbts(psbtHexs[, options])

描述

签署多个 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHexs - string[]：要签名的 psbt 的十六进制字符串
注
构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。

示例：可参考下面的 txInput 和 publicKey。

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [
{
"masterFingerprint": "a22e8e32",
"pubkey": "tb1q8h8....mjxzny",
"path": "m/49'/0'/0'/0/0",
},
],
});
options - object[]：签署 psbt 的选项
autoFinalized - boolean：签名后是否完成 psbt，默认为 true
toSignInputs - array：
index - number：要签名的输入
address - string：用于签名的相应私钥所对应的地址
publicKey - string：用于签名的相应私钥所对应的公钥
sighashTypes - number[]： (可选) sighashTypes
返回值

Promise - string[]：已签名 psbt 的十六进制字符串
示例

try {
let res = await okxwallet.bitcoin.signPsbts([
'70736274ff01007d...',
'70736274ff01007d...',
]);
console.log(res);
} catch (e) {
console.log(e);
}
pushPsbt#
此字段仅适用于移动端版本 6.51.0 或更高以及插件端版本 2.77.1 或更高。
okxwallet.bitcoin.pushPsbt(psbtHex)

描述

广播 psbt 交易

参数

psbtHex - string：要推送的 psbt 的十六进制字符串
返回值

Promise - string：交易哈希
示例

try {
let res = await okxwallet.bitcoin.pushPsbt('70736274ff01007d....');
console.log(res);
} catch (e) {
console.log(e);
}
sendPsbt#
此字段当前仅适用于插件端版本，不适用于移动端版本。
okxwallet.bitcoin.sendPsbt(txs, from)

描述

广播 psbt 交易

与 pushPsbt 方法的不同点
sendPsbt 方法支持批量上链，pushPsbt 方法只支持单个上链
sendPsbt 支持传入 type 参数，使钱包内的交易历史展示更精确，而通过 pushPsbt 方法上链的交易在交易历史展示的比较简单
参数

txs - array：要发布的 psbt 交易
from - string：当前连接钱包的 BTC 地址
类型	描述
52	发送 BRC-20
20	发送 NFT
返回值

Promise - array：交易哈希
示例

okxwallet.bitcoin.sendPsbt([{
itemId: "xxxxx0", // 批量唯一标识，多笔交易内不重复即可
signedTx: '70736274ff01007d....', // 签名串
type: 52, // 类型 BRC-20 传递 52， NFT 传递 20
extJson: { // 拆UTXO的交易，可不传
// NFTID
inscription:"885441055c7bb5d1c54863e33f5c3a06e5a14cc4749cb61a9b3ff1dbe52a5bbbi0",
}
}，{
itemId: "xxxxx1", // 批量唯一标识
signedTx: '70736274ff01007d....', // 签名串或者要上链的psbt
dependItemId: ['xxxxx0'], // 依赖的交易itemId，没有依赖的话，这个字段可以不传
type: 52, // 类型 BRC-20 传递 52， NFT 传递 20
extJson: {
// NFTID
inscription:"885441055c7bb5d1c54863e33f5c3a06e5a14cc4749cb61a9b3ff1dbe52a5bbbi0",
}
}], from)

// response
[
{"xxxxx0":"txId1"}，{"xxxxx1":"txId2"}  // 失败txId返回空
]
accountChanged#
此字段仅适用于移动端版本 6.51.0 或更高。
描述

OKX Wallet允许用户从单个扩展程序或移动应用程序中无缝管理多个账户。每当用户切换账户时，OKX Wallet都会发出一个 accountChanged 事件

如果用户在已连接到应用程序时更改账户，并且新账户已经将该应用程序列入白名单，那么用户将保持连接状态并且OKX Wallet将传递新账户的公钥：

用法

window.okxwallet.bitcoin.on('accountChanged', (addressInfo) => {
console.log(addressInfo);
{
"address": "bc1pwqye6x35g2n6xpwalywhpsvsu39k3l6086cvdgqazlw9mz2meansz9knaq",
"publicKey": "4a627f388196639041ce226c0229560127ef9a5a39d4885123cd82dc82d8b497",
"compressedPublicKey": "034a627f388196639041ce226c0229560127ef9a5a39d4885123cd82dc82d8b497"
}
});
accountsChanged#
此字段仅适用于移动端版本 6.51.0 或更高以及插件端版本 2.77.1 或更高。
描述

每当用户暴露的账户地址发生变化时，就会发出该消息

用法

window.okxwallet.bitcoin.on('accountsChanged', (accounts) => {
console.log(accounts)[
// example
'tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz'
];
});


DApp 连接钱包
连接浏览器插件钱包
Bitcoin
Provider API (Fractal Bitcoin)
Provider API (Fractal Bitcoin)#
什么是 Injected provider API (Fractal Bitcoin) ？#
OKX Injected Providers API (Fractal Bitcoin) 基于 JavaScript 模型，由 OKX 嵌入用户访问网站中。

DApp 项目可以通过调用此 API 请求用户账户信息，从用户所连接的区块链中读取数据，并协助用户进行消息和交易的签署。

注：Fractal Bitcoin 仅适用于钱包插件端为 3.12.1 或更高版本。
connect#
描述

连接钱包

okxwallet.fractalBitcoin.connect()

参数

无

返回值

Promise - object
address - string：当前账户的地址
publicKey - string：当前账户的公钥
示例

const result = await okxwallet.fractalBitcoin.connect()
// example
{
address: 'bc1pwqye6x35g2n6xpwalywhpsvsu39k3l6086cvdgqazlw9mz2meansz9knaq',
publicKey: '4a627f388196639041ce226c0229560127ef9a5a39d4885123cd82dc82d8b497',
compressedPublicKey:'034a627f388196639041ce226c0229560127ef9a5a39d4885123cd82dc82d8b497',
}
requestAccounts#
okxwallet.fractalBitcoin.requestAccounts()

描述

请求连接当前账户

参数

无

返回值

Promise - string[]：当前账户的地址
示例

try {
let accounts = await okxwallet.fractalBitcoin.requestAccounts();
console.log('connect success', accounts);
} catch (e) {
console.log('connect failed');
}
// example
['tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz'];
getAccounts#
okxwallet.fractalBitcoin.getAccounts()

描述

获取当前账户地址

参数

无

返回值

Promise - string[]：当前账户地址
示例

try {
let res = await okxwallet.fractalBitcoin.getAccounts();
console.log(res);
} catch (e) {
console.log(e);
}
// example
['tb1qrn7tvhdf6wnh790384ahj56u0xaa0kqgautnnz'];
getPublicKey#
okxwallet.fractalBitcoin.getPublicKey()

描述

获取当前账户的公钥

参数

无

返回值

Promise - string：公钥
示例

try {
let res = await okxwallet.fractalBitcoin.getPublicKey();
console.log(res)
} catch (e) {
console.log(e);
}
// example
03cbaedc26f03fd3ba02fc936f338e980c9e2172c5e23128877ed46827e935296f
getBalance#
okxwallet.fractalBitcoin.getBalance()

描述

获取 BTC 余额

参数

无

返回值

Promise - object：
confirmed - number：已确认的聪数量
unconfirmed - number：未经确认的聪数量
total - number：总聪量
示例

try {
let res = await okxwallet.fractalBitcoin.getBalance();
console.log(res)
} catch (e) {
console.log(e);
}
// example
{
"confirmed":0,
"unconfirmed":100000,
"total":100000
}
signMessage#
okxwallet.fractalBitcoin.signMessage(signStr[, type])

描述

签名消息

参数

signStr - string：需要签名的数据
type - string： (可选) "ecdsa" | "bip322-simple"，默认值是 "ecdsa"。(请注意：版本低于 6.51.0 的应用仅支持“ecdsa”签名算法，而版本为 6.51.0 或更高的应用可支持所有签名算法类型。)
返回值

Promise - string：签名结果
示例

const signStr = 'need sign string';
const result = await window.okxwallet.fractalBitcoin.signMessage(signStr, 'ecdsa')
// example
INg2ZeG8b6GsiYLiWeQQpvmfFHqCt3zC6ocdlN9ZRQLhSFZdGhgYWF8ipar1wqJtYufxzSYiZm5kdlAcnxgZWQU=
signPsbt#
okxwallet.fractalBitcoin.signPsbt(psbtHex[, options])

描述

签名 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHex - string：要签名的 psbt 的十六进制字符串
注：构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。
示例：可参考下面的 txInput 和 publicKey

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [{"masterFingerprint": "a22e8e32","pubkey": "tb1q8h8....mjxzny","path": "m/49'/0'/0'/0/0",},],});

- options
    - autoFinalized - boolean：签名后是否完成 psbt，默认为 true
    - toSignInputs - array：
        - index - number：要签名的输入
        - address - string：用于签名的相应私钥所对应的地址
        - publicKey - string：用于签名的相应私钥所对应的公钥
        - sighashTypes - number[]： (可选) sighashTypes
        - disableTweakSigner - boolean： (可选) 签名和解锁 Taproot 地址时， 默认使用 tweakSigner 来生成签名，启用此选项允许使用原始私钥进行签名

返回值

Promise - string：已签名 psbt 的十六进制字符串
示例

try {let res = await okxwallet.fractalBitcoin.signPsbt('70736274ff01007d....', {
autoFinalized: false,
toSignInputs: [{
index: 0,
address: 'tb1q8h8....mjxzny',},{
index: 1,
publicKey: 'tb1q8h8....mjxzny',
sighashTypes: [1],},{
index: 2,
publicKey: '02062...8779693f',},],});console.log(res);} catch (e) {console.log(e);}


okxwallet.fractalBitcoin.signPsbt('xxxxxxxx', {
toSignInputs: [{ index: 0, publicKey: 'xxxxxx', disableTweakSigner: true }],
autoFinalized: false,});
signPsbts#
okxwallet.fractalBitcoin.signPsbts(psbtHexs[, options])

描述

签署多个 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHexs - string[]：要签名的 psbt 的十六进制字符串
注：构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。
示例：可参考下面的 txInput 和 publicKey

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [{"masterFingerprint": "a22e8e32","pubkey": "tb1q8h8....mjxzny","path": "m/49'/0'/0'/0/0",},],});
- options - object[]：签署 psbt 的选项
    - autoFinalized - boolean：签名后是否完成 psbt，默认为 true
    - toSignInputs - array：
        - index - number：要签名的输入
        - address - string：用于签名的相应私钥所对应的地址
        - publicKey - string：用于签名的相应私钥所对应的公钥
        - sighashTypes - number[]： (可选) sighashTypes
          返回值

Promise - string[]：已签名 psbt 的十六进制字符串
示例

try {
let res = await okxwallet.fractalBitcoin.signPsbts([
'70736274ff01007d...',
'70736274ff01007d...',
]);
console.log(res);
} catch (e) {
console.log(e);
}
pushPsbt#
okxwallet.fractalBitcoin.pushPsbt(psbtHex)

描述

广播 psbt 交易

参数

psbtHex - string：要推送的 psbt 的十六进制字符串
返回值

Promise - string：交易哈希
示例

try {
let res = await okxwallet.fractalBitcoin.pushPsbt('70736274ff01007d....');
console.log(res);
} catch (e) {
console.log(e);
}
pushTx#
okxwallet.fractalBitcoin.pushTx(rawTx)

描述

推送交易

参数

rawTx - string：上链的原始交易
返回值

Promise - string：交易哈希
示例

try {
let txid = await okxwallet.fractalBitcoin.pushTx('0200000000010135bd7d...');
console.log(txid);
} catch (e) {
console.log(e);
}



DApp 连接钱包
连接浏览器插件钱包
Bitcoin
Provider API (Testnet)
Provider API (Testnet)#
什么是 Injected provider API (Testnet) ？#
OKX Injected Providers API (Testnet) 基于 JavaScript 模型，由 OKX 嵌入用户访问网站中。DApp 项目可以通过调用此 API 请求用户账户信息，从用户所连接的区块链中读取数据，并协助用户进行消息和交易的签署。

connect#
okxwallet.bitcoinTestnet.connect()

描述

连接钱包

参数

无

返回值

Promise - object
address - string：当前账户的地址
publicKey - string：当前账户的公钥
示例

const result = await okxwallet.bitcoinTestnet.connect()
// example
{
address: 'bc1pwqye6x35g2n6xpwalywhpsvsu39k3l6086cvdgqazlw9mz2meansz9knaq',
publicKey: '4a627f388196639041ce226c0229560127ef9a5a39d4885123cd82dc82d8b497'
}
signMessage#
okxwallet.bitcoinTestnet.signMessage(signStr[, type])

描述

签名消息

参数

signStr - string：需要签名的数据
type - string： (可选) "ecdsa" | "bip322-simple"，默认值是 "ecdsa"
返回值

Promise - string：签名结果
示例

const signStr = 'need sign string';
const result = await window.okxwallet.bitcoinTestnet.signMessage(signStr, 'ecdsa')
// example
INg2ZeG8b6GsiYLiWeQQpvmfFHqCt3zC6ocdlN9ZRQLhSFZdGhgYWF8ipar1wqJtYufxzSYiZm5kdlAcnxgZWQU=
signPsbt#
okxwallet.bitcoinTestnet.signPsbt(psbtHex[, options])

描述

签名 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHex - string：要签名的 psbt 的十六进制字符串
注
构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。

示例：可参考下面的 txInput 和 publicKey。

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [
{
"masterFingerprint": "a22e8e32",
"pubkey": "tb1q8h8....mjxzny",
"path": "m/49'/0'/0'/0/0",
},
],
});
options
autoFinalized - boolean：签名后是否完成 psbt，默认为 true
toSignInputs - array：
index - number：要签名的输入
address - string：用于签名的相应私钥所对应的地址
publicKey - string：用于签名的相应私钥所对应的公钥
sighashTypes - number[]： (可选) sighashTypes
disableTweakSigner - boolean： (可选) 签名和解锁 Taproot 地址时， 默认使用 tweakSigner 来生成签名，启用此选项允许使用原始私钥进行签名
返回值

Promise - string：已签名 psbt 的十六进制字符串
示例

try {
let res = await okxwallet.bitcoinTestnet.signPsbt('70736274ff01007d....', {
autoFinalized: false,
toSignInputs: [
{
index: 0,
address: 'tb1q8h8....mjxzny',
},
{
index: 1,
publicKey: 'tb1q8h8....mjxzny',
sighashTypes: [1],
},
{
index: 2,
publicKey: '02062...8779693f',
},
],
});
console.log(res);
} catch (e) {
console.log(e);
}

okxwallet.bitcoinTestnet.signPsbt('xxxxxxxx', {
toSignInputs: [{ index: 0, publicKey: 'xxxxxx', disableTweakSigner: true }],
autoFinalized: false,
});
signPsbts#
okxwallet.bitcoinTestnet.signPsbts(psbtHexs[, options])

描述

签署多个 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHexs - string[]：要签名的 psbt 的十六进制字符串
注
构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。

示例：可参考下面的 txInput 和 publicKey。

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [
{
"masterFingerprint": "a22e8e32",
"pubkey": "tb1q8h8....mjxzny",
"path": "m/49'/0'/0'/0/0",
},
],
});
options - object[]：签署 psbt 的选项
autoFinalized - boolean：签名后是否完成 psbt，默认为 true
toSignInputs - array：
index - number：要签名的输入
address - string：用于签名的相应私钥所对应的地址
publicKey - string：用于签名的相应私钥所对应的公钥
sighashTypes - number[]： (可选) sighashTypes
返回值

Promise - string[]：已签名 psbt 的十六进制字符串
示例

try {
let res = await okxwallet.bitcoinTestnet.signPsbts([
'70736274ff01007d...',
'70736274ff01007d...',
]);
console.log(res);
} catch (e) {
console.log(e);
}


DApp 连接钱包
连接浏览器插件钱包
Bitcoin
Provider API (Signet)
Provider API (Signet)#
什么是 Injected provider API (Signet) ？#
OKX Injected Providers API (Signet) 基于 JavaScript 模型，由 OKX 嵌入用户访问网站中。DApp 项目可以通过调用此 API 请求用户账户信息，从用户所连接的区块链中读取数据，并协助用户进行消息和交易的签署。

注：BTC Signet 仅适用于钱包插件端为 2.82.32 或更高版本。
connect#
okxwallet.bitcoinSignet.connect()

描述

连接钱包

参数

无

返回值

Promise - object
address - string：当前账户的地址
publicKey - string：当前账户的公钥
示例

const result = await okxwallet.bitcoinSignet.connect()
// example
{
address: 'bc1pwqye6x35g2n6xpwalywhpsvsu39k3l6086cvdgqazlw9mz2meansz9knaq',
publicKey: '4a627f388196639041ce226c0229560127ef9a5a39d4885123cd82dc82d8b497'
}
signMessage#
okxwallet.bitcoinSignet.signMessage(signStr[, type])

描述

签名消息

参数

signStr - string：需要签名的数据
type - string： (可选) "ecdsa" | "bip322-simple"，默认值是 "ecdsa"
返回值

Promise - string：签名结果
示例

const signStr = 'need sign string';
const result = await window.okxwallet.bitcoinSignet.signMessage(signStr, 'ecdsa')
// example
INg2ZeG8b6GsiYLiWeQQpvmfFHqCt3zC6ocdlN9ZRQLhSFZdGhgYWF8ipar1wqJtYufxzSYiZm5kdlAcnxgZWQU=
signPsbt#
okxwallet.bitcoinSignet.signPsbt(psbtHex[, options])

描述

签名 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHex - string：要签名的 psbt 的十六进制字符串
注
构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。

示例：可参考下面的 txInput 和 publicKey。

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [
{
"masterFingerprint": "a22e8e32",
"pubkey": "tb1q8h8....mjxzny",
"path": "m/49'/0'/0'/0/0",
},
],
});
options
autoFinalized - boolean：签名后是否完成 psbt，默认为 true
toSignInputs - array：
index - number：要签名的输入
address - string：用于签名的相应私钥所对应的地址
publicKey - string：用于签名的相应私钥所对应的公钥
sighashTypes - number[]： (可选) sighashTypes
disableTweakSigner - boolean： (可选) 签名和解锁 Taproot 地址时， 默认使用 tweakSigner 来生成签名，启用此选项允许使用原始私钥进行签名
返回值

Promise - string：已签名 psbt 的十六进制字符串
示例

try {
let res = await okxwallet.bitcoinSignet.signPsbt('70736274ff01007d....', {
autoFinalized: false,
toSignInputs: [
{
index: 0,
address: 'tb1q8h8....mjxzny',
},
{
index: 1,
publicKey: 'tb1q8h8....mjxzny',
sighashTypes: [1],
},
{
index: 2,
publicKey: '02062...8779693f',
},
],
});
console.log(res);
} catch (e) {
console.log(e);
}

okxwallet.bitcoinSignet.signPsbt('xxxxxxxx', {
toSignInputs: [{ index: 0, publicKey: 'xxxxxx', disableTweakSigner: true }],
autoFinalized: false,
});
signPsbts#
okxwallet.bitcoinSignet.signPsbts(psbtHexs[, options])

描述

签署多个 psbt，该方法将遍历所有与当前地址匹配的输入进行签名

参数

psbtHexs - string[]：要签名的 psbt 的十六进制字符串
注
构建交易生成 psbt (string 类型)，如果遇到 input 地址是 Taproot 类型，需要提供公钥。

示例：可参考下面的 txInput 和 publicKey。

const txInputs: utxoInput[] = [];
txInputs.push({
txId: "1e0f92720ef34ab75eefc5d691b551fb2f783eac61503a69cdf63eb7305d2306",
vOut: 2,
amount: 341474,
address: "tb1q8h8....mjxzny",
privateKey: "0s79......ldjejke",
publicKey: "tb1q8h8....mjxzny",
bip32Derivation: [
{
"masterFingerprint": "a22e8e32",
"pubkey": "tb1q8h8....mjxzny",
"path": "m/49'/0'/0'/0/0",
},
],
});
options - object[]：签署 psbt 的选项
autoFinalized - boolean：签名后是否完成 psbt，默认为 true
toSignInputs - array：
index - number：要签名的输入
address - string：用于签名的相应私钥所对应的地址
publicKey - string：用于签名的相应私钥所对应的公钥
sighashTypes - number[]： (可选) sighashTypes
返回值

Promise - string[]：已签名 psbt 的十六进制字符串
示例

try {
let res = await okxwallet.bitcoinSignet.signPsbts([
'70736274ff01007d...',
'70736274ff01007d...',
]);
console.log(res);
} catch (e) {
console.log(e);
}



DApp 连接钱包
连接浏览器插件钱包
Tron
获取钱包地址
获取钱包地址#
钱包账户地址被用于多种场景，包括作为标识符和用于签名交易。

创建连接#
此处建议提供一个按钮，允许用户将OKX Wallet Tron 连接到 DApp。

在下方的示例项目代码中，JavaScript 代码在用户点击连接按钮时访问用户的帐户地址，HTML 代码显示按钮和当前帐户地址：

HTML
JavaScript
<button class="connectTronButton">Connect to Tron</button>
监听账户地址变化#
您可以使用事件来监听变化:

window.addEventListener('message', function (e) {
if (e.data.message && e.data.message.action === "accountsChanged") {
// handler logic
console.log('got accountsChanged event', e.data, e.data.message.address)
}
})
每当 tron_requestAccounts RPC 方法的返回值发生变化时，欧易都会发出对应事件提醒。



DApp 连接钱包
连接浏览器插件钱包
Tron
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

连接账户#
window.okxwallet.tronLink.request(args)

描述

OKX Wallet支持 DApp 发起的 TRX 转账、合约签名、授权以及其他授权的功能等。出于安全考虑，OKX Wallet需要用户授权 DApp 连接网站。DApp 必须先连接到网站，并等待用户的许可才能发起授权请求。

window.okxwallet.tronLink.request({ method: 'tron_requestAccounts'})
状态码

状态码
描述	信息
200	该站点之前已经被允许连接	The site is already in the whitelist
200	用户批准连接	User allowed the request.
4000	同一个 DApp 已经发起了连接网站请求	Authorization requests are being processed, please do not resubmit
4001	用户拒绝连接	User rejected the request
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectTronButton">Connect Tron</button>
在 TRON 网络上发起转账需要 3 个步骤：

创建转账交易
签署交易
广播签署的交易
在这个过程中，第 2 步需要 TronLink，而第 1 步和第 3 步都发生在 tronWeb 上。

签名交易#
okxwallet.tronLink.tronWeb.trx.sign(transaction, privateKey)

描述

步骤1: 创建转账交易

sendTRX

创建一个未签名的TRX转账交易

用法

okxwallet.tronLink.tronWeb.transactionBuilder.sendTrx(to,amount,from,options);
参数

参数	描述	类型
to	转入TRX 的地址	hexString
amount	要发送的TRX 数量	integer
from	转出trx的可选地址	hexString
options	permission Id	integer
示例

okxwallet.tronLink.tronWeb.transactionBuilder.sendTrx("TVDGpn4hCSzJ5nkHPLetk8KQBtwaTppnkr", 100, "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL");
步骤2: 签名交易

sign

为交易签名

提示
不要在任何面向 Web /面向用户的应用程序中使用它，以防暴露私钥。
用法

// sign a transaction
okxwallet.tronLink.tronWeb.trx.sign(transaction, privateKey);
参数

参数	描述	类型
transaction	创建的交易对象	JSON
privateKey	用于签名的私钥 ，可选，默认使用构建 tronweb 时传入的私钥	String
示例

const tradeobj = await okxwallet.tronLink.tronWeb.transactionBuilder.sendTrx("TNo9e8MWQpGVqdyySxLSTw3gjgFQWE3vfg", 100,"TM2TmqauSEiRf16CyFgzHV2BVxBejY9iyR",1);
const signedtxn = await okxwallet.tronLink.tronWeb.trx.sign(tradeobj, privateKey);
console.log(signedtxn)
步骤3: 广播签署的交易

sendRawTransaction 将已签名的交易广播到网络。

用法

// sign a transaction
okxwallet.tronLink.tronWeb.trx.sendRawTransaction(signedTransaction);
参数

参数	描述	类型
signedTransaction	已经签名后的交易对象	JSON
示例

const tronWeb = okxwallet.tronLink.tronWeb;
const tradeobj = await tronWeb.transactionBuilder.sendTrx("TNo9e8MWQpGVqdyySxLSTw3gjgFQWE3vfg", 100,"TM2TmqauSEiRf16CyFgzHV2BVxBejY9iyR",1);
const signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
const receipt = await tronWeb.trx.sendRawTransaction(signedtxn);
console.log(receipt)
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectTronButton btn">Connect Tron</button>
<button class="signTransactionButton btn">Sign Transaction</button>
签名信息#
window.okxwallet.tronLink.tronWeb.trx.sign(message)

描述

DApp 要求用户签署消息。 签名后的消息将被转发到后端，以验证用户的登录是否合法。 DApp 发送请求，要求用户将钱包连接到网站，用户同意连接。

参数

参数	描述	类型
message	普通非十六进制字符串或者十六进制字符串	String
版本要求

对于 okx wallet 2.80.0 之前 的版本：
参数无论是否是十六进制格式，都会进行十六进制转换，然后签名。因此如果本身消息就是十六进制，则验证签名的时候需要再进行十六进制转换一次来进行验证。

对于 okx wallet 2.80.0 及之后 的版本：
如果入参为十六进制字符串，则无需转换，直接签名；

如果入参为非十六进制字符串，钱包内部会转换为十六进制字符串进行签名，如普通字符串 “helloworld” 对应的十六进制格式字符串为 “68656c6c6f776f726c64” 则 .sign('helloworld') 等同于 .sign('0x68656c6c6f776f726c64')

返回值

如果用户在弹窗中选择签名点击确认， DApp 将获取已签名的十六进制字符串。 例如：

0xaa302ca153b10dff25b5f00a7e2f603c5916b8f6d78cdaf2122e24cab56ad39a79f60ff3916dde9761baaadea439b567475dde183ee3f8530b4cc76082b29c341c
如果发生错误，将返回以下信息：

Uncaught (in promise) Invalid transaction provided
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectTronButton btn">Connect Tron</button>
<button class="signButton btn">Sign Message</button>
<button class="verifyButton btn">Verify Message</button>
验证签名信息#
window.okxwallet.tronLink.tronWeb.trx.verifyMessage(hexMsg, signedMsg[, address])

描述

验证一个十六进制字符串的签名

参数

参数	描述	类型
hexMsg	十六进制格式的字符串信息	String
signedMsg	此十六进制格式字符串信息的签名结果	String
address	进行签名和验证的钱包地址，可选	String
版本要求

以上面的 helloworld 及其对应的十六进制 0x68656c6c6f776f726c64 为例

对于 okx wallet 2.80.0 之前 的版本，签名及验证：
非十六进制字符串：

const signedMsg = await window.okxwallet.tronLink.tronWeb.trx.sign('helloworld')
const validate = await window.okxwallet.tronLink.tronWeb.trx.verifyMessage('0x68656c6c6f776f726c64', signedMsg)
十六进制字符串：

const signedMsg = await window.okxwallet.tronLink.tronWeb.trx.sign('0x68656c6c6f776f726c64')
// 这里需要多一步
const hexed = await window.okxwallet.tronLink.tronWeb.toHex('0x68656c6c6f776f726c64')
const validate = await window.okxwallet.tronLink.tronWeb.trx.verifyMessage(hexed, signedMsg)
对于 okx wallet 2.80.0 及之后 的版本，签名及验证：
非十六进制字符串：

const signedMsg = await window.okxwallet.tronLink.tronWeb.trx.sign('helloworld')
const validate = await window.okxwallet.tronLink.tronWeb.trx.verifyMessage('0x68656c6c6f776f726c64', signedMsg)
十六进制字符串：

const signedMsg = await window.okxwallet.tronLink.tronWeb.trx.sign('0x68656c6c6f776f726c64')
const validate = await window.okxwallet.tronLink.tronWeb.trx.verifyMessage('0x68656c6c6f776f726c64', signedMsg)
返回值

(Promise) boolean: true 或 false

事件#
成功连接

在以下情况下会生成此消息：

DApp 请求连接，用户在弹窗中确认连接
用户连接到网站
用法

window.addEventListener('message', function (e) {
if (e.data.message && e.data.message.action == "connect") {
// handler logic
console.log('got connect event', e.data)
}
})
断开连接

在以下情况下会生成此消息：

DApp 请求连接，用户在弹窗拒绝连接
用户断开连接网站
用法

window.addEventListener('message', function (e) {
if (e.data.message && e.data.message.action == "disconnect") {
// handler logic
console.log('got connect event', e.data)
}
})
账户变更

在以下情况下会生成此消息：

用户登录
用户切换账户
用户锁定账户
超时后钱包自动锁定
用法

window.addEventListener('message', function (e) {
if (e.data.message && e.data.message.action === "accountsChanged") {
// handler logic
console.log('got accountsChanged event', e.data)
}
})
返回值

interface MessageEventAccountsChangedData {
isTronLink: boolean;
message: {
action: string;
data: {
address: string | boolean;
}
}
}



DApp 连接钱包
连接浏览器插件钱包
Solana兼容链
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

连接账户#
window.okxwallet.solana.connect()

描述

连接到OKX Wallet可以通过调用 window.okxwallet.solana.connect()。

connect 调用将返回一个 Promise 对象，该 Promise 对象在用户接受连接请求时 resolve，并在用户拒绝请求时 reject。有关OKX Wallet可能发生错误的详细信息，请参考 错误码。 当用户接受连接请求时，window.okxwallet.solana 也会触发连接事件。

window.okxwallet.solana.on("connect", () => console.log("connected!"));
一旦 Web 应用程序连接到OKX Wallet，它将能够读取连接账户的公钥并提示用户进行其他交易。还公开了一个方便的 isConnected 布尔值。

例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectSolanaButton">Connect Solana</button>
签名交易#
window.okxwallet.solana.signTransaction(transaction)

签名并发送交易

创建交易后，Web 应用程序可能会要求用户的OKX Wallet签署并发送交易。如果接受，OKX Wallet将使用用户的私钥签署交易并通过 Solana JSON RPC 连接提交。在 okxwallet.solana 上调用 signAndSendTransaction 方法会为已签名的交易返回 promise。

const provider = window.okxwallet.solana;
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const transaction = new Transaction();
const { signature } = await provider.signAndSendTransaction(transaction);
await connection.getSignatureStatus(signature);
签名交易（不发送）

创建交易后，Web 应用程序可能会要求用户的OKX Wallet签署交易，而无需将其提交到网络。调用 signTransaction 方法会为已签名的交易返回 Promise。 交易签署后，应用程序可以通过 @solana/web3.js
的 sendRawTransaction 提交交易本身。

const provider = window.okxwallet.solana;
const network = "<NETWORK_URL>";
const connection = new Connection(network);
const transaction = new Transaction();
const signedTransaction = await provider.signTransaction(transaction);
const signature = await connection.sendRawTransaction(signedTransaction.serialize());
批量签署交易

通过 provider 上的 signAllTransactions 方法也可以一次签署和发送多个交易。

const provider = window.okxwallet.solana;
const transactions = [new Transaction()];
const signedTransactions = await provider.signAllTransactions(transactions);
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectSolanaButton btn">Connect Solana</button>
<button class="signTransactionButton btn">Sign Transaction</button>
签名信息#
window.okxwallet.solana.signMessage(args)

描述

当 Web 应用程序连接到OKX Wallet时，它还可以请求用户签署给定消息。应用可以自由编写自己的消息，这些消息将在OKX Wallet的签名提示中显示给用户。消息签名不涉及网络费用，是应用程序验证地址所有权的便捷方式。

为了发送消息供用户签名，Web 应用程序必须：

提供一个十六进制或 UTF-8 编码的字符串作为 Uint8Array。 请求通过用户的OKX Wallet钱包对编码消息进行签名。

const message = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
const encodedMessage = new TextEncoder().encode(message);
const signedMessage = await window.okxwallet.solana.signMessage(encodedMessage, "utf8");
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectSolanaButton btn">Connect Solana</button>
<button class="signButton btn">Sign Message</button>
事件#
成功连接

连接到OKX Wallet可以通过调用 window.okxwallet.solana.connect()。 当用户接受连接请求时，会触发连接事件。

用法

window.okxwallet.solana.on("connect", () => console.log("connected!"));
断开连接#
断开连接与连接过程相同。但是，钱包也有可能发起断开连接，而不是应用程序本身。

用法

window.okxwallet.solana.on("disconnect", () => console.log("disconnected!")
);
账户变更

OKX Wallet允许用户从单个扩展程序或移动应用程序中无缝管理多个账户。每当用户切换账户时，OKX Wallet都会发出一个 accountChanged 事件。

如果用户在已连接到应用程序时更改账户，并且新账户已经将该应用程序列入白名单，那么用户将保持连接状态并且OKX Wallet将传递新账户的公钥：

用法

window.okxwallet.solana.on('accountChanged', (publicKey) => {
if (publicKey) {
// Set new public key and continue as usual
console.log(`Switched to account ${publicKey.toBase58()}`);
}
});
如果OKX Wallet没有传递新账户的公钥，应用程序可以不做任何事情或尝试重新连接：

window.okxwallet.solana.on('accountChanged', (publicKey) => {
if (publicKey) {
// Set new public key and continue as usual
console.log(`Switched to account ${publicKey.toBase58()}`);
} else {
// Attempt to reconnect to OKX wallet
window.okxwallet.solana.connect().catch((error) => {
// Handle connection failure
});
}
});



DApp 连接钱包
连接浏览器插件钱包
Solana兼容链
获取 genesisHash
获取 genesisHash#
window.okxwallet.svm.getNetwork()

所有的远程过程调用 (RPC) 请求都会提交给当前连接的网络，所以准确地获取用户的网络 genesisHash 在 SVM 系的应用开发中至关重要。

使用window.okxwallet.svm.getNetwork() 方法监测用户当前的网络 genesisHash。

const { genesisHash } = await window.okxwallet.svm.getNetwork()

默认 genesisHash#
这些是 OKX Wallet 默认支持的SVM链的 genesisHash。

网络	genesisHash
SOL	5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d
SONIC_TESTNET_VONE	E8nY8PG8PEdzANRsv91C2w28Dbw9w3AhLqRYfn5tNv2C
SOONTEST_ETH	E41XcTqezgDG8GzWwnPW8Rjewv2o5UUtskPbuwA52Kjr
ECLIPSE_ETH	EAQLJCV2mh23BsK2P9oYpV5CHVLDNHTxYss3URrNmg3s
SOON_ETH	E8aYS7Vghmf1sZVSsCse9JdFHzccdE9QdpPF5SVNcGxr
SONIC_SOL	9qoRTAHGWBZHYzMJGkt62wBbFRASj6H7CvoNsNyRw2h4
SOON_BNB	8MCzWLHk3FmrdW1gVtZe7NgDefMhYFZfTUmvMANn5r6X



DApp 连接钱包
连接浏览器插件钱包
Solana兼容链
切换网络
切换网络#
window.okxwallet.svm.changeNetwork({ genesisHash })

描述

参数

genesisHash - string：目标网络的 genesisHash
返回值

Promise<object>：用户当前的网络
genesisHash - string：用户当前网络的 genesisHash
此方法会询问用户是否要切换到具有指定 genesisHash 的网络上，并返回一个确认值。

与任何确认值出现的场景一样，window.okxwallet.svm.changeNetwork({ genesisHash })只能作为用户直接操作的结果调用，例如用户单击按钮的时候。

OKX Wallet会在以下情况下自动拒绝请求：

genesisHash 格式错误
指定 genesisHash 所属的链尚未添加到 OKX Wallet
范例

const { genesisHash } = await window.okxwallet.svm.changeNetwork(
{
"genesisHash": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d"
}
)
默认 genesisHash#
这些是 OKX Wallet 默认支持的SVM链的 genesisHash。

网络	genesisHash
SOL	5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d
SONIC_TESTNET_VONE	E8nY8PG8PEdzANRsv91C2w28Dbw9w3AhLqRYfn5tNv2C
SOONTEST_ETH	E41XcTqezgDG8GzWwnPW8Rjewv2o5UUtskPbuwA52Kjr
ECLIPSE_ETH	EAQLJCV2mh23BsK2P9oYpV5CHVLDNHTxYss3URrNmg3s
SOON_ETH	E8aYS7Vghmf1sZVSsCse9JdFHzccdE9QdpPF5SVNcGxr
SONIC_SOL	9qoRTAHGWBZHYzMJGkt62wBbFRASj6H7CvoNsNyRw2h4
SOON_BNB	8MCzWLHk3FmrdW1gVtZe7NgDefMhYFZfTUmvMANn5r6X



DApp 连接钱包
连接浏览器插件钱包
TON
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

特别说明#
OKX Wallet 的 TON API 完全符合 Ton Connect 协议
的规范。

Dapp 可以使用 TON Connect SDK
来更方便地接入 OKX Wallet 。

获取注入的对象#
OKX Wallet 按照 TON Connect 协议的规范向 Dapp 中注入如下属性：

window.okxTonWallet.tonconnect
其指向的对象的数据结构如下：

interface TonConnectBridge {
deviceInfo: DeviceInfo;
walletInfo?: WalletInfo;
protocolVersion: number;
connect(protocolVersion: number, message: ConnectRequest): Promise<ConnectEvent>;
restoreConnection(): Promise<ConnectEvent>;
send(message: AppRequest): Promise<WalletResponse>;
listen(callback: (event: WalletEvent) => void): () => void;
}
deviceInfo#
用于获取设备信息，数据结构如下：

{
platform: 'browser',
appName: 'OKX Wallet',
appVersion: '3.3.19',
maxProtocolVersion: 2,
features: [
'SendTransaction',
{
name: 'SendTransaction',
maxMessages: 4,
},
],
}
platform：设备平台
appName：钱包名称
appVersion：钱包版本
maxProtocolVersion：支持的最大协议版本
features：钱包支持的特性
walletInfo#
用于获取钱包信息，数据结构如下：

{
name: 'OKX Wallet',
app_name: 'okxTonWallet',
image: 'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png',
about_url: 'https://web3.okx.com/web3',
platforms: ['chrome', 'firefox', 'safari'],
}
name：钱包名称
app_name：钱包应用唯一标识
image：钱包图标
about_url：钱包介绍页面
platforms：钱包支持的平台
protocolVersion#
OKX Wallet 支持的 Ton Connect 的版本，目前为 2 。

connect#
连接钱包的方法，连接钱包时，也可以对钱包进行签名验证。

connect(protocolVersion: number, message: ConnectRequest): Promise<ConnectEvent>;
入参#
protocolVersion：Dapp 期望钱包支持的 Ton Connect 的版本，如果钱包暂未支持该版本，会直接返回错误
message: 连接钱包的请求信息
message 入参

type ConnectRequest = {
manifestUrl: string;
items: ConnectItem[], // 与应用共享的数据项
}

type ConnectItem = TonAddressItem | TonProofItem

type TonAddressItem = {
name: "ton_addr";
}

type TonProofItem = {
name: "ton_proof";
payload: string; // 任意载荷，例如 nonce + 过期时间戳。
}
manifestUrl：Dapp 的 manifest.json 文件的 URL，该文件中包含 Dapp 的元信息，数据结构如下：
{
"url": "<app-url>",                        // 必填
"name": "<app-name>",                      // 必填
"iconUrl": "<app-icon-url>",               // 必填
"termsOfUseUrl": "<terms-of-use-url>",     // 可选
"privacyPolicyUrl": "<privacy-policy-url>" // 可选
}
items：请求钱包的指令列表，目前支持两个指令：
ton_addr：获取用户的地址、公钥等信息
ton_proof：对钱包进行签名验证
返回值#
返回一个 Promise 对象，Promise 对象的结果为 ConnectEvent，数据结构如下：

type ConnectEvent = ConnectEventSuccess | ConnectEventError;

type ConnectEventSuccess = {
event: "connect";
id: number; // 递增的事件计数器
payload: {
items: ConnectItemReply[];
device: DeviceInfo;
}
}

type ConnectEventError = {
event: "connect_error",
id: number; // 递增的事件计数器
payload: {
code: number;
message: string;
}
}

// 与 window.okxTonWallet.tonconnect 对象上的 deviceInfo 完全相同
type DeviceInfo = {
platform: "iphone" | "ipad" | "android" | "windows" | "mac" | "linux";
appName: string;
appVersion: string;
maxProtocolVersion: number;
features: Feature[];
}

type Feature = { name: 'SendTransaction', maxMessages: number } // `maxMessages` 是钱包支持的一次 `SendTransaction` 中的最大消息数

type ConnectItemReply = TonAddressItemReply | TonProofItemReply;

// 由钱包返回的不受信任的数据。
// 如果您需要保证用户拥有此地址和公钥，您需要额外请求 ton_proof。
type TonAddressItemReply = {
name: "ton_addr";
address: string; // TON 地址原始 (`0:<hex>`)
network: NETWORK; // 网络 global_id
publicKey: string; // HEX 字符串，不带 0x
walletStateInit: string; // Base64（不安全 URL）编码的钱包合约的 stateinit cell
}

type TonProofItemReply = {
name: "ton_proof";
proof: {
timestamp: string; // 签名操作的 64 位 unix epoch 时间（秒）
domain: {
lengthBytes: number; // AppDomain 长度
value: string;  // 应用域名（作为 url 部分，无编码）
};
signature: string; // base64 编码的签名
payload: string; // 请求中的载荷
}
}

// 目前仅支持主网
enum NETWORK {
MAINNET = '-239',
TESTNET = '-3'
}
示例#
只是获取用户的地址、公钥等信息：

const result = await window.okxTonWallet.tonconnect.connect(2, {
manifestUrl: 'https://example.com/manifest.json',
items: [{ name: 'ton_addr' }]
})

if (result.event === 'connect') {
console.log(result.payload.items[0].address)
} else {
console.log(result.payload.message)
}
获取用户地址、公钥等信息，同时对钱包进行签名验证：

const result = await window.okxTonWallet.tonconnect.connect(2, {
manifestUrl: 'https://example.com/manifest.json',
items: [
{ name: 'ton_addr' },
{ name: 'ton_proof', payload: '123' }
]
})

if(result.event === 'connect') {
console.log(result.payload.items[0].address)
console.log(result.payload.items[1].proof)
} else {
console.log(result.payload.message)
}
restoreConnection#
恢复连接的方法，只会返回 ton_addr 指令的结果，如果无法连接钱包，则返回错误。

restoreConnection(): Promise<ConnectEvent>;
示例#
const result = await window.okxTonWallet.tonconnect.restoreConnection()

if(result.event === 'connect') {
console.log(result.payload.items[0].address)
} else {
console.log(result.payload.message)
}
send#
向钱包发送消息的方法：

send(message: AppRequest): Promise<WalletResponse>;
入参#
message：发送给钱包的消息体
message 入参

interface AppRequest {
method: string;
params: string[];
id: string;
}
method：消息的名称，目前支持 sendTransaction 和 disconnect
params：消息的参数
id：递增的标识符，允许匹配请求和响应
sendTransaction 消息#
用于签署并广播交易。

入参：

interface SendTransactionRequest {
method: 'sendTransaction';
params: [<transaction-payload>];
id: string;
}
其中 <transaction-payload> 是具有以下属性的 JSON：

valid_until（整数，可选）：unix 时间戳。该时刻之后交易将无效。
network（NETWORK，可选）：目前仅支持主网
from（以 wc:hex 格式的字符串，可选）- DApp打算从中发送交易的发送者地址。
messages（信息数组）：1-4 条从钱包合约到其他账户的输出消息。所有消息按顺序发送出去，但钱包无法保证消息会按相同顺序被传递和执行。
消息结构：

address（字符串）：消息目的地
amount（小数字符串）：要发送的纳币数量。
payload（base64 编码的字符串，可选）：以 Base64 编码的原始cell BoC。
stateInit（base64 编码的字符串，可选）：以 Base64 编码的原始cell BoC。
示例：

{
"valid_until": 1658253458,
"network": "-239",
"from": "0:348bcf827469c5fc38541c77fdd91d4e347eac200f6f2d9fd62dc08885f0415f",
"messages": [
{
"address": "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F",
"amount": "20000000",
"stateInit": "base64bocblahblahblah==" // 部署合约
},{
"address": "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3",
"amount": "60000000",
"payload": "base64bocblahblahblah==" // 将 nft 转移至新部署的账户 0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F
}
]
}
返回值：

type SendTransactionResponse = SendTransactionResponseSuccess | SendTransactionResponseError;

interface SendTransactionResponseSuccess {
result: <boc>;
id: string;

}

interface SendTransactionResponseError {
error: { code: number; message: string };
id: string;
}
其中 result 是签名后的签名串。

disconnect 消息#
用于断开钱包连接。

入参：

interface DisconnectRequest {
method: 'disconnect';
params: [];
id: string;
}
返回值：

type DisconnectResponse = DisconnectResponseSuccess | DisconnectResponseError;

interface DisconnectResponseSuccess {
result: {};
id: string;

}

interface DisconnectResponseError {
error: { code: number; message: string };
id: string;
}
listen#
监听钱包事件的方法。

listen(callback: (event: WalletEvent) => void): () => void;
入参#
callback：事件监听的回调函数
interface WalletEvent {
event: WalletEventName;
id: number; // 递增的事件计数器
payload: <event-payload>; // 每个事件特定的载荷
}

type WalletEventName = 'connect' | 'connect_error' | 'disconnect';
返回值#
返回一个函数，用于取消监听。

on / off#
这是专属于 OKX Wallet 的非标准 API，设计该 API 主要是为了支持 accountChanged 事件，可以让 Dapp 响应插件内的钱包切换
添加/移除事件监听，目前支持的事件有：

connect: 钱包已连接的事件
disconnect：当用户断开连接时会触发该事件
accountChanged：当用户切换账户时会触发该事件
const accountChanged = () => {}
window.okxTonWallet.tonconnect.on('accountChanged', accountChanged)
window.okxTonWallet.tonconnect.off('accountChanged', accountChanged)


DApp 连接钱包
连接浏览器插件钱包
aptos
Provider API
Provider API#
Aptos-AIP-62#
AIP-62
标准是Aptos推出的连接钱包的标准，OKX钱包已经支持AIP-62标准.

什么是 Injected provider API？#
欧易 Injected providers API 是一个 JavaScript API，欧易将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

连接账户#
window.okxwallet.aptos.connect()

描述

通过调用 window.okxwallet.aptos.connect() 连接OKX Wallet。

当成功调用 window.okxwallet.aptos.connect()，将会唤起OKX Wallet连接钱包页面，用户可以决定是否连接当前 DApp，如果用户同意将会返回地址 (address) 和公钥 (public key)。

try {
const response = await window.okxwallet.aptos.connect();
console.log(response);
// { address: string, publicKey: string }
} catch (error) {
console.log(error);
// { code: 4001, message: "User rejected the request."}
}
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectAptosButton">Connect Aptos</button>
获取账户信息#
window.okxwallet.aptos.account()

描述

调用 window.okxwallet.aptos.account()，将会获取当前 Dapp 链接的账户信息，将会返回地址 (address) 和公钥 (public key)。

const account = await window.okxwallet.aptos.account();
// { address: string, publicKey: string }
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectAptosButton">Connect Aptos</button>
<button class="accountAptosButton">Account</button>
获取当前链接的网络#
window.okxwallet.aptos.network()

描述

调用 window.okxwallet.aptos.network()，将会获取当前 Dapp 链接的网络信息，将会返回链接的网络名称。

const network = await window.okxwallet.aptos.network();
// 'Mainnet'
// 目前支持的网络： `Mainnet` | `Movement Mainnet` | `Movement Testnet`
enum Network {
Mainnet = 'Mainnet'
MovementMainnet = 'Movement Mainnet'
MovementTestnet = 'Movement Testnet'
}
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectAptosButton">Connect Aptos</button>
<button class="networkAptosButton">Network</button>
签名交易#
window.okxwallet.aptos.signAndSubmitTransaction(transaction)

描述

在OKX Wallet中通过调用 window.okxwallet.aptos.signAndSubmitTransaction(transaction) 方法来发起一笔 Aptos 链上交易，这个方法将会返回一个待确认的交易信息给 DApp

const transaction = {
arguments: [address, '717'],
function: '0x1::coin::transfer',
type: 'entry_function_payload',
type_arguments: ['0x1::aptos_coin::AptosCoin'],
};

try {
const pendingTransaction = await window.okxwallet.aptos.signAndSubmitTransaction(transaction);

const client = new AptosClient('https://fullnode.mainnet.aptoslabs.com/');
const txn = await client.waitForTransactionWithResult(
pendingTransaction.hash,
);
} catch (error) {
// see "Errors"
}
当然也可以通过 window.okxwallet.aptos.signTransaction(transaction) 仅仅是签名交易，而不发起上链操作，此方法将返回一个签名的Buffer

提示
重要提醒：这个方法并不常用，而且对用户来说也非常的不安全，建议不要使用这个方法
const transaction = {
arguments: [address, '717'],
function: '0x1::coin::transfer',
type: 'entry_function_payload',
type_arguments: ['0x1::aptos_coin::AptosCoin'],
};

try {
const signTransaction = await window.okxwallet.aptos.signTransaction(transaction);
} catch (error) {
// see "Errors"
}
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectAptosButton btn">Connect Aptos</button>
<button class="signTransactionButton btn">Sign Transaction</button>
签名信息#
window.okxwallet.aptos.signMessage(message)

描述

DApp 可以通过调用 window.okxwallet.aptos.signMessage(message) 来签名一段消息，当用户同意这个操作后，OKX Wallet将返回签名成功的信息、签名信息、入参和返回信息。结构如下：

参数

interface SignMessagePayload {
address?: boolean; // Should we include the address of the account in the message
application?: boolean; // Should we include the domain of the DApp
chainId?: boolean; // Should we include the current chain id the wallet is connected to
message: string; // The message to be signed and displayed to the user
nonce: string; // A nonce the DApp should generate
}
返回值

interface SignMessageResponse {
address: string;
application: string;
chainId: number;
fullMessage: string; // The message that was generated to sign
message: string; // The message passed in by the user
nonce: string;
prefix: string; // Should always be APTOS
signature: string; // The signed full message
}
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectAptosButton btn">Connect Aptos</button>
<button class="signButton btn">Sign Message</button>
签名消息验证#
import nacl from 'tweetnacl';

const message = 'hello';
const nonce = 'random_string';

try {
const response = await window.okxwallet.aptos.signMessage({
message,
nonce,
});
const { publicKey } = await window.okxwallet.aptos.account();
// Remove the 0x prefix
const key = publicKey!.slice(2, 66);
const verified = nacl.sign.detached.verify(
Buffer.from(response.fullMessage),
Buffer.from(response.signature, 'hex'),
Buffer.from(key, 'hex'),
);
console.log(verified);
} catch (error) {
console.error(error);
}
事件#
账户切换

当用户在切换OKX Wallet的时候，需要监听钱包切换事件：onAccountChange

提示
重要提醒：用户切换的钱包的时候，目前账户必须有 Aptos 地址时才会触发。
let currentAccount = await window.okxwallet.aptos.account();

// event listener for disconnecting
window.okxwallet.aptos.onAccountChange((newAccount) => {
// If the new account has already connected to your app then the newAccount will be returned
if (newAccount) {
currentAccount = newAccount;
} else {
// Otherwise you will need to ask to connect to the new account
currentAccount = window.okxwallet.aptos.connect();
}
});
onNetworkChange()

DApp 需要确保用户链接的是目标网络，因此需要获取当前网络、切换网络以及网络切换监听。

// 当前dapp链接的网络
let network = await window.okxwallet.aptos.network();

// 监听链接的网络发生变化
window.bitkeep.aptos.onNetworkChange((newNetwork) => {
network = newNetwork; // { networkName: 'Mainnet' }
});
断开连接

当OKX Wallet断开连接的时候（OKX Wallet是多链钱包，当用户切换到的钱包不包含 Aptos 相关地址的时候，也会触发该事件）

// get current connection status
let connectionStatus = await window.okxwallet.aptos.isConnected();

// event listener for disconnecting
window.okxwallet.aptos.onDisconnect(() => {
connectionStatus = false;
});


DApp 连接钱包
连接浏览器插件钱包
cosmos
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

Note: Cosmos 接入仅支持OKX Wallet插件端。

连接账户#
#window.okxwallet.keplr.enable(chainIds)

描述

如果插件当前被锁定，window.keplr.enable（chainIds）方法请求解锁插件。如果用户未授予该网页的权限，它将要求用户授予该网页访问 Keplr 的权限。 enable 方法可以接收一个或多个链id作为数组。当传递链id数组时，你可以同时请求尚未授权的所有链的权限。 如果用户取消解锁或拒绝权限，将抛出错误。

enable(chainIds: string | string[]): Promise<void>
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectCosmosButton">Connect Cosmos</button>
签名交易#
#window.okxwallet.keplr.signAmino(chainId, signer, signDoc)

描述

按照固定格式签名，类似 cosmjs 的 OfflineSigner 的 signAmino 方法

参数就是对象，signDoc 就是一个固定格式

window.okxwallet.keplr.signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions: any): Promise<AminoSignResponse>
例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectCosmosButton btn">Connect Cosmos</button>
<button class="signTransactionButton btn">Sign Transaction</button>
签名信息#
#window.okxwallet.keplr.signArbitrary(chainId, signer, data)

描述

签名任意信息，相当于之前几个链的 signMessage(any)。

signArbitrary(
chainId: string,
signer: string,
data: string | Uint8Array
): Promise<StdSignature>;
verifyArbitrary(
chainId: string,
signer: string,
data: string | Uint8Array,
signature: StdSignature
): Promise<boolean>;

例子

在 codeopen
中打开。

HTML
JavaScript
<button class="connectCosmosButton btn">Connect Cosmos</button>
<button class="signMessageButton btn">Sign Message</button>
事件#
成功连接

连接到OKX Wallet可以通过调用 window.okxwallet.keplr.enable(chainId)。 当用户接受连接请求时，会触发连接事件。

用法

window.okxwallet.keplr.on("connect", () => console.log("connected!"));



DApp 连接钱包
连接浏览器插件钱包
sui
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

获取 wallet 对象#
Sui 钱包使用的是 wallet standard，相比其他异构链有些不同，可以通过事件通知的方式获取 wallet 对象：

const GlobalWallet = {
register: (wallet) => {
GlobalWallet[wallet.chainName] = wallet
}
}
const event = new CustomEvent('wallet-standard:app-ready', { detail: GlobalWallet });
window.dispatchEvent(event);

const suiWallet = GlobalWallet.suiMainnet
获取账户#
通过以上获取到的 suiWallet 对象，可以获取到账户：

const suiAccounts = suiWallet.connectedAccounts

// suiAccounts 结构:
[
{
"address": "0x7995ca23961fe06d8cea7da58ca751567ce820d7cba77b4a373249034eecca4a",
"publicKey": "tUvCYrG22rHKR0c306MxgnhXOSf16Ot6H3GMO7btwDI=",
"chains": [
"sui:mainnet"
],
"features": [
"sui:signAndExecuteTransactionBlock",
"sui:signTransactionBlock",
"sui:signMessage"
]
}
]
第一笔交易#
suiWallet.features['sui:signAndExecuteTransactionBlock'].signAndExecuteTransactionBlock

签名并发送交易

Sui 钱包使用的是 wallet standard，相比其他异构链有些不同，所有方法都挂在 features[] 里 创建交易后，Web 应用程序可能会要求用户的OKX Wallet签署并发送交易。如果接受，OKX Wallet将使用用户的私钥签署交易并通过 SUI JSON RPC 连接提交。在 suiWallet 上调用 signAndExecuteTransactionBlock 方法会为已签名的交易返回 promise。

const handleTransaction = async () => {
const tx = new TransactionBlock()
tx.moveCall({
target: `${packageId}::${moduleName}::${functionName}`,
arguments: [
tx.pure(params1),
tx.pure(params2),
],
typeArguments: [],
})
const result = await suiWallet.features['sui:signAndExecuteTransactionBlock'].signAndExecuteTransactionBlock({
transactionBlock: tx,
options: { showEffects: true },
})
console.log('result', result)
// 通过result?.effects?.status?.status获取交易状态，成功为 'success'，失败为'failure'
}
拆币

在发交易时，付 gas 费的 objectId，如果这个 object 本身就要被发送，还要用来付 gas 费，这时候就需要用到拆币(split coin)

const handleTransaction = async () => {
const tx = new TransactionBlock()

    const value = '300000000'  // 这里是想要拆出的目标值
    const [coins] = tx.splitCoins(tx.gas, [
      tx.pure(BigInt(value)),
    ])
    tx.moveCall({
      target: `${packageId}::${moduleName}::${functionName}`,
      arguments: [
        tx.pure(参数1),
        tx.pure(参数2),
        tx.makeMoveVec({ objects: [coins] }),
      ],
      typeArguments: [],
    })
    const result = await suiWallet.features['sui:signAndExecuteTransactionBlock'].signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true },
    })
    console.log('result', result)
    // 通过result?.effects?.status?.status获取交易状态，成功为 'success'，失败为'failure'
}
对交易块进行签名

通过 provider 上的 signTransactionBlock 方法可以签署一个交易块(多个交易的集合)。

const tx = new TransactionBlock();
tx.moveCall({
target: 'xxx',
arguments: [
tx.pure('okx'),
tx.pure('wallet'),
],
});
const input = {
transactionBlockSerialized: tx.serialize(),
options: {
showEffects: true,
}
}l
const transaction = await suiWallet.features['sui:signTransactionBlock'].signTransactionBlock({ transactionBlock: tx })
签名信息#
对单个交易签名（不发送）

创建交易后，Web 应用程序可能会要求用户的OKX Wallet签署交易，而无需将其提交到网络。调用 signMessage 方法会为已签名的交易返回 Promise。

import { ethers } from 'ethers';
// 这里借用 ethers 库来帮我们处理 message，将其转为 Uint8Array 类型

const message = ethers.utils.toUtf8Bytes('okx')
const { signature, messageBytes } = await suiWallet.features['sui:signMessage'].signMessage({ message })
错误码#
错误码
标题
描述
4900	断开连接	OKX Wallet could not connect to the network.
4100	未授权	The requested method and/or account has not been authorized by the user.
4001	用户拒绝请求	The user rejected the request through OKX wallet.
-32000	无效输入	Missing or invalid parameters.
-32002	请求资源不可用	This error occurs when a dapp attempts to submit a new transaction while OKX wallet's approval dialog is already open for a previous transaction. Only one approve window can be open at a time. Users should approve or reject their transaction before initiating a new transaction.
-32003	拒绝交易	OKX Wallet does not recognize a valid transaction.
-32601	未找到方法	OKX Wallet does not recognize the method.
-32603	内部错误	Something went wrong within OKX wallet.
连接账户#
suiWallet.features['standard:connect'].connect()

描述

连接到OKX Wallet可以通过调用 suiWallet.features['standard:connect'].connect()。

connect 调用将返回一个 Promise 对象，该 Promise 对象在用户接受连接请求时 resolve，并在用户拒绝请求时 reject。有关OKX Wallet可能发生错误的详细信息，请参考 错误码。 当用户接受连接请求时，suiWallet.features['standard:events'] 也会触发连接事件。

suiWallet.features['standard:events'].on("connect", () => console.log("connected!"));
一旦 Web 应用程序连接到OKX Wallet，它将能够读取连接账户的公钥并提示用户进行其他交易。

例子

在 codeopen
中打开。

事件#
成功连接

连接到OKX Wallet可以通过调用 suiWallet.features['standard:events'].on。 当用户接受连接请求时，会触发连接事件。

用法

suiWallet.features['standard:events'].on("connect", () => console.log("connected!"));
断开连接

断开连接与连接过程相同。但是，钱包也有可能发起断开连接，而不是应用程序本身。

用法

suiWallet.features['standard:events'].on("disconnect", () => {
console.log("disconnected!")
});
账户变更

OKX Wallet允许用户从单个扩展程序或移动应用程序中无缝管理多个账户。每当用户切换账户时，OKX Wallet都会发出一个 accountChanged 事件。

如果用户在已连接到应用程序时更改账户，并且新账户已经将该应用程序列入白名单，那么用户将保持连接状态并且OKX Wallet将传递新账户的公钥：

用法

suiWallet.features['standard:events'].on('accountChanged', (publicKey) => {
if (publicKey) {
console.log(`Switched to account ${publicKey.toBase58()}`);
}
});

DApp 连接钱包
连接浏览器插件钱包
stacks
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

连接账户#
window.okxwallet.stacks.connect()

描述

通过调用 window.okxwallet.stacks.connect() 连接OKX Wallet。

当成功调用 window.okxwallet.stacks.connect()，将会唤起OKX Wallet连接钱包页面，用户可以决定是否连接当前 DApp，如果用户同意将会返回地址 (address) 和公钥 (public key)。

try {
const response = await window.okxwallet.stacks.connect();
console.log(response);
// { address: string, publicKey: string }
} catch (error) {
console.log(error);
// { code: 4001, message: "User rejected the request."}
}
合约调用#
window.okxwallet.stacks.signTransaction(transaction)

参数

transaction - object
stxAddress - string: 当前连接的钱包的 stx 地址
txType - string: 交易类型，必须传入 contract_call
contractName - string: 合约名称
contractAddress - string: 合约地址
functionName - string: 函数名称
functionArgs - array<string>: 16进制序列化的合约调用数据
postConditionMode - number: (非必需)是否允许后置条件
1: 允许
2: 拒绝
postConditions - array<string>: (非必需)后置条件的参数
anchorMode - number: (非必需)交易上链的方式
1: 交易必须被 anchored block 接收
2: 交易必须被 microblock 接收
3: 可以任意选择一种接收方式
返回值

result - object
txHash - string: 交易哈希
signature - string: 签名字符串
try {
const transaction = {
"stxAddress": "",
"txType": "contract_call",
"contractName": "amm-swap-pool-v1-1",
"contractAddress": "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
"functionName": "swap-helper",
"functionArgs": [
"0616e685b016b3b6cd9ebf35f38e5ae29392e2acd51d0a746f6b656e2d77737478",
"0616e685b016b3b6cd9ebf35f38e5ae29392e2acd51d176167653030302d676f7665726e616e63652d746f6b656e",
"0100000000000000000000000005f5e100",
"01000000000000000000000000000f4240",
"0a010000000000000000000000000078b854"
],
"postConditionMode": 2,
"postConditions": [
"000216c03b5520cf3a0bd270d8e41e5e19a464aef6294c010000000000002710",
"010316e685b016b3b6cd9ebf35f38e5ae29392e2acd51d0f616c65782d7661756c742d76312d3116e685b016b3b6cd9ebf35f38e5ae29392e2acd51d176167653030302d676f7665726e616e63652d746f6b656e04616c657803000000000078b854"
],
"anchorMode": 3,
};
const {txHash, signature} = await window.okxwallet.stacks.signTransaction(transaction);
console.location({txHash, signature});
} catch (error) {
console.log(error);
}
转账交易#
window.okxwallet.stacks.signTransaction(transaction)

参数

transaction - object
stxAddress - string: 当前连接的钱包的 stx 地址
txType - string: 交易类型，必须传入 token_transfer
recipient - string: 接收地址
amount - stirng: 发送的数量
memo - stirng: (非必需)备注信息
anchorMode - number: (非必需)交易上链的方式
1: 交易必须被 anchored block 接收
2: 交易必须被 microblock 接收
3: 可以任意选择一种接收方式
返回值

result - object
txHash - string: 交易哈希
signature - string: 签名字符串
try {
const transaction = {
stxAddress: '',
txType: 'token_transfer',
recipient: '',
amount: '10000',
memo: 'test'
};
const {txHash, signature} = await window.okxwallet.stacks.signTransaction(transaction);
console.location({txHash, signature});
} catch (error) {
console.log(error);
}
签名消息#
window.okxwallet.stacks.signMessage(data)

参数

data - object
message - string: 需要签名的数据
返回值

result - object
publicKey - string: 验签的公钥
signature - string: 签名字符串
try {
const data = {
message: '1234'
};
const {publicKey, signature} = await window.okxwallet.stacks.signMessage(data);
console.location({publicKey, signature});
} catch (error) {
console.log(error);
}


DApp 连接钱包
连接浏览器插件钱包
starknet
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

获取注入的对象#
Dapp 可以通过两种方式访问注入的对象，分别是：

window.okxwallet.starknet
window.starknet_okxwallet
这两个属性都指向同一个对象，提供两个方式是为了方便 Dapp 使用。

如果 Dapp 希望直接访问OKX Wallet注入的 Starknet 对象，可以直接使用 window.okxwallet.starknet 或者 window.starknet_okxwallet ，从而避免意外引用到其他钱包注入的 Starknet 对象。

如果 Dapp 使用了 get-starknet
这种第三方工具库，也可以完全支持。

注入对象的属性和方法#
name - string：钱包的名称，值为 'OKX Wallet'
icon - string：钱包的图标
version - string：版本号
isConnected - boolean:：当前钱包是否已连接上
selectedAddress - string：用户当前选中的钱包地址
account - Account：访问账户对象，继承自 starknet.js 的 Account
，实例上的具体属性和方法，可参考 starknet.js 的文档
chainId - string：仅支持主网，值为 SN_MAIN
provider - Provider：访问 provider 对象，使用的是 starknet.js 的 RpcProvider
，实例上的具体属性和方法，可参考 starknet.js 的文档
enable - () => [string]：用于连接钱包，成功调用后，会唤起OKX Wallet连接钱包页面，用户可以决定是否连接当前 DApp，如果用户同意，将会返回选中地址的单项数组
on - (event, callback) => void：添加事件监听
accountsChanged 事件：当用户切换账户时会触发该事件，并返回新地址的数组；当断开连接时，会返回空数组。
off - (event, callback) => void：移除事件监听
连接钱包的简单示例#
async function connect() {
if(window.okxwallet.starknet.isConnected) {
return
}

    try {
        const [address] = await window.okxwallet.starknet.enable()

        console.log(address)
        console.log(window.okxwallet.starknet.account)
        console.log(window.okxwallet.starknet.selectedAddress)
        console.log(window.okxwallet.starknet.isConnected)

        window.okxwallet.starknet.on('accountsChanged', ([addr]) => {
            if (addr) {
                console.log('switched address')
            } else {
                console.log('disconnected')
            }
        })
    } catch (e) {
        console.error(e)
    }
}
合约调用#
window.okxwallet.starknet.account.execute(transactions [, abi])

执行一个或多个调用。如果只有一个调用，则 transactions 就是一个对象，其包含的属性会在下面说明。如果有多个调用，则是一个对象的数组。

参数#
transactions 对象的结构如下：

contractAddress - string：合约的地址
entrypoint - string：合约的入口点
calldata - array：调用数据
signature - array：签名
abi - 合约的 abi，可选的

返回值#
result - object
transaction_hash - string：交易的 hash
const transaction = {
"contractAddress": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
"calldata": [
"3055261660830722006547698919883585605584552967779072711973046411977660833095",
"100000000000000",
"0"
],
"entrypoint": "transfer"
}

const result = await window.okxwallet.starknet.account.execute(transaction)
签名消息#
window.okxwallet.starknet.account.signMessage(data)

参数#
data - object：要签名的对象
返回值#
signature - string[]：签名的结果，包含两项
let data = {
"domain": {
"name": "OKX",
"chainId": "SN_MAIN",
"version": "0.0.1"
},
"types": {
"StarkNetDomain": [
{
"name": "name",
"type": "felt"
}
],
"Message": [
{
"name": "message",
"type": "felt"
}
]
},
"primaryType": "Message",
"message": {
"message": "hello"
}
}

const [r, s] = await window.okxwallet.starknet.account.signMessage(data)



DApp 连接钱包
连接浏览器插件钱包
cardano
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

获取注入的对象#
Dapp 可以通过两种方式访问注入的对象，分别是：

window.okxwallet.cardano
window.cardano.okxwallet
这两个属性都指向同一个对象，提供两个方式是为了方便 Dapp 使用。

注入对象的属性和方法#
name - string: 钱包的名称，值为 'OKX Wallet'
icon - string: 钱包的图标
apiVersion - string: 版本号
isEnabled - () => Promise<bool>: 返回当前钱包是否已经链接上 Dapp 。如果 Dapp 已经链接到用户的钱包，则返回 true ，否则返回 false 。如果此函数返回 true ，则后续调用 wallet.enable() 时都会成功并且返回 API 对象。
enable - () => Promise<API>: 该用法用于链接钱包，如果用户同意了链接钱包，则会将 API 对象返回给 Dapp 。
连接钱包的简单示例#
try {
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
} catch (error) {
console.log(error);
}
获取网络 Id#
api.getNetworkId(): Promise<number>

描述

返回当前连接的帐户的网络 Id 。

返回值

networkId - string: 当前连接的帐户的网络 Id 。
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const networkId = await okxwalletCardanoApi.getNetworkId();
获取 UTXO#
api.getUtxos(amount: cbor<value> = undefined): Promise<TransactionUnspentOutput[] | undefined>

描述

如果 amount 没有定义，则返回由钱包控制的所有 UTXO (未花费的交易输出)列表。 如果 amount 定义了，则返回达到 amount 中指定的 ADA /多资产价值目标所需的 UTXO ，如果无法达到，则返回 null 。

返回值

utxos - string[]: UTXO 列表。
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const utxos = await okxwalletCardanoApi.getUtxos();
获取资产#
api.getBalance(): Promise<cbor<value>>

描述

返回钱包可用的总余额。这与 api.getUtxos() 返回的结果相加是一样的。

返回值

balance - string: 钱包可用的总余额
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const utxos = await okxwalletCardanoApi.getBalance();
获取已使用的钱包地址#
api.getUsedAddresses(): Promise<cbor<address>[]>

描述

返回所有由钱包控制的已使用地址(包括在某些链上交易中)的列表。

返回值

addresses - string[]: 已使用的地址列表。
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const utxos = await okxwalletCardanoApi.getUsedAddresses();
获取未使用的钱包地址#
api.getUnusedAddresses(): Promise<cbor<address>[]>

描述

返回由钱包控制的未使用地址列表。

返回值

addresses - string[]: 未使用的地址列表。
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const utxos = await okxwalletCardanoApi.getUnusedAddresses();
获取找零地址#
api.getChangeAddress(): Promise<cbor<address>>

描述

返回钱包组装交易时，需要使用到的找零地址。

返回值

changeAddress - string: 找零地址.
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const utxos = await okxwalletCardanoApi.getChangeAddress();
签名交易#
api.signTx(tx: cbor<transaction>): Promise<cbor<transaction_witness_set>>

描述

请求用户对交易进行签名，如果用户同意，则尝试对交易进行签名，并返回签名的交易。

返回值

signedTx - string: 签名的交易。
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const rawTransaction = '';
const result = await okxwalletCardanoApi.signTx(rawTransaction);
签名消息#
api.signData: (addr: Cbor<address>, payload: HexString) => Promise<DataSignature>

描述

签名消息。 阅读更多关于 CIP-0030 的消息签名规范。(https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030
).

返回值

dataSignature - object
signature - string
key - string
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const addresses = await okxwalletCardanoApi.getUsedAddresses();
const payload = '';
const result = await okxwalletCardanoApi.signData(addresses[0], payload);
广播交易#
api.submitTx(tx: cbor<transaction>): Promise<hash32>

描述

广播交易，并返回给 Dapp 交易哈希以便 Dapp 追踪这笔交易。

返回值

txHash - string: 交易哈希。
const okxwalletCardanoApi = await window.okxwallet.cardano.enable();
const transaction = '';
const result = await okxwalletCardanoApi.submitTx(transaction);


DApp 连接钱包
连接浏览器插件钱包
nostr
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

获取注入的对象#
Dapp 可以通过如下方式访问注入的对象：

window.okxwallet.nostr
连接钱包的简单示例#
try {
const publicKey = await window.okxwallet.nostr.getPublicKey();
} catch (error) {
console.log(error);
}
获取公钥#
window.okxwallet.nostr.getPublicKey(): Promise<string>

描述

返回当前连接的帐户的公钥。

返回值

publicKey - string: 当前连接的帐户的公钥。
try {
const publicKey = await window.okxwallet.nostr.getPublicKey();
} catch (error) {
console.log(error);
}
签名 Event#
window.okxwallet.nostr.signEvent(event: Event): Promise<SignedEvent>

描述

对 Event 进行签名。

入参

event - object
created_at - number: 事件创建时间
kind - number: 事件类型
tags - string[][]: 事件标签
content - string: 事件内容
返回值

event - SignedEvent：除了包含 event 入参的所有属性外，还包含如下属性
id - string: 唯一标识
pubkey - string: 公钥
sig - string: 签名
const event = {
content: "hello",
kind: 4,
"tags": [
[
"p",
"693d3f45b81c1f3557383fb955f3a8cb2c194c44ffba1e2f4566e678773b44f8"
],
[
"r",
"json"
],
[
"a",
"b4f4e689fca78ebcaeec72162628ba61c51a62e1420b9b8ca8cb63d9a7e26219"
]
],
"created_at": 1700726837,
}
const signedEvent = await window.okxwallet.nostr.signEvent(event)
console.log(signedEvent.id)
console.log(signedEvent.pubkey)
console.log(signedEvent.sig)
对消息进行加密#
window.okxwallet.nostr.nip04.encrypt(pubkey: string, message: string): Promise<string>

描述

根据 NIP-04
规范对消息进行加密

返回值

encryptMsg - string: 加密的结果
const pubkey = '693d3f45b81c1f3557383fb955f3a8cb2c194c44ffba1e2f4566e678773b44f8'
const msg = 'hello world'
const encryptMsg = await window.okxwallet.nostr.nip04.encrypt(pubkey, msg);
console.log(encryptMsg)
对消息进行解密#
window.okxwallet.nostr.nip04.decrypt(pubkey: string, message: string): Promise<string>

描述

根据 NIP-04
规范对消息进行解密

返回值

decryptMsg - string: 解密的结果
const pubkey = '693d3f45b81c1f3557383fb955f3a8cb2c194c44ffba1e2f4566e678773b44f8'
const msg = 'VVPplRPF0w4dNZkuiQ==?iv=Nrb7gcph/9eKuqyuDx0yKQ=='
const decryptMsg = await window.okxwallet.nostr.nip04.decrypt(pubkey, msg);
console.log(decryptMsg)
添加/移除事件监听#
window.okxwallet.nostr.on(event:string, callback: Function): Promise<void>

window.okxwallet.nostr.off(event:string, callback: Function): Promise<void>

描述

添加事件监听，目前支持的事件有：

accountChanged：当用户切换账户时会触发该事件
window.okxwallet.nostr.on('accountChanged', async () => {
const publicKey = await window.okxwallet.nostr.getPublicKey();
console.log(publicKey)
})


DApp 连接钱包
连接浏览器插件钱包
near
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

获取注入的对象#
Dapp 可以通过如下方式访问注入的对象：

window.okxwallet.near - 推荐
window.near
连接钱包#
requestSignIn()#
/**
* @param {String} contractId contract account id
* @param {Array} methodNames methods on the contract should be allowed to be called.
* @returns { accountId, accessKey } accountId and signed in access key
  */
  window.okxwallet.near.requestSignIn({ contractId = '', methodNames = []}): Promise<Result>
  仅获取 accountId#
  不传 contractId 和 methodNames 只会获取到用户的 NEAR 地址.

try {
const { accountId } = window.okxwallet.near.requestSignIn();
} catch (_) {
// something error
}
返回值示例:

{
"accountId": "efad2c...9dae",
}
获取 accessKey#
传入 contractId 和 methodNames, 钱包会返回 accessKey

const contractId = 'wrap.near';
const methodNames = ['ft_metadata'];
try {
const { accountId, accessKey } = window.okxwallet.near.requestSignIn({ contractId, methodNames });
} catch (_) {
// something error
}
返回值示例:

{
"accountId": "efad2c...9dae",
"accessKey": {
"secretKey": "5S9Ngi...Uku6",
"publicKey": "ed25519:9RivAy...Hxc8"
}
}
signOut()#
断开钱包连接

window.okxwallet.near.signOut(): void;
isSignedIn()#
判断当前账户是否处于连接中状态

window.okxwallet.near.isSignedIn(): boolean;
getAccountId()#
获取当前连接的 accountId

window.okxwallet.near.getAccountId(): string;
signMessage#
near.signMessage({ message: string, recipient: string, nonce: Buffer }): Response;
签名, 示例:

const message = {
message: 'hello world',
recipient: 'test.testnet',
nonce: Buffer.from("4268ebc14ff247f5450d4a8682bec3729a06d268f83b0cb363083ab05b65486b", "hex")
}

const result = await window.okxwallet.near.signMessage(message);
返回值示例:

{
"accountId": "efad2c...9dae",
"publicKey": "ed25519:H8bbdL...ucKF",
"signature": "zYbw0Z+YabpZTnYA1REkvAX5KeXt/qRgHkorYfjRR5dD5keySfFuWGMafkfi/RPUpG1EAqbUf9VFt4tTBebcDQ=="
}
合约交互#
signAndSendTransaction()#
near.signAndSendTransaction({ receiverId: string, actions: Action[]}): Response;
签名并广播交易, 示例:

const tx = {
receiverId: 'wrap.near',
actions: [
{
methodName: 'near_deposit',
args: {},
deposit: '1250000000000000000000',
},
],
}

const result = await window.okxwallet.near.signAndSendTransaction(tx);
返回值示例:

{
"method": "signAndSendTransaction",
"txHash": "2bNbuT...UdSA",
"code": 0
}
注意: dapp 需要通过 txHash 获取交易广播的结果

requestSignTransactions()#
near.requestSignTransactions({transactions: Transaction[]}): Response;
批量签名交易, 示例:

const transactions = [
{
receiverId: 'wrap.near',
actions: [
{
methodName: 'near_deposit',
args: {},
deposit: '1000000000000000',
},
],
},
{
receiverId: 'wrap.near',
actions: [
{
methodName: 'ft_transfer',
args: {
receiver_id: 'efad2c...9dae',
amount: '10000000000',
},
deposit: '1',
},
],
},
]

const result = await window.okxwallet.near.signAndSendTransaction({ transactions });
返回值示例:

{
"txs": [
{
"signedTx": "QAAAAG...kAoH",
"txHash": "71MuUA...KVxt"
},
{
"signedTx": "QAAAAG...gksH",
"txHash": "8RHzw4...hvLN"
}
],
"code": 0,
"method": "requestSignTransactions"
}
注意: 批量签名交易钱包只会签名, 不会广播. dapp 侧需要承接广播的逻辑.

事件#
signIn#
连接钱包成功

window.okxwallet.near.on("signIn", ((accountId) => {
// accountId: 当前连接账户的 accountId
});
signOut#
连接钱包成功

window.okxwallet.near.on("signIn", (() => {
// do something
});
accountChanged#
钱包侧切换了账户

window.okxwallet.near.on("accountChanged", ((accountId) => {
// accountId: 切换后账户的 accountId
});

DApp 连接钱包
连接浏览器插件钱包
WAX
Provider API
Provider API#
什么是 Injected provider API？#
OKX Wallet Injected providers API 是一个 JavaScript API，OKX Wallet将其注入用户访问的网站。您的 DApp 可以使用此 API 请求用户帐户，从用户连接的区块链读取数据，帮助用户签署消息和交易。

特别说明#
OKX Wallet 的 WAX API 完全兼容 Scatter 协议
，下面的 API 和示例都是基于该协议的，具体使用详情，开发者可以参考 Scatter 协议的文档。

连接钱包并获取账户信息#
import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';

ScatterJS.plugins(new ScatterEOS());

ScatterJS.login().then(identity => {
const account = identity.accounts[0]
console.log(account)
})
是否已连接钱包#
确定钱包是否已连接。

import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';

ScatterJS.plugins(new ScatterEOS());

const isConnected = ScatterJS.isConnected()
console.log(isConnected)
获取钱包信息#
获取当前连接的钱包信息，如果没有连接到钱包，则会返回 null 。

import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';

ScatterJS.plugins(new ScatterEOS());

const isConnected = ScatterJS.isConnected()

if (isConnected) {
const identity = ScatterJS.account()
const account = identity.accounts[0]
console.log(account)
}
签名交易#
签署交易时，需要用到 eosjs
这个库。

import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import {JsonRpc, Api} from 'eosjs';

ScatterJS.plugins(new ScatterEOS());

const network = ScatterJS.Network.fromJson({
blockchain:'wax',
chainId:'1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
host:'nodes.get-scatter.com',
port:443,
protocol:'https'
});
const rpc = new JsonRpc(network.fullhost());

ScatterJS.connect('YourAppName', {network}).then(connected => {
if(!connected) return console.error('no scatter');

    const eos = ScatterJS.eos(network, Api, {rpc});

    ScatterJS.login().then(identity => {
        if(!identity) return console.error('no identity');

        const account = identity.accounts[0]

        eos.transact({
            actions: []
        }).then(res => {
            console.log('sent: ', res);
        }).catch(err => {
            console.error('error: ', err);
        });
    });
});
添加/移除事件监听#
添加/移除事件监听，目前支持的事件有：

connect: 钱包已连接的事件
accountChanged：当用户切换账户时会触发该事件
disconnect：当用户断开连接时会触发该事件
import ScatterJS from '@scatterjs/core';

const connect = () => {}
ScatterJS.on('connect', connect)
ScatterJS.off('connect', connect)