import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    Button,
    Card,
    CardContent,
} from '@/ui';
import { ArrowLeftIcon, CheckCircleIcon, EyeIcon, WarningCircleIcon, XCircleIcon } from '@phosphor-icons/react';

export default function BackupMnemonic() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const isAddMode = mode === 'add';
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isWarningOpen, setIsWarningOpen] = useState(true);
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
                    <ArrowLeftIcon size={16} />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Backup Recovery Phrase</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    Write down these 12 words in order and keep them safe
                </p>
            </div>

            {/* Warning */}
            <AlertDialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="secondary"
                        className="mb-4 w-full justify-start gap-3 border border-warning/40 bg-warning/10 text-warning hover:bg-warning/20"
                    >
                        <WarningCircleIcon className="text-warning" size={20} />
                        Never share your recovery phrase
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Keep your recovery phrase safe</AlertDialogTitle>
                        <AlertDialogDescription>
                            Never share your recovery phrase with anyone. Anyone with this phrase can control your funds.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>Got it</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Mnemonic display */}
            <div className="flex-1 mb-6">
                <Card className="relative">
                    {!isRevealed && (
                        <div className="absolute inset-0 backdrop-blur-xl bg-black/50 rounded-xl flex items-center justify-center z-10">
                            <Button onClick={() => setIsRevealed(true)}>
                                <EyeIcon size={16} />
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
                    <CheckCircleIcon size={16} className="text-success" />
                    Write it down on paper
                </p>
                <p className="flex items-center gap-2">
                    <CheckCircleIcon size={16} className="text-success" />
                    Store in a secure location
                </p>
                <p className="flex items-center gap-2">
                    <XCircleIcon size={16} className="text-error" />
                    Never share with anyone
                </p>
                <p className="flex items-center gap-2">
                    <XCircleIcon size={16} className="text-error" />
                    Never store digitally
                </p>
            </div>

            {/* Continue button */}
            <div className="mt-auto pt-2 pb-2 sticky bottom-0 bg-background">
                <Button onClick={handleContinue} disabled={!isRevealed} className="w-full">
                    I've Written It Down
                </Button>
            </div>

            <AlertDialog open={isRevealAlertOpen} onOpenChange={setIsRevealAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reveal required</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please reveal and back up your recovery phrase before continuing.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
