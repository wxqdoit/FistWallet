import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import QRCode from 'react-qr-code';
import {
    ArrowLeftIcon,
    CheckIcon,
    CopyIcon,
    WarningIcon,
    ShareNetworkIcon,
    CaretDownIcon,
    CoinsIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { t } from '@utils/i18n';

export default function Receive() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork } = useWalletStore();
    const { language } = useSettingsStore();
    const [copied, setCopied] = useState(false);
    const [showAmountInput, setShowAmountInput] = useState(false);
    const [requestedAmount, setRequestedAmount] = useState('');

    if (!currentAccount) return null;

    const currentAddress = currentAccount.addresses[currentNetwork.chainType] || '';
    const qrValue = requestedAmount && parseFloat(requestedAmount) > 0
        ? `ethereum:${currentAddress}?amount=${requestedAmount}`
        : currentAddress;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentAddress);
            setCopied(true);
            toast.success(t(language, 'addressCopied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t(language, 'addressCopyFailed'));
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'FistWallet Receive Address',
                    text: qrValue,
                });
            } catch {}
        } else {
            handleCopy();
        }
    };

    return (
        <div className="h-full w-full flex flex-col justify-between p-4 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none overflow-y-auto scrollbar-thin">
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
                    <h2 className="text-sm font-bold text-white tracking-tight">Receive Assets</h2>
                    <p className="text-[10px] text-[#64748B] font-mono">{currentNetwork.name}</p>
                </div>
                <div className="w-8" />
            </div>

            {/* Network Selector Pill */}
            <div className="flex justify-center pt-2">
                <button
                    type="button"
                    onClick={() => navigate('/chains')}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141926] hover:bg-[#1C2538] border border-[#263147] text-xs font-bold text-white transition-all cursor-pointer shadow-sm hover:border-white/20"
                >
                    <span className="w-2 h-2 rounded-full bg-[#00E599] shadow-[0_0_6px_#00E599]" />
                    <span>{currentNetwork.name} ({currentNetwork.nativeCurrency.symbol})</span>
                    <CaretDownIcon size={12} className="text-[#94A3B8]" />
                </button>
            </div>

            {/* High-Resolution QR Card */}
            <div className="flex flex-col items-center my-auto py-2">
                <div className="relative p-5 rounded-2xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
                    <QRCode
                        value={qrValue}
                        size={170}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        viewBox={`0 0 256 256`}
                    />
                    {/* Centered Fist Logo Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-xl bg-[#070A12] border-2 border-white shadow-md flex items-center justify-center">
                            <span className="text-[#00F5A0] font-black text-sm font-mono">F</span>
                        </div>
                    </div>
                </div>

                {/* Amount indicator if set */}
                {requestedAmount && (
                    <div className="mt-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                        Requested: {requestedAmount} {currentNetwork.nativeCurrency.symbol}
                    </div>
                )}

                {/* Address Box with Copy Button */}
                <div className="w-full mt-3.5 p-3 rounded-xl bg-[#101522] border border-[#253248] flex items-center justify-between gap-2 shadow-inner">
                    <p className="font-mono text-xs text-[#E2E8F0] truncate select-all">
                        {currentAddress}
                    </p>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-bold text-[#818CF8] hover:text-white transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                        {copied ? <CheckIcon size={14} className="text-[#00E599]" /> : <CopyIcon size={14} />}
                        <span>{copied ? 'COPIED' : 'COPY'}</span>
                    </button>
                </div>

                {/* Security Warning Notice */}
                <div className="w-full mt-3 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/25 flex items-start gap-2.5 text-amber-300">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <WarningIcon size={13} weight="bold" />
                    </div>
                    <div>
                        <p className="text-xs font-bold leading-tight">
                            Only send {currentNetwork.nativeCurrency.symbol} &amp; native tokens
                        </p>
                        <p className="text-[11px] text-amber-200/70 leading-snug mt-0.5">
                            Sending assets from incompatible blockchains will result in permanent loss.
                        </p>
                    </div>
                </div>
            </div>

            {/* Set Amount Drawer / Modal if active */}
            {showAmountInput && (
                <div className="p-3 mb-2 rounded-xl bg-[#121826] border border-[#2B364C] flex items-center justify-between gap-2">
                    <input
                        type="text"
                        placeholder="Specify amount (e.g. 1.5)"
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => setShowAmountInput(false)}
                        className="text-xs font-bold text-[#00E599] px-2 py-1 rounded bg-[#00E599]/15"
                    >
                        Apply
                    </button>
                </div>
            )}

            {/* Dual Actions: Set Amount & Share QR */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                    type="button"
                    onClick={() => setShowAmountInput((prev) => !prev)}
                    className="h-11 rounded-xl font-bold text-xs bg-[#141A28] hover:bg-[#1A2234] text-[#E2E8F0] border border-[#2B364C] hover:border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                    <CoinsIcon size={16} className="text-[#818CF8]" />
                    <span>{showAmountInput ? 'Hide Amount' : 'Set Amount'}</span>
                </button>
                <button
                    type="button"
                    onClick={handleShare}
                    className="h-11 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                    <ShareNetworkIcon size={16} />
                    <span>Share QR</span>
                </button>
            </div>
        </div>
    );
}
