import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';
import { getSupportedNetworksForAccount } from '@core/networks';
import { ArrowLeftIcon, CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChainSelect() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork, switchNetwork } = useWalletStore();
    const { language } = useSettingsStore();
    const [search, setSearch] = useState('');

    if (!currentAccount) return null;

    const supportedNetworks = getSupportedNetworksForAccount(currentAccount);

    const filteredNetworks = useMemo(() => {
        if (!search.trim()) return supportedNetworks;
        const q = search.toLowerCase();
        return supportedNetworks.filter(
            (n) => n.name.toLowerCase().includes(q) || n.chainType.toLowerCase().includes(q) || n.nativeCurrency.symbol.toLowerCase().includes(q)
        );
    }, [supportedNetworks, search]);

    const handleSelect = (networkId: string) => {
        switchNetwork(networkId);
        navigate(-1);
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
                <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'selectMainnetTitle')}</h1>
                <div className="w-8" />
            </div>

            {/* Rectangular Search Bar */}
            <div className="p-4 pb-2">
                <div className="relative">
                    <MagnifyingGlassIcon
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t(language, 'searchNetworkPlaceholder')}
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0A0D14] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Networks List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
                <AnimatePresence>
                    {filteredNetworks.map((network) => {
                        const isSelected = currentNetwork.id === network.id;

                        return (
                            <div
                                key={network.id}
                                onClick={() => handleSelect(network.id)}
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:opacity-85 cursor-pointer ${
                                    isSelected
                                        ? 'border-indigo-500/60 bg-[#14161E] shadow-lg shadow-indigo-500/5'
                                        : 'border-white/10 bg-[#14161E] hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#1F2330] flex items-center justify-center border border-white/10 relative">
                                        <NetworkIcon
                                            chainType={network.chainType}
                                            iconKey={network.icon}
                                            size={20}
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#14161E]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-xs leading-tight text-white">
                                            {network.name}
                                        </p>
                                        <p className="text-[10px] text-white/40 uppercase font-mono mt-0.5">
                                            {network.nativeCurrency.symbol} • {network.chainType}
                                        </p>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                                        <CheckIcon size={14} weight="bold" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

