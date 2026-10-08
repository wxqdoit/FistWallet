import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@store/settings';
import { motion } from 'framer-motion';
import { OkxFistLogo } from '@/components/OkxFistLogo';
import { t } from '@utils/i18n';

export default function Welcome() {
    const navigate = useNavigate();
    const { language } = useSettingsStore();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full w-full flex flex-col justify-between px-6 pt-12 pb-8 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none relative"
        >
            {/* Top: OKX-Style Pixel Modular F-Fist Logo + Fist Core Headline (No Subtitle) */}
            <div className="flex flex-col items-center text-center relative z-10 pt-1">
                <div className="mb-4 flex items-center justify-center">
                    <OkxFistLogo size={84} mode="f" colorScheme="indigo" glow={false} />
                </div>

                {/* Fist Headline: Direct meaning of Fist (No Subtitle) */}
                <h1 className="text-[26px] font-black tracking-tight text-white leading-tight">
                    {t(language, 'holdYourDigitalFuture')}
                </h1>
            </div>

            {/* Flexible Breathing Space to Balance Layout */}
            <div className="flex-1 min-h-[44px]" />

            {/* Bottom Actions: Capsule Pill Buttons in Brand Colors */}
            <div className="w-full flex flex-col space-y-3 relative z-10">
                <button
                    type="button"
                    onClick={() => navigate('/create-password')}
                    className="w-full h-12 rounded-full font-bold text-[14px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-opacity active:opacity-85 cursor-pointer flex items-center justify-center"
                >
                    {t(language, 'createBrandNewWallet')}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/create-password?mode=import')}
                    className="w-full h-12 rounded-full font-semibold text-[14px] bg-[#14161E] hover:bg-[#1A1D26] text-white transition-all border border-white/10 hover:border-white/20 active:opacity-85 cursor-pointer flex items-center justify-center"
                >
                    {t(language, 'importExistingWalletOption')}
                </button>
            </div>
        </motion.div>
    );
}
