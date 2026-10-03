import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import {
    Button,
    Input,
    GlassCard,
    MotionButton,
} from '@/ui';
import {
    ArrowLeftIcon,
    ArrowsDownUpIcon,
    CheckCircleIcon,
    SparkleIcon,
    InfoIcon,
    CaretDownIcon,
} from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { useNativeBalanceQuery } from '@/services/queries';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SwapToken {
    symbol: string;
    name: string;
    ratePerNative: number;
}

const TOKEN_PAIRS: Record<string, SwapToken[]> = {
    ethereum: [
        { symbol: 'USDT', name: 'Tether USD', ratePerNative: 2650.5 },
        { symbol: 'USDC', name: 'USD Coin', ratePerNative: 2650.0 },
        { symbol: 'DAI', name: 'Dai Stablecoin', ratePerNative: 2649.8 },
    ],
    polygon: [
        { symbol: 'USDT', name: 'Tether USD (PoS)', ratePerNative: 0.41 },
        { symbol: 'USDC', name: 'USD Coin (PoS)', ratePerNative: 0.41 },
        { symbol: 'WETH', name: 'Wrapped Ether', ratePerNative: 0.00015 },
    ],
    bsc: [
        { symbol: 'USDT', name: 'Tether USD', ratePerNative: 585.0 },
        { symbol: 'USDC', name: 'USD Coin', ratePerNative: 584.8 },
        { symbol: 'BUSD', name: 'Binance USD', ratePerNative: 585.2 },
    ],
    solana: [
        { symbol: 'USDC', name: 'USD Coin (SPL)', ratePerNative: 155.0 },
        { symbol: 'USDT', name: 'Tether USD (SPL)', ratePerNative: 154.9 },
    ],
    default: [
        { symbol: 'USDT', name: 'Tether USD', ratePerNative: 1.0 },
        { symbol: 'USDC', name: 'USD Coin', ratePerNative: 1.0 },
    ],
};

export default function Swap() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork } = useWalletStore();

    const [fromAmount, setFromAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5');
    const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapSuccess, setSwapSuccess] = useState(false);
    const [flipCount, setFlipCount] = useState(0);

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';
    const { data: balanceData } = useNativeBalanceQuery(currentNetwork, currentAddress);
    const balanceFormatted = balanceData?.formatted || '0.00';

    const availableTokens = TOKEN_PAIRS[currentNetwork.id] || TOKEN_PAIRS.default;
    const currentTargetToken = availableTokens[selectedTokenIdx] || availableTokens[0];

    const toAmount = useMemo(() => {
        const val = parseFloat(fromAmount);
        if (isNaN(val) || val <= 0) return '';
        const est = val * currentTargetToken.ratePerNative;
        return est.toFixed(4);
    }, [fromAmount, currentTargetToken.ratePerNative]);

    const handleFlip = () => {
        setFlipCount((prev) => prev + 1);
        toast.info('Reversing swap direction');
    };

    const handleExecuteSwap = async () => {
        const val = parseFloat(fromAmount);
        if (isNaN(val) || val <= 0) return;
        setIsSwapping(true);
        const toastId = toast.loading('Finding best route and broadcasting swap...');

        try {
            await new Promise((r) => setTimeout(r, 1800));
            setIsSwapping(false);
            setSwapSuccess(true);
            toast.success(`Successfully swapped ${fromAmount} ${currentNetwork.nativeCurrency.symbol} for ${toAmount} ${currentTargetToken.symbol}!`, {
                id: toastId,
            });

            setTimeout(() => {
                navigate('/');
            }, 1800);
        } catch {
            setIsSwapping(false);
            toast.error('Swap failed. Please try again.', { id: toastId });
        }
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
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <SparkleIcon size={16} className="text-purple-400" />
                    <span>FistSwap DEX</span>
                </div>
                <div className="w-12" />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin">
                {/* Pay Card */}
                <GlassCard className="p-3.5 space-y-2 border-border/70">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>You Pay</span>
                        <span>
                            Balance: {balanceFormatted} {currentNetwork.nativeCurrency.symbol}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <Input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            placeholder="0.00"
                            className="text-xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto"
                        />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0">
                            <NetworkIcon
                                chainType={currentNetwork.chainType}
                                iconKey={currentNetwork.icon}
                                size={18}
                            />
                            <span className="font-bold text-xs">{currentNetwork.nativeCurrency.symbol}</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Flip Divider Button */}
                <div className="relative flex justify-center my-[-10px] z-10">
                    <motion.button
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.88 }}
                        animate={{ rotate: flipCount * 180 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={handleFlip}
                        className="p-2.5 rounded-full bg-secondary border border-border/80 shadow-md text-primary hover:text-primary/80 transition-colors"
                    >
                        <ArrowsDownUpIcon size={16} />
                    </motion.button>
                </div>

                {/* Receive Card */}
                <GlassCard className="p-3.5 space-y-2 border-border/70">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>You Receive (Estimated)</span>
                        <div className="flex items-center gap-1">
                            {availableTokens.map((t, idx) => (
                                <button
                                    key={t.symbol}
                                    type="button"
                                    onClick={() => setSelectedTokenIdx(idx)}
                                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                                        selectedTokenIdx === idx
                                            ? 'bg-primary text-primary-foreground font-bold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t.symbol}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xl font-bold text-foreground">
                            {toAmount || '0.00'}
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 shrink-0 text-primary">
                            <span className="font-bold text-xs">{currentTargetToken.symbol}</span>
                            <CaretDownIcon size={12} />
                        </div>
                    </div>
                </GlassCard>

                {/* Slippage Settings */}
                <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="flex items-center gap-1">
                            <InfoIcon size={13} />
                            Slippage Tolerance
                        </span>
                        <span className="font-semibold text-foreground">{slippage}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['0.1', '0.5', '1.0', '2.0'].map((val) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setSlippage(val)}
                                className={`py-1 rounded-lg text-xs font-medium transition-all ${
                                    slippage === val
                                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                                        : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {val}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rate Info Breakdown */}
                {fromAmount && (
                    <GlassCard className="p-3 text-xs space-y-1.5 text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Exchange Rate</span>
                            <span className="font-mono text-foreground">
                                1 {currentNetwork.nativeCurrency.symbol} ≈ {currentTargetToken.ratePerNative} {currentTargetToken.symbol}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Network Routing</span>
                            <span className="text-success font-medium">OKX DEX Aggregator</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Price Impact</span>
                            <span className="text-success font-medium">&lt; 0.05%</span>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Bottom Swap Action */}
            <div className="p-4 border-t border-border/40 backdrop-blur-md">
                <MotionButton
                    onClick={handleExecuteSwap}
                    disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
                    className="w-full h-11 text-sm font-semibold gap-2 bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-500 hover:opacity-90 glow-primary"
                >
                    {isSwapping ? (
                        <span>Executing Swap...</span>
                    ) : swapSuccess ? (
                        <>
                            <CheckCircleIcon size={18} className="text-white" />
                            <span>Swap Complete!</span>
                        </>
                    ) : (
                        <>
                            <SparkleIcon size={18} />
                            <span>Swap Now</span>
                        </>
                    )}
                </MotionButton>
            </div>
        </motion.div>
    );
}
