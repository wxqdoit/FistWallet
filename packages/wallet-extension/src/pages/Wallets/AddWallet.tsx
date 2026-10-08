import { useNavigate } from 'react-router-dom';
import { generateMnemonic } from '@core/wallet';
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
import { ArrowLeftIcon, DownloadSimpleIcon, PlusIcon, CpuIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AddWallet() {
    const navigate = useNavigate();
    const { language } = useSettingsStore();
    const [error, setError] = useState('');

    const handleErrorDialogChange = (open: boolean) => {
        if (!open) {
            setError('');
        }
    };

    const handleCreate = () => {
        setError('');
        try {
            const mnemonic = generateMnemonic(12);
            sessionStorage.setItem('tempMnemonic', mnemonic);
            navigate('/backup-mnemonic?mode=add');
        } catch (err) {
            console.error(err);
            setError(t(language, 'failedCreateWallet'));
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
                <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'addNewWalletBtn')}</h1>
                <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {/* Create Wallet Card */}
                <div
                    onClick={handleCreate}
                    className="p-4 rounded-2xl bg-[#14161E] border border-white/10 hover:border-indigo-500/40 active:opacity-85 cursor-pointer transition-colors space-y-3 shadow-sm group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#1F2330] border border-white/10 text-indigo-400 flex items-center justify-center group-hover:bg-[#252A3A] group-hover:border-indigo-500/40 transition-colors">
                                <PlusIcon size={20} weight="bold" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{t(language, 'createBrandNewWallet')}</p>
                                <p className="text-xs text-white/40 mt-0.5">{t(language, 'newMnemonicDesc')}</p>
                            </div>
                        </div>
                        <CaretRightIcon size={16} className="text-white/30 group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Import Wallet Card */}
                <div
                    onClick={() => navigate('/import-wallet?mode=add')}
                    className="p-4 rounded-2xl bg-[#14161E] border border-white/10 hover:border-indigo-500/40 active:opacity-85 cursor-pointer transition-colors space-y-3 shadow-sm group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#1F2330] border border-white/10 text-indigo-400 flex items-center justify-center group-hover:bg-[#252A3A] group-hover:border-indigo-500/40 transition-colors">
                                <DownloadSimpleIcon size={20} weight="bold" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{t(language, 'importExistingWalletOption')}</p>
                                <p className="text-xs text-white/40 mt-0.5">{t(language, 'importWalletDesc')}</p>
                            </div>
                        </div>
                        <CaretRightIcon size={16} className="text-white/30 group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Connect Hardware Wallet Card */}
                <div
                    onClick={() => navigate('/connect-hardware')}
                    className="p-4 rounded-2xl bg-[#14161E] border border-white/10 hover:border-indigo-500/40 active:opacity-85 cursor-pointer transition-colors space-y-3 shadow-sm group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#1F2330] border border-white/10 text-indigo-400 flex items-center justify-center group-hover:bg-[#252A3A] group-hover:border-indigo-500/40 transition-colors">
                                <CpuIcon size={20} weight="bold" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{t(language, 'connectHardwareTitle')}</p>
                                <p className="text-xs text-white/40 mt-0.5">{t(language, 'hardwareSupportDesc')}</p>
                            </div>
                        </div>
                        <CaretRightIcon size={16} className="text-white/30 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">{t(language, 'failedCreateWallet')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 mt-1">{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogAction className="rounded-full h-11 text-xs font-bold bg-indigo-600 text-white w-full">
                            {t(language, 'ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}

