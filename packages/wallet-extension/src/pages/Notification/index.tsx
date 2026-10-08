import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';
import { ShieldCheckIcon, GlobeIcon, CheckCircleIcon, WarningCircleIcon, LockIcon } from '@phosphor-icons/react';
import { checkOriginSecurity } from '@/services/security';
import browser from 'webextension-polyfill';
import { motion } from 'framer-motion';

export default function Notification() {
    const [searchParams] = useSearchParams();
    const { currentAccount, currentNetwork, isLocked, unlock } = useWalletStore();
    const { language } = useSettingsStore();
    const [id, setId] = useState<string>('');
    const [action, setAction] = useState<string>('connect');
    const [origin, setOrigin] = useState<string>('');
    const [dataToSign, setDataToSign] = useState<string>('');
    const [isDone, setIsDone] = useState(false);
    const [unlockPassword, setUnlockPassword] = useState('');
    const [unlockError, setUnlockError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const securityResult = checkOriginSecurity(origin);

    useEffect(() => {
        const act = searchParams.get('action') || 'connect';
        const orig = searchParams.get('origin') || window.location.origin;
        const msg = searchParams.get('message') || '';
        const reqId = searchParams.get('id') || '';
        setAction(act);
        setOrigin(orig);
        setDataToSign(msg);
        setId(reqId);
    }, [searchParams]);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setUnlockError('');
        setIsUnlocking(true);
        try {
            const ok = await unlock(unlockPassword);
            if (!ok) {
                setUnlockError(t(language, 'unlockIncorrectPassword'));
            }
        } catch (err: any) {
            setUnlockError(err.message || t(language, 'unlockFailed'));
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleApprove = async () => {
        setIsDone(true);
        if (window.opener) {
            window.opener.postMessage({ type: 'FISTWALLET_APPROVAL_RESPONSE', approved: true, id }, '*');
        }
        try {
            await browser.runtime.sendMessage({
                type: 'DAPP_APPROVAL_RESOLVE',
                payload: { approved: true, id },
            });
        } catch {}
        setTimeout(() => window.close(), 600);
    };

    const handleReject = async () => {
        setIsDone(true);
        if (window.opener) {
            window.opener.postMessage({ type: 'FISTWALLET_APPROVAL_RESPONSE', approved: false, id }, '*');
        }
        try {
            await browser.runtime.sendMessage({
                type: 'DAPP_APPROVAL_RESOLVE',
                payload: { approved: false, id },
            });
        } catch {}
        setTimeout(() => window.close(), 300);
    };

    if (isDone) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#070A12] text-white font-sans"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                    <CheckCircleIcon size={36} weight="fill" />
                </div>
                <h3 className="text-base font-semibold">{t(language, 'requestProcessedTitle')}</h3>
                <p className="text-xs text-white/40 mt-1">{t(language, 'authWindowAutoClose')}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col justify-between p-4 bg-[#070A12] text-white font-sans selection:bg-indigo-500/30"
        >
            {/* DApp Origin Header */}
            <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-[#14161E] text-indigo-400 flex items-center justify-center border border-white/10">
                            <GlobeIcon size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white leading-tight">{origin}</p>
                            <span className="text-[10px] text-white/40">{t(language, 'requestAuthInteraction')}</span>
                        </div>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#14161E] border border-white/10 text-white/80">
                        {currentNetwork.name}
                    </span>
                </div>

                {!securityResult.isSafe ? (
                    <div className="mt-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-400">
                        <WarningCircleIcon size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold">{t(language, 'securityWarningTitle')}</p>
                            <p className="text-[11px] opacity-90 leading-tight mt-0.5">{securityResult.reason}</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                        <ShieldCheckIcon size={14} weight="fill" />
                        <span>{t(language, 'originVerifiedSafe')}</span>
                    </div>
                )}

                <div className="mt-4 space-y-3">
                    <div className="text-center py-1">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-2">
                            <ShieldCheckIcon size={28} />
                        </div>
                        <h2 className="text-base font-bold text-white">
                            {action === 'connect' ? t(language, 'connectToAppTitle') : t(language, 'signRequestTitle')}
                        </h2>
                        <p className="text-xs text-white/40 mt-0.5">
                            {action === 'connect'
                                ? t(language, 'connectToAppDesc')
                                : t(language, 'signPayloadDesc')}
                        </p>
                    </div>

                    {isLocked ? (
                        <div className="p-4 rounded-2xl bg-[#14161E] border border-indigo-500/30 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                                <LockIcon size={16} />
                                <span>{t(language, 'walletIsLocked')}</span>
                            </div>
                            <p className="text-xs text-white/40">
                                {t(language, 'unlockToReviewDesc')}
                            </p>
                            <form onSubmit={handleUnlock} className="space-y-2.5">
                                <input
                                    type="password"
                                    placeholder={t(language, 'enterUnlockPasswordToApprove')}
                                    value={unlockPassword}
                                    onChange={(e) => setUnlockPassword(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    autoFocus
                                />
                                {unlockError && (
                                    <p className="text-[11px] text-rose-400">{unlockError}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isUnlocking || !unlockPassword}
                                    className="w-full h-11 rounded-full font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
                                >
                                    {isUnlocking ? t(language, 'unlocking') : t(language, 'unlockWallet')}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            {/* Account preview */}
                            <div className="p-3.5 rounded-2xl bg-[#14161E] border border-white/5 space-y-1">
                                <div className="flex justify-between text-xs text-white/50">
                                    <span>{t(language, 'targetAccountLabel')}</span>
                                    <span className="font-semibold text-white">{currentAccount?.name}</span>
                                </div>
                                <p className="font-mono text-[11px] text-white/40 break-all">
                                    {currentAccount?.addresses[currentNetwork.chainType]}
                                </p>
                            </div>

                            {/* Message Preview */}
                            {dataToSign && (
                                <div className="space-y-1.5">
                                    <span className="text-xs font-semibold text-white/50">{t(language, 'payloadContentLabel')}</span>
                                    <div className="p-3.5 rounded-xl bg-[#0A0D14] border border-white/10 font-mono text-[11px] text-white/80 max-h-28 overflow-y-auto break-all scrollbar-thin leading-relaxed">
                                        {dataToSign}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                    type="button"
                    onClick={handleReject}
                    className="flex-1 h-12 rounded-full font-semibold text-[14px] bg-[#14161E] hover:bg-[#1A1D26] border border-white/10 text-white active:opacity-85 transition-opacity cursor-pointer"
                >
                    {t(language, 'cancelReject')}
                </button>
                <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isLocked}
                    className="flex-1 h-12 rounded-full font-bold text-[14px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                    {t(language, 'confirmAndAuthorize')}
                </button>
            </div>
        </motion.div>
    );
}

