import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChainType } from 'wallet-apdater';
import {
	AppModal,
	type ConnectStatus,
	type IBtcAccount,
	type IChainInfo,
	type Locals,
	type Theme
} from '../types/configType';

export interface IAccount {
	address:string | IBtcAccount,
	chainId?:number | string,
	chainType:ChainType,
	walletRdns:string,
	status:ConnectStatus
}

export interface IWalletKit {
	chain: IChainInfo | null;
	modalStatus: AppModal | null;
	language: Locals | null;
	theme: Theme | null;
	account:IAccount | null
	toggleModal:(modal: AppModal)=>void
	setChain:({id,name,type,isMainnet}: IChainInfo)=>void
	setAccount:(account:IAccount | null)=>void
}

const useStore = create(
	persist(
		(set, get: () => IWalletKit) => ({
			chain: null,
			modalStatus: null,
			language: null,
			theme: null,
			account:null,
			toggleModal(modal: AppModal) {
				return set(() => ({ modalStatus: modal === get().modalStatus ? null : modal }));
			},
			openConnectModal() {
				return set(() => ({ modalStatus: AppModal.ConnectModal === get().modalStatus ? null : AppModal.ConnectModal }));
			},
			closeModal() {
				return set(() => ({ modalStatus: null }));
			},
			modalIsOpen(modal: AppModal) {
				return modal === get().modalStatus;
			},
			setLanguage(language: Locals) {
				return set(() => ({ language }));
			},
			setTheme(theme: Theme) {
				return set(() => ({ theme }));
			},
			setChain({id,name,type,isMainnet}: IChainInfo) {
				return set(() => ({ chain: {id, name, type, isMainnet} }));
			},
			setAccount(account:IAccount | null){
				return set(() => ({ account }));

			}
		}),
		{
			name: 'WALLET_KIT_APP',
			storage: createJSONStorage(() => localStorage)
		}
	)
);

export default useStore;
