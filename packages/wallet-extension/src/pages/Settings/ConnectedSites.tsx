import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';

export default function ConnectedSites() {
    const navigate = useNavigate();
    const { language } = useSettingsStore();
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
        toast.success(t(language, 'disconnectedFromOrigin', { origin }));
    };

    const handleDisconnectAll = async () => {
        setConnections([]);
        await setStorage(STORAGE_KEYS.DAPP_CONNECTIONS, []);
        toast.success(t(language, 'disconnectedFromAll'));
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
                    onClick={() => navigate('/settings')}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'connectedSitesTitle')}</h1>
                {connections.length > 0 ? (
                    <button
                        type="button"
                        onClick={handleDisconnectAll}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                    >
                        {t(language, 'disconnectAllBtn')}
                    </button>
                ) : (
                    <div className="w-8" />
                )}
            </div>

            {/* Content Body */}
            <div className="p-4 flex-1 overflow-y-auto scrollbar-thin space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        <div className="h-16 rounded-2xl bg-[#14161E] animate-pulse" />
                        <div className="h-16 rounded-2xl bg-[#14161E] animate-pulse" />
                    </div>
                ) : connections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-white/50 space-y-3">
                        <div className="w-14 h-14 rounded-full bg-[#14161E] border border-white/5 flex items-center justify-center text-white/30">
                            <GlobeIcon size={32} />
                        </div>
                        <p className="text-sm font-semibold text-white/70">{t(language, 'noConnectedSitesYet')}</p>
                        <p className="text-xs text-white/40 max-w-[260px] mx-auto leading-relaxed">
                            {t(language, 'noAuthorizedSitesDesc')}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {connections.map((conn) => {
                            const sec = checkOriginSecurity(conn.origin);
                            return (
                                <motion.div
                                    key={conn.origin}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="p-4 rounded-2xl bg-[#14161E] border border-white/5 hover:border-white/15 transition-all space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#1F2330] flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
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
                                                        <GlobeIcon size={18} className="text-indigo-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-xs text-white">
                                                            {conn.name || conn.origin}
                                                        </span>
                                                        {sec.isSafe ? (
                                                            <ShieldCheckIcon size={14} weight="fill" className="text-emerald-400" />
                                                        ) : (
                                                            <WarningCircleIcon size={14} weight="fill" className="text-amber-400" />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-white/40 font-mono truncate max-w-[180px] mt-0.5">
                                                        {conn.origin}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDisconnect(conn.origin)}
                                                className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors"
                                            >
                                                <TrashIcon size={15} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/40">
                                            <span>
                                                {t(language, 'authorizedAccountsCount', { count: conn.connectedAccounts?.length || 1 })}
                                            </span>
                                            <span className="font-mono text-[10px]">
                                                {new Date(conn.connectedAt).toLocaleDateString()}
                                            </span>
                                        </div>
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

