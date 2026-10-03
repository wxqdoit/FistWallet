import './styles.css';

export * from './components/WalletKitProvider';
export * from './components/ConnectButton';
export * from './types/configType';
export * from 'wallet-apdater';
export { useOpenConnectModal, useCloseConnectModal } from './components/Modal/ConnectModal';
export { useAccount } from './hooks/useAccount';
export { useDisconnect } from './hooks/useDisconnect';
export { useConnectedProvider } from './hooks/useConnectedProvider';
export { useSwitchChain } from './hooks/useSwitchChain';
export { useSignTypedData } from './hooks/useSignTypedData';
export { useSignMessage } from './hooks/useSignMessage';
export { useChain } from './hooks/useChain';
export { useAutoReconnect } from './hooks/useAutoReconnect';
