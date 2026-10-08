import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    Button,
    Input,
    Label,
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    MotionButton,
    Skeleton,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/ui';
import {
    ArrowsClockwiseIcon,
    ArrowUpRightIcon,
    ArrowDownLeftIcon,
    ArrowsLeftRightIcon,
    ClockCounterClockwiseIcon,
    CopyIcon,
    CheckIcon,
    GearSixIcon,
    PlusIcon,
    EyeIcon,
    EyeSlashIcon,
    CaretDownIcon,
    SparkleIcon,
} from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { toast } from 'sonner';
import { t } from '@utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useNativeBalanceQuery,
    useCustomTokensQuery,
    useAddCustomTokenMutation,
} from '@/services/queries';

export default function Dashboard() {
    const navigate = useNavigate();
    const { wallet, currentAccount, currentNetwork } = useWalletStore();
    const { language } = useSettingsStore();

    const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
    const [newTokenAddress, setNewTokenAddress] = useState('');
    const [copied, setCopied] = useState(false);
    const [hideBalance, setHideBalance] = useState(false);
    const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');
    const [isAddNftOpen, setIsAddNftOpen] = useState(false);
    const [newNftContract, setNewNftContract] = useState('');
    const [newNftId, setNewNftId] = useState('');
    const [newNftName, setNewNftName] = useState('');
    const [customNfts, setCustomNfts] = useState<Array<{ id: string; name: string; tokenId: string; contract: string; image?: string }>>(() => {
        try {
            return JSON.parse(localStorage.getItem('fist_nfts_' + currentNetwork.id) || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('fist_nfts_' + currentNetwork.id) || '[]');
            setCustomNfts(stored);
        } catch {
            setCustomNfts([]);
        }
    }, [currentNetwork.id]);

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';

    // TanStack Query for live native & custom token balances
    const {
        data: nativeData,
        isLoading: isNativeLoading,
        refetch: refetchNative,
        isRefetching,
    } = useNativeBalanceQuery(currentNetwork, currentAddress);

    const {
        data: customTokens = [],
        // isLoading: isTokensLoading,
        refetch: refetchTokens,
    } = useCustomTokensQuery(currentNetwork, currentAddress);

    const addTokenMutation = useAddCustomTokenMutation(currentNetwork, currentAddress);

    // Fiat estimation rates
    const usdRate = useMemo(() => {
        const rates: Record<string, number> = {
            ethereum: 2650.0,
            polygon: 0.41,
            bsc: 585.0,
            arbitrum: 2650.0,
            optimism: 2650.0,
            base: 2650.0,
            solana: 155.0,
            bitcoin: 65000.0,
        };
        return rates[currentNetwork.id] || 1.0;
    }, [currentNetwork.id]);

    const nativeBalanceFormatted = nativeData?.formatted || '0.00';
    const totalUsd = useMemo(() => {
        const nativeVal = parseFloat(nativeBalanceFormatted || '0') * usdRate;
        const customTokensVal = customTokens.reduce((acc, t) => {
            const isStable = ['USDT', 'USDC', 'DAI', 'BUSD'].includes(t.symbol.toUpperCase());
            return acc + (isStable ? parseFloat(t.formatted || '0') : 0);
        }, 0);
        return (nativeVal + customTokensVal).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [nativeBalanceFormatted, usdRate, customTokens]);

    const handleCopyAddress = async () => {
        if (!currentAddress) return;
        try {
            await navigator.clipboard.writeText(currentAddress);
            setCopied(true);
            toast.success(t(language, 'addressCopied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t(language, 'addressCopyFailed'));
        }
    };

    const handleRefreshAll = async () => {
        toast.promise(Promise.all([refetchNative(), refetchTokens()]), {
            loading: t(language, 'refreshBalancesLoading'),
            success: t(language, 'refreshBalancesSuccess'),
            error: t(language, 'refreshBalancesFailed'),
        });
    };

    const handleAddNftSubmit = () => {
        if (!newNftContract || !newNftId) return;
        const newEntry = {
            id: `${newNftContract}_${newNftId}`,
            name: newNftName.trim() || 'Custom Collectible',
            tokenId: newNftId.trim(),
            contract: newNftContract.trim(),
        };
        const updated = [...customNfts, newEntry];
        setCustomNfts(updated);
        localStorage.setItem('fist_nfts_' + currentNetwork.id, JSON.stringify(updated));
        setIsAddNftOpen(false);
        setNewNftContract('');
        setNewNftId('');
        setNewNftName('');
        toast.success(t(language, 'nftAddedToast'));
    };

    const handleAddTokenSubmit = async () => {
        if (!newTokenAddress) return;
        try {
            await addTokenMutation.mutateAsync(newTokenAddress);
            toast.success(t(language, 'customTokenAddedToast'));
            setIsAddTokenOpen(false);
            setNewTokenAddress('');
        } catch (err: any) {
            toast.error(err?.message || t(language, 'tokenDetectFailedToast'));
        }
    };

    if (!wallet || !currentAccount) {
        return null;
    }

    const shortAddress = currentAddress
        ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`
        : '0x...';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans select-none relative"
        >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#070A12]/90 backdrop-blur-md sticky top-0 z-20">
                {/* Account Selector Pill */}
                <button
                    type="button"
                    onClick={() => navigate('/wallets/manage')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14161E] hover:bg-[#1A1D26] active:opacity-80 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                        {currentAccount.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="max-w-[85px] truncate">{currentAccount.name}</span>
                    <CaretDownIcon size={12} className="text-neutral-400" />
                </button>

                {/* Network Pill Button */}
                <button
                    type="button"
                    onClick={() => navigate('/chains')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14161E] hover:bg-[#1A1D26] active:opacity-80 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <NetworkIcon
                        chainType={currentNetwork.chainType}
                        iconKey={currentNetwork.icon}
                        className="text-foreground"
                        size={14}
                    />
                    <span className="max-w-[90px] truncate">{currentNetwork.name}</span>
                    <CaretDownIcon size={12} className="text-neutral-400" />
                </button>

                {/* Action Shortcuts */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handleRefreshAll}
                        className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title={t(language, 'refreshBalancesTooltip')}
                    >
                        <ArrowsClockwiseIcon size={16} className={isRefetching ? 'animate-spin text-primary' : ''} />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title={t(language, 'settings')}
                    >
                        <GearSixIcon size={16} />
                    </button>
                </div>
            </div>

            {/* Main Scroll Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-4">
                {/* Hero Asset Card */}
                <div className="relative rounded-2xl border border-white/10 bg-[#14161E] p-5 shadow-sm">
                    {/* Top Row: Address Chip & Balance Privacy Toggle */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-white/80 hover:text-white transition-all cursor-pointer"
                        >
                            <span>{shortAddress}</span>
                            {copied ? (
                                <CheckIcon size={13} className="text-emerald-400" />
                            ) : (
                                <CopyIcon size={13} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setHideBalance(!hideBalance)}
                            className="p-1 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                            {hideBalance ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                    </div>

                    {/* Total Net Worth Balance */}
                    <div className="mt-4">
                        <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                            {t(language, 'totalAssetsUsd')}
                        </span>
                        <div className="text-3xl font-black tracking-tight mt-0.5 text-white flex items-baseline gap-2">
                            {isNativeLoading ? (
                                <Skeleton className="h-9 w-36 mt-1" />
                            ) : hideBalance ? (
                                <span className="font-mono text-2xl tracking-widest text-white/30">••••••••</span>
                            ) : (
                                <span>${totalUsd}</span>
                            )}
                        </div>

                        {/* Native Asset Quantity Subtitle */}
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                            {isNativeLoading ? (
                                <Skeleton className="h-4 w-24" />
                            ) : hideBalance ? (
                                <span>••• {currentNetwork.nativeCurrency.symbol}</span>
                            ) : (
                                <span>
                                    {nativeBalanceFormatted} {currentNetwork.nativeCurrency.symbol}
                                </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase font-mono text-white/60">
                                {currentNetwork.name}
                            </span>
                        </div>
                    </div>

                    {/* 4 OKX-Style Circular Quick Action Buttons */}
                    <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/5">
                        {[
                            {
                                id: 'send',
                                label: t(language, 'send'),
                                icon: <ArrowUpRightIcon size={20} className="text-indigo-400" />,
                                onClick: () => navigate('/send'),
                            },
                            {
                                id: 'receive',
                                label: t(language, 'receive'),
                                icon: <ArrowDownLeftIcon size={20} className="text-indigo-400" />,
                                onClick: () => navigate('/receive'),
                            },
                            {
                                id: 'swap',
                                label: t(language, 'swap'),
                                icon: <ArrowsLeftRightIcon size={20} className="text-indigo-400" />,
                                onClick: () => navigate('/swap'),
                            },
                            {
                                id: 'activity',
                                label: t(language, 'activityTab'),
                                icon: <ClockCounterClockwiseIcon size={20} className="text-indigo-400" />,
                                onClick: () => navigate('/activity'),
                            },
                        ].map((action) => (
                            <button
                                key={action.id}
                                type="button"
                                onClick={action.onClick}
                                className="flex flex-col items-center justify-center p-1 rounded-xl transition-opacity active:opacity-75 cursor-pointer group"
                            >
                                <div className="w-11 h-11 rounded-full bg-[#1F2330] group-hover:bg-[#252A3A] border border-white/10 group-hover:border-indigo-500/40 flex items-center justify-center transition-colors shadow-sm mb-1.5">
                                    {action.icon}
                                </div>
                                <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Segmented Asset Navigation Tabs */}
                <div className="flex items-center justify-between pt-1">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => {
                            if (val === 'activity') navigate('/activity');
                            else setActiveTab(val as 'tokens' | 'nfts');
                        }}
                    >
                        <TabsList className="h-8 bg-[#14161E] border border-white/10 p-0.5 rounded-xl">
                            <TabsTrigger value="tokens" className="px-3 py-1 text-xs">{t(language, 'tokensTab')}</TabsTrigger>
                            <TabsTrigger value="nfts" className="px-3 py-1 text-xs">{t(language, 'nftsTab')}</TabsTrigger>
                            <TabsTrigger value="activity" className="px-3 py-1 text-xs">{t(language, 'activityTab')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {currentNetwork.chainType === 'evm' && (
                        <button
                            type="button"
                            onClick={() => activeTab === 'nfts' ? setIsAddNftOpen(true) : setIsAddTokenOpen(true)}
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2.5 py-1 rounded-full bg-[#14161E] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                        >
                            <PlusIcon size={13} weight="bold" />
                            <span>{activeTab === 'nfts' ? t(language, 'addNft') : t(language, 'addToken')}</span>
                        </button>
                    )}
                </div>

                {/* Tokens List */}
                {activeTab === 'tokens' ? (
                <div className="space-y-2">
                    {/* Native Token Item */}
                    <div
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 hover:border-white/15 bg-[#14161E] hover:bg-[#1A1D26] active:opacity-85 transition-colors cursor-pointer shadow-sm"
                        onClick={() => navigate('/send')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1F2330] border border-white/10 flex items-center justify-center">
                                <NetworkIcon
                                    chainType={currentNetwork.chainType}
                                    iconKey={currentNetwork.icon}
                                    className="text-foreground"
                                    size={20}
                                />
                            </div>
                            <div>
                                <p className="font-bold text-sm leading-tight text-white">
                                    {currentNetwork.nativeCurrency.symbol}
                                </p>
                                <p className="text-xs text-neutral-400">{currentNetwork.nativeCurrency.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {isNativeLoading ? (
                                <Skeleton className="h-4 w-20 ml-auto mb-1" />
                            ) : (
                                <p className="font-bold text-sm text-white">
                                    {hideBalance ? '••••' : nativeBalanceFormatted} {currentNetwork.nativeCurrency.symbol}
                                </p>
                            )}
                            <p className="text-[11px] text-neutral-400 font-mono">
                                {hideBalance ? '••••' : `$${(parseFloat(nativeBalanceFormatted || '0') * usdRate).toFixed(2)}`}
                            </p>
                        </div>
                    </div>

                    {/* Custom Tokens Items */}
                    <AnimatePresence>
                        {customTokens.map((tok) => (
                            <motion.div
                                key={tok.address}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 hover:border-white/15 bg-[#14161E] hover:bg-[#1A1E2C] active:opacity-85 transition-colors cursor-pointer shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#1F2330] text-white border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
                                        {tok.symbol.slice(0, 3)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm leading-tight text-white">{tok.symbol}</p>
                                        <p className="text-[10px] text-neutral-400 font-mono">
                                            {tok.address.slice(0, 6)}...{tok.address.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-white">
                                        {hideBalance ? '••••' : tok.formatted} {tok.symbol}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                ) : (
                /* NFT Collectibles Gallery */
                <div className="space-y-3">
                    {customNfts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-white/50 bg-[#14161E] rounded-2xl border border-white/5 p-6">
                            <div className="w-12 h-12 rounded-full bg-[#1F2330] text-white/80 border border-white/10 flex items-center justify-center mb-2">
                                <SparkleIcon size={24} />
                            </div>
                            <p className="text-xs font-semibold text-white">{t(language, 'noNftsYet')}</p>
                            <p className="text-[11px] text-white/40 mt-0.5 max-w-[200px]">
                                {t(language, 'importNftDesc', { network: currentNetwork.name })}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddNftOpen(true)}
                                className="mt-3 text-xs gap-1 border-white/10 bg-[#1F2330] hover:bg-[#252A3A] text-white"
                            >
                                <PlusIcon size={13} />
                                <span>{t(language, 'importNftAction')}</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                            {customNfts.map((nft) => (
                                <div
                                    key={nft.id}
                                    className="rounded-xl border border-border/60 bg-card/60 p-2.5 flex flex-col space-y-2 overflow-hidden hover:border-indigo-500/40 active:opacity-85 transition-colors shadow-sm cursor-pointer"
                                >
                                    <div className="w-full aspect-square rounded-lg bg-[#1F2330] border border-white/10 flex items-center justify-center relative overflow-hidden">
                                        <SparkleIcon size={32} className="text-indigo-400/70 animate-pulse" />
                                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-white font-semibold">
                                            #{nft.tokenId}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-xs text-foreground truncate">{nft.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                                            {nft.contract.slice(0, 6)}...{nft.contract.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Import NFT Modal */}
            <AlertDialog open={isAddNftOpen} onOpenChange={setIsAddNftOpen}>
                <AlertDialogContent className="glass-card border-border/80 max-w-sm rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <SparkleIcon size={18} className="text-primary" />
                            {t(language, 'importCollectibleNft')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            {t(language, 'importCollectibleDesc', { network: currentNetwork.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2 space-y-2.5">
                        <div>
                            <Label className="text-xs font-medium">{t(language, 'contractAddress')}</Label>
                            <Input
                                value={newNftContract}
                                onChange={(e) => setNewNftContract(e.target.value)}
                                placeholder="0x..."
                                className="font-mono text-xs mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs font-medium">{t(language, 'tokenId')}</Label>
                                <Input
                                    value={newNftId}
                                    onChange={(e) => setNewNftId(e.target.value)}
                                    placeholder="e.g. 1"
                                    className="font-mono text-xs mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-medium">{t(language, 'nameOptional')}</Label>
                                <Input
                                    value={newNftName}
                                    onChange={(e) => setNewNftName(e.target.value)}
                                    placeholder="e.g. Genesis Ape"
                                    className="text-xs mt-1"
                                />
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsAddNftOpen(false)}
                            className="flex-1"
                        >
                            {t(language, 'cancel')}
                        </Button>
                        <MotionButton
                            onClick={handleAddNftSubmit}
                            disabled={!newNftContract || !newNftId}
                            className="flex-1"
                        >
                            {t(language, 'importNftAction')}
                        </MotionButton>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Custom Token Modal */}
            <AlertDialog open={isAddTokenOpen} onOpenChange={setIsAddTokenOpen}>
                <AlertDialogContent className="glass-card border-border/80 max-w-sm rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <SparkleIcon size={18} className="text-primary" />
                            {t(language, 'addCustomTokenModalTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            {t(language, 'addCustomTokenModalDesc', { network: currentNetwork.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2 space-y-2">
                        <Label className="text-xs font-medium">{t(language, 'contractAddress')}</Label>
                        <Input
                            value={newTokenAddress}
                            onChange={(e) => setNewTokenAddress(e.target.value)}
                            placeholder="0x..."
                            className="font-mono text-xs"
                        />
                    </div>
                    <AlertDialogFooter className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsAddTokenOpen(false)}
                            className="flex-1"
                        >
                            {t(language, 'cancel')}
                        </Button>
                        <MotionButton
                            onClick={handleAddTokenSubmit}
                            disabled={!newTokenAddress || addTokenMutation.isPending}
                            className="flex-1"
                        >
                            {addTokenMutation.isPending ? t(language, 'detectingToken') : t(language, 'addAsset')}
                        </MotionButton>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
