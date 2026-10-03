import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { Button, GlassCard, MotionButton, Badge } from '@/ui';
import { ShieldCheckIcon, GlobeIcon, CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { checkOriginSecurity } from '@/services/security';
import browser from 'webextension-polyfill';
import { motion } from 'framer-motion';

export default function Notification() {
    const [searchParams] = useSearchParams();
    const { currentAccount, currentNetwork } = useWalletStore();
    const [action, setAction] = useState<string>('connect');
    const [origin, setOrigin] = useState<string>('');
    const [dataToSign, setDataToSign] = useState<string>('');
    const [isDone, setIsDone] = useState(false);
    const securityResult = checkOriginSecurity(origin);


    useEffect(() => {
        const act = searchParams.get('action') || 'connect';
        const orig = searchParams.get('origin') || window.location.origin;
        const msg = searchParams.get('message') || '';
        setAction(act);
        setOrigin(orig);
        setDataToSign(msg);
    }, [searchParams]);

    const handleApprove = async () => {
        setIsDone(true);
        if (window.opener) {
            window.opener.postMessage({ type: 'FISTWALLET_APPROVAL_RESPONSE', approved: true }, '*');
        }
        try {
            await browser.runtime.sendMessage({
                type: 'DAPP_APPROVAL_RESOLVE',
                payload: { approved: true },
            });
        } catch {}
        setTimeout(() => window.close(), 600);
    };

    const handleReject = async () => {
        setIsDone(true);
        if (window.opener) {
            window.opener.postMessage({ type: 'FISTWALLET_APPROVAL_RESPONSE', approved: false }, '*');
        }
        try {
            await browser.runtime.sendMessage({
                type: 'DAPP_APPROVAL_RESOLVE',
                payload: { approved: false },
            });
        } catch {}
        setTimeout(() => window.close(), 300);
    };

    if (isDone) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center p-6 text-center bg-background text-foreground"
            >
                <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mb-3">
                    <CheckCircleIcon size={36} weight="duotone" />
                </div>
                <h3 className="text-base font-semibold">Request Handled</h3>
                <p className="text-xs text-muted-foreground mt-1">This window will close automatically.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col justify-between p-5 bg-background text-foreground"
        >
            {/* DApp Origin Header */}
            <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <GlobeIcon size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold leading-tight">{origin}</p>
                            <span className="text-[10px] text-muted-foreground">Requests Connection</span>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                        {currentNetwork.name}
                    </Badge>
                </div>

                {!securityResult.isSafe ? (
                    <div className="mt-3 p-3 rounded-xl bg-destructive/15 border border-destructive/30 flex items-start gap-2.5 text-destructive">
                        <WarningCircleIcon size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold">Security Alert</p>
                            <p className="text-[11px] opacity-90 leading-tight mt-0.5">{securityResult.reason}</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 flex items-center gap-1.5 text-success text-[11px] font-medium">
                        <ShieldCheckIcon size={14} />
                        <span>Origin verified • Safe connection</span>
                    </div>
                )}

                <div className="mt-4 space-y-3">
                    <div className="text-center py-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-primary border border-primary/20 flex items-center justify-center mb-2">
                            <ShieldCheckIcon size={28} />
                        </div>
                        <h2 className="text-base font-bold text-foreground">
                            {action === 'connect' ? 'Connect to DApp' : 'Signature Request'}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {action === 'connect'
                                ? 'Allow this site to view your account public address and balance.'
                                : 'Sign the following payload with your private key.'}
                        </p>
                    </div>

                    {/* Account preview */}
                    <GlassCard className="p-3 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Account</span>
                            <span className="font-semibold text-foreground">{currentAccount?.name}</span>
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground break-all">
                            {currentAccount?.addresses[currentNetwork.chainType]}
                        </p>
                    </GlassCard>

                    {/* Message Preview */}
                    {dataToSign && (
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground">Message Payload</span>
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-foreground/90 max-h-32 overflow-y-auto break-all scrollbar-thin">
                                {dataToSign}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-4 border-t border-border/40">
                <Button
                    variant="outline"
                    onClick={handleReject}
                    className="flex-1 h-10 text-xs font-semibold"
                >
                    Reject
                </Button>
                <MotionButton
                    onClick={handleApprove}
                    className="flex-1 h-10 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 glow-primary"
                >
                    Confirm & Approve
                </MotionButton>
            </div>
        </motion.div>
    );
}
