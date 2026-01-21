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
    Button,
    Input,
    Label,
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
        <div className="h-full flex flex-col p-6 bg-background">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-4 px-2 text-muted-foreground hover:text-foreground"
                    disabled={isCreating}
                >
                    <ArrowLeftIcon size={16} />
                    {t(language, 'back')}
                </Button>
                <h1 className="text-2xl font-bold">{t(language, 'verifyRecoveryTitle')}</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    {t(language, 'verifyRecoverySubtitle')}
                </p>
            </div>

            {/* Verification slots */}
            <div className="mb-6 space-y-4">
                {verifyPositions.map((pos, idx) => (
                    <div key={pos}>
                        <Label className="mb-2 block text-sm font-medium">
                            {t(language, 'wordNumber', { number: pos + 1 })}
                        </Label>
                        <Input
                            readOnly
                            value={selectedWords[idx] || ''}
                            placeholder={t(language, 'selectWordPlaceholder')}
                            className={selectedWords[idx] ? 'border-primary/60 bg-primary/10 text-primary' : ''}
                        />
                    </div>
                ))}
            </div>

            {/* Word selection */}
            <div className="flex-1 mb-6">
                <p className="text-sm font-medium mb-3">{t(language, 'selectFromRecovery')}</p>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                    {shuffledWords.map((word, index) => {
                        const isSelected = selectedWords.includes(word);
                        return (
                            <Button
                                key={index}
                                onClick={() => {
                                    const emptySlot = selectedWords.findIndex((w) => w === null);
                                    if (emptySlot !== -1 || isSelected) {
                                        handleWordSelect(word, isSelected ? selectedWords.indexOf(word) : emptySlot);
                                    }
                                }}
                                disabled={isSelected}
                                variant={isSelected ? 'default' : 'secondary'}
                                className="h-9 px-3 text-xs font-mono"
                            >
                                {word}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Verify button */}
            <Button
                onClick={handleVerify}
                disabled={selectedWords.some((w) => w === null) || isCreating}
                className="w-full"
            >
                {isCreating
                    ? isAddMode
                        ? t(language, 'addingWallet')
                        : t(language, 'creatingWallet')
                    : isAddMode
                        ? t(language, 'verifyAddWallet')
                        : t(language, 'verifyCreateWallet')}
            </Button>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'verificationFailed')}</AlertDialogTitle>
                        <AlertDialogDescription>{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
