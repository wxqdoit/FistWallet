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
} from '@/ui';
import {
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    FingerprintIcon,
} from '@phosphor-icons/react';
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
    const [touchIdEnabled, setTouchIdEnabled] = useState(true);
    const [agreedToTerms, setAgreedToTerms] = useState(true);
    const [error, setError] = useState('');

    const hasMinLength = password.length >= 8;
    const hasSymbol = /[@$!%*?&#^_~]/.test(password);
    const hasNumber = /\d/.test(password);
    const isMatched = password.length > 0 && password === confirmPassword;

    // 4-Tier Strength Calculation
    const getStrengthTier = () => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (hasSymbol) score += 1;
        if (hasNumber && /[A-Z]/.test(password)) score += 1;
        return Math.max(1, Math.min(score, 4));
    };

    const strengthTier = getStrengthTier();
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#FF5252', '#FBBF24', '#38BDF8', '#00E599'];

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
            navigate('/import-wallet', {
                state: { password, touchIdEnabled },
            });
        } else {
            const mnemonic = generateMnemonic();
            navigate('/backup-mnemonic', {
                state: { password, mnemonic, touchIdEnabled },
            });
        }
    };

    return (
        <div className="h-full w-full flex flex-col justify-between p-5 bg-[#070A12] text-white font-sans select-none">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#CBD5E1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} />
                </button>
                <h2 className="text-sm font-bold text-white tracking-tight">Set Password</h2>
                <div className="w-8" />
            </div>

            {/* Content */}
            <div className="flex-1 py-3 space-y-4">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Lock Your Vault</h1>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                        This password protects your private keys on this browser.
                    </p>
                </div>

                {/* New Password Input */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#E2E8F0] tracking-wider uppercase">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••••••"
                            className="w-full h-11 px-3.5 pr-10 rounded-xl bg-[#101522] border border-[#253147] focus:border-indigo-500 text-white placeholder:text-white/20 text-sm font-medium transition-colors outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-[#94A3B8] hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                </div>

                {/* 4-Tier Strength Bar */}
                {password && (
                    <div className="space-y-1.5 pt-0.5">
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                            {[1, 2, 3, 4].map((tier) => (
                                <div
                                    key={tier}
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        backgroundColor:
                                            strengthTier >= tier
                                                ? strengthColors[strengthTier - 1]
                                                : '#1E293B',
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                            <span
                                className="font-bold transition-colors"
                                style={{ color: strengthColors[strengthTier - 1] }}
                            >
                                {strengthLabels[strengthTier - 1]} Password
                            </span>
                            <span className="text-[#64748B] font-mono">
                                Entropy: ~{strengthTier * 22} bits
                            </span>
                        </div>
                    </div>
                )}

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#E2E8F0] tracking-wider uppercase">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••••••"
                            className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-[#101522] border ${
                                isMatched ? 'border-[#00E599]' : 'border-[#253147]'
                            } focus:border-indigo-500 text-white placeholder:text-white/20 text-sm font-medium transition-colors outline-none`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-[#94A3B8] hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="space-y-2 pt-1 text-xs text-[#CBD5E1]">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                hasMinLength ? 'bg-[#00E599]/20 text-[#00E599]' : 'bg-white/5 text-white/30'
                            }`}
                        >
                            <CheckCircleIcon size={14} weight="bold" />
                        </div>
                        <span>At least 8 alphanumeric characters</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                hasSymbol ? 'bg-[#00E599]/20 text-[#00E599]' : 'bg-white/5 text-white/30'
                            }`}
                        >
                            <CheckCircleIcon size={14} weight="bold" />
                        </div>
                        <span>Contains at least 1 symbol (@, #, $, %, !)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                isMatched ? 'bg-[#00E599]/20 text-[#00E599]' : 'bg-white/5 text-white/30'
                            }`}
                        >
                            <CheckCircleIcon size={14} weight="bold" />
                        </div>
                        <span>Passwords match perfectly</span>
                    </div>
                </div>

                {/* Biometrics Toggle Card */}
                <div
                    onClick={() => setTouchIdEnabled(!touchIdEnabled)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#121726] border border-[#253248] hover:border-white/20 transition-all cursor-pointer shadow-xs"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-[#818CF8] flex items-center justify-center">
                            <FingerprintIcon size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Enable Touch ID Quick Unlock</p>
                            <p className="text-[11px] text-[#94A3B8]">Unlock instantly without typing password</p>
                        </div>
                    </div>
                    <div
                        className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                            touchIdEnabled ? 'bg-indigo-600' : 'bg-white/10'
                        }`}
                    >
                        <div
                            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                touchIdEnabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                    </div>
                </div>

                {/* Terms of Service Checkbox */}
                <div
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className="flex items-center gap-2 pt-1 text-xs text-[#94A3B8] cursor-pointer"
                >
                    <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            agreedToTerms ? 'bg-indigo-600 text-white' : 'border border-white/20'
                        }`}
                    >
                        {agreedToTerms && <CheckCircleIcon size={12} weight="bold" />}
                    </div>
                    <span>I understand FistWallet is non-custodial and I am responsible for my keys.</span>
                </div>
            </div>

            {/* CTA Continue */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!hasMinLength || !isMatched || !agreedToTerms}
                    className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] disabled:opacity-40 disabled:pointer-events-none text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] border border-[#A5B4FC]/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                >
                    {mode === 'import' ? 'Continue to Import' : 'Continue to Secret Phrase'}
                </button>
            </div>

            <AlertDialog open={!!error} onOpenChange={(open) => !open && setError('')}>
                <AlertDialogContent className="bg-[#121726] border border-[#2B364C] text-white rounded-2xl max-w-[320px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold text-rose-400">Error</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-[#94A3B8]">{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="bg-indigo-600 text-white rounded-xl text-xs font-bold">
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
