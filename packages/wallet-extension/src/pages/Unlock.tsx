import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';
import { motion } from 'framer-motion';
import { OkxFistLogo } from '@/components/OkxFistLogo';

export default function Unlock() {
    const navigate = useNavigate();
    const { unlock } = useWalletStore();
    const { language } = useSettingsStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || isUnlocking) return;
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

    const handleForgotPassword = () => {
        if (confirm(t(language, 'forgotPasswordRestoreHint'))) {
            navigate('/create-password?mode=import');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full w-full flex flex-col justify-between px-6 pt-12 pb-8 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none relative"
        >
            {/* Top Brand Section: OKX-Style Pixel Modular F-Fist Logo + Fist Core Headline (No Subtitle) */}
            <div className="flex flex-col items-center text-center relative z-10 pt-1">
                <div className="mb-4 flex items-center justify-center">
                    <OkxFistLogo size={84} mode="f" colorScheme="indigo" glow={false} />
                </div>

                {/* Fist Headline: Direct meaning of Fist (No Subtitle) */}
                <h1 className="text-[26px] font-black tracking-tight text-white leading-tight">
                    {t(language, 'holdYourAssetsTight')}
                </h1>
            </div>

            {/* Middle: Standard Rectangular Card Input (NOT a pill!) in Natural Position */}
            <div className="w-full relative z-10 mt-8">
                <form onSubmit={handleUnlock} className="space-y-3">
                    <div
                        className={`relative flex items-center rounded-xl border transition-all h-12 px-4 bg-[#0A0D14] ${
                            error
                                ? 'border-rose-500/50 ring-1 ring-rose-500/20'
                                : 'border-white/10 hover:border-white/20 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 shadow-sm'
                        }`}
                    >
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder={t(language, 'enterUnlockPasswordPlaceholder')}
                            autoFocus
                            className="w-full text-sm bg-transparent outline-none text-white placeholder:text-neutral-500 font-normal pr-8 tracking-wide"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1 cursor-pointer flex items-center justify-center"
                        >
                            {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-xs text-rose-400 text-center font-medium py-0.5">
                            {error}
                        </p>
                    )}
                </form>
            </div>

            {/* Flexible Breathing Space to Balance Layout */}
            <div className="flex-1 min-h-[44px]" />

            {/* Bottom Actions: Capsule Pill Button & Forgot Password */}
            <div className="w-full flex flex-col items-center space-y-3.5 relative z-10">
                <button
                    type="button"
                    onClick={handleUnlock}
                    disabled={!password || isUnlocking}
                    className={`w-full h-12 rounded-full font-bold text-[14px] transition-all flex items-center justify-center ${
                        password && !isUnlocking
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 cursor-pointer'
                            : 'bg-[#14161E] text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                >
                    {isUnlocking ? t(language, 'unlocking') : t(language, 'unlockWalletNow')}
                </button>

                <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-white/40 hover:text-white transition-colors py-1 cursor-pointer font-medium"
                >
                    {t(language, 'forgotPasswordHint')}
                </button>
            </div>
        </motion.div>
    );
}
