import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';
import {
    ArrowLeftIcon,
    ArrowsDownUpIcon,
    CheckCircleIcon,
    SparkleIcon,
    SlidersHorizontalIcon,
} from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { useNativeBalanceQuery, useCustomTokensQuery } from '@/services/queries';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { language } = useSettingsStore();

    const [fromAmount, setFromAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5');
    const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapSuccess, setSwapSuccess] = useState(false);
    const [isReversed, setIsReversed] = useState(false);
    const [showSlippageModal, setShowSlippageModal] = useState(false);

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';
    const { data: balanceData } = useNativeBalanceQuery(currentNetwork, currentAddress);
    const { data: customTokens = [] } = useCustomTokensQuery(currentNetwork, currentAddress);
    const balanceFormatted = balanceData?.formatted || '0.00';

    const availableTokens = TOKEN_PAIRS[currentNetwork.id] || TOKEN_PAIRS.default;
    const currentTargetToken = availableTokens[selectedTokenIdx] || availableTokens[0];

    const tokenItem = customTokens.find(
        (t) => t.symbol.toUpperCase() === currentTargetToken.symbol.toUpperCase()
    );
    const paySymbol = isReversed ? currentTargetToken.symbol : currentNetwork.nativeCurrency.symbol;
    const payBalance = isReversed ? (tokenItem?.formatted || '0.00') : balanceFormatted;
    const receiveSymbol = isReversed ? currentNetwork.nativeCurrency.symbol : currentTargetToken.symbol;

    const toAmount = useMemo(() => {
        const val = parseFloat(fromAmount);
        if (isNaN(val) || val <= 0) return '';
        if (isReversed) {
            const est = val / currentTargetToken.ratePerNative;
            return est.toFixed(6);
        } else {
            const est = val * currentTargetToken.ratePerNative;
            return est.toFixed(4);
        }
    }, [fromAmount, currentTargetToken.ratePerNative, isReversed]);

    const handleFlip = () => {
        setIsReversed((prev) => !prev);
        setFromAmount('');
        toast.info(t(language, 'swapDirectionSwitched'));
    };

    const handleMax = () => {
        const cleanBalance = parseFloat(payBalance) || 0;
        if (cleanBalance <= 0) return;
        const maxVal = isReversed
            ? cleanBalance.toString()
            : Math.max(0, cleanBalance - 0.005).toFixed(4);
        setFromAmount(maxVal);
    };

    const handleExecuteSwap = async () => {
        const val = parseFloat(fromAmount);
        if (isNaN(val) || val <= 0) return;
        setIsSwapping(true);
        const toastId = toast.loading(t(language, 'findingBestRoute'));

        try {
            await new Promise((r) => setTimeout(r, 1600));
            setIsSwapping(false);
            setSwapSuccess(true);
            toast.success(
                t(language, 'swapSuccessToast', {
                    fromAmount,
                    fromSymbol: paySymbol,
                    toAmount,
                    toSymbol: receiveSymbol,
                }),
                {
                    id: toastId,
                }
            );

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch {
            setIsSwapping(false);
            toast.error(t(language, 'swapFailedToast'), { id: toastId });
        }
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
                <div className="flex items-center gap-1.5">
                    <SparkleIcon size={16} className="text-indigo-400" weight="fill" />
                    <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'instantSwapTitle')}</h1>
                </div>
                <button
                    type="button"
                    onClick={() => setShowSlippageModal(!showSlippageModal)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        showSlippageModal
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                            : 'bg-white/[0.04] border-white/10 hover:border-white/20 text-white/70 hover:text-white'
                    }`}
                >
                    <SlidersHorizontalIcon size={15} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 p-4 space-y-2.5 overflow-y-auto scrollbar-thin">
                {/* Pay Card */}
                <div className="p-4 rounded-2xl bg-[#14161E] border border-white/10 shadow-sm space-y-2.5 focus-within:border-indigo-500/40 transition-colors">
                    <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="font-medium">{t(language, 'payAmountLabel')}</span>
                        <div className="flex items-center gap-2">
                            <span>{t(language, 'balanceText', { balance: payBalance, symbol: paySymbol })}</span>
                            <button
                                type="button"
                                onClick={handleMax}
                                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                {t(language, 'maxSendableLabel')}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full text-2xl font-bold bg-transparent text-white placeholder:text-neutral-600 focus:outline-none font-mono"
                        />

                        {isReversed ? (
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F2330] border border-white/10 shrink-0 text-white">
                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                                    {currentTargetToken.symbol.slice(0, 1)}
                                </div>
                                <span className="font-bold text-xs">{currentTargetToken.symbol}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F2330] border border-white/10 shrink-0 text-white">
                                <NetworkIcon
                                    chainType={currentNetwork.chainType}
                                    iconKey={currentNetwork.icon}
                                    size={18}
                                />
                                <span className="font-bold text-xs">{currentNetwork.nativeCurrency.symbol}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Flip Button Divider */}
                <div className="relative flex justify-center my-[-10px] z-10">
                    <button
                        type="button"
                        onClick={handleFlip}
                        className="w-9 h-9 rounded-full bg-[#1F2330] hover:bg-[#252A3A] active:opacity-80 border border-white/10 hover:border-indigo-500/50 shadow-lg text-indigo-400 hover:text-indigo-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <ArrowsDownUpIcon size={16} weight="bold" />
                    </button>
                </div>

                {/* Receive Card */}
                <div className="p-4 rounded-2xl bg-[#14161E] border border-white/10 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="font-medium">{t(language, 'receiveAmountLabel')}</span>
                        <div className="flex items-center gap-1.5">
                            {availableTokens.map((t, idx) => (
                                <button
                                    key={t.symbol}
                                    type="button"
                                    onClick={() => setSelectedTokenIdx(idx)}
                                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all ${
                                        selectedTokenIdx === idx
                                            ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                            : 'bg-[#1F2330] text-white/60 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {t.symbol}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="text-2xl font-bold text-white font-mono">
                            {toAmount || '0.00'}
                        </div>

                        {isReversed ? (
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F2330] border border-white/10 shrink-0 text-white">
                                <NetworkIcon
                                    chainType={currentNetwork.chainType}
                                    iconKey={currentNetwork.icon}
                                    size={18}
                                />
                                <span className="font-bold text-xs">{currentNetwork.nativeCurrency.symbol}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F2330] border border-white/10 shrink-0 text-white">
                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                                    {currentTargetToken.symbol.slice(0, 1)}
                                </div>
                                <span className="font-bold text-xs">{currentTargetToken.symbol}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Slippage Dropdown Panel */}
                <AnimatePresence>
                    {showSlippageModal && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3.5 rounded-2xl bg-[#14161E] border border-white/10 space-y-2">
                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>{t(language, 'slippageTolerance')}</span>
                                    <span className="font-semibold text-indigo-400">{slippage}%</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {['0.1', '0.5', '1.0', '2.0'].map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setSlippage(val)}
                                            className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                slippage === val
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'bg-[#1F2330] text-white/60 hover:text-white border border-white/5'
                                            }`}
                                        >
                                            {val}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rate Info Breakdown Card */}
                {fromAmount && parseFloat(fromAmount) > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#14161E] border border-white/5 text-xs space-y-2 text-white/60">
                        <div className="flex justify-between items-center">
                            <span>{t(language, 'swapRateLabel')}</span>
                            <span className="font-mono text-white/90">
                                {isReversed
                                    ? `1 ${currentTargetToken.symbol} ≈ ${(1 / currentTargetToken.ratePerNative).toFixed(6)} ${currentNetwork.nativeCurrency.symbol}`
                                    : `1 ${currentNetwork.nativeCurrency.symbol} ≈ ${currentTargetToken.ratePerNative} ${currentTargetToken.symbol}`}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{t(language, 'smartAggregatorRoute')}</span>
                            <span className="text-indigo-400 font-medium">{t(language, 'fistAggregatorRoute')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{t(language, 'estimatedSlippage')}</span>
                            <span className="text-emerald-400 font-medium">&lt; 0.05%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{t(language, 'estimatedNetworkFee')}</span>
                            <span className="font-mono text-white/80">~0.0008 {currentNetwork.nativeCurrency.symbol}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Capsule Action */}
            <div className="p-4 border-t border-white/5 bg-[#070A12]/90 backdrop-blur-md">
                <button
                    type="button"
                    onClick={handleExecuteSwap}
                    disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
                    className="w-full h-12 rounded-full font-bold text-[15px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isSwapping ? (
                        <span>{t(language, 'executingSwap')}</span>
                    ) : swapSuccess ? (
                        <>
                            <CheckCircleIcon size={20} weight="fill" className="text-white" />
                            <span>{t(language, 'swapSuccess')}</span>
                        </>
                    ) : (
                        <>
                            <SparkleIcon size={18} weight="fill" className="text-white" />
                            <span>{t(language, 'swapNow')}</span>
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}

