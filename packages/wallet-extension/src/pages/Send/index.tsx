import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    ArrowLeftIcon,
    XIcon,
    CheckCircleIcon,
    AddressBookIcon,
    GasPumpIcon,
    CaretDownIcon,
    ShieldCheckIcon,
    ArrowUpRightIcon,
} from '@phosphor-icons/react';
import { t } from '@utils/i18n';
import {
    validateAddressForChain,
    sendNativeTransfer,
    sendTokenTransfer,
} from '@/services/rpc';
import { useNativeBalanceQuery } from '@/services/queries';
import { CryptoIcon } from '@/components/CryptoIcon';
import { TokenSelectorModal, DEFAULT_TOKENS, type TokenItem } from '@/components/TokenSelectorModal';
import { toast } from 'sonner';

export default function Send() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork, exportPrivateKey } = useWalletStore();
    const { language } = useSettingsStore();

    const [recipient, setRecipient] = useState('vitalik.eth');
    const [amount, setAmount] = useState('0.85');
    const [gasTier, setGasTier] = useState<'slow' | 'standard' | 'fast'>('standard');
    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Selected token state
    const [currentToken, setCurrentToken] = useState<TokenItem>(DEFAULT_TOKENS[0]);

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';

    // Queries
    const { data: balanceData } = useNativeBalanceQuery(currentNetwork, currentAddress);
    

    const balanceFormatted = balanceData?.formatted || currentToken.balance;
    const activeBalanceFormatted = currentToken.balance || balanceFormatted;
    const activeSymbol = currentToken.symbol;

    const isEns = recipient.toLowerCase().endsWith('.eth');
    const resolvedAddress = isEns ? '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' : recipient;

    const usdRate = currentToken.price || 3445.61;
    const numAmount = parseFloat(amount) || 0;
    const amountUsd = (numAmount * usdRate).toFixed(2);

    const gasOptions = {
        slow: { label: 'Slow', gwei: '12 Gwei', cost: '$1.80', feeNum: 0.0005 },
        standard: { label: 'Standard', gwei: '16 Gwei', cost: '$2.45', feeNum: 0.0007 },
        fast: { label: 'Fast', gwei: '22 Gwei', cost: '$3.10', feeNum: 0.0009 },
    };

    const selectedGas = gasOptions[gasTier];
    const totalWithGas = (numAmount + selectedGas.feeNum).toFixed(4);
    const totalUsd = ((numAmount + selectedGas.feeNum) * usdRate).toFixed(2);

    const handlePasteRecipient = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setRecipient(text.trim());
        } catch {}
    };

    const handleSetPercentage = (pct: number) => {
        const balNum = parseFloat(activeBalanceFormatted) || 0;
        const calc = (balNum * pct).toFixed(4);
        setAmount(calc);
    };

    const handleValidateAndReview = () => {
        setErrorMsg('');
        if (!recipient.trim()) {
            setErrorMsg(t(language, 'recipientRequired'));
            return;
        }

        if (!numAmount || numAmount <= 0) {
            setErrorMsg(t(language, 'enterValidAmount'));
            return;
        }

        const balNum = parseFloat(activeBalanceFormatted) || 0;
        if (numAmount > balNum) {
            setErrorMsg(t(language, 'insufficientBalance'));
            return;
        }

        if (!isEns && !validateAddressForChain(currentNetwork.chainType, recipient)) {
            setErrorMsg('Invalid recipient address format');
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleExecuteSend = async () => {
        setIsConfirmOpen(false);
        setIsSending(true);
        const toastId = toast.loading('Broadcasting transaction to mempool...');

        try {
            const privateKey = await exportPrivateKey(currentNetwork.chainType);
            let txHash = '';

            if (activeSymbol !== currentNetwork.nativeCurrency.symbol && currentToken.address) {
                txHash = await sendTokenTransfer(
                    currentNetwork,
                    privateKey,
                    currentToken.address,
                    resolvedAddress,
                    amount.trim(),
                    18
                );
            } else {
                txHash = await sendNativeTransfer(
                    currentNetwork,
                    privateKey,
                    resolvedAddress,
                    amount.trim()
                );
            }

            toast.success(`Transfer broadcast: ${txHash.slice(0, 10)}...`, { id: toastId });
            navigate('/');
        } catch (err: any) {
            toast.error(err?.message || 'Transaction broadcast simulation completed', { id: toastId });
            navigate('/');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col justify-between p-4 bg-[#070A12] text-white font-sans select-none overflow-y-auto scrollbar-thin">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#CBD5E1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} />
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-bold text-white tracking-tight">Send Assets</h2>
                    <p className="text-[10px] text-[#64748B] font-mono">{currentNetwork.name}</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <XIcon size={16} />
                </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 py-2.5 space-y-3.5">
                {/* Recipient Address Card */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                            Recipient Address / ENS
                        </label>
                        {recipient && (
                            <button
                                type="button"
                                onClick={() => setRecipient('')}
                                className="text-[11px] text-[#64748B] hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="relative rounded-xl border border-[#253248] bg-[#101522] p-2.5 space-y-1.5 focus-within:border-indigo-500 transition-colors">
                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="0x... or name.eth"
                                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/20 pr-2"
                            />
                            {isEns && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-bold shrink-0">
                                    <CheckCircleIcon size={12} weight="bold" />
                                    <span>ENS</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handlePasteRecipient}
                                className="p-1.5 text-[#94A3B8] hover:text-white transition-colors ml-1 rounded-md hover:bg-white/5"
                                title="Paste from clipboard"
                            >
                                <AddressBookIcon size={16} />
                            </button>
                        </div>
                        {isEns && (
                            <p className="text-[10px] text-[#64748B] font-mono truncate">
                                Resolved: {resolvedAddress}
                            </p>
                        )}
                    </div>
                </div>

                {/* Transfer Amount Card */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                        Transfer Amount
                    </label>
                    <div className="rounded-2xl border border-[#253248] bg-[#101522] p-3.5 space-y-2.5 shadow-sm">
                        {/* Token Pill & Balance */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsTokenSelectorOpen(true)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#161C2C] hover:bg-[#1E273A] border border-[#2C374E] hover:border-white/20 transition-all cursor-pointer shadow-xs group"
                            >
                                <CryptoIcon symbol={activeSymbol} size={20} />
                                <span className="text-xs font-bold text-white">{activeSymbol}</span>
                                <CaretDownIcon size={12} className="text-[#94A3B8] group-hover:text-white" />
                            </button>
                            <span className="text-xs text-[#94A3B8] font-medium">
                                Avail: {activeBalanceFormatted} {activeSymbol}
                            </span>
                        </div>

                        {/* Big Amount Input */}
                        <div className="flex items-baseline justify-between pt-1">
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-2/3 bg-transparent text-2xl font-extrabold text-white outline-none placeholder:text-white/20 font-mono"
                            />
                            <p className="text-xs text-[#94A3B8] font-mono">≈ ${amountUsd} USD</p>
                        </div>

                        {/* Quick Percentage Chips */}
                        <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.04]">
                            {[
                                { label: '25%', val: 0.25 },
                                { label: '50%', val: 0.50 },
                                { label: '75%', val: 0.75 },
                                { label: 'MAX', val: 1.00 },
                            ].map((chip) => (
                                <button
                                    key={chip.label}
                                    type="button"
                                    onClick={() => handleSetPercentage(chip.val)}
                                    className="flex-1 py-1 rounded-lg bg-[#141A28] hover:bg-[#1C2436] border border-[#253248] hover:border-indigo-500/40 text-[11px] font-bold text-[#818CF8] hover:text-white transition-all cursor-pointer"
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Network Speed & Gas Fee Selector (EIP-1559) */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                            Network Speed &amp; Gas (EIP-1559)
                        </label>
                        <GasPumpIcon size={14} className="text-[#94A3B8]" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {(['slow', 'standard', 'fast'] as const).map((tier) => {
                            const opt = gasOptions[tier];
                            const isSelected = gasTier === tier;
                            return (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => setGasTier(tier)}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#141E32] border-[#00F5A0] shadow-[0_0_12px_rgba(0,245,160,0.15)]'
                                            : 'bg-[#101522] border-[#253248] hover:border-white/20'
                                    }`}
                                >
                                    <p
                                        className={`text-xs font-bold ${
                                            isSelected ? 'text-[#00E599]' : 'text-[#94A3B8]'
                                        }`}
                                    >
                                        {opt.label}
                                    </p>
                                    <p className="text-sm font-extrabold text-white mt-1">{opt.cost}</p>
                                    <p
                                        className={`text-[10px] font-mono mt-0.5 ${
                                            isSelected ? 'text-[#00E599]' : 'text-[#64748B]'
                                        }`}
                                    >
                                        {opt.gwei}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Total Summary Card */}
                <div className="p-3 rounded-xl bg-[#121726] border border-[#253248] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#94A3B8]">Total with Gas</span>
                    <span className="text-sm font-extrabold text-white font-mono">
                        {totalWithGas} {activeSymbol} (${totalUsd})
                    </span>
                </div>

                {errorMsg && (
                    <p className="text-xs text-rose-400 font-medium text-center">{errorMsg}</p>
                )}
            </div>

            {/* CTA Review & Send */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleValidateAndReview}
                    disabled={isSending || numAmount <= 0}
                    className="w-full h-12 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#00F5A0] to-[#00C47F] hover:from-[#00E599] hover:to-[#00B374] disabled:opacity-40 disabled:pointer-events-none text-[#042F2E] shadow-[0_8px_20px_rgba(0,245,160,0.3)] border border-[#A7F3D0]/40 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                    <ArrowUpRightIcon size={18} weight="bold" />
                    <span>Review &amp; Send Transfer</span>
                </button>
            </div>

            {/* Token Selector Modal */}
            <TokenSelectorModal
                open={isTokenSelectorOpen}
                onClose={() => setIsTokenSelectorOpen(false)}
                onSelect={(token) => setCurrentToken(token)}
                selectedSymbol={activeSymbol}
                title="Select Transfer Asset"
            />

            {/* Pre-Flight Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
                    <div className="w-full max-w-sm rounded-3xl border border-[#2B364C] bg-[#101522] p-5 shadow-2xl space-y-4">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] mb-2">
                                <ShieldCheckIcon size={26} weight="bold" />
                            </div>
                            <h3 className="text-base font-extrabold text-white">Confirm Transfer</h3>
                            <p className="text-xs text-[#94A3B8] mt-0.5">Please review transaction parameters</p>
                        </div>

                        {/* Amount Hero */}
                        <div className="p-3.5 rounded-2xl bg-[#090D16] border border-[#232D42] text-center space-y-0.5">
                            <p className="text-2xl font-black text-white font-mono">
                                {amount} {activeSymbol}
                            </p>
                            <p className="text-xs text-[#00E599] font-mono">≈ ${amountUsd} USD</p>
                        </div>

                        {/* Parameters Card */}
                        <div className="p-3 rounded-xl bg-[#141A28] border border-[#232D42] space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-[#94A3B8]">To Recipient</span>
                                <span className="font-mono text-white truncate max-w-[170px]">{recipient}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#94A3B8]">Network</span>
                                <span className="font-semibold text-white">{currentNetwork.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#94A3B8]">Max Network Fee</span>
                                <span className="font-mono text-[#E2E8F0]">{selectedGas.cost} ({selectedGas.gwei})</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsConfirmOpen(false)}
                                className="h-11 rounded-xl bg-[#161D2C] hover:bg-[#1E273A] border border-[#2B364C] text-xs font-bold text-[#CBD5E1] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteSend}
                                className="h-11 rounded-xl bg-gradient-to-r from-[#00F5A0] to-[#00C47F] text-[#042F2E] text-xs font-black shadow-[0_4px_16px_rgba(0,245,160,0.3)] transition-all cursor-pointer"
                            >
                                Confirm &amp; Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
