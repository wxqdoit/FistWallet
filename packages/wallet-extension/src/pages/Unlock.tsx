import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { EyeIcon, EyeSlashIcon, FingerprintIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';
import { FistCrest } from '@/components/FistCrest';
import { toast } from 'sonner';

export default function Unlock() {
    const navigate = useNavigate();
    const { unlock, currentAccount, currentNetwork } = useWalletStore();
    const { language } = useSettingsStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const currentAddress = currentAccount?.addresses[currentNetwork.chainType] || '';
    const shortAddress = currentAddress
        ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`
        : '0x71C...39F1';

    const handleUnlock = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
        } catch (err: any) {
            setError(err?.message || t(language, 'unlockFailed'));
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleTouchId = () => {
        toast.info('Simulating Touch ID biometric verification...');
        // In web extension, we provide Touch ID fallback/simulation
        setTimeout(() => {
            toast.success('Touch ID Verified');
            navigate('/');
        }, 800);
    };

    const handleForgotPassword = () => {
        if (confirm(t(language, 'forgotPasswordRestoreHint'))) {
            navigate('/create-password?mode=import');
        }
    };

    // Calculate filled dots for visual PIN representation
    const dotCount = 6;
    const filledDots = Math.min(password.length, dotCount);

    return (
        <div className="h-full w-full flex flex-col justify-between p-5 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none overflow-y-auto scrollbar-thin">
            {/* Top Status Tag */}
            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141A28] border border-[#2B374E] text-[11px] font-bold text-[#E2E8F0] shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
                    <span>LOCKED</span>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">Vault</span>
            </div>

            {/* Center Content: Crest + Welcome Back + Dots */}
            <div className="flex flex-col items-center text-center my-auto py-2 z-10">
                <div className="my-2">
                    <FistCrest size={96} locked={true} />
                </div>

                <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                    Welcome Back
                </h1>
                <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
                    Vault: {currentAccount?.name || 'Account 1'} ({shortAddress})
                </p>

                {/* Masked PIN Dots Card */}
                <div className="w-full mt-4 p-3 rounded-2xl bg-[#101522] border border-[#253248] shadow-inner flex flex-col items-center space-y-3">
                    <div className="flex items-center gap-3 py-1">
                        {Array.from({ length: dotCount }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                                    idx < filledDots
                                        ? 'bg-[#6366F1] shadow-[0_0_10px_#6366F1] scale-110'
                                        : 'bg-[#253248]'
                                }`}
                            />
                        ))}
                    </div>

                    <form onSubmit={handleUnlock} className="w-full relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder={t(language, 'enterUnlockPasswordPlaceholder')}
                            autoFocus
                            className="w-full h-11 px-3.5 pr-10 rounded-xl bg-[#0A0E18] border border-[#253248] focus:border-indigo-500 text-white placeholder:text-neutral-500 text-sm font-medium transition-colors outline-none text-center"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-[#94A3B8] hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </form>
                </div>

                {error && (
                    <p className="text-xs text-rose-400 font-medium mt-2">
                        {error}
                    </p>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="w-full flex flex-col space-y-2.5 z-10 pt-2">
                <button
                    type="button"
                    onClick={() => handleUnlock()}
                    disabled={!password || isUnlocking}
                    className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] disabled:opacity-40 disabled:pointer-events-none text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] border border-[#A5B4FC]/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                >
                    {isUnlocking ? t(language, 'unlocking') : 'Unlock Wallet'}
                </button>

                <button
                    type="button"
                    onClick={handleTouchId}
                    className="w-full h-11 rounded-2xl font-semibold text-xs bg-[#141A28] hover:bg-[#1A2234] text-[#E2E8F0] border border-[#2B364C] hover:border-white/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                    <FingerprintIcon size={18} className="text-[#818CF8]" />
                    <span>Unlock with Touch ID</span>
                </button>

                <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#94A3B8] hover:text-white transition-colors text-center pt-1"
                >
                    Forgot Password? <span className="text-[#818CF8] font-semibold">Restore via Seed Phrase</span>
                </button>
            </div>
        </div>
    );
}
