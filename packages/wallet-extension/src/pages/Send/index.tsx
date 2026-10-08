import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    Input,
    Label,
} from '@/ui';
import {
    ArrowLeftIcon,
    ArrowUpRightIcon,
    GasPumpIcon,
    BookBookmarkIcon,
    ClipboardTextIcon,
    WarningCircleIcon,
    CheckCircleIcon,
} from '@phosphor-icons/react';
import { t } from '@utils/i18n';
import {
    validateAddressForChain,
    sendNativeTransfer,
    sendTokenTransfer,
} from '@/services/rpc';
import { useNativeBalanceQuery, useFeeEstimateQuery, useCustomTokensQuery } from '@/services/queries';
import { checkRecipientSecurity } from '@/services/security';
import { NetworkIcon } from '@/components/NetworkIcon';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Send() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork, exportPrivateKey } = useWalletStore();
    const { language } = useSettingsStore();

    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>('native');
    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';
    const needsMemo = ['ton', 'near'].includes(currentNetwork.chainType);

    // Live balance and fee queries with TanStack Query
    const { data: balanceData } = useNativeBalanceQuery(currentNetwork, currentAddress);
    const { data: feeData } = useFeeEstimateQuery(currentNetwork, currentAddress);
    const { data: customTokens = [] } = useCustomTokensQuery(currentNetwork, currentAddress);

    const balanceFormatted = balanceData?.formatted || '0.00';
    const estimatedFee = feeData?.fee || '0.00042';

    const selectedToken = selectedTokenAddress === 'native' ? null : customTokens.find(t => t.address.toLowerCase() === selectedTokenAddress.toLowerCase());
    const activeBalanceFormatted = selectedToken ? selectedToken.formatted : balanceFormatted;
    const activeSymbol = selectedToken ? selectedToken.symbol : currentNetwork.nativeCurrency.symbol;

    const isValidRecipient = recipient ? validateAddressForChain(currentNetwork.chainType, recipient) : true;
    const recipientSecurity = checkRecipientSecurity(recipient, currentAddress);


    const handlePasteRecipient = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setRecipient(text.trim());
        } catch {
            toast.error(t(language, 'clipboardAccessDenied'));
        }
    };

    const handleSetMax = () => {
        if (selectedToken) {
            setAmount(selectedToken.formatted);
        } else {
            const bal = parseFloat(balanceFormatted);
            const fee = parseFloat(estimatedFee);
            const maxVal = Math.max(0, bal - fee);
            setAmount(maxVal > 0 ? maxVal.toFixed(6) : balanceFormatted);
        }
    };

    const handleSend = async () => {
        setErrorMsg('');
        if (!recipient.trim()) {
            setErrorMsg(t(language, 'recipientRequired'));
            return;
        }

        if (!validateAddressForChain(currentNetwork.chainType, recipient)) {
            setErrorMsg(t(language, 'invalidRecipientForNetwork', { network: currentNetwork.name }));
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setErrorMsg(t(language, 'enterValidAmount'));
            return;
        }

        if (numAmount > parseFloat(activeBalanceFormatted)) {
            setErrorMsg(t(language, 'insufficientBalance'));
            return;
        }

        const toastId = toast.loading(t(language, 'broadcastingTx'));
        setIsSending(true);

        try {
            const privateKey = await exportPrivateKey(currentNetwork.chainType);
            let txHash: string;
            if (selectedToken) {
                txHash = await sendTokenTransfer(
                    currentNetwork,
                    privateKey,
                    recipient.trim(),
                    selectedToken.address,
                    amount.trim(),
                    selectedToken.decimals
                );
            } else {
                txHash = await sendNativeTransfer(
                    currentNetwork,
                    privateKey,
                    recipient.trim(),
                    amount.trim()
                );
            }

            toast.success(t(language, 'txBroadcastSuccess'), {
                id: toastId,
                description: t(language, 'txHashDesc', { hash: `${txHash.slice(0, 10)}...${txHash.slice(-8)}` }),
            });

            setTimeout(() => {
                navigate('/');
            }, 1400);
        } catch (err: any) {
            console.error('Transfer error:', err);
            toast.error(err.message || t(language, 'txBroadcastFailed'), { id: toastId });
            setErrorMsg(err.message || t(language, 'txBroadcastFailed'));
        } finally {
            setIsSending(false);
        }
    };

    if (!currentAccount) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans select-none relative"
        >
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#070A12]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-white">
                    <NetworkIcon
                        chainType={currentNetwork.chainType}
                        iconKey={currentNetwork.icon}
                        size={16}
                    />
                    <span>{t(language, 'sendAssetTitle', { symbol: activeSymbol })}</span>
                </div>
                <div className="w-8" />
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
                {/* Sender Card */}
                <div className="rounded-2xl border border-white/10 bg-[#14161E] p-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                        <span>{t(language, 'from')}</span>
                        <span>
                            {t(language, 'availableBalanceLabel')}: <strong className="text-white font-mono">{activeBalanceFormatted} {activeSymbol}</strong>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{currentAccount.name}</span>
                        <span className="font-mono text-[11px] text-white/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                            {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                        </span>
                    </div>
                </div>

                {/* Recipient Address */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t(language, 'to')}</Label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/settings/contacts')}
                                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                            >
                                <BookBookmarkIcon size={13} />
                                <span>{t(language, 'addressBook')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handlePasteRecipient}
                                className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white font-medium transition-colors cursor-pointer"
                            >
                                <ClipboardTextIcon size={13} />
                                <span>{t(language, 'pasteAction')}</span>
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Input
                            placeholder={t(language, 'enterAddressPlaceholder', { network: currentNetwork.name })}
                            value={recipient}
                            onChange={(e) => {
                                setRecipient(e.target.value);
                                setErrorMsg('');
                            }}
                            className={`font-mono text-xs pr-9 h-11 rounded-xl bg-[#0A0D14] border ${
                                recipient && !isValidRecipient
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : recipient && isValidRecipient
                                    ? 'border-emerald-500/60 focus-visible:ring-emerald-500'
                                    : 'border-white/10 focus-visible:border-indigo-500/50'
                            }`}
                        />
                        {recipient && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isValidRecipient ? (
                                    <CheckCircleIcon size={16} className="text-emerald-400" />
                                ) : (
                                    <WarningCircleIcon size={16} className="text-destructive" />
                                )}
                            </div>
                        )}
                    </div>
                    {recipient && !isValidRecipient && (
                        <p className="text-[11px] text-destructive">
                            {t(language, 'addressMismatchError', { network: currentNetwork.name })}
                        </p>
                    )}
                    {recipient && isValidRecipient && recipientSecurity.warning && (
                        <p className={`text-[11px] ${recipientSecurity.isSafe ? 'text-amber-400' : 'text-destructive font-medium'}`}>
                            {recipientSecurity.warning}
                        </p>
                    )}
                </div>

                {/* Asset Selection */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t(language, 'selectAssetLabel')}</Label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedTokenAddress('native');
                                setAmount('');
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                                selectedTokenAddress === 'native'
                                    ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                                    : 'border-white/10 bg-[#14161E] text-white/60 hover:text-white hover:border-white/20'
                            }`}
                        >
                            <NetworkIcon chainType={currentNetwork.chainType} iconKey={currentNetwork.icon} size={14} />
                            <span>{currentNetwork.nativeCurrency.symbol}</span>
                            <span className="text-[10px] opacity-80 font-mono">({balanceFormatted})</span>
                        </button>
                        {customTokens.map((tok) => (
                            <button
                                key={tok.address}
                                type="button"
                                onClick={() => {
                                    setSelectedTokenAddress(tok.address);
                                    setAmount('');
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                                    selectedTokenAddress === tok.address
                                        ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                                        : 'border-white/10 bg-[#14161E] text-white/60 hover:text-white hover:border-white/20'
                                }`}
                            >
                                <span>{tok.symbol}</span>
                                <span className="text-[10px] opacity-80 font-mono">({tok.formatted})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount Input Card */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t(language, 'amount')}</Label>
                        <span className="text-[11px] text-white/50">
                            {t(language, 'maxSendableLabel')}: <strong className="text-white font-mono">{activeBalanceFormatted}</strong>
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setErrorMsg('');
                            }}
                            placeholder="0.00"
                            step="any"
                            className="h-14 text-xl font-bold pr-24 rounded-2xl bg-[#0A0D14] border-white/10 text-white font-mono"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-xs font-bold text-white/60">
                                {activeSymbol}
                            </span>
                            <button
                                type="button"
                                onClick={handleSetMax}
                                className="h-7 px-2.5 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
                            >
                                MAX
                            </button>
                        </div>
                    </div>
                </div>

                {/* Memo (if required by chain) */}
                {needsMemo && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t(language, 'memoLabel')}</Label>
                        <Input
                            type="text"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder={t(language, 'memoPlaceholder')}
                            className="text-xs font-mono h-11 rounded-xl bg-[#0A0D14] border-white/10 text-white"
                        />
                    </div>
                )}

                {/* Network Gas Fee Breakdown */}
                <div className="rounded-2xl border border-white/10 bg-[#14161E] p-3.5 space-y-2 text-xs text-white/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <GasPumpIcon size={15} className="text-indigo-400" />
                            {t(language, 'estimatedNetworkFee')}
                        </span>
                        <span className="font-mono text-white">
                            ~{estimatedFee} {currentNetwork.nativeCurrency.symbol}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                        <span>{t(language, 'networkSpeed')}</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {t(language, 'standardSpeed')}
                        </span>
                    </div>
                </div>

                {errorMsg && (
                    <p className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                        {errorMsg}
                    </p>
                )}
            </div>

            {/* Bottom Submit Action */}
            <div className="p-4 border-t border-white/5 bg-[#070A12]/90 backdrop-blur-md">
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!recipient || !amount || !isValidRecipient || !recipientSecurity.isSafe || isSending}
                    className={`w-full h-12 rounded-full font-bold text-[15px] transition-opacity duration-150 flex items-center justify-center gap-2 ${
                        recipient && amount && isValidRecipient && recipientSecurity.isSafe && !isSending
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 cursor-pointer'
                            : 'bg-[#1A1D26] text-white/30 border border-white/[0.04] cursor-not-allowed'
                    }`}
                >
                    <ArrowUpRightIcon size={18} />
                    <span>{isSending ? t(language, 'sendingStatus') : t(language, 'send')}</span>
                </button>
            </div>
        </motion.div>
    );
}
