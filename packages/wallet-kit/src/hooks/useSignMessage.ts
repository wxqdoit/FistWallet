import { useState, useCallback } from 'react';
import useProvidersStore from '../state/providers';
import { useAccount } from './useAccount';
import { ChainType } from 'wallet-apdater';

export interface SignMessageParams {
  message: string;
}

export function useSignMessage() {
  const { connectedProvider } = useProvidersStore();
  const account = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signMessage = useCallback(
    async ({ message }: SignMessageParams): Promise<string> => {
      if (!connectedProvider || !account) {
        const err = new Error('Wallet not connected');
        setError(err);
        throw err;
      }
      setIsPending(true);
      setError(null);

      try {
        const from = typeof account.address === 'string' ? account.address : account.address?.address;

        if (account.chainType === ChainType.EVM) {
          const provider = (window as any).ethereum || (window as any).okxwallet?.ethereum || (window as any).fistwallet?.ethereum;
          if (!provider?.request) throw new Error('EVM provider not available for signing');

          const signature = await provider.request({
            method: 'personal_sign',
            params: [message, from],
          });
          return signature;
        } else if (account.chainType === ChainType.SOL) {
          const solProvider = (window as any).solana || (window as any).okxwallet?.solana || (window as any).fistwallet?.solana;
          if (!solProvider?.signMessage) throw new Error('Solana provider not available for signing');

          const encoded = new TextEncoder().encode(message);
          const res = await solProvider.signMessage(encoded, 'utf8');
          const bytes = res.signature ? new Uint8Array(res.signature) : new Uint8Array(res);
          return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
        } else {
          // Fallback to adapter generic signing
          const provider = connectedProvider as any;
          if (provider?.signMessage) {
            const res = await provider.signMessage(message);
            return typeof res === 'string' ? res : JSON.stringify(res);
          }
          throw new Error(`Signing not supported for chain ${account.chainType}`);
        }
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [connectedProvider, account]
  );

  return { signMessage, signMessageAsync: signMessage, isPending, error };
}
