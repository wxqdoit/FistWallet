import type { ComponentType } from 'react';
import { ChainType } from '@/types';
import type { IconProps } from '@phosphor-icons/react';
import {
    AtomIcon,
    CoinsIcon,
    CurrencyBtcIcon,
    DiamondIcon,
    DropIcon,
    HexagonIcon,
    TriangleIcon,
} from '@phosphor-icons/react';

import aptosIcon from '@/assets/APTOS.png';
import arbitrumIcon from '@assets/arb_9000.png';
import baseIcon from '@assets/base_v2.png';
import bscIcon from '@assets/new_bsc_chain_color.png';
import ethereumIcon from '@assets/ETH-20220328.png';
import optimismIcon from '@assets/op_10000.png';
import polygonIcon from '@assets/MATIC-20220415.png';
import solanaIcon from '@assets/SOL-20220525.png';
import suiIcon from '@assets/new_sui_chain_color.png';
import tonIcon from '@assets/TONCOIN-20220719.png';
import tronIcon from '@assets/TRX.png';

const ICONS_BY_CHAIN: Record<ChainType, ComponentType<IconProps>> = {
    [ChainType.EVM]: HexagonIcon,
    [ChainType.BITCOIN]: CurrencyBtcIcon,
    [ChainType.SOLANA]: AtomIcon,
    [ChainType.APTOS]: AtomIcon,
    [ChainType.SUI]: DropIcon,
    [ChainType.TRON]: TriangleIcon,
    [ChainType.TON]: DiamondIcon,
    [ChainType.NEAR]: AtomIcon,
    [ChainType.FILECOIN]: CoinsIcon,
};

const ICONS_BY_KEY: Record<string, string> = {
    evm: ethereumIcon,
    eth: ethereumIcon,
    ethereum: ethereumIcon,
    bnb: bscIcon,
    bsc: bscIcon,
    polygon: polygonIcon,
    arbitrum: arbitrumIcon,
    optimism: optimismIcon,
    base: baseIcon,
    solana: solanaIcon,
    aptos: aptosIcon,
    sui: suiIcon,
    tron: tronIcon,
    ton: tonIcon,
};

type NetworkIconProps = {
    chainType?: ChainType;
    iconKey?: string;
    size?: number;
    className?: string;
};

export function NetworkIcon({ chainType, iconKey, size = 18, className }: NetworkIconProps) {
    const iconSrc = iconKey ? ICONS_BY_KEY[iconKey] : undefined;
    if (iconSrc) {
        return (
            <img
                src={iconSrc}
                width={size}
                height={size}
                className={className}
                alt={iconKey}
                loading="lazy"
                decoding="async"
            />
        );
    }

    const Icon = (chainType && ICONS_BY_CHAIN[chainType]) ?? HexagonIcon;
    return <Icon size={size} className={className} />;
}
