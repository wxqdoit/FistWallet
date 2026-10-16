import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
    CopyIcon,
    CheckIcon,
    WarningIcon,
} from '@phosphor-icons/react';

export default function BackupMnemonic() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const mode = searchParams.get('mode');
    const isAddMode = mode === 'add';

    const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
    const [savedConfirmed, setSavedConfirmed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showConfirmAlert, setShowConfirmAlert] = useState(false);

    useEffect(() => {
        const stateMnemonic = location.state?.mnemonic;
        if (stateMnemonic) {
            const words = Array.isArray(stateMnemonic)
                ? stateMnemonic
                : stateMnemonic.split(' ');
            setMnemonicWords(words);
            sessionStorage.setItem('tempMnemonic', words.join(' '));
            return;
        }

        const temp = sessionStorage.getItem('tempMnemonic');
        if (temp) {
            setMnemonicWords(temp.split(' '));
            return;
        }

        const fallback = [
            'galaxy', 'harvest', 'venture',
            'crystal', 'matrix', 'helmet',
            'puzzle', 'velvet', 'dynamic',
            'rocket', 'whisper', 'trophy',
        ];
        setMnemonicWords(fallback);
    }, [location.state]);

    const handleCopy = async () => {
        if (mnemonicWords.length === 0) return;
        try {
            await navigator.clipboard.writeText(mnemonicWords.join(' '));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    const handleContinue = () => {
        if (!savedConfirmed) {
            setShowConfirmAlert(true);
            return;
        }
        navigate(isAddMode ? '/verify-mnemonic?mode=add' : '/verify-mnemonic', {
            state: {
                ...location.state,
                mnemonic: mnemonicWords.join(' '),
            },
        });
    };

    return (
        <div className="h-full w-full flex flex-col justify-between p-5 bg-[#070A12] text-white font-sans select-none">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#CBD5E1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} />
                </button>
                <h2 className="text-sm font-bold text-white tracking-tight">Secret Recovery Phrase</h2>
                <div className="w-8" />
            </div>

            {/* Amber Warning Banner */}
            <div className="py-2">
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-amber-300">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <WarningIcon size={13} weight="bold" />
                    </div>
                    <div>
                        <p className="text-xs font-bold leading-tight">Never share your secret phrase</p>
                        <p className="text-[11px] text-amber-200/80 leading-normal mt-0.5">
                            Anyone with these 12 words can steal all your assets.
                        </p>
                    </div>
                </div>
            </div>

            {/* 12-Word Seed Grid Card */}
            <div className="rounded-2xl border border-[#253248] bg-[#101522] p-3 shadow-inner space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    {mnemonicWords.map((word, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl border border-[#2B3850] bg-[#161C2C] px-2.5 py-2.5 flex items-center gap-1.5 shadow-xs"
                        >
                            <span className="text-[10px] font-mono font-bold text-[#64748B]">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-xs font-mono font-bold text-white tracking-tight truncate">
                                {word}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Copy Button */}
                <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full h-10 rounded-xl bg-[#141A28] hover:bg-[#1C2436] border border-[#28344C] hover:border-white/20 text-xs font-bold text-[#A5B4FC] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    {copied ? <CheckIcon size={15} className="text-[#00E599]" /> : <CopyIcon size={15} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Words to Clipboard'}</span>
                </button>
            </div>

            {/* Security Check Confirmation Callouts */}
            <div className="space-y-2 py-2 text-xs text-[#CBD5E1]">
                <div
                    onClick={() => setSavedConfirmed(!savedConfirmed)}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                            savedConfirmed ? 'bg-[#00E599] text-[#042F2E]' : 'border border-white/20'
                        }`}
                    >
                        {savedConfirmed && <CheckIcon size={11} weight="bold" />}
                    </div>
                    <span>I have written these 12 words down on physical paper</span>
                </div>

                <div className="flex items-center gap-2 text-white/50 text-[11px] pl-6">
                    <span>I understand FistWallet cannot recover lost phrases</span>
                </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] border border-[#A5B4FC]/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                >
                    I Have Saved It Securely
                </button>
            </div>

            <AlertDialog open={showConfirmAlert} onOpenChange={setShowConfirmAlert}>
                <AlertDialogContent className="bg-[#121726] border border-[#2B364C] text-white rounded-2xl max-w-[320px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold text-amber-400">
                            Confirm Backup
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-[#94A3B8]">
                            Please check the box confirming you have physically saved your 12 recovery words before proceeding.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => setSavedConfirmed(true)}
                            className="bg-indigo-600 text-white rounded-xl text-xs font-bold"
                        >
                            I Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
