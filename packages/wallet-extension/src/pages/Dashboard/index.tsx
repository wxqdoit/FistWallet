import { useState, useMemo } from 'react';
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
    GlassCard,
    MotionButton,
    Skeleton,
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
            loading: 'Refreshing balances...',
            success: 'Balances updated',
            error: 'Failed to refresh balances',
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
        toast.success('NFT added to your gallery!');
    };

    const handleAddTokenSubmit = async () => {
        if (!newTokenAddress) return;
        try {
            await addTokenMutation.mutateAsync(newTokenAddress);
            toast.success('Custom token added to your asset list');
            setIsAddTokenOpen(false);
            setNewTokenAddress('');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to add token');
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full flex flex-col bg-background text-foreground"
        >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 backdrop-blur-md">
                {/* Account Selector Pill */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/wallets/manage')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary border border-border/50 text-xs font-medium transition-colors"
                >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {currentAccount.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate">{currentAccount.name}</span>
                    <CaretDownIcon size={12} className="text-muted-foreground" />
                </motion.button>

                {/* Network Pill Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/chains')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-button text-xs font-medium text-foreground transition-all hover:border-primary/40"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    <NetworkIcon
                        chainType={currentNetwork.chainType}
                        iconKey={currentNetwork.icon}
                        className="text-foreground"
                        size={14}
                    />
                    <span className="max-w-[95px] truncate">{currentNetwork.name}</span>
                    <CaretDownIcon size={12} className="text-muted-foreground" />
                </motion.button>

                {/* Action Shortcuts */}
                <div className="flex items-center gap-1">
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleRefreshAll}
                        className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        title="Refresh Balances"
                    >
                        <ArrowsClockwiseIcon size={18} className={isRefetching ? 'animate-spin' : ''} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => navigate('/settings')}
                        className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        title="Settings"
                    >
                        <GearSixIcon size={18} />
                    </motion.button>
                </div>
            </div>

            {/* Main Scroll Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-4">
                {/* Hero Asset Card */}
                <GlassCard className="relative overflow-hidden glow-card border-border/60 bg-gradient-to-br from-card/90 via-card/70 to-card/50">
                    {/* Background Ambient Glow */}
                    <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Address Chip */}
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCopyAddress}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span>{shortAddress}</span>
                            {copied ? (
                                <CheckIcon size={13} className="text-success" />
                            ) : (
                                <CopyIcon size={13} />
                            )}
                        </motion.button>

                        {/* Balance Privacy Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setHideBalance(!hideBalance)}
                            className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {hideBalance ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                        </motion.button>
                    </div>

                    {/* Total USD Balance */}
                    <div className="mt-3">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Total Net Worth
                        </span>
                        <div className="text-3xl font-extrabold tracking-tight mt-0.5 text-foreground flex items-baseline gap-2">
                            {isNativeLoading ? (
                                <Skeleton className="h-9 w-36 mt-1" />
                            ) : hideBalance ? (
                                <span className="font-mono text-2xl tracking-widest text-muted-foreground">••••••••</span>
                            ) : (
                                <span>${totalUsd}</span>
                            )}
                        </div>

                        {/* Native Asset Quantity Subtitle */}
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            {isNativeLoading ? (
                                <Skeleton className="h-4 w-24" />
                            ) : hideBalance ? (
                                <span>••• {currentNetwork.nativeCurrency.symbol}</span>
                            ) : (
                                <span>
                                    {nativeBalanceFormatted} {currentNetwork.nativeCurrency.symbol}
                                </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase font-mono">
                                {currentNetwork.name}
                            </span>
                        </div>
                    </div>

                    {/* 4 Interactive Action Buttons */}
                    <div className="grid grid-cols-4 gap-2 mt-5 pt-3 border-t border-white/5">
                        {[
                            {
                                id: 'send',
                                label: t(language, 'send'),
                                icon: <ArrowUpRightIcon size={18} className="text-indigo-400" />,
                                onClick: () => navigate('/send'),
                            },
                            {
                                id: 'receive',
                                label: t(language, 'receive'),
                                icon: <ArrowDownLeftIcon size={18} className="text-emerald-400" />,
                                onClick: () => navigate('/receive'),
                            },
                            {
                                id: 'swap',
                                label: t(language, 'swap'),
                                icon: <ArrowsLeftRightIcon size={18} className="text-purple-400" />,
                                onClick: () => navigate('/swap'),
                            },
                            {
                                id: 'activity',
                                label: 'History',
                                icon: <ClockCounterClockwiseIcon size={18} className="text-sky-400" />,
                                onClick: () => navigate('/activity'),
                            },
                        ].map((action) => (
                            <motion.button
                                key={action.id}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={action.onClick}
                                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all shadow-sm group"
                            >
                                <div className="p-2 rounded-full bg-white/[0.06] group-hover:bg-white/[0.12] transition-colors mb-1.5">
                                    {action.icon}
                                </div>
                                <span className="text-[11px] font-medium text-foreground/90">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </GlassCard>

                {/* Asset Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <div className="flex items-center gap-4">
                        {[
                            { id: 'tokens', label: 'Tokens' },
                            { id: 'nfts', label: 'NFTs' },
                            { id: 'activity', label: 'Activity' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'activity') navigate('/activity');
                                    else setActiveTab('tokens');
                                }}
                                className={`relative py-1.5 text-xs font-semibold transition-colors ${
                                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {currentNetwork.chainType === 'evm' && (
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => activeTab === 'nfts' ? setIsAddNftOpen(true) : setIsAddTokenOpen(true)}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded-md hover:bg-primary/10 transition-colors"
                        >
                            <PlusIcon size={14} />
                            <span>{activeTab === 'nfts' ? 'Import NFT' : t(language, 'addToken')}</span>
                        </motion.button>
                    )}
                </div>

                {/* Tokens List */}
                {activeTab === 'tokens' ? (
                <div className="space-y-2">
                    {/* Native Token Item */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card/60 hover:bg-card/90 transition-all cursor-pointer"
                        onClick={() => navigate('/send')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <NetworkIcon
                                    chainType={currentNetwork.chainType}
                                    iconKey={currentNetwork.icon}
                                    className="text-foreground"
                                    size={20}
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-sm leading-tight text-foreground">
                                    {currentNetwork.nativeCurrency.symbol}
                                </p>
                                <p className="text-xs text-muted-foreground">{currentNetwork.nativeCurrency.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {isNativeLoading ? (
                                <Skeleton className="h-4 w-20 ml-auto mb-1" />
                            ) : (
                                <p className="font-semibold text-sm text-foreground">
                                    {hideBalance ? '••••' : nativeBalanceFormatted} {currentNetwork.nativeCurrency.symbol}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground font-mono">
                                {hideBalance ? '••••' : `$${(parseFloat(nativeBalanceFormatted || '0') * usdRate).toFixed(2)}`}
                            </p>
                        </div>
                    </motion.div>

                    {/* Custom Tokens Items */}
                    <AnimatePresence>
                        {customTokens.map((tok) => (
                            <motion.div
                                key={tok.address}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                whileHover={{ scale: 1.01 }}
                                className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs uppercase">
                                        {tok.symbol.slice(0, 3)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm leading-tight text-foreground">{tok.symbol}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            {tok.address.slice(0, 6)}...{tok.address.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-sm text-foreground">
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
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border/60 p-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                                <SparkleIcon size={24} />
                            </div>
                            <p className="text-xs font-semibold text-foreground">No Collectibles Found</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
                                Import your favorite digital collectibles on {currentNetwork.name}.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddNftOpen(true)}
                                className="mt-3 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                            >
                                <PlusIcon size={13} />
                                <span>Import NFT</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                            {customNfts.map((nft) => (
                                <motion.div
                                    key={nft.id}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="rounded-xl border border-border/60 bg-card/60 p-2.5 flex flex-col space-y-2 overflow-hidden hover:border-primary/40 transition-colors shadow-sm"
                                >
                                    <div className="w-full aspect-square rounded-lg bg-gradient-to-tr from-indigo-500/20 via-purple-500/30 to-pink-500/20 border border-white/5 flex items-center justify-center relative overflow-hidden">
                                        <SparkleIcon size={32} className="text-primary/70 animate-pulse" />
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
                                </motion.div>
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
                            Import Collectible (NFT)
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            Enter the ERC-721 or ERC-1155 contract address and token ID on {currentNetwork.name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2 space-y-2.5">
                        <div>
                            <Label className="text-xs font-medium">Contract Address</Label>
                            <Input
                                value={newNftContract}
                                onChange={(e) => setNewNftContract(e.target.value)}
                                placeholder="0x..."
                                className="font-mono text-xs mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs font-medium">Token ID</Label>
                                <Input
                                    value={newNftId}
                                    onChange={(e) => setNewNftId(e.target.value)}
                                    placeholder="e.g. 1"
                                    className="font-mono text-xs mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-medium">Name (Optional)</Label>
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
                            Cancel
                        </Button>
                        <MotionButton
                            onClick={handleAddNftSubmit}
                            disabled={!newNftContract || !newNftId}
                            className="flex-1"
                        >
                            Import
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
                            Add Custom Token
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            Enter the ERC-20 contract address on {currentNetwork.name}. FistWallet will query the decimals and balance automatically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2 space-y-2">
                        <Label className="text-xs font-medium">Contract Address</Label>
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
                            Cancel
                        </Button>
                        <MotionButton
                            onClick={handleAddTokenSubmit}
                            disabled={!newTokenAddress || addTokenMutation.isPending}
                            className="flex-1"
                        >
                            {addTokenMutation.isPending ? 'Detecting...' : 'Add Asset'}
                        </MotionButton>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
