import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@store/settings';
import { FistCrest } from '@/components/FistCrest';
import { CheckCircleIcon, ShieldCheckIcon, HardDrivesIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

export default function Welcome() {
    const navigate = useNavigate();
    const { language } = useSettingsStore();

    return (
        <div className="h-full w-full flex flex-col justify-between p-6 bg-[#070A12] text-white font-sans select-none">
            {/* Top Brand Status Pill */}
            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141A28] border border-[#2B374E] text-[11px] font-bold text-[#E2E8F0] shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599]" />
                    <span>FIST SECURE</span>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">v1.2.0</span>
            </div>

            {/* Center Visual: Crest + Headline + 3 Cards */}
            <div className="flex flex-col items-center text-center my-auto py-2 z-10">
                <div className="my-2">
                    <FistCrest size={100} />
                </div>

                <h1 className="text-[24px] font-extrabold tracking-tight text-white mt-1">
                    Hold Your Future
                </h1>
                <p className="text-[12px] text-[#94A3B8] font-medium max-w-[280px] mt-1 leading-relaxed">
                    Enterprise Non-Custodial Vault for EVM, Solana &amp; Bitcoin
                </p>

                {/* 3 Floating Feature Chips */}
                <div className="w-full space-y-2 mt-4 text-left">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111624] border border-[#202A3D] shadow-xs">
                        <div className="w-6 h-6 rounded-lg bg-[#00E599]/10 text-[#00E599] flex items-center justify-center shrink-0">
                            <CheckCircleIcon size={15} weight="bold" />
                        </div>
                        <span className="text-xs font-semibold text-[#E2E8F0] truncate">
                            Native Multi-Chain Routing (EVM + SVM + UTXO)
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111624] border border-[#202A3D] shadow-xs">
                        <div className="w-6 h-6 rounded-lg bg-[#6366F1]/15 text-[#818CF8] flex items-center justify-center shrink-0">
                            <ShieldCheckIcon size={15} weight="bold" />
                        </div>
                        <span className="text-xs font-semibold text-[#E2E8F0] truncate">
                            Built-in Pre-Execution Simulation (Zero Phishing)
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111624] border border-[#202A3D] shadow-xs">
                        <div className="w-6 h-6 rounded-lg bg-[#F59E0B]/15 text-[#FBBF24] flex items-center justify-center shrink-0">
                            <HardDrivesIcon size={15} weight="bold" />
                        </div>
                        <span className="text-xs font-semibold text-[#E2E8F0] truncate">
                            Hardware Cold Storage Ready (Ledger &amp; Trezor)
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="w-full flex flex-col space-y-2.5 z-10 pt-2">
                <button
                    type="button"
                    onClick={() => navigate('/create-password')}
                    className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] border border-[#A5B4FC]/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                >
                    {t(language, 'createBrandNewWallet')}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/create-password?mode=import')}
                    className="w-full h-11 rounded-2xl font-semibold text-xs bg-[#141A28] hover:bg-[#1A2234] text-[#CBD5E1] hover:text-white border border-[#2B364C] hover:border-white/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                >
                    {t(language, 'importExistingWalletOption')}
                </button>
            </div>
        </div>
    );
}
