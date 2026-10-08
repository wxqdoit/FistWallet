import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    Checkbox,
    Input,
    Label,
} from '@/ui';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

export default function CreatePassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useSettingsStore();
    const mode = searchParams.get('mode');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            setError(t(language, 'passwordTooShort'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t(language, 'passwordsDoNotMatch'));
            return;
        }

        if (!agreedToTerms) {
            setError(t(language, 'agreeToTermsRequired'));
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
                    : t(language, 'generateRecoveryFailed')
            );
        }
    };

    return (
        <div className="h-full flex flex-col justify-between p-6 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none relative overflow-hidden">
            {/* Top Navigation & Title */}
            <div className="relative z-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors mb-5 cursor-pointer"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, 'createPasswordTitle')}</h1>
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                    {t(language, 'createPasswordSubtitle')}
                </p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-5 my-auto relative z-10 pt-4">
                <div className="space-y-2">
                    <Label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                        {t(language, 'newPasswordLabel')}
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t(language, 'enterPassword')}
                            className="pr-10 h-12 bg-[#0A0D14] border-white/10 rounded-xl focus:border-indigo-500/50 text-white placeholder:text-neutral-500 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1 cursor-pointer"
                        >
                            {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                    {strength && (
                        <div className="pt-1.5 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <div className={`h-1 flex-1 rounded-full transition-all ${
                                    strengthValue >= 33 ? (strength === 'weak' ? 'bg-rose-500' : strength === 'medium' ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-white/10'
                                }`} />
                                <div className={`h-1 flex-1 rounded-full transition-all ${
                                    strengthValue >= 66 ? (strength === 'medium' ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-white/10'
                                }`} />
                                <div className={`h-1 flex-1 rounded-full transition-all ${
                                    strengthValue === 100 ? 'bg-emerald-400' : 'bg-white/10'
                                }`} />
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white/40">{t(language, 'securityStrength')}</span>
                                <span className={`font-semibold capitalize ${
                                    strength === 'weak' ? 'text-rose-400' : strength === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                    {strength === 'weak'
                                        ? t(language, 'strengthWeak')
                                        : strength === 'medium'
                                            ? t(language, 'strengthMedium')
                                            : t(language, 'strengthStrong')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                        {t(language, 'confirmPasswordLabel')}
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t(language, 'confirmPasswordPlaceholder')}
                            className="pr-10 h-12 bg-[#0A0D14] border-white/10 rounded-xl focus:border-indigo-500/50 text-white placeholder:text-neutral-500 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1 cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        className="rounded-md border-white/20 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <Label htmlFor="terms" className="text-xs text-white/50 leading-tight cursor-pointer">
                        {t(language, 'agreeToTermsPrefix')}{' '}
                        <span className="text-indigo-400 hover:underline">
                            {t(language, 'termsOfService')}
                        </span>
                    </Label>
                </div>
            </div>

            {/* Continue button: Capsule Pill Button in FistWallet Brand Color */}
            <div className="w-full relative z-10 pt-4">
                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!password || !confirmPassword || !agreedToTerms}
                    className={`w-full h-12 rounded-full font-bold text-[14px] transition-all flex items-center justify-center ${
                        password && confirmPassword && agreedToTerms
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 cursor-pointer'
                            : 'bg-[#14161E] text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                >
                    {t(language, 'continue')}
                </button>
            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">{t(language, 'unableToContinue')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 mt-1">{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogAction className="rounded-full h-11 text-xs font-bold bg-indigo-600 text-white w-full">{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
