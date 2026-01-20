import type { ComponentType } from 'react';
import { ChainType } from '@/types';
import type { IconProps } from '@phosphor-icons/react';
import {
    Atom,
    Coins,
    CurrencyBtc,
    Diamond,
    Drop,
    Hexagon,
    Triangle,
} from '@phosphor-icons/react';

const ICONS_BY_CHAIN: Record<ChainType, ComponentType<IconProps>> = {
    [ChainType.EVM]: Hexagon,
    [ChainType.BITCOIN]: CurrencyBtc,
    [ChainType.SOLANA]: Atom,
    [ChainType.APTOS]: Atom,
    [ChainType.SUI]: Drop,
    [ChainType.TRON]: Triangle,
    [ChainType.TON]: Diamond,
    [ChainType.NEAR]: Atom,
    [ChainType.FILECOIN]: Coins,
};

type NetworkIconProps = {
    chainType: ChainType;
    size?: number;
    className?: string;
};

export function NetworkIcon({ chainType, size = 18, className }: NetworkIconProps) {
    const Icon = ICONS_BY_CHAIN[chainType] ?? Hexagon;
    return <Icon size={size} className={className} />;
}
