import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, GlassCard } from '@/ui';
import {
    ArrowLeftIcon,
    GlobeIcon,
    TrashIcon,
    ShieldCheckIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react';
import { getStorage, setStorage } from '@/core/storage';
import { STORAGE_KEYS, DAppConnection } from '@/types';
import { checkOriginSecurity } from '@/services/security';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConnectedSites() {
    const navigate = useNavigate();
    const [connections, setConnections] = useState<DAppConnection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadConnections = async () => {
        try {
            const list = (await getStorage<DAppConnection[]>(STORAGE_KEYS.DAPP_CONNECTIONS)) || [];
            setConnections(list);
        } catch (err) {
            console.error('Failed to load connections:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConnections();
    }, []);

    const handleDisconnect = async (origin: string) => {
        const next = connections.filter((c) => c.origin !== origin);
        setConnections(next);
        await setStorage(STORAGE_KEYS.DAPP_CONNECTIONS, next);
        toast.success(`Disconnected from ${origin}`);
    };

    const handleDisconnectAll = async () => {
        setConnections([]);
        await setStorage(STORAGE_KEYS.DAPP_CONNECTIONS, []);
        toast.success('Disconnected from all DApps');
    };

    return (
        <div className="flex flex-col min-h-[600px] bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/settings')}
                        className="h-8 w-8 rounded-full hover:bg-accent/40"
                    >
                        <ArrowLeftIcon size={18} />
                    </Button>
                    <div>
                        <h1 className="text-base font-bold leading-tight">Connected Sites</h1>
                        <p className="text-[11px] text-muted-foreground">Manage authorized DApps & permissions</p>
                    </div>
                </div>

                {connections.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDisconnectAll}
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        Disconnect All
                    </Button>
                )}
            </div>

            {/* Content Body */}
            <div className="p-4 flex-1 space-y-3">
                {isLoading ? (
                    <div className="space-y-2">
                        <div className="h-16 rounded-xl bg-card/60 animate-pulse" />
                        <div className="h-16 rounded-xl bg-card/60 animate-pulse" />
                    </div>
                ) : connections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                            <GlobeIcon size={24} className="text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">No Connected Sites</p>
                        <p className="text-xs max-w-xs mt-1">
                            Sites you connect with FistWallet will appear here. You can revoke permissions at any time.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {connections.map((conn) => {
                            const sec = checkOriginSecurity(conn.origin);
                            return (
                                <motion.div
                                    key={conn.origin}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <GlassCard className="p-3.5 space-y-2 hover:border-primary/40 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-accent/40 flex items-center justify-center overflow-hidden border border-border/50">
                                                    {conn.favicon ? (
                                                        <img
                                                            src={conn.favicon}
                                                            alt={conn.name}
                                                            className="w-5 h-5 object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <GlobeIcon size={18} className="text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-xs text-foreground">
                                                            {conn.name || conn.origin}
                                                        </span>
                                                        {sec.isSafe ? (
                                                            <ShieldCheckIcon size={14} className="text-success" />
                                                        ) : (
                                                            <WarningCircleIcon size={14} className="text-warning" />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
                                                        {conn.origin}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDisconnect(conn.origin)}
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <TrashIcon size={15} />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-muted-foreground">
                                            <span>
                                                {conn.connectedAccounts?.length || 1} Account Connected
                                            </span>
                                            <span className="font-mono text-[10px]">
                                                {new Date(conn.connectedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
