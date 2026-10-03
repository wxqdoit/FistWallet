import { useEffect, useState } from 'react';
import useStore from '../state/store';
import useProvidersStore from '../state/providers';
import { eagerConnect, createDefaultAdapterRegistry } from 'wallet-apdater';
import { ConnectStatus } from '../types/configType';

export function useAutoReconnect() {
  const { setAccount } = useStore();
  const { setConnectedProvider, setProviders } = useProvidersStore();
  const [isReconnecting, setIsReconnecting] = useState(true);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function attempt() {
      try {
        const { registry, stop } = createDefaultAdapterRegistry();
        const adapters = registry.list();
        setProviders(adapters);

        const result = await eagerConnect(registry);
        if (mounted && result?.account) {
          setAccount({
            address: result.account.address,
            chainId: result.account.chainId,
            chainType: result.account.chainType,
            walletRdns: result.adapterId,
            status: ConnectStatus.connected,
          });

          const adapter = registry.getAdapter(result.adapterId);
          if (adapter) {
            setConnectedProvider(adapter as any);
          }
          setReconnected(true);
        }
        stop();
      } catch {
        // Eager connection failed, user can connect manually
      } finally {
        if (mounted) {
          setIsReconnecting(false);
        }
      }
    }

    attempt();

    return () => {
      mounted = false;
    };
  }, [setAccount, setConnectedProvider, setProviders]);

  return { isReconnecting, reconnected };
}
