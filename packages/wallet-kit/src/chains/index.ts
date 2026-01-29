import { ChainType } from "wallet-apdater";
import type { IChainInfo } from "../types/configType";
import {evm_chains} from "./evm_chains";
import {btc_chains} from "./btc_chains";
import {sol_chains} from "./sol_chains";

export type IChainMap = Record<ChainType, Array<IChainInfo>>;

export const chains: IChainMap = {
    [ChainType.EVM]: evm_chains,
    [ChainType.SOL]: sol_chains,
    [ChainType.BTC]: btc_chains,
    [ChainType.APTOS]: [],
    [ChainType.SUI]: [],
    [ChainType.TRON]: [],
}

export const getChainInfo = ({chainType,chainId}:{chainType:ChainType,chainId:number}) => {
    if(chainType && chains[chainType]){
        const chain = chains[chainType].find((chain) => chain.id === chainId);
        if(!chain) throw new Error(`Chain id '${chainId}' not supported`);
        return {...chain, type: chainType};
    }else {
        throw new Error(`Chain type '${chainType}' not supported`);
    }
}
