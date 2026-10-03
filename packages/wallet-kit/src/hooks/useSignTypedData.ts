import { useState, useCallback } from 'react';
import useProvidersStore from '../state/providers';
import { useAccount } from './useAccount';

export interface SignTypedDataParams {
  typedData: any;
}

export function useSignTypedData() {
  const { connectedProvider } = useProvidersStore();
  const account = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signTypedData = useCallback(
    async ({ typedData }: SignTypedDataParams): Promise<string> => {
      if (!connectedProvider) {
        const err = new Error('Wallet not connected');
        setError(err);
        throw err;
      }
      setIsPending(true);
      setError(null);
      try {
        const from = typeof account?.address === 'string' ? account.address : account?.address?.address;
        const provider = (window as any).ethereum || (window as any).okxwallet?.ethereum || (window as any).fistwallet?.ethereum;
        if (!provider || !provider.request) {
          throw new Error('EVM provider not found for eth_signTypedData_v4');
        }

        let signature: string;
        try {
          signature = await provider.request({
            method: 'eth_signTypedData_v4',
            params: [from, JSON.stringify(typedData)],
          });
        } catch {
          signature = await provider.request({
            method: 'eth_signTypedData_v4',
            params: [from, typedData],
          });
        }
        return signature;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [connectedProvider, account]
  );

  return { signTypedData, isPending, error };
}
