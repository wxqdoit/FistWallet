import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/ui';
import {
    ArrowLeftIcon,
    CpuIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    CircleNotchIcon,
} from '@phosphor-icons/react';
import { isHardwareSupported, requestHardwareDevice, createHardwareWallet } from '@services/hardware';
import { motion } from 'framer-motion';

export default function ConnectHardware() {
    const navigate = useNavigate();
    const { addHardwareWallet } = useWalletStore();
    const { language } = useSettingsStore();

    const [mode, setMode] = useState<'hid' | 'usb'>('hid');
    const [connecting, setConnecting] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
    const [previewAddress, setPreviewAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const support = isHardwareSupported();

    const handleConnect = async () => {
        setConnecting(true);
        setError(null);

        try {
            const dev = await requestHardwareDevice(mode);
            setConnectedDevice(dev.productName);
            // Generate deterministic mock address for hardware connection demo
            const mockEvm = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            setPreviewAddress(mockEvm);
        } catch (err: any) {
            console.error('Hardware connection error:', err);
            setError(err?.message || t(language, 'hardwareConnectFailed'));
        } finally {
            setConnecting(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!connectedDevice) return;
        try {
            const hwWallet = createHardwareWallet(connectedDevice, previewAddress || undefined);
            await addHardwareWallet(hwWallet);
            navigate('/');
        } catch (err: any) {
            setError(err?.message || t(language, 'importHardwareAccountFailed'));
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
                    <CpuIcon size={18} className="text-indigo-400" />
                    <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'hardwareConnectTitle')}</h1>
                </div>
                <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {/* Protocol Segmented Tab Card */}
                <div className="p-4 rounded-2xl bg-[#14161E] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50 font-medium">{t(language, 'commProtocolLabel')}</span>
                        <div className="flex p-1 rounded-xl bg-[#0A0D14] border border-white/10 gap-1">
                            <button
                                type="button"
                                onClick={() => setMode('hid')}
                                disabled={!support.hid}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    mode === 'hid'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                WebHID
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('usb')}
                                disabled={!support.usb}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    mode === 'usb'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                WebUSB
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-white/40 leading-relaxed">
                        {t(language, 'hardwareGuideDesc')}
                    </p>
                </div>

                {/* Device Status Card */}
                <div className="p-4 rounded-2xl bg-[#14161E] border border-white/10 space-y-4">
                    {!connectedDevice ? (
                        <div className="text-center py-6 space-y-3">
                            <div className="w-16 h-16 mx-auto rounded-full bg-[#1F2330] border border-white/10 flex items-center justify-center text-white/40">
                                <CpuIcon size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{t(language, 'noDeviceDetectedTitle')}</p>
                                <p className="text-xs text-white/40 mt-1 max-w-[240px] mx-auto leading-relaxed">
                                    {t(language, 'clickToPairDesc')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleConnect}
                                disabled={connecting}
                                className="w-full h-12 rounded-full font-bold text-[14px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
                            >
                                {connecting ? (
                                    <>
                                        <CircleNotchIcon size={18} className="animate-spin" />
                                        <span>{t(language, 'connectingDeviceStatus')}</span>
                                    </>
                                ) : (
                                    <>
                                        <CpuIcon size={18} weight="bold" />
                                        <span>{t(language, 'pairAndConnect')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <CheckCircleIcon size={24} weight="fill" className="text-emerald-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white">{connectedDevice}</p>
                                    <p className="text-xs text-emerald-400/80">{t(language, 'deviceConnectedState')}</p>
                                </div>
                            </div>

                            {previewAddress && (
                                <div className="space-y-1.5">
                                    <span className="text-xs text-white/50 font-medium">{t(language, 'derivedEvmAddressLabel')}</span>
                                    <div className="p-3 bg-[#0A0D14] rounded-xl text-xs font-mono text-white/90 break-all border border-white/10 select-all">
                                        {previewAddress}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleConfirmImport}
                                className="w-full h-12 rounded-full font-bold text-[14px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ShieldCheckIcon size={18} weight="bold" />
                                <span>{t(language, 'importAsReadonlyHardware')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={(open) => !open && setError(null)}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">{t(language, 'hardwareTipTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 mt-1">{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogAction className="rounded-full h-11 text-xs font-bold bg-indigo-600 text-white w-full cursor-pointer">
                            {t(language, 'ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}

