import { useEffect, useMemo, useState } from 'react';
import {
  WalletKitProvider,
  ConnectButton,
  useAccount,
  useConnectedProvider,
  useDisconnect,
  useOpenConnectModal,
  ChainType,
} from 'wallet-kit';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Checkbox } from './components/ui/checkbox';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';

type SelectableChainType = ChainType;
type ChainIdValue = number | string;
type ChainOption = { id: ChainIdValue; name: string; isMainnet: boolean };

const SELECTABLE_CHAIN_TYPES: SelectableChainType[] = [
  ChainType.EVM,
  ChainType.SOL,
  ChainType.BTC,
  ChainType.APTOS,
  ChainType.SUI,
  ChainType.TRON,
  ChainType.STARKNET,
];

const CHAIN_OPTIONS: Record<SelectableChainType, ChainOption[]> = {
  [ChainType.EVM]: [
    { id: 1, name: 'Ethereum Mainnet', isMainnet: true },
    { id: 11155111, name: 'Sepolia', isMainnet: false },
    { id: 137, name: 'Polygon', isMainnet: true },
    { id: 56, name: 'BSC', isMainnet: true },
    { id: 42161, name: 'Arbitrum One', isMainnet: true },
    { id: 10, name: 'OP Mainnet', isMainnet: true },
    { id: 8453, name: 'Base', isMainnet: true },
  ],
  [ChainType.SOL]: [
    { id: 1, name: 'Solana Mainnet', isMainnet: true },
    { id: 2, name: 'Solana Testnet', isMainnet: false },
    { id: 3, name: 'Solana Devnet', isMainnet: false },
    { id: 4, name: 'Solana Localnet', isMainnet: false },
  ],
  [ChainType.BTC]: [
    { id: 3652501241, name: 'Bitcoin Mainnet', isMainnet: true },
    { id: 118034699, name: 'Bitcoin Testnet', isMainnet: false },
    { id: 3669344250, name: 'Bitcoin Regtest', isMainnet: false },
    { id: 1087308554, name: 'Bitcoin Signet', isMainnet: false },
  ],
  [ChainType.APTOS]: [
    { id: 1, name: 'Aptos Mainnet', isMainnet: true },
    { id: 2, name: 'Aptos Testnet', isMainnet: false },
    { id: 3, name: 'Aptos Devnet', isMainnet: false },
  ],
  [ChainType.SUI]: [
    { id: 'sui:mainnet', name: 'Sui Mainnet', isMainnet: true },
    { id: 'sui:testnet', name: 'Sui Testnet', isMainnet: false },
    { id: 'sui:devnet', name: 'Sui Devnet', isMainnet: false },
  ],
  [ChainType.TRON]: [
    { id: 728126428, name: 'Tron Mainnet', isMainnet: true },
    { id: 2494104990, name: 'Tron Shasta Testnet', isMainnet: false },
    { id: 3448148188, name: 'Tron Nile Testnet', isMainnet: false },
  ],
  [ChainType.STARKNET]: [
    { id: 'SN_MAIN', name: 'Starknet Mainnet', isMainnet: true },
    { id: 'SN_SEPOLIA', name: 'Starknet Sepolia', isMainnet: false },
  ],
};

interface WalletDemoProps {
  selectedChainType: SelectableChainType;
  selectedChainId: ChainIdValue;
  onChangeChainType: (type: SelectableChainType) => void;
  onChangeChainId: (id: ChainIdValue) => void;
}

function WalletDemo({
  selectedChainType,
  selectedChainId,
  onChangeChainType,
  onChangeChainId,
}: WalletDemoProps) {
  const account = useAccount();
  const { connectedProvider } = useConnectedProvider();
  const { disConnect } = useDisconnect();
  const openConnectModal = useOpenConnectModal();
  const [logs, setLogs] = useState<string[]>([]);
  const [switchingChainId, setSwitchingChainId] = useState<ChainIdValue | null>(null);
  const [switchStatus, setSwitchStatus] = useState<string | null>(null);
  const [sendTxPayload, setSendTxPayload] = useState<string>('');
  const [messagePayload, setMessagePayload] = useState<string>('Hello from wallet-kit');
  const [signTxPayload, setSignTxPayload] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('18');
  const [tokenImage, setTokenImage] = useState('');
  const [tokenType, setTokenType] = useState('ERC20');
  const [evmNetworkConfig, setEvmNetworkConfig] = useState(
    JSON.stringify(
      {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        rpcUrls: ['https://rpc.sepolia.org'],
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      null,
      2
    )
  );
  const [listenAccount, setListenAccount] = useState(true);
  const [listenNetwork, setListenNetwork] = useState(true);
  const [listenDisconnect, setListenDisconnect] = useState(true);
  const [selectedInfoChain, setSelectedInfoChain] = useState<ChainType>(ChainType.EVM);
  const [mainnetOnly, setMainnetOnly] = useState(false);
  const selectableChainOptions = useMemo(() => {
    const options = CHAIN_OPTIONS[selectedChainType];
    return mainnetOnly ? options.filter((option) => option.isMainnet) : options;
  }, [selectedChainType, mainnetOnly]);
  const selectedChainIdValue = String(selectedChainId);
  const activeChainType = account?.chainType;
  const activeChainId = account?.chainId;
  const activeChainLabel = activeChainType
    ? `${activeChainType}${activeChainId !== undefined ? ` / ${String(activeChainId)}` : ''}`
    : 'Not connected';
  const targetChainLabel = `${selectedChainType} / ${selectedChainIdValue}`;

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}  ${message}`, ...prev].slice(0, 6));
  };

  const clearLogs = () => setLogs([]);

  const safeJsonParse = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    if (!selectableChainOptions.length) return;
    const exists = selectableChainOptions.some((option) => option.id === selectedChainId);
    if (!exists) {
      onChangeChainId(selectableChainOptions[0].id);
    }
  }, [selectableChainOptions, selectedChainId, onChangeChainId]);

  const resolveInjectedProvider = (chainType?: ChainType) => {
    const win = window as any;
    switch (chainType) {
      case ChainType.EVM:
        if (connectedProvider?.info?.rdns === 'com.okex.wallet') return win.okxwallet?.ethereum;
        if (connectedProvider?.info?.rdns === 'com.bitget.wallet') return win.bitkeep?.ethereum ?? win.bitkeep?.ethreum;
        if (connectedProvider?.info?.rdns === 'app.phantom') return win.phantom?.ethereum ?? win.ethereum;
        return win.ethereum;
      case ChainType.SOL:
        if (connectedProvider?.info?.rdns === 'com.okex.wallet') return win.okxwallet?.solana;
        if (connectedProvider?.info?.rdns === 'com.bitget.wallet') return win.bitkeep?.solana;
        if (connectedProvider?.info?.rdns === 'app.phantom') return win.phantom?.solana ?? win.solana;
        return win.solana;
      case ChainType.BTC:
        if (connectedProvider?.info?.rdns === 'com.okex.wallet') return win.okxwallet?.bitcoin;
        if (connectedProvider?.info?.rdns === 'com.bitget.wallet') return win.bitkeep?.unisat;
        if (connectedProvider?.info?.rdns === 'app.phantom') return win.phantom?.bitcoin;
        return win.unisat;
      case ChainType.APTOS:
        if (connectedProvider?.info?.rdns === 'com.okex.wallet') return win.okxwallet?.aptos;
        if (connectedProvider?.info?.rdns === 'com.bitget.wallet') return win.bitkeep?.aptos;
        if (connectedProvider?.info?.rdns === 'network.pontem') return win.pontem;
        if (connectedProvider?.info?.rdns === 'wallet.razor') return win.razor ?? win.razorWallet ?? win.razorwallet ?? win.razor_sdk;
        return win.aptos ?? win.martian;
      case ChainType.SUI:
        if (connectedProvider?.info?.rdns === 'com.okex.wallet') return win.okxwallet?.suiWallet;
        if (connectedProvider?.info?.rdns === 'com.bitget.wallet') return win.bitkeep?.suiWallet;
        if (connectedProvider?.info?.rdns === 'app.suiet') return win.suiet;
        if (connectedProvider?.info?.rdns === 'app.slush') return win.suiWallet;
        return win.martian ?? win.suiet ?? win.suiWallet;
      case ChainType.TRON:
        if (connectedProvider?.info?.rdns === 'com.okex.wallet') return win.okxwallet?.tronLink;
        if (connectedProvider?.info?.rdns === 'com.bitget.wallet') return win.bitkeep?.tronLink;
        return win.tronLink;
      case ChainType.STARKNET:
        if (connectedProvider?.info?.rdns === 'com.okex.wallet') return win.okxwallet?.starknet ?? win.starknet_okxwallet;
        if (connectedProvider?.info?.rdns === 'com.bitget.wallet') return win.starknet_bitkeep ?? win.bitkeep?.starknet;
        if (connectedProvider?.info?.rdns === 'wallet.braavos') return win.starknet_braavos ?? win.starknet;
        return win.starknet;
      default:
        return undefined;
    }
  };

  const getProviderCapabilities = (chainType: ChainType) => {
    const provider = resolveInjectedProvider(chainType);
    if (!provider) {
      return { providerName: 'Not detected', methods: [] as string[] };
    }
    const methods = new Set<string>();
    const add = (name?: string) => {
      if (name && typeof (provider as any)[name] === 'function') methods.add(name);
    };
    const addFromRecord = (record?: Record<string, any>) => {
      if (!record) return;
      for (const [key, value] of Object.entries(record)) {
        if (value && typeof value === 'object') {
          if (typeof (value as any).signMessage === 'function') methods.add(`${key}.signMessage`);
          if (typeof (value as any).signPersonalMessage === 'function') methods.add(`${key}.signPersonalMessage`);
          if (typeof (value as any).signTransactionBlock === 'function') methods.add(`${key}.signTransactionBlock`);
          if (typeof (value as any).signTransaction === 'function') methods.add(`${key}.signTransaction`);
          if (typeof (value as any).signAndExecuteTransactionBlock === 'function') methods.add(`${key}.signAndExecuteTransactionBlock`);
          if (typeof (value as any).signAndExecuteTransaction === 'function') methods.add(`${key}.signAndExecuteTransaction`);
          if (typeof (value as any).connect === 'function') methods.add(`${key}.connect`);
          if (typeof (value as any).disconnect === 'function') methods.add(`${key}.disconnect`);
          if (typeof (value as any).on === 'function') methods.add(`${key}.on`);
        }
      }
    };

    add('request');
    add('connect');
    add('disconnect');
    add('signMessage');
    add('signPersonalMessage');
    add('signTransaction');
    add('signTransactionBlock');
    add('signAndSendTransaction');
    add('signAndSendAllTransactions');
    add('signAndExecuteTransactionBlock');
    add('signAndExecuteTransaction');
    add('signPsbt');
    add('signPSBT');
    add('signPsbts');
    add('requestAccounts');
    add('getAccounts');
    add('sendBitcoin');
    add('sendInscription');
    add('transferNft');
    add('pushTx');
    add('pushPsbt');
    add('sendPsbt');
    add('signMessageV2');
    add('enable');
    add('execute');
    add('on');
    add('removeListener');
    add('off');

    addFromRecord(provider.features);

    const providerName = provider.name || provider.id || provider.wallet?.name || provider.wallet?.id || provider.isPhantom && 'Phantom' || provider.isMetaMask && 'MetaMask' || provider.isBitKeep && 'Bitget' || provider.isBitget && 'Bitget';
    return {
      providerName: providerName || 'Injected Provider',
      methods: Array.from(methods).sort(),
    };
  };

  useEffect(() => {
    if (!connectedProvider || !account) return;

    let offAccount: (() => void) | undefined;
    let offNetwork: (() => void) | undefined;
    let offDisconnect: (() => void) | undefined;

    try {
      if (listenAccount) {
        offAccount = connectedProvider.onAccountChanged?.((accounts) => {
        const first = accounts?.[0];
        if (!first) {
          addLog('Account cleared');
          return;
        }
        const address = typeof first === 'string' ? first : first.address;
        addLog(`Account changed: ${address}`);
        }, { chainType: account.chainType });
      }
    } catch {
      addLog('Account change listener not supported');
    }

    try {
      if (listenNetwork) {
        offNetwork = connectedProvider.onNetworkChanged?.((info) => {
        if (info.chainId !== undefined) {
          addLog(`Network changed: chainId=${info.chainId}`);
          return;
        }
        if (info.network) {
          addLog(`Network changed: ${info.network}`);
          return;
        }
        addLog('Network changed');
        }, { chainType: account.chainType });
      }
    } catch {
      addLog('Network change listener not supported');
    }

    try {
      if (listenDisconnect) {
        offDisconnect = connectedProvider.onDisconnect?.(() => {
        addLog('Wallet disconnected');
        }, { chainType: account.chainType });
      }
    } catch {
      addLog('Disconnect listener not supported');
    }

    return () => {
      if (offAccount) offAccount();
      if (offNetwork) offNetwork();
      if (offDisconnect) offDisconnect();
    };
  }, [connectedProvider, account?.chainType, listenAccount, listenNetwork, listenDisconnect]);

  const accountAddress = useMemo(() => {
    if (!account) return '';
    if (typeof account.address === 'string') return account.address;
    return account.address.address;
  }, [account]);

  useEffect(() => {
    if (!activeChainType) {
      setSendTxPayload('');
      return;
    }
    const from = accountAddress;
    if (activeChainType === ChainType.EVM) {
      setSendTxPayload(
        JSON.stringify(
          {
            from: from || '0xYourAddress',
            to: from || '0xYourAddress',
            value: '0x0',
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.SOL) {
      setSendTxPayload(
        JSON.stringify(
          {
            transaction: '<SignedTransactionOrTransaction>',
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.BTC) {
      setSendTxPayload(
        JSON.stringify(
          {
            method: 'sendBitcoin',
            params: ['<toAddress>', 1000, { feeRate: 1 }],
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.TRON) {
      setSendTxPayload(
        JSON.stringify(
          {
            to: '<toAddress>',
            amount: 1,
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.SUI) {
      setSendTxPayload(
        JSON.stringify(
          {
            transactionBlock: '<TransactionBlock>',
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.APTOS) {
      setSendTxPayload(
        JSON.stringify(
          {
            payload: {
              function: '0x1::coin::transfer',
              type_arguments: ['0x1::aptos_coin::AptosCoin'],
              arguments: ['<toAddress>', '1'],
            },
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.STARKNET) {
      setSendTxPayload(
        JSON.stringify(
          {
            calls: {
              contractAddress: '<contract>',
              entrypoint: 'transfer',
              calldata: [],
            },
          },
          null,
          2
        )
      );
      return;
    }
    setSendTxPayload('');
  }, [activeChainType, accountAddress]);

  useEffect(() => {
    if (!activeChainType) {
      setSignTxPayload('');
      return;
    }
    const from = accountAddress;
    if (activeChainType === ChainType.EVM) {
      setSignTxPayload(
        JSON.stringify(
          {
            from: from || '0xYourAddress',
            to: from || '0xYourAddress',
            value: '0x0',
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.SOL) {
      setSignTxPayload(
        JSON.stringify(
          {
            transaction: '<Transaction>',
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.BTC) {
      setSignTxPayload(
        JSON.stringify(
          {
            method: 'signPsbt',
            params: ['<psbtHex>'],
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.TRON) {
      setSignTxPayload(
        JSON.stringify(
          {
            transaction: '<transaction>',
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.SUI) {
      setSignTxPayload(
        JSON.stringify(
          {
            transactionBlock: '<TransactionBlock>',
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.APTOS) {
      setSignTxPayload(
        JSON.stringify(
          {
            payload: {
              function: '0x1::coin::transfer',
              type_arguments: ['0x1::aptos_coin::AptosCoin'],
              arguments: ['<toAddress>', '1'],
            },
          },
          null,
          2
        )
      );
      return;
    }
    if (activeChainType === ChainType.STARKNET) {
      setSignTxPayload(
        JSON.stringify(
          {
            method: 'signTransaction',
            params: ['<transaction>'],
          },
          null,
          2
        )
      );
      return;
    }
    setSignTxPayload('');
  }, [activeChainType, accountAddress]);

  const handleSwitchNetwork = async () => {
    if (!account || !connectedProvider) {
      addLog('Connect a wallet before switching networks');
      return;
    }
    if (account.chainType !== selectedChainType) {
      addLog(`Selected chain is ${selectedChainType}, but wallet is on ${account.chainType}`);
      return;
    }
    if (!connectedProvider.switchNetwork) {
      addLog('switchNetwork not supported by this adapter');
      return;
    }
    if (typeof selectedChainId !== 'number') {
      addLog('switchNetwork requires a numeric chainId');
      return;
    }
    setSwitchingChainId(selectedChainId);
    setSwitchStatus('Switching...');
    try {
      const ok = await connectedProvider.switchNetwork({ chainId: selectedChainId, chainType: account.chainType });
      addLog(ok ? `Switched to chain ${selectedChainId}` : `Failed to switch to chain ${selectedChainId}`);
      setSwitchStatus(ok ? `Switched to ${selectedChainId}` : `Failed to switch to ${selectedChainId}`);
    } catch (error: any) {
      addLog(`Switch network failed: ${error?.message ?? String(error)}`);
      setSwitchStatus('Switch failed');
    } finally {
      setSwitchingChainId(null);
    }
  };

  const handleAddNetwork = async () => {
    if (!account || !connectedProvider) {
      addLog('Connect a wallet before adding a network');
      return;
    }
    if (account.chainType !== ChainType.EVM) {
      addLog('addNetwork is only supported on EVM adapters');
      return;
    }
    if (selectedChainType !== ChainType.EVM) {
      addLog('Select an EVM chain in Chain Selection to add a network');
      return;
    }
    if (!connectedProvider.addNetwork) {
      addLog('addNetwork not supported by this adapter');
      return;
    }
    if (typeof selectedChainId !== 'number') {
      addLog('addNetwork requires a numeric chainId');
      return;
    }
    const parsed = safeJsonParse(evmNetworkConfig);
    if (!parsed) {
      addLog('Invalid JSON for network config');
      return;
    }
    try {
      const ok = await connectedProvider.addNetwork({
        chainId: selectedChainId,
        chainType: ChainType.EVM,
        chainConfig: parsed,
      });
      addLog(ok ? 'Network added' : 'Failed to add network');
    } catch (error: any) {
      addLog(`Add network failed: ${error?.message ?? String(error)}`);
    }
  };

  const handleAddToken = async () => {
    if (!activeChainType) {
      addLog('Connect a wallet before adding tokens');
      return;
    }
    const provider = resolveInjectedProvider(activeChainType);
    if (!provider?.request) {
      addLog('wallet_watchAsset not supported by this provider');
      return;
    }
    const decimals = Number(tokenDecimals);
    if (!tokenAddress || !tokenSymbol || !Number.isFinite(decimals)) {
      addLog('Token address, symbol, and decimals are required');
      return;
    }
    const params = {
      type: tokenType || 'ERC20',
      options: {
        address: tokenAddress,
        symbol: tokenSymbol,
        decimals,
        ...(tokenImage ? { image: tokenImage } : {}),
      },
    };
    try {
      const result = await provider.request({ method: 'wallet_watchAsset', params });
      addLog(result ? 'Token added' : 'Token add rejected');
    } catch (error: any) {
      addLog(`Add token failed: ${error?.message ?? String(error)}`);
    }
  };

  const handleSendTransaction = async () => {
    if (!account || !connectedProvider) {
      addLog('Connect a wallet before sending transactions');
      return;
    }
    if (!connectedProvider.sendTransaction) {
      addLog('sendTransaction not supported by this adapter');
      return;
    }
    try {
      const parsed = sendTxPayload ? JSON.parse(sendTxPayload) : {};
      if (account.chainType === ChainType.EVM && account) {
        const from = typeof account.address === 'string' ? account.address : account.address.address;
        if (!parsed.from) parsed.from = from;
      }
      const txHash = await connectedProvider.sendTransaction({
        chainType: account.chainType,
        chainId: activeChainId,
        transaction: parsed,
      });
      addLog(`Transaction sent: ${String(txHash)}`);
    } catch (error: any) {
      addLog(`Transaction failed: ${error?.message ?? String(error)}`);
    }
  };

  const handleSignMessage = async () => {
    if (!activeChainType) {
      addLog('Connect a wallet before signing messages');
      return;
    }
    const provider = resolveInjectedProvider(activeChainType);
    if (!provider) {
      addLog('No injected provider detected for signMessage');
      return;
    }
    const message = messagePayload;
    try {
      if (activeChainType === ChainType.EVM) {
        const from = accountAddress || messagePayload;
        const result = await provider.request({
          method: 'personal_sign',
          params: [message, from],
        });
        addLog(`Signed message: ${String(result)}`);
        return;
      }
      if (activeChainType === ChainType.SOL) {
        if (!provider.signMessage) {
          addLog('Solana signMessage not supported');
          return;
        }
        const bytes = new TextEncoder().encode(message);
        const result = await provider.signMessage(bytes);
        addLog(`Signed message: ${String(result?.signature ?? result)}`);
        return;
      }
      if (activeChainType === ChainType.BTC) {
        const bytes = new TextEncoder().encode(message);
        if (provider.isPhantom && provider.signMessage) {
          const address = typeof account?.address === 'string' ? account.address : account?.address?.address;
          const result = await provider.signMessage(address, bytes);
          addLog(`Signed message: ${String(result?.signature ?? result)}`);
          return;
        }
        if (provider.signMessage) {
          const result = await provider.signMessage(message, 'ecdsa');
          addLog(`Signed message: ${String(result)}`);
          return;
        }
        addLog('Bitcoin signMessage not supported');
        return;
      }
      if (activeChainType === ChainType.APTOS) {
        if (!provider.signMessage) {
          addLog('Aptos signMessage not supported');
          return;
        }
        const parsed = safeJsonParse(message);
        const payload = parsed ?? { message };
        const result = await provider.signMessage(payload);
        addLog(`Signed message: ${String(result?.signature ?? result)}`);
        return;
      }
      if (activeChainType === ChainType.SUI) {
        const bytes = new TextEncoder().encode(message);
        const features = provider.features ?? {};
        if (features['sui:signPersonalMessage']?.signPersonalMessage) {
          const result = await features['sui:signPersonalMessage'].signPersonalMessage({ message: bytes });
          addLog(`Signed message: ${String(result?.signature ?? result)}`);
          return;
        }
        if (features['sui:signMessage']?.signMessage) {
          const result = await features['sui:signMessage'].signMessage({ message: bytes });
          addLog(`Signed message: ${String(result?.signature ?? result)}`);
          return;
        }
        if (provider.signMessage) {
          const result = await provider.signMessage({ message: bytes });
          addLog(`Signed message: ${String(result?.signature ?? result)}`);
          return;
        }
        addLog('Sui signMessage not supported');
        return;
      }
      if (activeChainType === ChainType.TRON) {
        if (provider.signMessageV2) {
          const result = await provider.signMessageV2(message);
          addLog(`Signed message: ${String(result)}`);
          return;
        }
        if (provider.tronWeb?.trx?.signMessageV2) {
          const result = await provider.tronWeb.trx.signMessageV2(message);
          addLog(`Signed message: ${String(result)}`);
          return;
        }
        addLog('Tron signMessage not supported');
        return;
      }
      if (activeChainType === ChainType.STARKNET) {
        const parsed = safeJsonParse(message);
        const payload = parsed ?? message;
        if (provider.signMessage) {
          const result = await provider.signMessage(payload);
          addLog(`Signed message: ${String(result)}`);
          return;
        }
        if (provider.account?.signMessage) {
          const result = await provider.account.signMessage(payload);
          addLog(`Signed message: ${String(result)}`);
          return;
        }
        addLog('Starknet signMessage not supported');
      }
    } catch (error: any) {
      addLog(`Sign message failed: ${error?.message ?? String(error)}`);
    }
  };

  const handleSignTransaction = async () => {
    if (!activeChainType) {
      addLog('Connect a wallet before signing transactions');
      return;
    }
    const provider = resolveInjectedProvider(activeChainType);
    if (!provider) {
      addLog('No injected provider detected for signTransaction');
      return;
    }
    const parsed = safeJsonParse(signTxPayload);
    if (!parsed) {
      addLog('Invalid JSON for signTransaction');
      return;
    }
    try {
      if (activeChainType === ChainType.EVM) {
        if (!provider.request) {
          addLog('EVM provider request not supported');
          return;
        }
        const tx = { ...parsed };
        if (!tx.from && accountAddress) tx.from = accountAddress;
        const result = await provider.request({
          method: 'eth_signTransaction',
          params: [tx],
        });
        addLog(`Signed transaction: ${String(result)}`);
        return;
      }
      if (activeChainType === ChainType.SOL) {
        if (provider.signTransaction) {
          const result = await provider.signTransaction(parsed.transaction ?? parsed);
          addLog(`Signed transaction: ${String(result?.signature ?? result)}`);
          return;
        }
        if (provider.request) {
          const result = await provider.request({ method: 'signTransaction', params: [parsed] });
          addLog(`Signed transaction: ${String(result)}`);
          return;
        }
        addLog('Solana signTransaction not supported');
        return;
      }
      if (activeChainType === ChainType.APTOS) {
        if (!provider.signTransaction) {
          addLog('Aptos signTransaction not supported');
          return;
        }
        const result = await provider.signTransaction(parsed);
        addLog(`Signed transaction: ${String(result)}`);
        return;
      }
      if (activeChainType === ChainType.SUI) {
        const features = provider.features ?? {};
        if (features['sui:signTransactionBlock']?.signTransactionBlock) {
          const result = await features['sui:signTransactionBlock'].signTransactionBlock(parsed);
          addLog(`Signed transaction: ${String(result?.signature ?? result)}`);
          return;
        }
        if (features['sui:signTransaction']?.signTransaction) {
          const result = await features['sui:signTransaction'].signTransaction(parsed);
          addLog(`Signed transaction: ${String(result?.signature ?? result)}`);
          return;
        }
        if (provider.signTransaction) {
          const result = await provider.signTransaction(parsed);
          addLog(`Signed transaction: ${String(result?.signature ?? result)}`);
          return;
        }
        addLog('Sui signTransaction not supported');
        return;
      }
      if (activeChainType === ChainType.BTC) {
        if (parsed.method && typeof provider[parsed.method] === 'function') {
          const result = await provider[parsed.method](...(parsed.params ?? []));
          addLog(`Signed transaction: ${String(result)}`);
          return;
        }
        const psbt = parsed.psbt ?? parsed.psbtHex ?? parsed.psbtBytes ?? parsed.psbtBase64;
        if (psbt && (provider.signPsbt || provider.signPSBT)) {
          const sign = provider.signPsbt ?? provider.signPSBT;
          const result = await sign(psbt, parsed.options);
          addLog(`Signed PSBT: ${String(result)}`);
          return;
        }
        addLog('Bitcoin signTransaction not supported');
        return;
      }
      if (activeChainType === ChainType.TRON) {
        if (provider.tronWeb?.trx?.sign) {
          const result = await provider.tronWeb.trx.sign(parsed.transaction ?? parsed);
          addLog(`Signed transaction: ${String(result)}`);
          return;
        }
        if (provider.sign) {
          const result = await provider.sign(parsed);
          addLog(`Signed transaction: ${String(result)}`);
          return;
        }
        addLog('Tron signTransaction not supported');
        return;
      }
      if (activeChainType === ChainType.STARKNET) {
        if (parsed.method && typeof provider[parsed.method] === 'function') {
          const result = await provider[parsed.method](...(parsed.params ?? []));
          addLog(`Signed transaction: ${String(result)}`);
          return;
        }
        if (provider.account?.signTransaction) {
          const result = await provider.account.signTransaction(parsed);
          addLog(`Signed transaction: ${String(result)}`);
          return;
        }
        addLog('Starknet signTransaction not supported');
      }
    } catch (error: any) {
      addLog(`Sign transaction failed: ${error?.message ?? String(error)}`);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 pb-20 pt-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">wallet-kit demo</CardTitle>
            <CardDescription>Connect a wallet and try adapter interactions.</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chain Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Chain Type</Label>
              <Select
                value={selectedChainType}
                onValueChange={(value) => onChangeChainType(value as SelectableChainType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chain type" />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_CHAIN_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Chain</Label>
              <Select
                value={selectedChainIdValue}
                onValueChange={(value) => {
                  const next = selectableChainOptions.find((chain) => String(chain.id) === value);
                  if (next) onChangeChainId(next.id);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {selectableChainOptions.map((chain) => (
                    <SelectItem key={`${chain.name}-${chain.id}`} value={String(chain.id)}>
                      {chain.name} ({String(chain.id)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={mainnetOnly} onCheckedChange={(value) => setMainnetOnly(Boolean(value))} />
            <Label className="text-xs">Only mainnet</Label>
          </div>
          <ConnectButton />
          <CardDescription className="text-xs">
            This selection controls the chain used by the connect modal.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {account ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Address</span>
                <span className="text-xs font-medium text-slate-900 md:text-sm">
                  <span className="font-mono">{accountAddress}</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Chain</span>
                <span className="text-sm font-medium text-slate-900">
                  {account.chainType}
                  {account.chainId ? ` / ${account.chainId}` : ''}
                </span>
              </div>
              {switchingChainId !== null && (
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  Switching to chain {switchingChainId}...
                </div>
              )}
              {switchStatus && switchingChainId === null && (
                <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
                  {switchStatus}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Wallet</span>
                <span className="text-sm font-medium text-slate-900">{account.walletRdns}</span>
              </div>
              {connectedProvider?.switchNetwork ? (
                <Button
                  variant="info"
                  onClick={handleSwitchNetwork}
                  disabled={
                    !account ||
                    account.chainType !== selectedChainType ||
                    typeof selectedChainId !== 'number'
                  }
                >
                  Switch Network to {targetChainLabel}
                </Button>
              ) : (
                <div className="text-xs text-slate-400">Switch network not supported by this wallet.</div>
              )}
            </>
          ) : (
            <CardDescription>No wallet connected yet.</CardDescription>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adapter Actions</CardTitle>
          <CardDescription>Actions are routed to the active wallet/chain when supported.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <div className="text-slate-500">Current wallet</div>
              <div className="text-sm font-medium text-slate-900">{activeChainLabel}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <div className="text-slate-500">Target chain (selection)</div>
              <div className="text-sm font-medium text-slate-900">{targetChainLabel}</div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="secondary" onClick={() => openConnectModal()}>
              Switch Wallet
            </Button>
            <Button variant="info" onClick={handleSwitchNetwork}>
              Switch Network
            </Button>
            <Button variant="secondary" onClick={() => disConnect()}>
              Disconnect
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-700">Add Token (wallet_watchAsset)</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Token Address</Label>
                <Input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="0x..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Symbol</Label>
                <Input value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} placeholder="TOKEN" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Decimals</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={tokenDecimals}
                  onChange={(e) => setTokenDecimals(e.target.value)}
                  placeholder="18"
                />
              </div>
              <div className="flex flex-col gap-2 lg:col-span-2">
                <Label className="text-xs">Image URL</Label>
                <Input value={tokenImage} onChange={(e) => setTokenImage(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Token Type</Label>
                <Input value={tokenType} onChange={(e) => setTokenType(e.target.value)} placeholder="ERC20" />
              </div>
            </div>
            <div className="mt-3">
              <Button variant="info" onClick={handleAddToken}>
                Add Token
              </Button>
            </div>
            <CardDescription className="text-xs">
              Uses wallet_watchAsset when available. Token type is passed through to the provider.
            </CardDescription>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Label className="text-xs">EVM Network Config (JSON)</Label>
            <Textarea
              className="mt-2 min-h-[160px] font-mono text-xs"
              value={evmNetworkConfig}
              onChange={(e) => setEvmNetworkConfig(e.target.value)}
            />
            <div className="mt-3">
              <Button variant="info" onClick={handleAddNetwork}>
                Add Network
              </Button>
            </div>
            <CardDescription className="text-xs">Only EVM adapters support addNetwork.</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Transaction</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-xs text-slate-500">Uses active wallet chain: {activeChainLabel}</div>
          <Label className="text-xs">Transaction Payload (JSON)</Label>
          <Textarea
            className="min-h-[180px] font-mono text-xs"
            value={sendTxPayload}
            onChange={(e) => setSendTxPayload(e.target.value)}
          />
          <Button variant="success" onClick={handleSendTransaction}>
            Send Transaction
          </Button>
          <CardDescription className="text-xs">
            Use chain-specific JSON. Payload is passed to adapter sendTransaction.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign Message</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-xs text-slate-500">Uses active wallet chain: {activeChainLabel}</div>
          <Label className="text-xs">Message / JSON</Label>
          <Textarea
            className="min-h-[140px] font-mono text-xs"
            value={messagePayload}
            onChange={(e) => setMessagePayload(e.target.value)}
          />
          <Button variant="info" onClick={handleSignMessage}>
            Sign Message
          </Button>
          <CardDescription className="text-xs">
            Aptos/Starknet allow JSON payloads; others use raw text.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign Transaction</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-xs text-slate-500">Uses active wallet chain: {activeChainLabel}</div>
          <Label className="text-xs">Transaction Payload (JSON)</Label>
          <Textarea
            className="min-h-[180px] font-mono text-xs"
            value={signTxPayload}
            onChange={(e) => setSignTxPayload(e.target.value)}
          />
          <Button variant="info" onClick={handleSignTransaction}>
            Sign Transaction
          </Button>
          <CardDescription className="text-xs">
            Payload is passed to the wallet's signTransaction/signPsbt/signTransactionBlock methods.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider Info / Capability</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label className="text-xs">Chain Type</Label>
          <Select value={selectedInfoChain} onValueChange={(value) => setSelectedInfoChain(value as ChainType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chain type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ChainType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(() => {
            const { providerName, methods } = getProviderCapabilities(selectedInfoChain);
            return (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Provider</div>
                <div className="text-sm font-medium text-slate-900">{providerName}</div>
                <div className="mt-3 text-xs text-slate-500">Methods</div>
                {methods.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {methods.map((method) => (
                      <Badge key={method}>{method}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-400">No methods detected.</div>
                )}
              </div>
            );
          })()}
          <CardDescription className="text-xs">
            Detected from injected provider and wallet-standard features when available.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={listenAccount} onCheckedChange={(value) => setListenAccount(Boolean(value))} />
              <Label className="text-xs">Account</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={listenNetwork} onCheckedChange={(value) => setListenNetwork(Boolean(value))} />
              <Label className="text-xs">Network</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={listenDisconnect} onCheckedChange={(value) => setListenDisconnect(Boolean(value))} />
              <Label className="text-xs">Disconnect</Label>
            </div>
            <Button variant="secondary" size="sm" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
          <div className="min-h-[80px] space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
            {logs.length ? logs.map((item) => <div key={item}>{item}</div>) : <div>Waiting for actions…</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [defaultChainType, setDefaultChainType] = useState<SelectableChainType>(ChainType.EVM);
  const [defaultChainId, setDefaultChainId] = useState<ChainIdValue>(CHAIN_OPTIONS[ChainType.EVM][0].id);

  const handleChainTypeChange = (type: SelectableChainType) => {
    setDefaultChainType(type);
    const options = CHAIN_OPTIONS[type];
    const nextId = options.find((option) => option.id === defaultChainId)?.id ?? options[0].id;
    setDefaultChainId(nextId);
  };

  return (
    <WalletKitProvider defaultChainId={defaultChainId} defaultChainType={defaultChainType} language="en">
      <WalletDemo
        selectedChainType={defaultChainType}
        selectedChainId={defaultChainId}
        onChangeChainType={handleChainTypeChange}
        onChangeChainId={setDefaultChainId}
      />
    </WalletKitProvider>
  );
}
