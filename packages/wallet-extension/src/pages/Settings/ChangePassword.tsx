import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, LockKeyIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';
import { motion } from 'framer-motion';

export default function ChangePassword() {
    const navigate = useNavigate();
    const { changePassword } = useWalletStore();
    const { language } = useSettingsStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError(t(language, 'allPasswordFieldsRequired'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError(t(language, 'passwordsDoNotMatchError'));
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError(t(language, 'passwordMinLengthError'));
            return;
        }

        setPasswordError('');
        setIsSaving(true);
        try {
            await changePassword(currentPassword, newPassword);
            toast.success(t(language, 'passwordChangedSuccessToast'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigate(-1);
        } catch {
            setPasswordError(t(language, 'currentPasswordIncorrectError'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans"
        >
            {/* Unified Sticky Header */}
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#070A12]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div className="flex items-center gap-1.5">
                    <LockKeyIcon size={18} className="text-indigo-400" />
                    <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'changePassword')}</h1>
                </div>
                <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                <div className="p-4 rounded-2xl bg-[#14161E] border border-white/5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-white/50 block font-medium">{t(language, 'currentPasswordLabel')}</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(event) => {
                                    setCurrentPassword(event.target.value);
                                    if (passwordError) setPasswordError('');
                                }}
                                placeholder={t(language, 'enterCurrentPasswordPlaceholder')}
                                className="w-full h-12 px-4 pr-11 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showCurrent ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/50 block font-medium">{t(language, 'newPasswordLabel')}</label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(event) => {
                                    setNewPassword(event.target.value);
                                    if (passwordError) setPasswordError('');
                                }}
                                placeholder={t(language, 'enterNewPasswordPlaceholder')}
                                className="w-full h-12 px-4 pr-11 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showNew ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/50 block font-medium">{t(language, 'confirmNewPassword')}</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(event) => {
                                    setConfirmPassword(event.target.value);
                                    if (passwordError) setPasswordError('');
                                }}
                                placeholder={t(language, 'reEnterNewPasswordPlaceholder')}
                                className="w-full h-12 px-4 pr-11 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showConfirm ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    {passwordError && (
                        <p className="text-xs text-rose-400 font-medium">{passwordError}</p>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#070A12]/90 backdrop-blur-md">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 rounded-full font-bold text-[14px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                    {isSaving ? t(language, 'saving') : t(language, 'saveNewPassword')}
                </button>
            </div>
        </motion.div>
    );
}

