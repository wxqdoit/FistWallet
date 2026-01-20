import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, Button, Card, CardContent } from '@/ui';
import { ArrowLeft, CheckCircle, Eye, WarningCircle, XCircle } from '@phosphor-icons/react';

export default function BackupMnemonic() {
    const navigate = useNavigate();
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const tempMnemonic = sessionStorage.getItem('tempMnemonic');
        if (!tempMnemonic) {
            navigate('/welcome');
            return;
        }
        setMnemonic(tempMnemonic.split(' '));
    }, [navigate]);



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
                    className="mb-4 px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Backup Recovery Phrase</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    Write down these 12 words in order and keep them safe
                </p>
            </div>

            {/* Warning */}
            <Alert variant="warning" className="mb-4">
                <AlertDescription >
                    <div className="flex align-middle items-center gap-3">
                        <WarningCircle className="text-warning" size={20} />
                        <div className="text-sm">
                            <p className="font-semibold text-warning ">Never share your recovery phrase</p>
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
                                <Eye size={16} />
                                Reveal Recovery Phrase
                            </Button>
                        </div>
                    )}

                    <CardContent className="p-4">
                        <div className={`grid grid-cols-2 gap-3 ${!isRevealed ? 'blur-lg' : ''}`}>
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
                    </CardContent>
                </Card>
            </div>

            {/* Tips */}
            <div className="mb-6 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    Write it down on paper
                </p>
                <p className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    Store in a secure location
                </p>
                <p className="flex items-center gap-2">
                    <XCircle size={16} className="text-error" />
                    Never share with anyone
                </p>
                <p className="flex items-center gap-2">
                    <XCircle size={16} className="text-error" />
                    Never store digitally
                </p>
            </div>

            {/* Continue button */}
            <div className="mt-auto pt-2 pb-2 sticky bottom-0 bg-background">
                <Button onClick={handleContinue} disabled={!isRevealed} className="w-full">
                    I've Written It Down
                </Button>
            </div>
        </div>
    );
}
