import { useMemo, useState } from 'react';
import {
  WalletKitProvider,
  ConnectButton,
  useAccount,
  useConnectedProvider,
  useDisconnect,
  ChainType,
} from 'wallet-kit';

function WalletDemo() {
  const account = useAccount();
  const { connectedProvider } = useConnectedProvider();
  const { disConnect } = useDisconnect();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}  ${message}`, ...prev].slice(0, 6));
  };

  const accountAddress = useMemo(() => {
    if (!account) return '';
    if (typeof account.address === 'string') return account.address;
    return account.address.address;
  }, [account]);

  const handleSwitch = async (chainId: number) => {
    if (!connectedProvider?.switchNetwork) {
      addLog('switchNetwork not supported by this adapter');
      return;
    }
    const ok = await connectedProvider.switchNetwork({ chainId, chainType: ChainType.EVM });
    addLog(ok ? `Switched to chain ${chainId}` : `Failed to switch to chain ${chainId}`);
  };

  const handleAddSepolia = async () => {
    if (!connectedProvider?.addNetwork) {
      addLog('addNetwork not supported by this adapter');
      return;
    }
    const sepoliaConfig = {
      chainId: '0xaa36a7' as const,
      chainName: 'Sepolia Testnet',
      rpcUrls: ['https://rpc.sepolia.org'],
      nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    };
    const ok = await connectedProvider.addNetwork({
      chainId: 11155111,
      chainType: ChainType.EVM,
      chainConfig: sepoliaConfig,
    });
    addLog(ok ? 'Sepolia added' : 'Failed to add Sepolia');
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 pb-20 pt-10">
      <header className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div>
          <div className="text-2xl font-semibold">wallet-kit demo</div>
          <div className="mt-1 text-sm text-slate-500">Connect a wallet and try adapter interactions.</div>
        </div>
        <ConnectButton />
      </header>

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="text-base font-semibold">Connection</div>
        {account ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Address</span>
              <span className="text-xs font-medium text-slate-900 md:text-sm">
                <span className="font-mono">{accountAddress}</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Chain</span>
              <span className="text-sm font-medium text-slate-900">{account.chainType}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Wallet</span>
              <span className="text-sm font-medium text-slate-900">{account.walletRdns}</span>
            </div>
            <button className="rounded-xl bg-slate-200 px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-300" onClick={() => disConnect()}>
              Disconnect
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500">No wallet connected yet.</div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="text-base font-semibold">Adapter Actions (EVM)</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30" onClick={() => handleSwitch(1)}>
            Switch to Mainnet
          </button>
          <button className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30" onClick={() => handleSwitch(11155111)}>
            Switch to Sepolia
          </button>
          <button className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30" onClick={handleAddSepolia}>
            Add Sepolia Network
          </button>
        </div>
        <div className="text-xs text-slate-500">
          These actions call adapter methods on the connected provider when supported.
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="text-base font-semibold">Event Log</div>
        <div className="min-h-[80px] space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
          {logs.length ? logs.map((item) => <div key={item}>{item}</div>) : <div>Waiting for actions…</div>}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <WalletKitProvider defaultChainId={1} defaultChainType={ChainType.EVM} language="en">
      <WalletDemo />
    </WalletKitProvider>
  );
}
