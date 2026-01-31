import { ChainType } from "wallet-apdater";
import type { IChainInfo } from "../types/configType";
import {evm_chains} from "./evm_chains";
import {btc_chains} from "./btc_chains";
import {sol_chains} from "./sol_chains";
import {aptos_chains} from "./aptos_chains";
import {sui_chains} from "./sui_chains";
import {tron_chains} from "./tron_chains";
import {starknet_chains} from "./starknet_chains";

export type IChainMap = Record<ChainType, Array<IChainInfo>>;

const isLikelyMainnet = (name: string) => {
    const lowered = name.toLowerCase();
    const testSignals = [
        'testnet',
        'devnet',
        'dev',
        'test',
        'goerli',
        'sepolia',
        'holesky',
        'rinkeby',
        'ropsten',
        'kovan',
        'mumbai',
        'fuji',
        'chapel',
        'shasta',
        'nile',
        'signet',
        'regtest',
        'local',
        'canary',
        'sandbox',
        'staging',
        'preview',
        'alpha',
        'beta'
    ];
    return !testSignals.some((signal) => lowered.includes(signal));
};

const withMainnetFlag = (list: Array<IChainInfo>) =>
    list.map((chain) => ({
        ...chain,
        isMainnet: chain.isMainnet ?? isLikelyMainnet(chain.name),
    }));

export const chains: IChainMap = {
    [ChainType.EVM]: withMainnetFlag(evm_chains as Array<IChainInfo>),
    [ChainType.SOL]: withMainnetFlag(sol_chains as Array<IChainInfo>),
    [ChainType.BTC]: withMainnetFlag(btc_chains as Array<IChainInfo>),
    [ChainType.APTOS]: withMainnetFlag(aptos_chains as Array<IChainInfo>),
    [ChainType.SUI]: withMainnetFlag(sui_chains as Array<IChainInfo>),
    [ChainType.TRON]: withMainnetFlag(tron_chains as Array<IChainInfo>),
    [ChainType.STARKNET]: withMainnetFlag(starknet_chains as Array<IChainInfo>),
}

export const getChainInfo = ({chainType,chainId}:{chainType:ChainType,chainId:number | string}) => {
    if(chainType && chains[chainType]){
        const chain = chains[chainType].find((chain) => chain.id === chainId);
        if(!chain) throw new Error(`Chain id '${chainId}' not supported`);
        return {...chain, type: chainType};
    }else {
        throw new Error(`Chain type '${chainType}' not supported`);
    }
}
