Request TronLink Extension
Connect Website
DEPRECATED

The methods in this section are deprecated and are expected to be removed in a few releases. The TRON community is discussing new specifications, you can go to TRON-TIP to participate in the discussion.

Connect Website

Overview

TronLink supports TRX transfers, contract signature, authorization, etc. initiated by DApps. For security considerations, users are required to authorize the DApp to “connect website”. They can take further actions only after successful authorization. The DApp must first connect to the website, and wait for the user's permission before it can initiate a request for authorization.

Specification

Example


    const res = await tronWeb.request(
      {
        method: 'tron_requestAccounts',
        params: {
          websiteIcon: '<WEBSITE ICON URI>',
          websiteName: '<WEBSITE NAME>',
        },
      }
    )
Parameters


    interface RequestAccountsParams {
      websiteIcon?: string;
      websiteName?: string;
    }
Returns


    interface ReqestAccountsResponse {
      code: 200 | 4000 | 4001,
      message: string
    }
Error Code	Description	Message
null	Wallet is locked	Empty string
200	The site has previously been allowed to connect	The site is already in the whitelist
200	The user approved the connection	User allowed the request.
4000	The same DApp has already initiated a request to connect to the website, and the pop-up window has not been closed	Authorization requests are being processed, please do not resubmit
4001	The user rejected connection	User rejected the request
Interaction

After triggering ‘tron_requestAccounts‘, there will be a pop-up window asking for 

Add Token
Overview

Buttons on DApps allow users to directly add the specified tokens to the asset list on their TronLink user extension.

Specification

Example


    const res = await tronWeb.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'TRC20',
        options: {
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
        }
      },
    });
Parameters



    interface WatchAssetParams {
      type: 'trc10' | 'trc20' | 'trc721';
      options: {
        address: string;
        symbol?: string;
        decimals?: number;
        image?: string;
      }
    }
method: wallet_watchAsset fixed string

params: WatchAssetParams, the specific parameters are as follows:

type: Only 'trc10', 'trc20', 'trc721' are supported now

options:

address: the contract address of the token or the token id, required

symbol: placeholder (currently unused), optional

decimals: placeholder (currently unused), optional

image: placeholder (currently unused), optional

Returns

This method has no return value

Interaction

Add TRC10 assets



    if (window.tronLink.ready) {
      const tronweb = tronLink.tronWeb;
      try {
        tronweb.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'trc10',
            options: {
              address: '1002000'
            },
          },
        });
      } catch (e) {}
    }
When the code is executed, a TronLink pop-up window for adding TRC10 assets will show up, and the user can click “Add” or “Cancel”.

image

After clicking "Add", users can see the added assets as shown in the following screen:

image

Add TRC20 assets



    if (window.tronLink.ready) {
      const tronweb = tronLink.tronWeb;
      try {
        tronweb.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'trc20',
            options: {
              address: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3'
            },
          },
        });
      } catch (e) {}
    }
When the code is executed, a TronLink pop-up window for adding TRC20 assets will show up, and the user can click “Add” or “Cancel”.

image

After clicking “Add”, users can see the added assets as shown in the following screen:

image

Add TRC721 asset


    if (window.tronLink.ready) {
      const tronweb = tronLink.tronWeb;
      try {
        tronweb.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'trc721',
            options: {
              address: 'TVtaUnsgKXhTfqSFRnHCsSXzPiXmm53nZt'
            },
          },
        });
      } catch (e) {}
    }
When the code is executed, a TronLink pop-up window for adding TRC721 will show up, and the user can click “Add” or “Cancel”.

image

After clicking “Add”, users can see the added assets as shown in the following screen:

image

Receive messages from TronLink
The message is sent using "window.postMessage", and the content received by the Dapp is a MessageEvent.You can refer to MDN documentation of MessageEvent.

Account Change Message
Message ID: accountsChanged

Overview

This message is generated when:

Users log in

Users switch accounts

Users lock accounts

The wallet is automatically locked after timeout

Specification

Example




    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action === "accountsChanged") {
        // handler logic
        console.log('got accountsChanged event', e.data)
      }
    })
Returns




    interface MessageEventAccountsChangedData {
      isTronLink: boolean;
      message: {
        action: string;
        data: {
          address: string | boolean;
        }
      }
    }
Return value example

When users log in, the content of the message body is:



    {
      "data": {
        "address": "TZ5XixnRyraxJJy996Q1sip85PHWuj4793" // Last selected account address
      }
    }
When users switch accounts, the content of the message body is:

    {
      "data": {
        "address": "TRKb2nAnCBfwxnLxgoKJro6VbyA6QmsuXq" // Newly selected account address
      }
    }
When users lock accounts and the wallet is automatically locked due to timeout, the message body content is:

    {
      "data": {
        "address": false
      }
    }
Network Change Message
Message ID: setNode

Overview

Developers can monitor this message to know network changes

This message is generated when:

When the user changes the network
Specification

Example




    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action == "setNode") {
        // handler logic
        console.log('got setNode event', e.data)
      }
    })
Returns




    {
      "node": {
        // Information about the current network
      },
      "connectNode": {
        // Node information of DApp chain
      }
    }
Successful connection message
Message ID: connect

Overview

Developers can monitor this message for connection changes.

This message is generated when:

The DApp requests a connection, and the user confirms the connection in the pop-up window

Users connect to the website

Specification

Example




    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action == "connect") {
        // handler logic
        console.log('got connect event', e.data)
      }
    })
Disconnect website message
Message ID: disconnect

Overview

Developers can monitor this message for connection changes.

This message is generated when:

The DApp requests a connection, and the user rejects the connection in the pop-up window

Users disconnect from the website

Specification

Example




    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action == "disconnect") {
        // handler logic
        console.log('got connect event', e.data)
      }
    })
Messages to Be Deprecated
The user rejects connection: “rejectWeb”

The user disconnects from the website: “disconnectWeb”

The user accepts connection: “acceptWeb”

The user requests to connect to the website: “connectWeb”

User rejects connection
DEPRECATED

Message ID: rejectWeb

This message is generated when:

The DApp requests a connection and the user rejects the connection in the pop-up window.
image

Developers can get the connection rejection message by listening to it:



    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action == "rejectWeb") {
        // handler logic
        console.log('got rejectWeb event', e.data)
      }
    })
User disconnects from the website
DEPRECATED

Message ID: disconnectWeb

This message is generated when:

User actively disconnect from the website.
image

Developers can get the disconnection message by listening to it:




    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action == "disconnectWeb") {
        // handler logic
        console.log('got disconnectWeb event', e.data)
      }
    })
User accepts connection
DEPRECATED

Message ID: acceptWeb

This message is generated when:

The user accepts connection.
image

Developers can get the connection acceptance message by listening to it:


    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action == "acceptWeb") {
        // handler logic
        console.log('got acceptWeb event', e.data)
      }
    })
User requests to connect to the website
DEPRECATED

Message ID: connectWeb

This message is generated when:

The user requests to connect to the website.
image

Developers can get the connection request message by listening to it:


    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action == "connectWeb") {
        // handler logic
        console.log('got connectWeb event', e.data)
      }
    })

DeepLink
DApps and H5 pages can launch the TronLink App to open the wallet, log in, make transfers, sign transactions, open DApps in the wallet, and more via DeepLink.

image

Process Flowchart

Please be aware that only DApps that have been added to the whitelist will be able to establish a successful connection with TronLink. Kindly fill out the whitelist request form here: Start

Open Wallet
Launch TronLink wallet via DeepLink

    // Tronlink-v4.10.0
    // Link
    <a href='tronlinkoutside://pull.activity?param={}'>Open Tronlink</a>

    // The parameter of param is the protocol data in json format
    // Note: json.toString needs to be encoded with urlencode
    {
        "action": "open",
        "protocol": "tronlink",
        "version": "1.0"
    }
Open DApp
Use DeepLink to launch TronLink and open DApp in the DApp Explorer

    // Tronlink-v4.10.0
    // Link
    <a href='tronlinkoutside://pull.activity?param={}'>Open DApp</a>


    //  The parameter of param is the protocol data in json format
    //  Note: json.toString needs to be encoded with urlencode
    {
        "url": "https://www.tronlink.org/", //target DApp
        "action": "open",
        "protocol": "tronlink",
        "version": "1.0"
    }
Login by TronLink

    // Tronlink-v4.11.0
    // Link
    <a href='tronlinkoutside://pull.activity?param={}'>Login/Request Address</a>


    //  The parameter of param is the protocol data in json format
    //  Note: json.toString needs to be encoded with urlencode
    {
      "url": "https://justlend.org/#/home",
      "callbackUrl": "http://xxx/api/tron/v1/callback",
      "dappIcon": "https://test/icon.png",
      "dappName": "Test demo",
      "protocol": "TronLink",
      "version": "1.0",
      "chainId": "0x2b6653dc",
      "action": "login",
      "actionId": "e5471a9c-b0f1-418b-8634-3de60d68a288"
    }

    {
      "actionId": "e5471a9c-b0f1-418b-8634-3de60d68a288",
      "address": "TSPrmJetAMo6S6RxMd4tswzeRCFVegBNig",
      "code": 0,
      "id": 1780812177,
      "message": "success"
    }
Transfer

// Tronlink-v4.11.0
// Link
<a href='tronlinkoutside://pull.activity?param={}'>Transfer</a>

{
"url": "https://justlend.org/#/home",
"callbackUrl": "http://3.12.131.175:7777/api/tron/v1/callback",
"dappIcon": "https://test/icon.png",
"dappName": "Test demo",
"protocol": "TronLink",
"version": "1.0",
"chainId": "0x2b6653dc",
"memo": "Reward",
"from": "TSPrmJetAMo6S6RxMd4tswzeRCFVegBNig",
"to": "TXd9duqtcyyj4pBCKvXKNqmazxxDw5SdBa",
"loginAddress": "TSPrmJetAMo6S6RxMd4tswzeRCFVegBNig",
"tokenId": "0",
"contract": "",
"amount": "20",
"action": "transfer",
"actionId": "408170fc-7919-4459-be5e-05a9d4b4065e"
}

{
"actionId": "099482f0-ee12-4703-bb7b-2e9d8c7c61a1",
"code": 0,
"id": 1142367107,
"message": "success",
"transactionHash": "e8ffe9b92c771e66999732b810bf2493be389464191040d8666a26dc449fa5f0"
}
Sign Transaction

// Tronlink-v4.11.0
// Link
<a href='tronlinkoutside://pull.activity?param={}'>Sign transaction</a>

// request parameter
{
"url": "https://justlend.org/#/home",
"callbackUrl": "http://3.12.131.175:7777/api/tron/v1/callback",
"dappIcon": "https://test/icon.png",
"dappName": "Test demo",
"protocol": "TronLink",
"version": "1.0",
"chainId": "0x2b6653dc",
"action": "sign",
"loginAddress": "TSPrmJetAMo6S6RxMd4tswzeRCFVegBNig",
"method": "transfer(address,uint256)",
"signType": "signTransaction",
"data": "{\"visible\":false,\"txID\":\"dcfaf2c2d75d91994f9a23623e905eaa7d74bc804fa5821640111ada3441376a\",\"raw_data\":{\"contract\":[{\"parameter\":{\"value\":{\"data\":\"a9059cbb000000000000000000000000ed87a3ae2bf2ab8b95486a23f224487ad75c60200000000000000000000000000000000000000000000000000000000000000014\",\"owner_address\":\"41b42b84bad413dde093e27d01bb02ed9eede52c43\",\"contract_address\":\"41eca9bc828a3005b9a3b909f2cc5c2a54794de05f\"},\"type_url\":\"type.googleapis.com/protocol.TriggerSmartContract\"},\"type\":\"TriggerSmartContract\"}],\"ref_block_bytes\":\"84e1\",\"ref_block_hash\":\"1731d6450e11a03f\",\"expiration\":1670168865000,\"fee_limit\":100000000,\"timestamp\":1670168805340},\"raw_data_hex\":\"0a0284e122081731d6450e11a03f40e8d1c9eecd305aae01081f12a9010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412740a1541b42b84bad413dde093e27d01bb02ed9eede52c43121541eca9bc828a3005b9a3b909f2cc5c2a54794de05f2244a9059cbb000000000000000000000000ed87a3ae2bf2ab8b95486a23f224487ad75c6020000000000000000000000000000000000000000000000000000000000000001470dcffc5eecd30900180c2d72f\"}",
"actionId": "64fcdb39-2cfa-47f2-85bd-d7e8409809ed"
}

// callback parameter
{
"actionId": "f5d9791a-c774-4684-805a-83784c0c86ff",
"code": 0,
"id": -799302342,
"message": "success",
"successful": true,
"transactionHash": "2fc49e560f648e5ecb455955d8778267ec1f257436425f62393b632c9a7a55ad"
}
Sign Message

    // Tronlink-v4.11.0
    <a href='tronlinkoutside://pull.activity?param={}'>Sign message</a>

    // request parameter
    {
      "url": "https://justlend.org/#/home",
      "callbackUrl": "http://3.12.131.175:7777/api/tron/v1/callback",
      "dappIcon": "https://test/icon.png",
      "dappName": "Test demo",
      "protocol": "TronLink",
      "version": "1.0",
      "chainId": "0x2b6653dc",
      "loginAddress": "TSPrmJetAMo6S6RxMd4tswzeRCFVegBNig",
      "signType": "signStr",
      "message": "abc",
      "action": "sign",
      "actionId": "50554861-4861-41c4-adf3-abf36213f843"
    }

    // callback parameter
    {
      "actionId": "50554861-4861-41c4-adf3-abf36213f843",
      "code": 0,
      "id": 2001871012,
      "message": "success",
      "signedData": "0xffcac5731d9f70a58e5126f44c34b9356ccb9bef53331e33ddab84bb829adc1b77df24362348f8d46e506b489b4af4496600799b173e708faf1b9db99da9d13c1b"
    }
Result Code
id	Message
0	success
10001	Incorrect JSON format
10002	Missing Action
10003	Unknown Action
10004	Missing ActionId
10005	Incorrect DApp URL format
10006	Incorrect CallbackUrl format
10007	Empty DApp name
10008	Version number not supported
10009	Current network not supported
10010	The URL is not supported to open TronLink
10011	Unknown SignType
10012	Incorrect Transaction format
10013	Incorrect Method format
10014	Incorrect Message format
10015	Incorrect toAddress
10016	No wallet created in TronLink
10017	Incorrect fromAddress
10018	Incorrect contactAddress
10019	Incorrect chainId
10020	Incorrect amount
10021	The initiating address does not match the current wallet
10022	incorrect loginAddress
10023	System contract not support
10024	Incorrect tokenId
10025	TokenId & Contract address should not be exist together
300	Transaction canceled
301	Transaction executed in TronLink
302	Broadcast failure - returned with incorrect info
-1	Unknown reason