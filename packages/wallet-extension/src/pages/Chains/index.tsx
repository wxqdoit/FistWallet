import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { getSupportedNetworksForAccount } from '@core/networks';
import { Button, Input } from '@/ui';
import { ArrowLeftIcon, CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { t } from '@utils/i18n';
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
                <h2 className="text-sm font-semibold">{t(language, 'selectChain')}</h2>
                <div className="w-12" />
            </div>

            {/* Search Input */}
            <div className="p-4 pb-2">
                <div className="relative">
                    <MagnifyingGlassIcon
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search networks by name or symbol..."
                        className="pl-9 text-xs"
                    />
                </div>
            </div>

            {/* Networks List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                <AnimatePresence>
                    {filteredNetworks.map((network) => {
                        const isSelected = currentNetwork.id === network.id;

                        return (
                            <motion.div
                                key={network.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(network.id)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-primary/60 bg-primary/10 shadow-sm'
                                        : 'border-border/50 bg-card/40 hover:bg-card/80'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border/60">
                                        <NetworkIcon
                                            chainType={network.chainType}
                                            iconKey={network.icon}
                                            size={18}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-xs leading-tight text-foreground">
                                            {network.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">
                                            {network.nativeCurrency.symbol} • {network.chainType}
                                        </p>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                        <CheckIcon size={12} weight="bold" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
