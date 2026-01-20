import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { Alert, AlertDescription, Button, Input, Label } from '@/ui';

export default function VerifyMnemonic() {
    const navigate = useNavigate();
    const { createNewWallet } = useWalletStore();
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [shuffledWords, setShuffledWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([null, null, null]);
    const [verifyPositions] = useState([2, 6, 11]); // Positions 3, 7, 12 (0-indexed)
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const tempMnemonic = sessionStorage.getItem('tempMnemonic');
        if (!tempMnemonic) {
            navigate('/welcome');
            return;
        }

        const words = tempMnemonic.split(' ');
        setMnemonic(words);

        // Shuffle words for selection
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
    }, [navigate]);

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
            setError('Please select all words');
            return;
        }

        // Verify correctness
        const isCorrect = verifyPositions.every(
            (pos, idx) => selectedWords[idx] === mnemonic[pos]
        );

        if (!isCorrect) {
            setError('Incorrect words. Please try again.');
            setSelectedWords([null, null, null]);
            return;
        }

        // Create wallet
        setIsCreating(true);
        try {
            const password = sessionStorage.getItem('tempPassword');
            const mnemonicPhrase = sessionStorage.getItem('tempMnemonic');

            if (!password || !mnemonicPhrase) {
                throw new Error('Session data not found');
            }

            await createNewWallet(password, mnemonicPhrase);

            // Clear temporary data
            sessionStorage.removeItem('tempPassword');
            sessionStorage.removeItem('tempMnemonic');

            // Navigate to dashboard
            navigate('/');
        } catch (err) {
            setError('Failed to create wallet. Please try again.');
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
                    className="mb-4 px-0 text-muted-foreground hover:text-foreground"
                    disabled={isCreating}
                >
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">Verify Recovery Phrase</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    Select the correct words to verify your backup
                </p>
            </div>

            {/* Verification slots */}
            <div className="mb-6 space-y-4">
                {verifyPositions.map((pos, idx) => (
                    <div key={pos}>
                        <Label className="mb-2 block text-sm font-medium">
                            Word #{pos + 1}
                        </Label>
                        <Input
                            readOnly
                            value={selectedWords[idx] || ''}
                            placeholder="Select word..."
                            className={selectedWords[idx] ? 'border-primary/60 bg-primary/10 text-primary' : ''}
                        />
                    </div>
                ))}
            </div>

            {/* Word selection */}
            <div className="flex-1 mb-6">
                <p className="text-sm font-medium mb-3">Select from your recovery phrase:</p>
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

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Verify button */}
            <Button
                onClick={handleVerify}
                disabled={selectedWords.some((w) => w === null) || isCreating}
                className="w-full"
            >
                {isCreating ? 'Creating Wallet...' : 'Verify & Create Wallet'}
            </Button>
        </div>
    );
}
