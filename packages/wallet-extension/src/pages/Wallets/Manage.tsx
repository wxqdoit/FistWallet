import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/ui';
import { ArrowLeftIcon, CopyIcon, KeyIcon, TrashIcon, CheckIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { t } from '@utils/i18n';
import { motion } from 'framer-motion';

export default function WalletManage() {
    const navigate = useNavigate();
    const { wallet, currentNetwork, exportMnemonic, exportPrivateKey, deleteWallet, unlock } = useWalletStore();
    const { language } = useSettingsStore();
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [pendingAction, setPendingAction] = useState<'mnemonic' | 'privateKey' | 'delete' | null>(null);
    const [copiedMnemonic, setCopiedMnemonic] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const handleErrorDialogChange = (open: boolean) => {
        if (!open) {
            setError('');
        }
    };
    const handleConfirmDialogChange = (open: boolean) => {
        setIsConfirmDialogOpen(open);
        if (!open) {
            setConfirmPassword('');
            setConfirmError('');
            setPendingAction(null);
        }
    };

    if (!wallet) {
        return null;
    }

    const canExportMnemonic = wallet.type === 'mnemonic';

    const handleExportMnemonic = async () => {
        setError('');
        setIsLoading(true);
        try {
            const phrase = await exportMnemonic();
            if (!phrase) {
                setError(t(language, 'mnemonicNotAvailable'));
                return;
            }
            setMnemonic(phrase);
        } catch (err) {
            console.error(err);
            setError(t(language, 'exportMnemonicFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPrivateKey = async () => {
        setError('');
        setIsLoading(true);
        try {
            const key = await exportPrivateKey(currentNetwork.chainType);
            setPrivateKey(key);
        } catch (err) {
            console.error(err);
            setError(t(language, 'exportPrivateKeyFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setError('');
        openConfirmDialog('delete');
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) {
            return;
        }

        if (!confirmPassword) {
            setConfirmError(t(language, 'confirmPasswordRequired'));
            return;
        }

        setIsConfirming(true);
        setConfirmError('');
        try {
            const isValid = await unlock(confirmPassword);
            if (!isValid) {
                setConfirmError(t(language, 'unlockIncorrectPassword'));
                return;
            }

            const action = pendingAction;
            handleConfirmDialogChange(false);

            if (action === 'mnemonic') {
                await handleExportMnemonic();
                return;
            }

            if (action === 'privateKey') {
                await handleExportPrivateKey();
                return;
            }

            if (action === 'delete') {
                setIsLoading(true);
                try {
                    await deleteWallet(wallet.id);
                    navigate('/wallets');
                } catch (err) {
                    console.error(err);
                    setError(t(language, 'deleteWalletFailed'));
                } finally {
                    setIsLoading(false);
                }
            }
        } catch (err) {
            console.error(err);
            setConfirmError(t(language, 'confirmPasswordFailed'));
        } finally {
            setIsConfirming(false);
        }
    };

    const handleConfirmClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        await handleConfirmAction();
    };

    const openConfirmDialog = (action: 'mnemonic' | 'privateKey' | 'delete') => {
        setPendingAction(action);
        setConfirmPassword('');
        setConfirmError('');
        setIsConfirmDialogOpen(true);
    };

    const getConfirmTitle = () => {
        if (pendingAction === 'delete') return t(language, 'confirmDeleteWalletTitle');
        if (pendingAction === 'privateKey') return t(language, 'exportPrivateKeyAuthTitle');
        return t(language, 'viewMnemonicAuthTitle');
    };

    const getConfirmDescription = () => {
        if (pendingAction === 'delete') {
            return t(language, 'deleteWalletWarningText');
        }
        if (pendingAction === 'privateKey') {
            return t(language, 'verifyPasswordForPrivateKeyText', { network: currentNetwork.name });
        }
        return t(language, 'verifyPasswordForMnemonicText');
    };

    const getConfirmActionLabel = () => {
        if (pendingAction === 'delete') return t(language, 'confirmDeleteBtnText');
        return t(language, 'verifyAndShowBtnText');
    };

    const isDeleteAction = pendingAction === 'delete';

    const handleCopy = async (value: string, isKey: boolean) => {
        try {
            await navigator.clipboard.writeText(value);
            if (isKey) {
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
            } else {
                setCopiedMnemonic(true);
                setTimeout(() => setCopiedMnemonic(false), 2000);
            }
            toast.success(t(language, 'addressCopiedToClipboard'));
        } catch (err) {
            console.error(err);
            toast.error(t(language, 'addressCopyFailed'));
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
                <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'securityAndExportTitle')}</h1>
                <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {canExportMnemonic && (
                    <div className="p-4 rounded-2xl bg-[#14161E] border border-white/10 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-white">{t(language, 'backupMnemonicHeading')}</p>
                            <p className="text-xs text-white/40 mt-0.5">
                                {t(language, 'backupMnemonicDetail')}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => openConfirmDialog('mnemonic')}
                            disabled={isLoading}
                            className="w-full h-11 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 active:opacity-85 transition-opacity cursor-pointer"
                        >
                            <KeyIcon size={15} className="text-indigo-400" />
                            <span>{t(language, 'viewMnemonicBtnText')}</span>
                        </button>

                        {mnemonic && (
                            <div className="space-y-2 pt-1">
                                <div className="p-3.5 rounded-xl bg-[#0A0D14] border border-white/10 font-mono text-xs text-white/90 leading-relaxed select-all">
                                    {mnemonic}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(mnemonic, false)}
                                    className="w-full h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    {copiedMnemonic ? <CheckIcon size={14} className="text-emerald-400" /> : <CopyIcon size={14} />}
                                    <span>{copiedMnemonic ? t(language, 'copiedItem', { label: t(language, 'recoveryPhrase') }) : `${t(language, 'copy')} ${t(language, 'recoveryPhrase')}`}</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-4 rounded-2xl bg-[#14161E] border border-white/10 space-y-3">
                    <div>
                        <p className="text-sm font-semibold text-white">{t(language, 'exportPrivateKeyHeading')}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                            {t(language, 'exportPrivateKeyDetail', { network: currentNetwork.name })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => openConfirmDialog('privateKey')}
                        disabled={isLoading}
                        className="w-full h-11 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 active:opacity-85 transition-opacity cursor-pointer"
                    >
                        <KeyIcon size={15} className="text-indigo-400" />
                        <span>{t(language, 'viewPrivateKeyBtnText')}</span>
                    </button>

                    {privateKey && (
                        <div className="space-y-2 pt-1">
                            <div className="p-3.5 rounded-xl bg-[#0A0D14] border border-white/10 font-mono text-xs text-white/90 break-all leading-relaxed select-all">
                                {privateKey}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopy(privateKey, true)}
                                className="w-full h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                {copiedKey ? <CheckIcon size={14} className="text-emerald-400" /> : <CopyIcon size={14} />}
                                <span>{copiedKey ? t(language, 'copiedItem', { label: t(language, 'privateKey') }) : `${t(language, 'copy')} ${t(language, 'privateKey')}`}</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="w-full h-11 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 active:opacity-85 transition-opacity cursor-pointer"
                    >
                        <TrashIcon size={15} />
                        <span>{t(language, 'deleteCurrentWalletBtn')}</span>
                    </button>
                </div>
            </div>

            {/* Password Verification Modal */}
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={handleConfirmDialogChange}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">
                            {getConfirmTitle()}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 leading-relaxed mt-1">
                            {getConfirmDescription()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 mt-4">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => {
                                setConfirmPassword(event.target.value);
                                if (confirmError) setConfirmError('');
                            }}
                            placeholder={t(language, 'enterUnlockPasswordToApprove')}
                            autoFocus
                            disabled={isConfirming}
                            className="w-full h-11 px-4 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                        {confirmError && <p className="text-xs text-rose-400">{confirmError}</p>}
                    </div>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel
                            disabled={isConfirming}
                            className="rounded-full h-11 border-white/10 bg-[#1F2330] hover:bg-[#252A3A] text-white text-xs font-semibold cursor-pointer"
                        >
                            {t(language, 'cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmClick}
                            disabled={isConfirming}
                            className={`rounded-full h-11 text-xs font-bold cursor-pointer ${
                                isDeleteAction
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                        >
                            {isConfirming ? t(language, 'unlocking') : getConfirmActionLabel()}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error Dialog */}
            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">{t(language, 'walletActionFailed')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 mt-1">{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogAction className="rounded-full h-11 text-xs font-bold bg-indigo-600 text-white w-full cursor-pointer">
                            {t(language, 'ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}

