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
    AlertDialogTrigger,
    Button,
    Card,
    CardContent,
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
                    {t(language, 'back')}
                </Button>
                <h1 className="text-2xl font-bold">{t(language, 'backupRecoveryTitle')}</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    {t(language, 'backupRecoverySubtitle')}
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
                        {t(language, 'neverShareRecovery')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'keepRecoverySafe')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(language, 'recoveryWarningBody')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>{t(language, 'gotIt')}</AlertDialogAction>
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
                                {t(language, 'revealRecovery')}
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
                    {t(language, 'tipWriteDown')}
                </p>
                <p className="flex items-center gap-2">
                    <CheckCircleIcon size={16} className="text-success" />
                    {t(language, 'tipStoreSecure')}
                </p>
                <p className="flex items-center gap-2">
                    <XCircleIcon size={16} className="text-error" />
                    {t(language, 'tipNeverShare')}
                </p>
                <p className="flex items-center gap-2">
                    <XCircleIcon size={16} className="text-error" />
                    {t(language, 'tipNeverStoreDigital')}
                </p>
            </div>

            {/* Continue button */}
            <div className="mt-auto pt-2 pb-2 sticky bottom-0 bg-background">
                <Button onClick={handleContinue} disabled={!isRevealed} className="w-full">
                    {t(language, 'writtenDown')}
                </Button>
            </div>

            <AlertDialog open={isRevealAlertOpen} onOpenChange={setIsRevealAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'revealRequiredTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(language, 'revealRequiredBody')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
