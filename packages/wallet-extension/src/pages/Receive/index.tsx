import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import QRCode from 'react-qr-code';
import {
    Button,
    GlassCard,
    MotionButton,
} from '@/ui';
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
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
                    <span>Receive on {currentNetwork.name}</span>
                </div>
                <div className="w-12" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-5">
                {/* QR Code Frame */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-3xl bg-white shadow-xl border border-white/20 relative"
                >
                    <QRCode
                        value={currentAddress}
                        size={190}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        viewBox="0 0 190 190"
                    />
                </motion.div>

                {/* Account Name */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        {currentAccount.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Scan QR code to receive {currentNetwork.nativeCurrency.symbol} or tokens
                    </p>
                </div>

                {/* Address Box */}
                <GlassCard className="w-full p-3.5 flex items-center justify-between gap-3">
                    <p className="text-xs font-mono break-all text-foreground select-all leading-relaxed">
                        {currentAddress}
                    </p>
                    <MotionButton
                        variant="secondary"
                        size="icon"
                        onClick={handleCopy}
                        className="shrink-0 h-9 w-9 rounded-xl"
                    >
                        {copied ? <CheckIcon size={16} className="text-success" /> : <CopyIcon size={16} />}
                    </MotionButton>
                </GlassCard>

                {/* Network Safety Note */}
                <div className="w-full flex items-start gap-2.5 p-3 rounded-xl border border-warning/30 bg-warning/10 text-warning text-xs">
                    <WarningCircleIcon size={18} className="shrink-0 mt-0.5" />
                    <span>
                        Only send {currentNetwork.name} ({currentNetwork.nativeCurrency.symbol}) assets to this address. Sending funds via other networks may result in permanent loss.
                    </span>
                </div>
            </div>

            {/* Bottom Copy Button */}
            <div className="p-4 border-t border-border/40 backdrop-blur-md">
                <MotionButton
                    onClick={handleCopy}
                    className="w-full h-11 text-sm font-semibold gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 glow-primary"
                >
                    {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                    <span>{copied ? 'Address Copied!' : 'Copy Full Address'}</span>
                </MotionButton>
            </div>
        </motion.div>
    );
}
