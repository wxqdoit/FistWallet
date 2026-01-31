import {createContext, type ReactNode, useEffect, useMemo} from 'react';
import { type ChainType, type ConnectedAccount, type NetworkChangeInfo } from 'wallet-apdater';
import useStore from "../../state/store";
import useProvidersStore from "../../state/providers";
import { getChainInfo } from '../../chains';
import { subscribeAdapters } from '../../adapters/registry';
import { ConnectStatus } from '../../types/configType';


interface ChainContextValue {
	defaultChainId?: number | string;
	defaultChainType?: ChainType;
}
interface IChainProvider {
	children: ReactNode;
	defaultChainId?: number | string;
	defaultChainType?: ChainType;
}
const ChainContext = createContext<ChainContextValue>({
	defaultChainId: undefined,
	defaultChainType: undefined
});

export function ChainProvider({children,defaultChainId,defaultChainType}:IChainProvider) {
	const setChain = useStore((state: any) => state.setChain);
	const setAccount = useStore((state: any) => state.setAccount);
	const account = useStore((state: any) => state.account);
	const {setProviders} = useProvidersStore();
	const { connectedProvider, setConnectedProvider } = useProvidersStore();
	useEffect(() => {
		const unsubscribe = subscribeAdapters((nextProviders) => {
			setProviders(nextProviders);
		});
		return unsubscribe;
	}, [setProviders]);

	useEffect(() => {
		if (!connectedProvider || !account) return;

		let offAccount: (() => void) | undefined;
		let offNetwork: (() => void) | undefined;
		let offDisconnect: (() => void) | undefined;

		try {
			offAccount = connectedProvider.onAccountChanged?.((accounts: Array<ConnectedAccount['address']>) => {
				if (!accounts || accounts.length === 0) {
					setConnectedProvider(null);
					setAccount(null);
					return;
				}
				const current = useStore.getState().account;
				if (!current) return;
				setAccount({
					...current,
					address: accounts[0],
					status: ConnectStatus.connected
				});
			}, { chainType: account.chainType });
		} catch {}

		try {
			offNetwork = connectedProvider.onNetworkChanged?.((info: NetworkChangeInfo) => {
				const current = useStore.getState().account;
				if (!current) return;
				if (info.chainId !== undefined) {
					if (current.chainId !== info.chainId) {
						setAccount({
							...current,
							chainId: info.chainId,
							status: ConnectStatus.connected
						});
					}
					if (current.chainType) {
						try {
							const chainInfo = getChainInfo({ chainType: current.chainType, chainId: info.chainId });
							setChain(chainInfo);
						} catch {
							// ignore unknown chain mapping
						}
					}
				}
			}, { chainType: account.chainType });
		} catch {}

		try {
			offDisconnect = connectedProvider.onDisconnect?.(() => {
				setConnectedProvider(null);
				setAccount(null);
			}, { chainType: account.chainType });
		} catch {}

		return () => {
			if (offAccount) offAccount();
			if (offNetwork) offNetwork();
			if (offDisconnect) offDisconnect();
		};
	}, [connectedProvider, account?.walletRdns]);

	useEffect(() => {
		if (defaultChainType && defaultChainId) {
			const chainInfo = getChainInfo({chainType: defaultChainType, chainId: defaultChainId})
			setChain(chainInfo);
		}
	}, [defaultChainType,defaultChainId]);
	const chainValue = useMemo(() => {
		return {
			defaultChainId,
			defaultChainType
		};
	}, []);

	return <ChainContext.Provider value={chainValue}>{children}</ChainContext.Provider>;
}
