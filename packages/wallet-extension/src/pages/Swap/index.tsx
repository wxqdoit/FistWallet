import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import {
    ArrowLeftIcon,
    SlidersHorizontalIcon,
    ArrowsDownUpIcon,
    CaretDownIcon,
    ShieldCheckIcon,
    XIcon,
} from '@phosphor-icons/react';
import { useNativeBalanceQuery } from '@/services/queries';
import { CryptoIcon } from '@/components/CryptoIcon';
import { BottomDock } from '@/components/BottomDock';
import { TokenSelectorModal, DEFAULT_TOKENS, type TokenItem } from '@/components/TokenSelectorModal';
import { toast } from 'sonner';

export default function Swap() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork } = useWalletStore();

    const [payToken, setPayToken] = useState<TokenItem>(DEFAULT_TOKENS[0]); // ETH
    const [receiveToken, setReceiveToken] = useState<TokenItem>(DEFAULT_TOKENS[1]); // USDT
    const [fromAmount, setFromAmount] = useState('1.5');
    const [slippage, setSlippage] = useState('0.5');
    const [isSwapping, setIsSwapping] = useState(false);
    const [showSlippageModal, setShowSlippageModal] = useState(false);
    const [isPaySelectorOpen, setIsPaySelectorOpen] = useState(false);
    const [isReceiveSelectorOpen, setIsReceiveSelectorOpen] = useState(false);

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';
    const { data: balanceData } = useNativeBalanceQuery(currentNetwork, currentAddress);
    const nativeBalanceFormatted = balanceData?.formatted || '4.25';

    const payBalance = payToken.symbol === currentNetwork.nativeCurrency.symbol ? nativeBalanceFormatted : payToken.balance;
    const numFrom = parseFloat(fromAmount) || 0;

    // Derived Rate
    const exchangeRate = useMemo(() => {
        if (!receiveToken.price || receiveToken.price <= 0) return 1;
        return payToken.price / receiveToken.price;
    }, [payToken.price, receiveToken.price]);

    const toAmount = useMemo(() => {
        if (numFrom <= 0) return '0.00';
        const calc = numFrom * exchangeRate * 0.9985; // 0.15% fee
        if (calc >= 100) return calc.toFixed(2);
        if (calc >= 1) return calc.toFixed(4);
        return calc.toFixed(6);
    }, [numFrom, exchangeRate]);

    const payUsd = (numFrom * payToken.price).toFixed(2);
    const receiveUsd = (parseFloat(toAmount || '0') * receiveToken.price).toFixed(2);

    const handleFlip = () => {
        const temp = payToken;
        setPayToken(receiveToken);
        setReceiveToken(temp);
    };

    const handleSetPercentage = (pct: number) => {
        const balNum = parseFloat(payBalance) || 0;
        setFromAmount((balNum * pct).toFixed(4));
    };

    const handleExecuteSwap = async () => {
        if (numFrom <= 0) return;
        setIsSwapping(true);
        const toastId = toast.loading('Routing through FistAggregator...');

        try {
            await new Promise((resolve) => setTimeout(resolve, 1400));
            toast.success(
                `Swapped ${fromAmount} ${payToken.symbol} for ${toAmount} ${receiveToken.symbol}!`,
                { id: toastId }
            );
            navigate('/activity');
        } catch {
            toast.error('Swap execution failed', { id: toastId });
        } finally {
            setIsSwapping(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col justify-between bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans select-none relative">
            {/* Header */}
            <div className="h-[52px] px-3.5 flex items-center justify-between border-b border-[#1D263B] bg-[#0A0E18]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#CBD5E1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} />
                </button>

                <div className="text-center">
                    <h1 className="text-sm font-bold text-white tracking-tight">Token Swap</h1>
                    <p className="text-[10px] text-[#64748B] font-mono">FistAggregator Engine</p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowSlippageModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-xs font-bold text-[#E2E8F0] cursor-pointer"
                >
                    <span>{slippage}%</span>
                    <SlidersHorizontalIcon size={13} className="text-[#94A3B8]" />
                </button>
            </div>

            {/* Main Form Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
                {/* Dual Cards Container */}
                <div className="relative space-y-2">
                    {/* Pay Card */}
                    <div className="rounded-2xl border border-[#253248] bg-[#101522] p-3.5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#94A3B8]">
                            <span>YOU PAY</span>
                            <div className="flex items-center gap-1">
                                <span>Balance: {payBalance}</span>
                                <button
                                    type="button"
                                    onClick={() => handleSetPercentage(1.0)}
                                    className="text-[#818CF8] hover:text-white transition-colors cursor-pointer ml-1 font-bold"
                                >
                                    MAX
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                value={fromAmount}
                                onChange={(e) => setFromAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-1/2 bg-transparent text-2xl font-extrabold text-white outline-none font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setIsPaySelectorOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161C2C] hover:bg-[#1F273A] border border-[#2C374E] hover:border-white/20 transition-all cursor-pointer shadow-xs group"
                            >
                                <CryptoIcon symbol={payToken.symbol} size={22} />
                                <span className="text-xs font-bold text-white">{payToken.symbol}</span>
                                <CaretDownIcon size={12} className="text-[#94A3B8] group-hover:text-white" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#64748B]">
                            <span className="font-mono">≈ ${payUsd} USD</span>
                            {/* Fast percentage pills */}
                            <div className="flex items-center gap-1">
                                {[0.25, 0.5, 0.75].map((pct) => (
                                    <button
                                        key={pct}
                                        type="button"
                                        onClick={() => handleSetPercentage(pct)}
                                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#141A28] hover:bg-[#1C2538] text-[#818CF8]"
                                    >
                                        {pct * 100}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Centered Floating Reversal Button */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button
                            type="button"
                            onClick={handleFlip}
                            className="w-10 h-10 rounded-full bg-[#131928] hover:bg-[#1A2234] border-2 border-[#00F5A0] shadow-[0_0_12px_rgba(0,245,160,0.3)] text-[#00E599] flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                        >
                            <ArrowsDownUpIcon size={18} weight="bold" />
                        </button>
                    </div>

                    {/* Receive Card */}
                    <div className="rounded-2xl border border-[#253248] bg-[#101522] p-3.5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#94A3B8]">
                            <span>YOU RECEIVE (ESTIMATED)</span>
                            <span>Balance: {receiveToken.balance}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-extrabold text-[#00E599] font-mono">
                                {toAmount}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsReceiveSelectorOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161C2C] hover:bg-[#1F273A] border border-[#2C374E] hover:border-white/20 transition-all cursor-pointer shadow-xs group"
                            >
                                <CryptoIcon symbol={receiveToken.symbol} size={22} />
                                <span className="text-xs font-bold text-white">{receiveToken.symbol}</span>
                                <CaretDownIcon size={12} className="text-[#94A3B8] group-hover:text-white" />
                            </button>
                        </div>

                        <p className="text-xs text-[#64748B] font-mono">
                            ≈ ${receiveUsd} (-0.15% routing)
                        </p>
                    </div>
                </div>

                {/* Routing Details Card */}
                <div className="p-3.5 rounded-xl border border-[#253248] bg-[#101522] space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-[#94A3B8]">Best Route</span>
                        <span className="font-bold text-[#00E599] flex items-center gap-1">
                            <ShieldCheckIcon size={14} weight="bold" />
                            <span>FistAggregator (Uniswap v3 80% + Curve 20%)</span>
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[#94A3B8]">Exchange Rate</span>
                        <span className="font-mono text-white">
                            1 {payToken.symbol} ≈ {exchangeRate >= 10 ? exchangeRate.toFixed(2) : exchangeRate.toFixed(4)} {receiveToken.symbol}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[#94A3B8]">Minimum Received</span>
                        <span className="font-mono text-white">
                            {(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(4)} {receiveToken.symbol}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[#94A3B8]">Est. Network Gas Fee</span>
                        <span className="font-mono text-[#00E599]">~$2.45 (16 Gwei)</span>
                    </div>
                </div>

                {/* Swap CTA Button */}
                <button
                    type="button"
                    onClick={handleExecuteSwap}
                    disabled={isSwapping || numFrom <= 0}
                    className="w-full h-12 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#00F5A0] to-[#00C47F] hover:from-[#00E599] hover:to-[#00B374] disabled:opacity-40 disabled:pointer-events-none text-[#042F2E] shadow-[0_8px_20px_rgba(0,245,160,0.3)] border border-[#A7F3D0]/40 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                    {isSwapping ? 'Swapping on Mempool...' : `Swap ${payToken.symbol} for ${receiveToken.symbol}`}
                </button>
            </div>

            {/* Bottom Dock */}
            <BottomDock activeTab="swap" />

            {/* Pay Token Selector Modal */}
            <TokenSelectorModal
                open={isPaySelectorOpen}
                onClose={() => setIsPaySelectorOpen(false)}
                onSelect={(token) => setPayToken(token)}
                selectedSymbol={payToken.symbol}
                title="Select Token to Pay"
            />

            {/* Receive Token Selector Modal */}
            <TokenSelectorModal
                open={isReceiveSelectorOpen}
                onClose={() => setIsReceiveSelectorOpen(false)}
                onSelect={(token) => setReceiveToken(token)}
                selectedSymbol={receiveToken.symbol}
                title="Select Token to Receive"
            />

            {/* Slippage Settings Modal */}
            {showSlippageModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
                    <div className="w-full max-w-xs bg-[#121726] border border-[#2B364C] rounded-2xl p-4 space-y-3.5 text-white shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-white">Slippage Tolerance</h3>
                            <button
                                type="button"
                                onClick={() => setShowSlippageModal(false)}
                                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#94A3B8] hover:text-white"
                            >
                                <XIcon size={12} weight="bold" />
                            </button>
                        </div>
                        <p className="text-xs text-[#94A3B8]">
                            Your transaction will revert if the price changes unfavorably by more than this percentage.
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                            {['0.1', '0.5', '1.0'].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                        setSlippage(val);
                                        setShowSlippageModal(false);
                                    }}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                        slippage === val
                                            ? 'bg-[#00E599]/20 border-[#00E599] text-[#00E599]'
                                            : 'bg-[#182030] border-[#253248] text-[#94A3B8] hover:text-white'
                                    }`}
                                >
                                    {val}%
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
