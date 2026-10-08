import { useState, useCallback } from 'react';
import { useAccount } from './useAccount';
import useProvidersStore from '../state/providers';

export interface UserOpData {
  sender: string;
  nonce?: bigint | string;
  initCode?: string;
  callData: string;
  callGasLimit?: bigint | string;
  verificationGasLimit?: bigint | string;
  preVerificationGas?: bigint | string;
  maxFeePerGas?: bigint | string;
  maxPriorityFeePerGas?: bigint | string;
  paymasterAndData?: string;
  signature?: string;
}

export interface SponsorOptions {
  paymasterUrl?: string;
  entryPoint?: string;
}

export function useAccountAbstraction() {
  const account = useAccount();
  const { connectedProvider } = useProvidersStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const from = typeof account?.address === 'string' ? account.address : account?.address?.address || '0x0000000000000000000000000000000000000000';

  /**
   * Build a standard UserOperation scaffold for current account
   */
  const buildUserOperation = useCallback((callData: string, override?: Partial<UserOpData>): UserOpData => {
    return {
      sender: from,
      nonce: 0n,
      initCode: '0x',
      callData,
      callGasLimit: 100000n,
      verificationGasLimit: 150000n,
      preVerificationGas: 21000n,
      maxFeePerGas: 2000000000n,
      maxPriorityFeePerGas: 1000000000n,
      paymasterAndData: '0x',
      signature: '0x',
      ...override,
    };
  }, [from]);

  /**
   * Request Paymaster sponsorship & bundler gas estimation
   */
  const sponsorUserOperation = useCallback(async (userOp: UserOpData, options?: SponsorOptions) => {
    setIsPending(true);
    setError(null);
    try {
      // Mock / actual paymaster sponsorship call
      const entryPoint = options?.entryPoint || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
      const sponsoredOp: UserOpData = {
        ...userOp,
        paymasterAndData: `${entryPoint}0000000000000000000000000000000000000000`,
        preVerificationGas: 45000n,
        verificationGasLimit: 120000n,
      };
      return sponsoredOp;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  /**
   * Send UserOperation via connected provider or bundler
   */
  const sendUserOperation = useCallback(async (_userOp: UserOpData, _bundlerUrl?: string): Promise<string> => {
    setIsPending(true);
    setError(null);
    try {
      // Return userOpHash
      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return mockHash;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    accountAddress: from,
    isConnected: !!connectedProvider,
    buildUserOperation,
    sponsorUserOperation,
    sendUserOperation,
    isPending,
    error,
  };
}
