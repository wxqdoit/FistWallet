import useStore from '../state/store';
import { useSwitchChain } from './useSwitchChain';

export function useChain() {
  const { chain } = useStore();
  const { switchChain, isPending, error } = useSwitchChain();

  const isTestnet =
    chain?.id === 11155111 || // Sepolia
    chain?.id === 5 || // Goerli
    chain?.id === 97 || // BSC Testnet
    chain?.id === 80001 || chain?.id === 80002 || // Polygon Mumbai/Amoy
    chain?.id === 421614 || // Arb Sepolia
    chain?.id === 118034699; // BTC Testnet

  return {
    chainId: chain?.id,
    chainType: chain?.type,
    chainName: chain?.name,
    isTestnet,
    switchChain,
    isSwitching: isPending,
    switchError: error,
  };
}
