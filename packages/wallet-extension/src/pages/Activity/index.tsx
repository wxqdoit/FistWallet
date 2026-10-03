import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { Button, GlassCard, Badge } from '@/ui';
import {
    ArrowLeftIcon,
    ArrowUpRightIcon,
    ArrowSquareOutIcon,
    ClockIcon,
} from '@phosphor-icons/react';
import { getStorage } from '@/core/storage';
import { STORAGE_KEYS, Transaction } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Activity() {
    const navigate = useNavigate();
    const { currentNetwork } = useWalletStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const stored = (await getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTION_HISTORY)) || [];
                const filtered = stored.filter((tx) => !tx.networkId || tx.networkId === currentNetwork.id);
                setTransactions(filtered);
            } catch (err) {
                console.warn('Failed to load tx history', err);
            }
        };
        loadHistory();
    }, [currentNetwork.id]);

    const openExplorer = (hash?: string) => {
        if (!hash || !currentNetwork.explorerUrl) return;
        const url = `${currentNetwork.explorerUrl.replace(/\/$/, '')}/tx/${hash}`;
        window.open(url, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full flex flex-col bg-background text-foreground"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="px-2 text-muted-foreground hover:text-foreground gap-1"
                >
                    <ArrowLeftIcon size={16} />
                    <span>Back</span>
                </Button>
                <h2 className="text-sm font-semibold">Activity & History</h2>
                <div className="w-12" />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
                {transactions.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground space-y-2">
                        <ClockIcon size={40} className="mx-auto text-muted-foreground/40" />
                        <p className="text-sm font-medium">No transactions yet</p>
                        <p className="text-xs text-muted-foreground/70">
                            Your transfers and smart contract interactions on {currentNetwork.name} will appear here.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {transactions.map((tx, idx) => (
                            <motion.div
                                key={tx.id || tx.hash || idx}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ delay: idx * 0.04 }}
                            >
                                <GlassCard className="p-3.5 space-y-2 hover:border-primary/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                <ArrowUpRightIcon size={15} />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-xs capitalize text-foreground">
                                                    {'Transfer'}
                                                </span>
                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                                                tx.status === 'confirmed'
                                                    ? 'bg-success/15 text-success border-success/30'
                                                    : tx.status === 'failed'
                                                    ? 'bg-destructive/15 text-destructive border-destructive/30'
                                                    : 'bg-warning/15 text-warning border-warning/30'
                                            }`}
                                        >
                                            {tx.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span className="font-semibold font-mono text-foreground">
                                            {tx.value} {currentNetwork.nativeCurrency.symbol}
                                        </span>
                                    </div>

                                    {tx.hash && (
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span className="font-mono">
                                                {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                                            </span>
                                            {currentNetwork.explorerUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => openExplorer(tx.hash)}
                                                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
                                                >
                                                    <span>View</span>
                                                    <ArrowSquareOutIcon size={12} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
