import React, { useState, useMemo } from 'react';
import { CryptoIcon } from './CryptoIcon';
import { MagnifyingGlassIcon, XIcon, CheckIcon } from '@phosphor-icons/react';

export interface TokenItem {
    symbol: string;
    name: string;
    balance: string;
    usd: string;
    price: number;
    address?: string;
}

interface TokenSelectorModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (token: TokenItem) => void;
    selectedSymbol?: string;
    title?: string;
    tokens?: TokenItem[];
}

export const DEFAULT_TOKENS: TokenItem[] = [
    { symbol: 'ETH', name: 'Ethereum', balance: '4.25', usd: '$14,643.84', price: 3445.61 },
    { symbol: 'USDT', name: 'Tether USD', balance: '8,500.00', usd: '$8,500.00', price: 1.00 },
    { symbol: 'USDC', name: 'USD Coin', balance: '4,250.00', usd: '$4,250.00', price: 1.00 },
    { symbol: 'SOL', name: 'Solana', balance: '18.50', usd: '$2,645.50', price: 143.00 },
    { symbol: 'BTC', name: 'Bitcoin (WBTC)', balance: '0.015', usd: '$1,097.35', price: 73156.66 },
    { symbol: 'ARB', name: 'Arbitrum', balance: '1,450.00', usd: '$870.00', price: 0.60 },
    { symbol: 'BNB', name: 'BNB Chain', balance: '2.10', usd: '$1,218.00', price: 580.00 },
    { symbol: 'MATIC', name: 'Polygon POL', balance: '850.00', usd: '$340.00', price: 0.40 },
    { symbol: 'OP', name: 'Optimism', balance: '320.00', usd: '$480.00', price: 1.50 },
];

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
    open,
    onClose,
    onSelect,
    selectedSymbol = 'ETH',
    title = 'Select a Token',
    tokens = DEFAULT_TOKENS,
}) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return tokens;
        return tokens.filter(
            (t) =>
                t.symbol.toLowerCase().includes(q) ||
                t.name.toLowerCase().includes(q) ||
                (t.address && t.address.toLowerCase().includes(q))
        );
    }, [tokens, search]);

    if (!open) return null;

    const popularChips = ['ETH', 'USDT', 'USDC', 'SOL', 'BTC'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
            <div className="w-full max-w-sm rounded-2xl border border-[#2B364C] bg-[#101522] shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex flex-col max-h-[520px] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <XIcon size={14} weight="bold" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-3 border-b border-white/5 space-y-2.5">
                    <div className="relative flex items-center">
                        <MagnifyingGlassIcon size={15} className="absolute left-3 text-[#64748B]" />
                        <input
                            type="text"
                            placeholder="Search name or paste contract address"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-9 pr-8 rounded-xl bg-[#090D16] border border-[#232D42] text-xs text-white placeholder:text-[#64748B] outline-none focus:border-indigo-500 transition-colors"
                            autoFocus
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 text-[#64748B] hover:text-white"
                            >
                                <XIcon size={12} />
                            </button>
                        )}
                    </div>

                    {/* Quick Popular Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                        {popularChips.map((sym) => {
                            const tok = tokens.find((t) => t.symbol === sym);
                            const isSelected = selectedSymbol.toUpperCase() === sym;
                            return (
                                <button
                                    key={sym}
                                    type="button"
                                    onClick={() => {
                                        if (tok) {
                                            onSelect(tok);
                                            onClose();
                                        }
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#00E599]/15 border border-[#00E599]/40 text-[#00E599]'
                                            : 'bg-[#161D2C] border border-[#232D42] text-[#CBD5E1] hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    <CryptoIcon symbol={sym} size={14} />
                                    <span>{sym}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tokens List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-xs text-[#64748B]">
                            No tokens found for "{search}"
                        </div>
                    ) : (
                        filtered.map((tok) => {
                            const isSelected =
                                tok.symbol.toUpperCase() === selectedSymbol.toUpperCase();

                            return (
                                <div
                                    key={tok.symbol}
                                    onClick={() => {
                                        onSelect(tok);
                                        onClose();
                                    }}
                                    className={`p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#141E32] border border-[#00F5A0]/40 shadow-xs'
                                            : 'hover:bg-[#161D2C] border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CryptoIcon symbol={tok.symbol} size={32} />
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-white">
                                                    {tok.symbol}
                                                </span>
                                                <span className="text-[10px] text-[#64748B]">
                                                    {tok.name}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                                                ${tok.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-right">
                                        <div>
                                            <p className="text-xs font-bold text-white font-mono">
                                                {tok.balance}
                                            </p>
                                            <p className="text-[10px] text-[#64748B] font-mono">
                                                {tok.usd}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-[#00E599] text-[#042F2E] flex items-center justify-center shrink-0">
                                                <CheckIcon size={12} weight="bold" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
