import { useState, useCallback } from 'react';
import useProvidersStore from '../state/providers';
import { useAccount } from './useAccount';
import { ChainType } from 'wallet-apdater';

export interface SwitchChainOptions {
  chainId: number | string;
  chainType?: ChainType;
}

export function useSwitchChain() {
  const { connectedProvider } = useProvidersStore();
  const account = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const switchChain = useCallback(
    async ({ chainId, chainType }: SwitchChainOptions): Promise<boolean> => {
      if (!connectedProvider || !connectedProvider.switchNetwork) {
        const err = new Error('Wallet not connected or switchNetwork not supported');
        setError(err);
        throw err;
      }
      setIsPending(true);
      setError(null);
      try {
        const effectiveChainType = chainType || account?.chainType || ChainType.EVM;
        const numericChainId = typeof chainId === 'number' ? chainId : parseInt(chainId, 10);
        const res = await connectedProvider.switchNetwork({
          chainId: numericChainId,
          chainType: effectiveChainType,
        });
        return res;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [connectedProvider, account]
  );

  return { switchChain, isPending, error };
}
