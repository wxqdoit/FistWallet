import { useMemo } from "react";
import useStore from "../state/store";
import useProvidersStore from "../state/providers";

export const useDisconnect = ()=>{
    const {account} = useStore()
    const setAccount = useStore((state: any) => state.setAccount)
    const closeModal = useStore((state: any) => state.closeModal)
    const { connectedProvider, providers, setConnectedProvider } = useProvidersStore()
    return useMemo(()=>{
        if(account){
            const activeProvider = connectedProvider
                ?? providers?.find((provider) => provider.info.rdns === account.walletRdns)
            return {
                disConnect: async () => {
                    if (activeProvider) {
                        await activeProvider.disconnect({ chainType: account.chainType });
                    }
                    setConnectedProvider(null)
                    setAccount(null)
                    closeModal()
                }
            }
        }else {
            return {
                disConnect:()=>{}
            }
        }
    },[account, connectedProvider, providers, closeModal, setAccount, setConnectedProvider])
}
