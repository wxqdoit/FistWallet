import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';
import {
    ShieldCheckIcon,
    CheckCircleIcon,
    WarningCircleIcon,
    LockIcon,
    XCircleIcon,
} from '@phosphor-icons/react';
import { checkOriginSecurity } from '@/services/security';
import browser from 'webextension-polyfill';

export default function Notification() {
    const [searchParams] = useSearchParams();
    const { currentAccount, currentNetwork, isLocked, unlock } = useWalletStore();
    const { language } = useSettingsStore();

    const [id, setId] = useState<string>('');
    const [action, setAction] = useState<string>('connect');
    const [origin, setOrigin] = useState<string>('https://app.uniswap.org');
    const [dataToSign, setDataToSign] = useState<string>('');
    const [isDone, setIsDone] = useState(false);
    const [unlockPassword, setUnlockPassword] = useState('');
    const [unlockError, setUnlockError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [spendingCap, setSpendingCap] = useState<'exact' | 'unlimited'>('exact');

    const securityResult = checkOriginSecurity(origin);

    useEffect(() => {
        const act = searchParams.get('action') || 'connect';
        const orig = searchParams.get('origin') || 'https://app.uniswap.org';
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
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-[#070A12] text-white font-sans">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                    <CheckCircleIcon size={36} weight="fill" />
                </div>
                <h3 className="text-base font-bold text-white">Request Processed</h3>
                <p className="text-xs text-[#94A3B8] mt-1">This notification window will close automatically.</p>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="h-full flex flex-col justify-between p-5 bg-[#070A12] text-white">
                <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 text-[#818CF8] flex items-center justify-center mb-3">
                        <LockIcon size={24} weight="bold" />
                    </div>
                    <h2 className="text-base font-bold text-white">Wallet is Locked</h2>
                    <p className="text-xs text-[#94A3B8] mt-1">Unlock with your password to approve this request.</p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-3">
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#101522] border border-[#253248] text-white text-xs outline-none focus:border-indigo-500"
                        autoFocus
                    />
                    {unlockError && <p className="text-xs text-rose-400 text-center">{unlockError}</p>}
                    <button
                        type="submit"
                        disabled={isUnlocking || !unlockPassword}
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                    >
                        {isUnlocking ? 'Unlocking...' : 'Unlock & Review'}
                    </button>
                </form>

                <div className="pt-4">
                    <button
                        type="button"
                        onClick={handleReject}
                        className="w-full text-xs text-[#94A3B8] hover:text-white"
                    >
                        Reject Request
                    </button>
                </div>
            </div>
        );
    }

    // SCREEN 14: CONTRACT TRANSACTION WITH SIMULATION
    if (action === 'signTx' || action === 'sendTransaction' || action === 'transaction') {
        return (
            <div className="h-full w-full flex flex-col justify-between p-4 bg-[#070A12] text-white font-sans select-none overflow-y-auto scrollbar-thin">
                {/* DApp Origin Header */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#101522] border border-[#202A3D]">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00E599]" />
                            <span className="text-xs font-bold text-[#E2E8F0]">{origin.replace('https://', '')}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#94A3B8]">Contract Interaction</span>
                    </div>

                    <div>
                        <h2 className="text-base font-extrabold text-white">Confirm Transaction</h2>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Sign and broadcast smart contract execution</p>
                    </div>

                    {/* Pre-Execution Simulation Badge (Screen 14) */}
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-[#00E599]/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-[#00E599] text-xs font-bold">
                            <CheckCircleIcon size={16} weight="bold" />
                            <span>Simulation Success (Dry Run: No Risk)</span>
                        </div>
                        <p className="text-[11px] text-[#A7F3D0] leading-snug">
                            State changes verified: In: +5,168.42 USDT | Out: -1.50 ETH
                        </p>
                    </div>

                    {/* Contract Details Card */}
                    <div className="rounded-xl border border-[#253248] bg-[#101522] p-3 space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-[#94A3B8]">Action</span>
                            <span className="font-bold text-[#00E599]">exactInputSingle (Swap)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#94A3B8]">Interact Contract</span>
                            <span className="font-mono text-[#818CF8]">UniversalRouter (0x3fc...8842)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#94A3B8]">Spend Amount</span>
                            <span className="font-bold text-[#FF5252] font-mono">-1.50 ETH ($5,175.30)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#94A3B8]">Receive Amount</span>
                            <span className="font-bold text-[#00E599] font-mono">+5,168.42 USDT</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#94A3B8]">Max Network Fee</span>
                            <span className="font-mono text-white">0.0018 ETH (~$6.20)</span>
                        </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#121726] border border-[#253248] flex items-center gap-2 text-[11px] text-[#E2E8F0]">
                        {securityResult.isSafe ? (
                            <>
                                <ShieldCheckIcon size={16} className="text-[#00E599]" weight="bold" />
                                <span>FISTSHIELD: Verified Router · High Liquidity Score</span>
                            </>
                        ) : (
                            <>
                                <WarningCircleIcon size={16} className="text-rose-400" weight="bold" />
                                <span className="text-rose-300">FISTSHIELD: {securityResult.reason || "Suspicious target"}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Dual CTAs */}
                <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                        type="button"
                        onClick={handleReject}
                        className="h-11 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-[#253248] text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                    >
                        Reject
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        className="h-11 rounded-xl bg-gradient-to-r from-[#00F5A0] to-[#00C47F] text-[#042F2E] text-xs font-extrabold shadow-[0_4px_16px_rgba(0,245,160,0.3)] transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Confirm &amp; Sign
                    </button>
                </div>
            </div>
        );
    }

    // SCREEN 15: EIP-712 TYPED DATA SIGNATURE
    if (action === 'signTypedData' || action === 'signMessage') {
        return (
            <div className="h-full w-full flex flex-col justify-between p-4 bg-[#070A12] text-white font-sans select-none overflow-y-auto scrollbar-thin">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#101522] border border-[#202A3D]">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00E599]" />
                            <span className="text-xs font-bold text-[#E2E8F0]">{origin.replace('https://', '')}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#818CF8]">EIP-712 Permit2</span>
                    </div>

                    <div>
                        <h2 className="text-base font-extrabold text-white">Signature Request</h2>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Signing this message does NOT cost any gas fee.</p>
                    </div>

                    {/* Structured Tree View */}
                    <div className="rounded-xl border border-[#253248] bg-[#0A0E18] p-3 space-y-1.5 font-mono text-[11px]">
                        <p className="text-[#64748B] font-bold">[DOMAIN]</p>
                        <p className="text-[#CBD5E1] pl-2">name: &quot;Permit2&quot;</p>
                        <p className="text-[#CBD5E1] pl-2">chainId: 1 (Ethereum)</p>
                        <p className="text-[#CBD5E1] pl-2">verifyingContract: 0x000000000022...</p>

                        <p className="text-[#64748B] font-bold pt-1.5">[MESSAGE DETAILS]</p>
                        <p className="text-[#00E599] pl-2 truncate">token: 0xA0b86991c6218b36c... (USDC)</p>
                        <p className="text-[#CBD5E1] pl-2">amount: 1500000000 (1,500.00 USDC)</p>
                        <p className="text-[#CBD5E1] pl-2 truncate">spender: UniversalRouter (0x3fC...)</p>
                        <p className="text-[#CBD5E1] pl-2">expiration: In 24 hours</p>
                        <p className="text-[#CBD5E1] pl-2">nonce: 42</p>

                        {dataToSign && (
                            <div className="pt-2 text-[10px] text-white/40 break-all border-t border-white/5 mt-2">
                                Raw: {dataToSign.slice(0, 100)}...
                            </div>
                        )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-[#00E599]/30 text-xs text-[#A7F3D0] flex items-center gap-2">
                        <ShieldCheckIcon size={16} className="text-[#00E599]" />
                        <span>Safe Permit2 Signature: Auto-expires in 24 hrs.</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                        type="button"
                        onClick={handleReject}
                        className="h-11 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-[#253248] text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                    >
                        Reject
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        className="h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-xs font-extrabold shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Sign Message
                    </button>
                </div>
            </div>
        );
    }

    // SCREEN 16: TOKEN SPENDING CAP APPROVAL
    if (action === 'approve' || action === 'approval') {
        return (
            <div className="h-full w-full flex flex-col justify-between p-4 bg-[#070A12] text-white font-sans select-none overflow-y-auto scrollbar-thin">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#101522] border border-[#202A3D]">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00E599]" />
                            <span className="text-xs font-bold text-[#E2E8F0]">{origin.replace('https://', '')}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#F59E0B]">Token Approval</span>
                    </div>

                    <div>
                        <h2 className="text-base font-extrabold text-white">Approve USDT Spending</h2>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Spender: Uniswap UniversalRouter</p>
                    </div>

                    {/* Spending Cap Options */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                            Spending Cap Limit
                        </label>

                        {/* Exact Amount */}
                        <div
                            onClick={() => setSpendingCap('exact')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                spendingCap === 'exact'
                                    ? 'border-[#00F5A0] bg-[#141E32]'
                                    : 'border-[#253248] bg-[#101522]'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                            spendingCap === 'exact'
                                                ? 'bg-[#00E599] text-[#042F2E]'
                                                : 'border border-white/30'
                                        }`}
                                    >
                                        {spendingCap === 'exact' && <CheckCircleIcon size={12} weight="bold" />}
                                    </div>
                                    <span className="text-xs font-bold text-white">
                                        Exact Transaction Amount (Recommended)
                                    </span>
                                </div>
                                <span className="text-[11px] font-bold text-[#00E599]">Safest</span>
                            </div>
                            <p className="text-sm font-extrabold text-[#00E599] font-mono mt-1 pl-6">
                                1,500.00 USDT
                            </p>
                        </div>

                        {/* Unlimited */}
                        <div
                            onClick={() => setSpendingCap('unlimited')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                spendingCap === 'unlimited'
                                    ? 'border-amber-500 bg-[#1E1912]'
                                    : 'border-[#253248] bg-[#101522]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                        spendingCap === 'unlimited'
                                            ? 'bg-amber-400 text-black'
                                            : 'border border-white/30'
                                    }`}
                                >
                                    {spendingCap === 'unlimited' && <CheckCircleIcon size={12} weight="bold" />}
                                </div>
                                <span className="text-xs font-semibold text-white">Unlimited Approval</span>
                            </div>
                            <p className="text-[11px] text-[#64748B] mt-1 pl-6">
                                Allows future swaps without approving again
                            </p>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#101522] border border-[#202A3D] space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-[#94A3B8]">Approval Gas Fee</span>
                            <span className="font-mono text-white">~$1.25 (Standard)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#94A3B8]">Risk Level</span>
                            <span className="font-bold text-[#00E599]">LOW (Official Uniswap Contract)</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                        type="button"
                        onClick={handleReject}
                        className="h-11 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-[#253248] text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                    >
                        Reject
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        className="h-11 rounded-xl bg-gradient-to-r from-[#00F5A0] to-[#00C47F] text-[#042F2E] text-xs font-extrabold shadow-[0_4px_16px_rgba(0,245,160,0.3)] transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Approve USDT
                    </button>
                </div>
            </div>
        );
    }

    // SCREEN 13: DAPP CONNECT REQUEST (DEFAULT)
    return (
        <div className="h-full w-full flex flex-col justify-between p-4 bg-[#070A12] text-white font-sans select-none overflow-y-auto scrollbar-thin">
            <div className="space-y-3.5">
                {/* DApp Header Card (Screen 13) */}
                <div className="p-3 rounded-2xl bg-[#101522] border border-[#253248] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#FF007A]/15 border border-[#FF007A]/30 flex items-center justify-center text-xl">
                            🦄
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-white">Uniswap Interface</p>
                            <p className="text-xs text-[#94A3B8] font-medium">{origin}</p>
                        </div>
                    </div>

                    {securityResult.isSafe ? (
                        <div className="px-2.5 py-1 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-extrabold flex items-center gap-1">
                            <ShieldCheckIcon size={12} weight="bold" />
                            <span>VERIFIED</span>
                        </div>
                    ) : (
                        <div className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold flex items-center gap-1">
                            <WarningCircleIcon size={12} weight="bold" />
                            <span>SUSPICIOUS</span>
                        </div>
                    )}
                </div>

                {!securityResult.isSafe && (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                        <WarningCircleIcon size={16} className="text-rose-400 shrink-0" weight="bold" />
                        <span>{securityResult.reason || "Caution: This site may be untrusted."}</span>
                    </div>
                )}

                <div className="text-center py-1">
                    <h2 className="text-base font-extrabold text-white">Connect to this site?</h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Uniswap wants to connect to your wallet</p>
                </div>

                {/* Requested Permissions Card */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                        Requested Permissions
                    </label>
                    <div className="rounded-xl border border-[#253248] bg-[#101522] p-3 space-y-2.5 text-xs text-[#E2E8F0]">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon size={15} className="text-[#00E599]" weight="bold" />
                            <span>See your public address and balance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon size={15} className="text-[#00E599]" weight="bold" />
                            <span>Request approvals for transactions</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#94A3B8]">
                            <XCircleIcon size={15} className="text-[#FF5252]" weight="bold" />
                            <span>Cannot transfer funds without signature</span>
                        </div>
                    </div>
                </div>

                {/* Connecting Account Card */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                        Connecting Account
                    </label>
                    <div className="p-3 rounded-xl border border-indigo-500/40 bg-[#141E32] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                                1
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">
                                    {currentAccount?.name || 'Account 1'} (0x887F...ff1a)
                                </p>
                                <p className="text-[11px] text-[#00E599] font-semibold">
                                    $28,495.80 ({currentNetwork.name})
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-[#818CF8] cursor-pointer">Change</span>
                    </div>
                </div>
            </div>

            {/* Dual CTAs: Cancel / Connect Site */}
            <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                    type="button"
                    onClick={handleReject}
                    className="h-11 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-[#253248] text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleApprove}
                    className="h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-xs font-extrabold shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all active:scale-[0.98] cursor-pointer"
                >
                    Connect Site
                </button>
            </div>
        </div>
    );
}
