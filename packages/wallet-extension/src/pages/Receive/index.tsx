import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import QRCode from 'react-qr-code';
import {
    ArrowLeftIcon,
    CheckIcon,
    CopyIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { toast } from 'sonner';
import { t } from '@utils/i18n';
import { motion } from 'framer-motion';

export default function Receive() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork } = useWalletStore();
    const { language } = useSettingsStore();
    const [copied, setCopied] = useState(false);

    if (!currentAccount) return null;

    const currentAddress = currentAccount.addresses[currentNetwork.chainType] || '';

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
                    <span>{t(language, 'receiveAssetTitle', { network: currentNetwork.name })}</span>
                </div>
                <div className="w-8" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 overflow-y-auto scrollbar-thin">
                {/* QR Code Frame */}
                <div className="p-4 rounded-3xl bg-white shadow-2xl border border-white/20 relative">
                    <QRCode
                        value={currentAddress}
                        size={180}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        viewBox="0 0 190 190"
                    />
                </div>

                {/* Account Name */}
                <div className="text-center">
                    <p className="text-sm font-bold text-white tracking-wide">
                        {currentAccount.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                        {t(language, 'scanQrToPay')}
                    </p>
                </div>

                {/* Address Box */}
                <div className="w-full rounded-2xl border border-white/10 bg-[#14161E] p-4 flex items-center justify-between gap-3 shadow-sm">
                    <p className="text-xs font-mono break-all text-white/90 select-all leading-relaxed">
                        {currentAddress}
                    </p>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="shrink-0 w-8 h-8 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                        {copied ? <CheckIcon size={15} className="text-emerald-400" /> : <CopyIcon size={15} />}
                    </button>
                </div>

                {/* Network Safety Note */}
                <div className="w-full flex items-start gap-2.5 p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs">
                    <WarningCircleIcon size={18} className="shrink-0 mt-0.5 text-amber-400" />
                    <span className="leading-relaxed">
                        {t(language, 'receiveWarningNote', { network: currentNetwork.name, symbol: currentNetwork.nativeCurrency.symbol })}
                    </span>
                </div>
            </div>

            {/* Bottom Copy Button */}
            <div className="p-4 border-t border-white/5 bg-[#070A12]/90 backdrop-blur-md">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full h-12 rounded-full font-bold text-[15px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                    {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                    <span>{copied ? t(language, 'addressCopied') : t(language, 'copyFullAddress')}</span>
                </button>
            </div>
        </motion.div>
    );
}
