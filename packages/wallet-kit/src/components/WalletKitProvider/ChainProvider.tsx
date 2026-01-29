import {createContext, type ReactNode, useEffect, useMemo} from 'react';
import { type ChainType } from 'wallet-apdater';
import useStore from "../../state/store";
import useProvidersStore from "../../state/providers";
import { getChainInfo } from '../../chains';
import { subscribeAdapters } from '../../adapters/registry';


interface ChainContextValue {
	defaultChainId?: number;
	defaultChainType?: ChainType;
}
interface IChainProvider {
	children: ReactNode;
	defaultChainId?: number;
	defaultChainType?: ChainType;
}
const ChainContext = createContext<ChainContextValue>({
	defaultChainId: undefined,
	defaultChainType: undefined
});

export function ChainProvider({children,defaultChainId,defaultChainType}:IChainProvider) {
	const setChain = useStore((state: any) => state.setChain);
	const {setProviders} = useProvidersStore();
	useEffect(() => {
		const unsubscribe = subscribeAdapters((nextProviders) => {
			setProviders(nextProviders);
		});
		return unsubscribe;
	}, [setProviders]);


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
