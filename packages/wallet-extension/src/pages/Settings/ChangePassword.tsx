import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { Button, Input, Label } from '@/ui';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

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
            setPasswordError(t(language, 'passwordRequired'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError(t(language, 'passwordMismatch'));
            return;
        }

        setPasswordError('');
        setIsSaving(true);
        try {
            await changePassword(currentPassword, newPassword);
            toast.success(t(language, 'passwordUpdated'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigate(-1);
        } catch (error) {
            setPasswordError(t(language, 'incorrectPassword'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-4 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    {t(language, 'back')}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                <div className="space-y-2">
                    <h2 className="text-base font-semibold">{t(language, 'changePassword')}</h2>
                    <p className="text-xs text-muted-foreground">
                        {t(language, 'changePasswordSubtitle')}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t(language, 'currentPassword')}</Label>
                        <div className="relative">
                            <Input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(event) => {
                                    setCurrentPassword(event.target.value);
                                    if (passwordError) {
                                        setPasswordError('');
                                    }
                                }}
                                placeholder={t(language, 'enterYourPassword')}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent((prev) => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                aria-label={showCurrent ? t(language, 'hide') : t(language, 'show')}
                            >
                                {showCurrent ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t(language, 'newPassword')}</Label>
                        <div className="relative">
                            <Input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(event) => {
                                    setNewPassword(event.target.value);
                                    if (passwordError) {
                                        setPasswordError('');
                                    }
                                }}
                                placeholder={t(language, 'enterPassword')}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((prev) => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                aria-label={showNew ? t(language, 'hide') : t(language, 'show')}
                            >
                                {showNew ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t(language, 'confirmNewPassword')}</Label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(event) => {
                                    setConfirmPassword(event.target.value);
                                    if (passwordError) {
                                        setPasswordError('');
                                    }
                                }}
                                placeholder={t(language, 'confirmPasswordPlaceholder')}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((prev) => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                aria-label={showConfirm ? t(language, 'hide') : t(language, 'show')}
                            >
                                {showConfirm ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
            </div>

            <div className="p-4 border-t border-border/60">
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    {isSaving ? `${t(language, 'save')}...` : t(language, 'save')}
                </Button>
            </div>
        </div>
    );
}
