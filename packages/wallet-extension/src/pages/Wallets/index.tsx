import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';
import { ArrowLeftIcon, CheckIcon, PlusIcon, WrenchIcon, WalletIcon } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function Wallets() {
    const navigate = useNavigate();
    const { wallets, currentWalletId, switchWallet } = useWalletStore();
    const { language } = useSettingsStore();

    const handleSelectWallet = (walletId: string) => {
        switchWallet(walletId);
        navigate('/');
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
                <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'walletListTitle')}</h1>
                <div className="w-8" />
            </div>

            {/* Wallet list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {wallets.length === 0 ? (
                    <div className="text-center py-20 text-white/50 space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-[#14161E] border border-white/5 flex items-center justify-center text-white/30">
                            <WalletIcon size={32} />
                        </div>
                        <p className="text-sm font-semibold text-white/70">{t(language, 'walletNotFound')}</p>
                    </div>
                ) : (
                    wallets.map((wallet, index) => {
                        const isSelected = wallet.id === currentWalletId;
                        const primaryAccount = wallet.accounts[0];
                        const primaryAddress = primaryAccount
                            ? Object.values(primaryAccount.addresses)[0]
                            : '';
                        const addressLabel = primaryAddress
                            ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}`
                            : `Wallet ${index + 1}`;

                        return (
                            <div
                                key={wallet.id}
                                onClick={() => handleSelectWallet(wallet.id)}
                                className={`p-4 rounded-2xl border transition-colors active:opacity-85 cursor-pointer flex items-center justify-between ${
                                    isSelected
                                        ? 'border-indigo-500/60 bg-[#14161E] shadow-lg shadow-indigo-500/5'
                                        : 'border-white/5 bg-[#14161E] hover:border-white/15'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#1F2330] border border-white/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                        W{index + 1}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-white">
                                                {primaryAccount?.name || `Wallet ${index + 1}`}
                                            </p>
                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-white/60 border border-white/5">
                                                {wallet.type === 'mnemonic' ? t(language, 'walletMnemonicType') : t(language, 'walletPrivateKeyType')}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-white/40 mt-0.5">
                                            {addressLabel}
                                        </p>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                                        <CheckIcon size={14} weight="bold" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 bg-[#070A12]/90 backdrop-blur-md">
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/wallets/manage')}
                        disabled={wallets.length === 0}
                        className="flex-1 h-12 rounded-full font-semibold text-[14px] bg-[#14161E] hover:bg-[#1A1D26] border border-white/10 text-white active:opacity-85 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        <WrenchIcon size={16} />
                        <span>{t(language, 'manageWalletsBtn')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/add-wallet')}
                        className="flex-1 h-12 rounded-full font-bold text-[14px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <PlusIcon size={16} weight="bold" />
                        <span>{t(language, 'addNewWalletBtn')}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

