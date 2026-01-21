import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { LockIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

export default function Unlock() {
    const navigate = useNavigate();
    const { unlock } = useWalletStore();
    const { language } = useSettingsStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const handleErrorDialogChange = (open: boolean) => {
        if (!open) {
            setError('');
        }
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsUnlocking(true);

        try {
            const success = await unlock(password);

            if (success) {
                navigate('/');
            } else {
                setError(t(language, 'unlockIncorrectPassword'));
                setPassword('');
            }
        } catch (err) {
            setError(t(language, 'unlockFailed'));
            console.error(err);
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-muted/40 to-background">
            {/* Logo */}
            <div className="text-center mb-12">
                <div className="text-6xl mb-4 flex items-center justify-center">
                    <LockIcon size={48} />
                </div>
                <h1 className="text-3xl font-bold mb-2">{t(language, 'unlockTitle')}</h1>
                <p className="text-muted-foreground text-sm">{t(language, 'unlockSubtitle')}</p>
            </div>

            {/* Unlock form */}
            <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-4">
                <div>
                    <Label className="mb-2 block text-sm font-medium">{t(language, 'passwordLabel')}</Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t(language, 'enterYourPassword')}
                        autoFocus
                        disabled={isUnlocking}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={!password || isUnlocking}
                    className="w-full"
                >
                    {isUnlocking ? t(language, 'unlocking') : t(language, 'unlock')}
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-muted-foreground">
                <p>{t(language, 'forgotPasswordHint')}</p>
            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'unableToUnlock')}</AlertDialogTitle>
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
