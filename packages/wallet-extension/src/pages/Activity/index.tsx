import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import {
    ArrowLeftIcon,
    ArrowUpRightIcon,
    ArrowDownLeftIcon,
    ArrowsLeftRightIcon,
    ArrowsClockwiseIcon,
    CodeBlockIcon,
} from '@phosphor-icons/react';
import { getStorage } from '@/core/storage';
import { STORAGE_KEYS, Transaction } from '@/types';
import { BottomDock } from '@/components/BottomDock';

export default function Activity() {
    const navigate = useNavigate();
    const { currentNetwork } = useWalletStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'sends' | 'receives' | 'swaps'>('all');

    const loadHistory = async () => {
        setIsRefreshing(true);
        try {
            const stored = (await getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTION_HISTORY)) || [];
            const filtered = stored.filter((tx) => !tx.networkId || tx.networkId === currentNetwork.id);
            setTransactions(filtered);
        } catch (err) {
            console.warn('Failed to load tx history', err);
        } finally {
            setTimeout(() => setIsRefreshing(false), 300);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [currentNetwork.id]);

    const openExplorer = (hash?: string) => {
        if (!hash || !currentNetwork.explorerUrl) return;
        const url = `${currentNetwork.explorerUrl.replace(/\/$/, '')}/tx/${hash}`;
        window.open(url, '_blank');
    };

    // Default sample commercial transactions matching Figma Screen 08
    const mockTxs = [
        {
            id: 'mock-1',
            type: 'swap',
            title: 'SWAP ETH to USDT',
            time: 'Oct 5, 22:30 · Confirmed',
            amountPrimary: '+ 5,168 USDT',
            amountSecondary: '-1.5 ETH',
            status: 'confirmed',
            hash: '0x88f...12a',
        },
        {
            id: 'mock-2',
            type: 'send',
            title: 'Send Ethereum',
            time: 'To: vitalik.eth · Confirmed',
            amountPrimary: '-0.85 ETH',
            amountSecondary: '-$2,932.67',
            status: 'confirmed',
            hash: '0x71c...39f',
        },
        {
            id: 'mock-3',
            type: 'receive',
            title: 'Receive Solana',
            time: 'From: 7UdM...8k2L · Confirmed',
            amountPrimary: '+ 28.50 SOL',
            amountSecondary: '+$4,235.10',
            status: 'confirmed',
            hash: '0x442...bc0',
        },
        {
            id: 'mock-4',
            type: 'contract',
            title: 'Uniswap UniversalRouter',
            time: 'Pending (12/24 blocks) ⏳',
            amountPrimary: 'exactInput',
            amountSecondary: 'Gas: $4.10',
            status: 'pending',
            hash: '0x3fc...884',
        },
    ];

    const displayTxs = transactions.length > 0
        ? transactions.map((t) => ({
              id: t.id || t.hash || Math.random().toString(),
              type: t.from.toLowerCase() === t.to.toLowerCase() ? 'receive' : 'send',
              title: t.from.toLowerCase() === t.to.toLowerCase() ? 'Receive Asset' : 'Send Asset',
              time: new Date(t.timestamp).toLocaleString(),
              amountPrimary: `${t.value} ${currentNetwork.nativeCurrency.symbol}`,
              amountSecondary: `$${(parseFloat(t.value || '0') * 3445).toFixed(2)}`,
              status: t.status,
              hash: t.hash,
          }))
        : mockTxs;

    const filteredTxs = displayTxs.filter((tx) => {
        if (filter === 'all') return true;
        if (filter === 'sends') return tx.type === 'send';
        if (filter === 'receives') return tx.type === 'receive';
        if (filter === 'swaps') return tx.type === 'swap';
        return true;
    });

    return (
        <div className="h-full w-full flex flex-col justify-between bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans select-none relative">
            {/* Header */}
            <div className="h-[52px] px-3.5 flex items-center justify-between border-b border-[#1D263B] bg-[#0A0E18]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#CBD5E1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} />
                </button>
                <h1 className="text-sm font-bold text-white tracking-tight">Activity History</h1>
                <button
                    type="button"
                    onClick={loadHistory}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowsClockwiseIcon size={15} className={isRefreshing ? 'animate-spin text-[#00E599]' : ''} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
                {/* Filter Pills (Figma Screen 08) */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'sends', label: 'Sends' },
                        { id: 'receives', label: 'Receives' },
                        { id: 'swaps', label: 'Swaps' },
                    ].map((btn) => {
                        const isSelected = filter === btn.id;
                        return (
                            <button
                                key={btn.id}
                                type="button"
                                onClick={() => setFilter(btn.id as any)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-[#00E599]/15 border border-[#00E599]/40 text-[#00E599] shadow-xs'
                                        : 'bg-[#131826] border border-[#253248] text-[#94A3B8] hover:text-white'
                                }`}
                            >
                                {btn.label}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
                        October 2026
                    </span>

                    
                        {filteredTxs.map((tx) => {
                            const isPending = tx.status === 'pending';

                            return (
                                <div
                                    key={tx.id}
                                    
                                    onClick={() => openExplorer(tx.hash)}
                                    className={`p-3 rounded-xl border bg-[#101522] hover:bg-[#141A28] transition-all cursor-pointer shadow-sm flex items-center justify-between ${
                                        isPending
                                            ? 'border-amber-500/50 bg-[#141926]'
                                            : 'border-[#253248] hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                                tx.type === 'swap'
                                                    ? 'bg-emerald-500/15 text-[#00E599]'
                                                    : tx.type === 'send'
                                                    ? 'bg-rose-500/15 text-[#FF5252]'
                                                    : tx.type === 'receive'
                                                    ? 'bg-emerald-500/15 text-[#00E599]'
                                                    : 'bg-amber-500/15 text-[#FBBF24]'
                                            }`}
                                        >
                                            {tx.type === 'swap' && <ArrowsLeftRightIcon size={18} weight="bold" />}
                                            {tx.type === 'send' && <ArrowUpRightIcon size={18} weight="bold" />}
                                            {tx.type === 'receive' && <ArrowDownLeftIcon size={18} weight="bold" />}
                                            {tx.type === 'contract' && <CodeBlockIcon size={18} weight="bold" />}
                                        </div>

                                        <div>
                                            <p className="font-bold text-sm text-white leading-tight">
                                                {tx.title}
                                            </p>
                                            <p
                                                className={`text-[11px] mt-0.5 ${
                                                    isPending ? 'text-[#FBBF24] font-semibold' : 'text-[#94A3B8]'
                                                }`}
                                            >
                                                {tx.time}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={`font-bold text-sm font-mono ${
                                                tx.amountPrimary.startsWith('+')
                                                    ? 'text-[#00E599]'
                                                    : tx.amountPrimary.startsWith('-')
                                                    ? 'text-white'
                                                    : 'text-[#FBBF24]'
                                            }`}
                                        >
                                            {tx.amountPrimary}
                                        </p>
                                        <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                                            {tx.amountSecondary}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    
                </div>
            </div>

            {/* Bottom Dock */}
            <BottomDock activeTab="wallet" />
        </div>
    );
}
