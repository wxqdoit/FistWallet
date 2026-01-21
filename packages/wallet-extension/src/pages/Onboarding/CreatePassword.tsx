import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    Checkbox,
    Input,
    Label,
    Progress,
} from '@/ui';
import { ArrowLeftIcon } from '@phosphor-icons/react';

export default function CreatePassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const handleErrorDialogChange = (open: boolean) => {
        if (!open) {
            setError('');
        }
    };

    const getPasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
        if (pwd.length < 8) return 'weak';
        if (pwd.length < 12) return 'medium';
        if (pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)) return 'strong';
        return 'medium';
    };

    const strength = password ? getPasswordStrength(password) : null;
    const strengthValue = strength === 'weak' ? 33 : strength === 'medium' ? 66 : strength === 'strong' ? 100 : 0;

    const handleContinue = () => {
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!agreedToTerms) {
            setError('Please agree to the terms of service');
            return;
        }

        if (mode === 'import') {
            sessionStorage.setItem('tempPassword', password);
            navigate('/import-wallet');
            return;
        }

        try {
            // Generate mnemonic and store password temporarily
            const mnemonic = generateMnemonic(12);
            sessionStorage.setItem('tempPassword', password);
            sessionStorage.setItem('tempMnemonic', mnemonic);

            navigate('/backup-mnemonic');
        } catch (error) {
            console.error('Failed to generate mnemonic:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to generate recovery phrase. Please try again.'
            );
        }
    };

    return (
            <div className="h-full flex flex-col p-6 bg-background">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-4 px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Create Password</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    This password encrypts your wallet on this device
                </p>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-4">
                <div>
                    <Label className="mb-2 block text-sm font-medium">New Password</Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                    />
                    {strength && (
                        <div className="mt-2 flex items-center gap-2">
                            <Progress value={strengthValue} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground capitalize">{strength}</span>
                        </div>
                    )}
                </div>

                <div>
                    <Label className="mb-2 block text-sm font-medium">Confirm Password</Label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                    />
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <a href="#" className="text-primary hover:underline">
                            Terms of Service
                        </a>
                    </Label>
                </div>

            </div>

            {/* Continue button */}
            <Button onClick={handleContinue} disabled={!password || !confirmPassword || !agreedToTerms} className="w-full">
                Continue
            </Button>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unable to continue</AlertDialogTitle>
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
