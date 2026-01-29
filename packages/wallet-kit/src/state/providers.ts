import {create} from "zustand";
import {type WalletAdapter} from "wallet-apdater";
export interface IProvidersStore {
    providers:Array<WalletAdapter> | null,
    connectedProvider:WalletAdapter | null
    setProviders: (providers:Array<WalletAdapter>) => void;
    setConnectedProvider: (provider:WalletAdapter | null) => void
}
const useProvidersStore = create<IProvidersStore>((set) => ({
    providers: null,
    connectedProvider:null,
    setProviders: (providers) => set(() => ({providers})),
    setConnectedProvider: (provider) => set(() => ({connectedProvider:provider}))
}));

export default useProvidersStore;
