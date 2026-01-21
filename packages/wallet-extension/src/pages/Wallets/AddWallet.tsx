import { useNavigate } from 'react-router-dom';
import { generateMnemonic } from '@core/wallet';
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

export default function AddWallet() {
    const navigate = useNavigate();
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
            setError('Failed to generate recovery phrase.');
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
                    Add Wallet
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium">Create New Wallet</p>
                        <p className="text-xs text-muted-foreground">
                            Generate a brand new recovery phrase.
                        </p>
                        <Button className="w-full justify-center" onClick={handleCreate}>
                            <PlusCircleIcon size={16} />
                            Create Wallet
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium">Import Existing Wallet</p>
                        <p className="text-xs text-muted-foreground">
                            Restore from a recovery phrase or private key.
                        </p>
                        <Button
                            variant="secondary"
                            className="w-full justify-center"
                            onClick={() => navigate('/import-wallet?mode=add')}
                        >
                            <DownloadSimpleIcon size={16} />
                            Import Wallet
                        </Button>
                    </CardContent>
                </Card>

            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unable to create wallet</AlertDialogTitle>
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
