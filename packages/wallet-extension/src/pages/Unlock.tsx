import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { Alert, AlertDescription, Button, Input, Label } from '@/ui';

export default function Unlock() {
    const navigate = useNavigate();
    const { unlock } = useWalletStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsUnlocking(true);

        try {
            const success = await unlock(password);

            if (success) {
                navigate('/');
            } else {
                setError('Incorrect password');
                setPassword('');
            }
        } catch (err) {
            setError('Failed to unlock wallet');
            console.error(err);
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-muted/40 to-background">
            {/* Logo */}
            <div className="text-center mb-12">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                <p className="text-muted-foreground text-sm">Unlock your wallet to continue</p>
            </div>

            {/* Unlock form */}
            <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-4">
                <div>
                    <Label className="mb-2 block text-sm font-medium">Password</Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoFocus
                        disabled={isUnlocking}
                    />
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button
                    type="submit"
                    disabled={!password || isUnlocking}
                    className="w-full"
                >
                    {isUnlocking ? 'Unlocking...' : 'Unlock'}
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-muted-foreground">
                <p>Forgot password? You'll need to restore from recovery phrase</p>
            </div>
        </div>
    );
}
