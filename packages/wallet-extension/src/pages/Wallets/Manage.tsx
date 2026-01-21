import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
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

export default function WalletManage() {
    const navigate = useNavigate();
    const { wallet, currentNetwork, exportMnemonic, exportPrivateKey, deleteWallet, unlock } = useWalletStore();
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
                setError('Mnemonic not available for this wallet.');
                return;
            }
            setMnemonic(phrase);
        } catch (err) {
            console.error(err);
            setError('Failed to export mnemonic.');
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
            setError('Failed to export private key.');
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
            setConfirmError('Please enter your password.');
            return;
        }

        setIsConfirming(true);
        setConfirmError('');
        try {
            const isValid = await unlock(confirmPassword);
            if (!isValid) {
                setConfirmError('Incorrect password.');
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
                    setError('Failed to delete wallet.');
                } finally {
                    setIsLoading(false);
                }
            }
        } catch (err) {
            console.error(err);
            setConfirmError('Failed to confirm password.');
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
        if (pendingAction === 'delete') return 'Confirm deletion';
        if (pendingAction === 'privateKey') return 'Confirm export';
        return 'Confirm export';
    };

    const getConfirmDescription = () => {
        if (pendingAction === 'delete') {
            return 'Enter your password to delete this wallet. This action cannot be undone.';
        }
        if (pendingAction === 'privateKey') {
            return `Enter your password to reveal the private key for ${currentNetwork.name}.`;
        }
        return 'Enter your password to reveal your recovery phrase.';
    };

    const getConfirmActionLabel = () => {
        if (pendingAction === 'delete') return 'Delete';
        return 'Confirm';
    };

    const isDeleteAction = pendingAction === 'delete';

    const handleCopy = async (value: string, label: string) => {
        const toastId = toast.loading(`Copying ${label.toLowerCase()}...`);
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`, { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error(`Failed to copy ${label.toLowerCase()}`, { id: toastId });
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
                    Manage
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-4">
                {canExportMnemonic && (
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <Label className="text-sm font-medium">Export Mnemonic</Label>
                            <p className="text-xs text-muted-foreground">
                                Available for wallets created from or imported with a recovery phrase.
                            </p>
                            <Button
                                variant="secondary"
                            onClick={() => openConfirmDialog('mnemonic')}
                                disabled={isLoading}
                                className="w-full justify-center"
                            >
                                <KeyIcon size={16} />
                                Reveal Recovery Phrase
                            </Button>
                            {mnemonic && (
                                <div className="space-y-2">
                                    <Textarea readOnly value={mnemonic} className="font-mono text-xs min-h-[90px]" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-center"
                                    onClick={() => handleCopy(mnemonic, 'Recovery phrase')}
                                    >
                                        <CopyIcon size={14} />
                                        Copy
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="p-4 space-y-3">
                        <Label className="text-sm font-medium">Export Private Key</Label>
                        <p className="text-xs text-muted-foreground">
                            Export private key for {currentNetwork.name}.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => openConfirmDialog('privateKey')}
                            disabled={isLoading}
                            className="w-full justify-center"
                        >
                            <KeyIcon size={16} />
                            Reveal Private Key
                        </Button>
                        {privateKey && (
                            <div className="space-y-2">
                                <Textarea readOnly value={privateKey} className="font-mono text-xs min-h-[90px]" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => handleCopy(privateKey, 'Private key')}
                                >
                                    <CopyIcon size={14} />
                                    Copy
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
                        Delete Wallet
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
                            Password
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
                            placeholder="Enter your password"
                            autoFocus
                            disabled={isConfirming}
                        />
                        {confirmError && <p className="text-xs text-destructive">{confirmError}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmClick}
                            disabled={isConfirming}
                            className={isDeleteAction ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
                        >
                            {isConfirming ? 'Confirming...' : getConfirmActionLabel()}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Wallet action failed</AlertDialogTitle>
                        <AlertDialogDescription>{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
