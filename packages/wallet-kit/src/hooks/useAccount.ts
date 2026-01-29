import { useMemo} from "react";
import useStore from "../state/store";

export const useAccount = ()=>{
    const {account} = useStore()
    return useMemo(()=>{
        return account
    },[account])
}