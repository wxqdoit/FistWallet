import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
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
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

export default function VerifyMnemonic() {
    const navigate = useNavigate();
    const { createNewWallet, addWalletFromMnemonic } = useWalletStore();
    const { language } = useSettingsStore();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const isAddMode = mode === 'add';
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [shuffledWords, setShuffledWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([null, null, null]);
    const [verifyPositions] = useState([2, 6, 11]); // Positions 3, 7, 12 (0-indexed)
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const handleErrorDialogChange = (open: boolean) => {
        if (!open) {
            setError('');
        }
    };

    useEffect(() => {
        const tempMnemonic = sessionStorage.getItem('tempMnemonic');
        if (!tempMnemonic) {
            navigate(isAddMode ? '/add-wallet' : '/welcome');
            return;
        }

        const words = tempMnemonic.split(' ');
        setMnemonic(words);

        // Shuffle words for selection
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
    }, [isAddMode, navigate]);

    const handleWordSelect = (word: string, slotIndex: number) => {
        const newSelected = [...selectedWords];

        // Remove word from other slots if already selected
        const existingIndex = newSelected.indexOf(word);
        if (existingIndex !== -1) {
            newSelected[existingIndex] = null;
        }

        newSelected[slotIndex] = word;
        setSelectedWords(newSelected);
        setError('');
    };

    const handleVerify = async () => {
        // Check if all words are selected
        if (selectedWords.some((word) => word === null)) {
            setError(t(language, 'selectAllWords'));
            return;
        }

        // Verify correctness
        const isCorrect = verifyPositions.every(
            (pos, idx) => selectedWords[idx] === mnemonic[pos]
        );

        if (!isCorrect) {
            setError(t(language, 'incorrectWords'));
            setSelectedWords([null, null, null]);
            return;
        }

        // Create wallet
        setIsCreating(true);
        try {
            const mnemonicPhrase = sessionStorage.getItem('tempMnemonic');
            if (!mnemonicPhrase) {
                throw new Error(t(language, 'sessionDataMissing'));
            }

            if (isAddMode) {
                await addWalletFromMnemonic(mnemonicPhrase);
            } else {
                const password = sessionStorage.getItem('tempPassword');
                if (!password) {
                    throw new Error(t(language, 'sessionDataMissing'));
                }
                await createNewWallet(password, mnemonicPhrase);
            }

            // Clear temporary data
            sessionStorage.removeItem('tempMnemonic');

            // Navigate to dashboard
            if (isAddMode) {
                navigate('/');
            } else {
                sessionStorage.removeItem('tempPassword');
                navigate('/');
            }
        } catch (err) {
            setError(t(language, 'failedCreateWallet'));
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="h-full flex flex-col justify-between p-6 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none relative overflow-y-auto scrollbar-thin">
            {/* Top Navigation & Title */}
            <div className="relative z-10 mb-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={isCreating}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, 'verifyRecoveryTitle')}</h1>
                <p className="text-xs text-white/40 mt-1">
                    {t(language, 'verifyRecoverySubtitle')}
                </p>
            </div>

            {/* Verification target slots */}
            <div className="mb-4 space-y-2.5 relative z-10">
                {verifyPositions.map((pos, idx) => (
                    <div key={pos} className="space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                            {t(language, 'wordNumber', { number: pos + 1 })}
                        </span>
                        <div
                            onClick={() => {
                                if (selectedWords[idx]) {
                                    const next = [...selectedWords];
                                    next[idx] = null;
                                    setSelectedWords(next);
                                }
                            }}
                            className={`h-11 rounded-xl border px-3.5 flex items-center justify-between transition-all cursor-pointer ${
                                selectedWords[idx]
                                    ? 'border-indigo-500/50 bg-indigo-500/10 text-white font-mono font-medium shadow-sm'
                                    : 'border-white/10 bg-[#0A0D14] text-white/40 font-mono text-xs'
                            }`}
                        >
                            <span>{selectedWords[idx] || t(language, 'selectWordPlaceholder')}</span>
                            {selectedWords[idx] && (
                                <span className="text-[10px] text-white/40 hover:text-white">✕ {t(language, 'removeWord')}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Word selection pool */}
            <div className="flex-1 mb-4 relative z-10">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">
                    {t(language, 'selectFromRecovery')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {shuffledWords.map((word, index) => {
                        const isSelected = selectedWords.includes(word);
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    const emptySlot = selectedWords.findIndex((w) => w === null);
                                    if (emptySlot !== -1 || isSelected) {
                                        handleWordSelect(word, isSelected ? selectedWords.indexOf(word) : emptySlot);
                                    }
                                }}
                                disabled={isSelected}
                                className={`h-9 px-2 rounded-xl text-xs font-mono transition-colors flex items-center justify-center ${
                                    isSelected
                                        ? 'bg-[#0A0D14] text-white/20 border border-white/5 cursor-not-allowed opacity-50'
                                        : 'bg-[#14161E] hover:bg-[#1A1D26] text-white border border-white/10 hover:border-white/20 active:opacity-85 cursor-pointer shadow-sm'
                                }`}
                            >
                                {word}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Verify button: Capsule Pill Button in FistWallet Brand Color */}
            <div className="w-full relative z-10 pt-2">
                <button
                    type="button"
                    onClick={handleVerify}
                    disabled={selectedWords.some((w) => w === null) || isCreating}
                    className={`w-full h-12 rounded-full font-bold text-[14px] transition-all flex items-center justify-center ${
                        !selectedWords.some((w) => w === null) && !isCreating
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 cursor-pointer'
                            : 'bg-[#14161E] text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                >
                    {isCreating
                        ? isAddMode
                            ? t(language, 'addingWallet')
                            : t(language, 'creatingWallet')
                        : isAddMode
                            ? t(language, 'verifyAddWallet')
                            : t(language, 'verifyCreateWallet')}
                </button>
            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">{t(language, 'verificationFailed')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 mt-1">{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogAction className="rounded-full h-11 text-xs font-bold bg-indigo-600 text-white w-full">{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
