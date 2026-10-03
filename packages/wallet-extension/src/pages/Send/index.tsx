import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    Button,
    Input,
    Label,
    GlassCard,
    MotionButton,
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
} from '@/services/rpc';
import { useNativeBalanceQuery, useFeeEstimateQuery } from '@/services/queries';
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
    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';
    const needsMemo = ['ton', 'near'].includes(currentNetwork.chainType);

    // Live balance and fee queries with TanStack Query
    const { data: balanceData } = useNativeBalanceQuery(currentNetwork, currentAddress);
    const { data: feeData } = useFeeEstimateQuery(currentNetwork, currentAddress);

    const balanceFormatted = balanceData?.formatted || '0.00';
    const estimatedFee = feeData?.fee || '0.00042';

    const isValidRecipient = recipient ? validateAddressForChain(currentNetwork.chainType, recipient) : true;
    const recipientSecurity = checkRecipientSecurity(recipient, currentAddress);


    const handlePasteRecipient = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setRecipient(text.trim());
        } catch {
            toast.error('Clipboard access denied');
        }
    };

    const handleSetMax = () => {
        const bal = parseFloat(balanceFormatted);
        const fee = parseFloat(estimatedFee);
        const maxVal = Math.max(0, bal - fee);
        setAmount(maxVal > 0 ? maxVal.toFixed(6) : balanceFormatted);
    };

    const handleSend = async () => {
        setErrorMsg('');
        if (!recipient.trim()) {
            setErrorMsg('Recipient address is required');
            return;
        }

        if (!validateAddressForChain(currentNetwork.chainType, recipient)) {
            setErrorMsg(`Invalid recipient address for ${currentNetwork.name}`);
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setErrorMsg('Please enter a valid amount');
            return;
        }

        if (numAmount > parseFloat(balanceFormatted)) {
            setErrorMsg('Insufficient balance');
            return;
        }

        const toastId = toast.loading('Broadcasting transaction to network...');
        setIsSending(true);

        try {
            const privateKey = await exportPrivateKey(currentNetwork.chainType);
            const txHash = await sendNativeTransfer(
                currentNetwork,
                privateKey,
                recipient.trim(),
                amount.trim()
            );

            toast.success('Transaction broadcasted successfully!', {
                id: toastId,
                description: `Hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
            });

            setTimeout(() => {
                navigate('/');
            }, 1400);
        } catch (err: any) {
            console.error('Transfer error:', err);
            toast.error(err.message || 'Transaction failed', { id: toastId });
            setErrorMsg(err.message || 'Transaction failed');
        } finally {
            setIsSending(false);
        }
    };

    if (!currentAccount) return null;

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
                    <NetworkIcon
                        chainType={currentNetwork.chainType}
                        iconKey={currentNetwork.icon}
                        size={16}
                    />
                    <span>Send {currentNetwork.nativeCurrency.symbol}</span>
                </div>
                <div className="w-12" />
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 p-4 space-y-3.5 overflow-y-auto scrollbar-thin">
                {/* Sender Card */}
                <GlassCard className="p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{t(language, 'from')}</span>
                        <span>
                            Balance: {balanceFormatted} {currentNetwork.nativeCurrency.symbol}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{currentAccount.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                            {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                        </span>
                    </div>
                </GlassCard>

                {/* Recipient Address */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-muted-foreground">{t(language, 'to')}</Label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/settings/contacts')}
                                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                            >
                                <BookBookmarkIcon size={13} />
                                <span>Contacts</span>
                            </button>
                            <button
                                type="button"
                                onClick={handlePasteRecipient}
                                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ClipboardTextIcon size={13} />
                                <span>Paste</span>
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Input
                            placeholder={`Paste ${currentNetwork.name} address`}
                            value={recipient}
                            onChange={(e) => {
                                setRecipient(e.target.value);
                                setErrorMsg('');
                            }}
                            className={`font-mono text-xs pr-8 ${
                                recipient && !isValidRecipient
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : recipient && isValidRecipient
                                    ? 'border-success/60 focus-visible:ring-success'
                                    : ''
                            }`}
                        />
                        {recipient && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                {isValidRecipient ? (
                                    <CheckCircleIcon size={16} className="text-success" />
                                ) : (
                                    <WarningCircleIcon size={16} className="text-destructive" />
                                )}
                            </div>
                        )}
                    </div>
                    {recipient && !isValidRecipient && (
                        <p className="text-[11px] text-destructive">
                            Invalid address format for {currentNetwork.name}
                        </p>
                    )}
                    {recipient && isValidRecipient && recipientSecurity.warning && (
                        <p className={`text-[11px] ${recipientSecurity.isSafe ? 'text-amber-400' : 'text-destructive font-medium'}`}>
                            {recipientSecurity.warning}
                        </p>
                    )}
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-muted-foreground">{t(language, 'amount')}</Label>
                        <span className="text-[11px] text-muted-foreground">
                            Max: {balanceFormatted} {currentNetwork.nativeCurrency.symbol}
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
                            className="text-lg font-bold pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {currentNetwork.nativeCurrency.symbol}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                type="button"
                                onClick={handleSetMax}
                                className="h-6 px-1.5 text-[10px] font-bold text-primary"
                            >
                                MAX
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Memo (if required by chain) */}
                {needsMemo && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Memo / Tag</Label>
                        <Input
                            type="text"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="Required for exchange deposits"
                            className="text-xs font-mono"
                        />
                    </div>
                )}

                {/* Network Gas Fee Breakdown */}
                <GlassCard className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <GasPumpIcon size={15} />
                            Network Fee
                        </span>
                        <span className="font-mono">
                            ~{estimatedFee} {currentNetwork.nativeCurrency.symbol}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-2">
                        <span>Speed</span>
                        <span className="text-success font-medium">Standard (~15s)</span>
                    </div>
                </GlassCard>

                {/* Total Summary */}
                <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">{t(language, 'totalAmount')}</span>
                    <div className="text-right">
                        <p className="font-bold text-sm text-foreground">
                            {amount || '0'} {currentNetwork.nativeCurrency.symbol}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                            + {estimatedFee} {currentNetwork.nativeCurrency.symbol} fee
                        </p>
                    </div>
                </div>

                {errorMsg && (
                    <p className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                        {errorMsg}
                    </p>
                )}
            </div>

            {/* Submit Action */}
            <div className="p-4 border-t border-border/40 backdrop-blur-md">
                <MotionButton
                    onClick={handleSend}
                    disabled={!recipient || !amount || !isValidRecipient || !recipientSecurity.isSafe || isSending}
                    className="w-full h-11 text-sm font-semibold gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md glow-primary"
                >
                    <ArrowUpRightIcon size={18} />
                    <span>{isSending ? 'Sending...' : t(language, 'send')}</span>
                </MotionButton>
            </div>
        </motion.div>
    );
}
