import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    Input,
    GlassCard,
    MotionButton,
} from '@/ui';
import { LockIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';
import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-card/50 to-background text-foreground"
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            {/* Logo & Lock Badge */}
            <div className="text-center mb-8 relative">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-xl glow-primary mb-3"
                >
                    <LockIcon size={32} weight="duotone" />
                </motion.div>
                <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                    FistWallet
                </h1>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <ShieldCheckIcon size={14} className="text-success" />
                    <span>Decentralized Multi-Chain Vault</span>
                </p>
            </div>

            {/* Form */}
            <GlassCard className="w-full p-5 border-border/70 glow-card space-y-4">
                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span>Password</span>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter wallet password"
                                autoFocus
                                className="pr-10 text-xs"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-destructive text-center font-medium bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                            {error}
                        </p>
                    )}

                    <MotionButton
                        type="submit"
                        disabled={!password || isUnlocking}
                        className="w-full h-10 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md glow-primary"
                    >
                        {isUnlocking ? 'Unlocking Vault...' : t(language, 'unlock')}
                    </MotionButton>
                </form>
            </GlassCard>
        </motion.div>
    );
}
