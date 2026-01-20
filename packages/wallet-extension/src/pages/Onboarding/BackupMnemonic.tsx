import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, Button, Card, CardContent } from '@/ui';

export default function BackupMnemonic() {
    const navigate = useNavigate();
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const tempMnemonic = sessionStorage.getItem('tempMnemonic');
        if (!tempMnemonic) {
            navigate('/welcome');
            return;
        }
        setMnemonic(tempMnemonic.split(' '));
    }, [navigate]);

    const handleCopy = () => {
        navigator.clipboard.writeText(mnemonic.join(' '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Show warning about clipboard
        alert('⚠️ Warning: Copying to clipboard may not be secure. We recommend writing it down on paper.');
    };

    const handleContinue = () => {
        if (!isRevealed) {
            alert('Please reveal and backup your recovery phrase first');
            return;
        }
        navigate('/verify-mnemonic');
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
                >
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">Backup Recovery Phrase</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    Write down these 12 words in order and keep them safe
                </p>
            </div>

            {/* Warning */}
            <Alert variant="warning" className="mb-6">
                <AlertDescription>
                    <div className="flex items-start gap-3">
                        <span className="text-warning text-xl">⚠️</span>
                        <div className="text-sm">
                            <p className="font-semibold text-warning mb-1">Never share your recovery phrase</p>
                            <p className="text-muted-foreground">
                                Anyone with this phrase can access your funds. FistWallet will never ask for it.
                            </p>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>

            {/* Mnemonic display */}
            <div className="flex-1 mb-6">
                <Card className="relative">
                    {!isRevealed && (
                        <div className="absolute inset-0 backdrop-blur-xl bg-black/50 rounded-xl flex items-center justify-center z-10">
                            <Button onClick={() => setIsRevealed(true)}>
                                👁️ Reveal Recovery Phrase
                            </Button>
                        </div>
                    )}

                    <CardContent className="p-6">
                        <div className={`grid grid-cols-3 gap-3 ${!isRevealed ? 'blur-lg' : ''}`}>
                            {mnemonic.map((word, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-border/60 bg-muted/30 p-3"
                                >
                                    <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                                    <span className="font-mono">{word}</span>
                                </div>
                            ))}
                        </div>

                        {isRevealed && (
                            <Button
                                variant="ghost"
                                onClick={handleCopy}
                                className="mt-4 w-full text-sm text-primary hover:text-primary/80"
                            >
                                {copied ? '✓ Copied!' : '📋 Copy to Clipboard (Not Recommended)'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tips */}
            <div className="mb-6 space-y-2 text-sm text-muted-foreground">
                <p>✓ Write it down on paper</p>
                <p>✓ Store in a secure location</p>
                <p>✗ Never share with anyone</p>
                <p>✗ Never store digitally</p>
            </div>

            {/* Continue button */}
            <Button onClick={handleContinue} disabled={!isRevealed} className="w-full">
                I've Written It Down
            </Button>
        </div>
    );
}
