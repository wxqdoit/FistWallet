import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Card,
    CardContent,
    Input,
    Label,
    Textarea,
} from '@/ui';
import { ArrowLeftIcon, CopyIcon, KeyIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { t } from '@utils/i18n';

export default function WalletManage() {
    const navigate = useNavigate();
    const { wallet, currentNetwork, exportMnemonic, exportPrivateKey, deleteWallet, unlock } = useWalletStore();
    const { language } = useSettingsStore();
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [pendingAction, setPendingAction] = useState<'mnemonic' | 'privateKey' | 'delete' | null>(null);
    const handleErrorDialogChange = (open: boolean) => {
        if (!open) {
            setError('');
        }
    };
    const handleConfirmDialogChange = (open: boolean) => {
        setIsConfirmDialogOpen(open);
        if (!open) {
            setConfirmPassword('');
            setConfirmError('');
            setPendingAction(null);
        }
    };

    if (!wallet) {
        return null;
    }

    const canExportMnemonic = wallet.type === 'mnemonic';

    const handleExportMnemonic = async () => {
        setError('');
        setIsLoading(true);
        try {
            const phrase = await exportMnemonic();
            if (!phrase) {
                setError(t(language, 'mnemonicNotAvailable'));
                return;
            }
            setMnemonic(phrase);
        } catch (err) {
            console.error(err);
            setError(t(language, 'exportMnemonicFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPrivateKey = async () => {
        setError('');
        setIsLoading(true);
        try {
            const key = await exportPrivateKey(currentNetwork.chainType);
            setPrivateKey(key);
        } catch (err) {
            console.error(err);
            setError(t(language, 'exportPrivateKeyFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setError('');
        openConfirmDialog('delete');
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) {
            return;
        }

        if (!confirmPassword) {
            setConfirmError(t(language, 'confirmPasswordRequired'));
            return;
        }

        setIsConfirming(true);
        setConfirmError('');
        try {
            const isValid = await unlock(confirmPassword);
            if (!isValid) {
                setConfirmError(t(language, 'unlockIncorrectPassword'));
                return;
            }

            const action = pendingAction;
            handleConfirmDialogChange(false);

            if (action === 'mnemonic') {
                await handleExportMnemonic();
                return;
            }

            if (action === 'privateKey') {
                await handleExportPrivateKey();
                return;
            }

            if (action === 'delete') {
                setIsLoading(true);
                try {
                    await deleteWallet(wallet.id);
                    navigate('/wallets');
                } catch (err) {
                    console.error(err);
                    setError(t(language, 'deleteWalletFailed'));
                } finally {
                    setIsLoading(false);
                }
            }
        } catch (err) {
            console.error(err);
            setConfirmError(t(language, 'confirmPasswordFailed'));
        } finally {
            setIsConfirming(false);
        }
    };

    const handleConfirmClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        await handleConfirmAction();
    };

    const openConfirmDialog = (action: 'mnemonic' | 'privateKey' | 'delete') => {
        setPendingAction(action);
        setConfirmPassword('');
        setConfirmError('');
        setIsConfirmDialogOpen(true);
    };

    const getConfirmTitle = () => {
        if (pendingAction === 'delete') return t(language, 'confirmDeletion');
        if (pendingAction === 'privateKey') return t(language, 'confirmExport');
        return t(language, 'confirmExport');
    };

    const getConfirmDescription = () => {
        if (pendingAction === 'delete') {
            return t(language, 'confirmDeleteDescription');
        }
        if (pendingAction === 'privateKey') {
            return t(language, 'confirmPrivateKeyDescription', { network: currentNetwork.name });
        }
        return t(language, 'confirmRecoveryDescription');
    };

    const getConfirmActionLabel = () => {
        if (pendingAction === 'delete') return t(language, 'delete');
        return t(language, 'confirm');
    };

    const isDeleteAction = pendingAction === 'delete';

    const handleCopy = async (value: string, label: string) => {
        const toastId = toast.loading(t(language, 'copyingItem', { label: label.toLowerCase() }));
        try {
            await navigator.clipboard.writeText(value);
            toast.success(t(language, 'copiedItem', { label }), { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error(t(language, 'copyFailed', { label: label.toLowerCase() }), { id: toastId });
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
                    className="px-2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                >
                    <ArrowLeftIcon size={16} />
                    {t(language, 'manage')}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-4">
                {canExportMnemonic && (
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <Label className="text-sm font-medium">{t(language, 'exportMnemonic')}</Label>
                            <p className="text-xs text-muted-foreground">
                                {t(language, 'exportMnemonicHint')}
                            </p>
                            <Button
                                variant="secondary"
                            onClick={() => openConfirmDialog('mnemonic')}
                                disabled={isLoading}
                                className="w-full justify-center"
                            >
                                <KeyIcon size={16} />
                                {t(language, 'revealRecoveryPhrase')}
                            </Button>
                            {mnemonic && (
                                <div className="space-y-2">
                                    <Textarea readOnly value={mnemonic} className="font-mono text-xs min-h-[90px]" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-center"
                                    onClick={() => handleCopy(mnemonic, t(language, 'recoveryPhraseLabel'))}
                                    >
                                        <CopyIcon size={14} />
                                        {t(language, 'copy')}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="p-4 space-y-3">
                        <Label className="text-sm font-medium">{t(language, 'exportPrivateKey')}</Label>
                        <p className="text-xs text-muted-foreground">
                            {t(language, 'exportPrivateKeyHint', { network: currentNetwork.name })}
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => openConfirmDialog('privateKey')}
                            disabled={isLoading}
                            className="w-full justify-center"
                        >
                            <KeyIcon size={16} />
                            {t(language, 'revealPrivateKey')}
                        </Button>
                        {privateKey && (
                            <div className="space-y-2">
                                <Textarea readOnly value={privateKey} className="font-mono text-xs min-h-[90px]" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => handleCopy(privateKey, t(language, 'privateKeyLabel'))}
                                >
                                    <CopyIcon size={14} />
                                    {t(language, 'copy')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-auto">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="w-full justify-center"
                    >
                        <WarningCircleIcon size={16} />
                        {t(language, 'deleteWallet')}
                    </Button>
                </div>
            </div>

            <AlertDialog open={isConfirmDialogOpen} onOpenChange={handleConfirmDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{getConfirmTitle()}</AlertDialogTitle>
                        <AlertDialogDescription>{getConfirmDescription()}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium">
                            {t(language, 'passwordLabel')}
                        </Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => {
                                setConfirmPassword(event.target.value);
                                if (confirmError) {
                                    setConfirmError('');
                                }
                            }}
                            placeholder={t(language, 'enterYourPassword')}
                            autoFocus
                            disabled={isConfirming}
                        />
                        {confirmError && <p className="text-xs text-destructive">{confirmError}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isConfirming}>{t(language, 'cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmClick}
                            disabled={isConfirming}
                            className={isDeleteAction ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
                        >
                            {isConfirming ? t(language, 'confirming') : getConfirmActionLabel()}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'walletActionFailed')}</AlertDialogTitle>
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
