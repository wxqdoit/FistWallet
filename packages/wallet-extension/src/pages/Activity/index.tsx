import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { t, formatLocalizedDateTime } from '@utils/i18n';
import {
    ArrowLeftIcon,
    ArrowUpRightIcon,
    ArrowSquareOutIcon,
    ClockIcon,
    ArrowDownLeftIcon,
    ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { getStorage } from '@/core/storage';
import { STORAGE_KEYS, Transaction } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Activity() {
    const navigate = useNavigate();
    const { currentNetwork } = useWalletStore();
    const { language } = useSettingsStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans"
        >
            {/* Unified Sticky Header */}
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#070A12]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'historyActivityTitle')}</h1>
                <button
                    type="button"
                    onClick={loadHistory}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                    <ArrowClockwiseIcon size={15} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {transactions.length === 0 ? (
                    <div className="text-center py-20 text-white/50 space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-[#14161E] border border-white/5 flex items-center justify-center text-white/30">
                            <ClockIcon size={32} />
                        </div>
                        <p className="text-sm font-semibold text-white/70">{t(language, 'noTransactionsYet')}</p>
                        <p className="text-xs text-white/40 max-w-[260px] mx-auto leading-relaxed">
                            {t(language, 'transactionsAppearHere', { network: currentNetwork.name })}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {transactions.map((tx, idx) => {
                            const isReceive = tx.from && tx.to && tx.to.toLowerCase() === tx.from.toLowerCase();
                            const isSuccess = tx.status === 'confirmed';
                            const isFailed = tx.status === 'failed';

                            return (
                                <motion.div
                                    key={tx.id || tx.hash || idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="p-4 rounded-2xl bg-[#14161E] border border-white/10 hover:border-white/20 transition-all space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                                        isReceive
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                    }`}
                                                >
                                                    {isReceive ? (
                                                        <ArrowDownLeftIcon size={18} weight="bold" />
                                                    ) : (
                                                        <ArrowUpRightIcon size={18} weight="bold" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-sm text-white">
                                                        {isReceive ? t(language, 'txReceive') : t(language, 'txSend')}
                                                    </span>
                                                    <p className="text-[11px] text-white/40 font-mono mt-0.5">
                                                        {formatLocalizedDateTime(tx.timestamp, language)}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                                                    isSuccess
                                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                        : isFailed
                                                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                }`}
                                            >
                                                {tx.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                                            <span className="text-white/50">{t(language, 'txAmountLabel')}</span>
                                            <span className="font-bold font-mono text-white text-sm">
                                                {tx.value} {currentNetwork.nativeCurrency.symbol}
                                            </span>
                                        </div>

                                        {tx.hash && (
                                            <div className="flex items-center justify-between pt-1 text-[11px] text-white/40">
                                                <span className="font-mono">
                                                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                                                </span>
                                                {currentNetwork.explorerUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openExplorer(tx.hash)}
                                                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer"
                                                    >
                                                        <span>{t(language, 'viewInBlockExplorer')}</span>
                                                        <ArrowSquareOutIcon size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}

