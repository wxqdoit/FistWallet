import { useNavigate } from 'react-router-dom';
import { generateMnemonic } from '@core/wallet';
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
    Card,
    CardContent,
} from '@/ui';
import { ArrowLeftIcon, DownloadSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { t } from '@utils/i18n';

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
            setError(t(language, 'generateRecoveryFailedShort'));
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4  flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className=" px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    {t(language, 'addWalletTitle')}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium">{t(language, 'createWalletTitle')}</p>
                        <p className="text-xs text-muted-foreground">
                            {t(language, 'createWalletHint')}
                        </p>
                        <Button className="w-full justify-center" onClick={handleCreate}>
                            <PlusCircleIcon size={16} />
                            {t(language, 'createWalletAction')}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium">{t(language, 'importExistingWallet')}</p>
                        <p className="text-xs text-muted-foreground">
                            {t(language, 'importWalletHint')}
                        </p>
                        <Button
                            variant="secondary"
                            className="w-full justify-center"
                            onClick={() => navigate('/import-wallet?mode=add')}
                        >
                            <DownloadSimpleIcon size={16} />
                            {t(language, 'importWallet')}
                        </Button>
                    </CardContent>
                </Card>

            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'unableToCreateWallet')}</AlertDialogTitle>
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
