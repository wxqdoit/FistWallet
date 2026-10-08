import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSettingsStore } from '@store/settings';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/ui';
import { ArrowLeftIcon, CheckCircleIcon, EyeIcon, WarningCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

export default function BackupMnemonic() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useSettingsStore();
    const mode = searchParams.get('mode');
    const isAddMode = mode === 'add';
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isRevealAlertOpen, setIsRevealAlertOpen] = useState(false);

    useEffect(() => {
        const tempMnemonic = sessionStorage.getItem('tempMnemonic');
        if (!tempMnemonic) {
            navigate(isAddMode ? '/add-wallet' : '/welcome');
            return;
        }
        setMnemonic(tempMnemonic.split(' '));
    }, [isAddMode, navigate]);



    const handleContinue = () => {
        if (!isRevealed) {
            setIsRevealAlertOpen(true);
            return;
        }
        navigate(isAddMode ? '/verify-mnemonic?mode=add' : '/verify-mnemonic');
    };

    const [copied, setCopied] = useState(false);

    const handleCopyAll = async () => {
        if (!isRevealed || mnemonic.length === 0) return;
        try {
            await navigator.clipboard.writeText(mnemonic.join(' '));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    return (
        <div className="h-full flex flex-col justify-between p-6 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none relative overflow-y-auto scrollbar-thin">
            {/* Top Navigation & Title */}
            <div className="relative z-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, 'backupRecoveryTitle')}</h1>
                        <p className="text-xs text-white/40 mt-1">
                            {t(language, 'backupRecoverySubtitle')}
                        </p>
                    </div>
                    {isRevealed && (
                        <button
                            type="button"
                            onClick={handleCopyAll}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            {copied ? <CheckCircleIcon size={14} className="text-emerald-400" /> : <EyeIcon size={14} />}
                            <span>{copied ? t(language, 'copiedItem') : t(language, 'copy')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Security Warning Banner */}
            <div className="my-3.5 relative z-10">
                <div className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2.5">
                    <WarningCircleIcon size={18} className="shrink-0 text-amber-400" />
                    <span className="leading-snug">{t(language, 'neverShareRecovery')}</span>
                </div>
            </div>

            {/* Mnemonic Display Grid */}
            <div className="flex-1 my-auto relative z-10">
                <div className="relative rounded-2xl border border-white/10 bg-[#0A0D14] p-3.5 shadow-inner">
                    {!isRevealed && (
                        <div className="absolute inset-0 backdrop-blur-md bg-black/70 rounded-2xl flex flex-col items-center justify-center z-10 p-4 text-center">
                            <button
                                type="button"
                                onClick={() => setIsRevealed(true)}
                                className="px-5 py-2.5 rounded-full font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-opacity active:opacity-85"
                            >
                                <EyeIcon size={16} />
                                <span>{t(language, 'revealRecovery')}</span>
                            </button>
                            <p className="text-[11px] text-white/40 mt-2">{t(language, 'revealPasswordSecTip')}</p>
                        </div>
                    )}

                    <div className={`grid grid-cols-3 gap-2 ${!isRevealed ? 'filter blur-sm select-none pointer-events-none' : ''}`}>
                        {mnemonic.map((word, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-white/10 bg-[#14161E] hover:border-indigo-500/40 px-2.5 py-2 flex items-center justify-between text-xs transition-colors"
                            >
                                <span className="text-[10px] text-white/30 font-mono select-none">{index + 1}</span>
                                <span className="font-mono font-medium text-white tracking-wide">{word}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Tips List */}
            <div className="my-3 space-y-1.5 text-xs text-white/50 relative z-10">
                <p className="flex items-center gap-2">
                    <CheckCircleIcon size={15} className="text-emerald-400 shrink-0" />
                    <span>{t(language, 'tipWriteDown')}</span>
                </p>
                <p className="flex items-center gap-2">
                    <XCircleIcon size={15} className="text-rose-400 shrink-0" />
                    <span>{t(language, 'tipNeverShare')}</span>
                </p>
            </div>

            {/* Bottom Continue Action Button */}
            <div className="w-full relative z-10 pt-2">
                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!isRevealed}
                    className={`w-full h-12 rounded-full font-bold text-[14px] transition-all flex items-center justify-center ${
                        isRevealed
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 cursor-pointer'
                            : 'bg-[#14161E] text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                >
                    {t(language, 'writtenDown')}
                </button>
            </div>

            <AlertDialog open={isRevealAlertOpen} onOpenChange={setIsRevealAlertOpen}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">{t(language, 'revealRequiredTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 mt-1">
                            {t(language, 'revealRequiredBody')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogAction className="rounded-full h-11 text-xs font-bold bg-indigo-600 text-white w-full">{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
