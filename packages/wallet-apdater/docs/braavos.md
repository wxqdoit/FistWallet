Braavos
Braavos Smart Wallet for StarkNet makes self-custodial asset management easier than ever! With Braavos, you can securely access decentralized applications on StarkNet and manage your assets from within your browser.

Establishing a Connection
To enable the Injected connector, you need to first import the InjectedConnector from StarknetKit:
https://www.starknetkit.com/docs/v2.3.2/connectors/injected
import { connect, disconnect } from "starknetkit"
import { InjectedConnector } from "starknetkit/injected"
After importing, you need to call the connect method, passing in your Argent X/Braavos connector:

const { wallet } = await connect({
connectors: [
new InjectedConnector({
options: { id: "argentX" },
}),
new InjectedConnector({
options: { id: "braavos" },
}),
],
})
If you face import errors with typescript, head to your tsconfig.json, and update your moduleResolution and module to use Bundler and ES2015 respectively.

Connection Parameters
The Injected Connector takes a single param options used to specify the id of the connector to be used. Name and icon can be passed as additional (optional) parameters.

// with id only
new InjectedConnector({
options: { id: "argentX" },
})
new InjectedConnector({
options: { id: "braavos" },
})

// with id, name and icon
new InjectedConnector({
options: {
id: "argentX",
name: "Argent X",
icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0a....",
},
})

new InjectedConnector({
options: {
id: "braavos",
name: "Braavos",
icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0a....",
},