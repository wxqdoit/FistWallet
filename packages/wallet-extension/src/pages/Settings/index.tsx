import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    Switch,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Button,
    Input
} from '@/ui';
import {
    ArrowLeftIcon,
    CaretRightIcon,
    ClockIcon,
    KeyIcon,
    LockIcon,
    MoonIcon,
    TranslateIcon,
    GlobeIcon,
    UserPlusIcon,
    CopyIcon,
    CheckIcon,
    WarningIcon,
    BookBookmarkIcon,
    InfoIcon,
} from '@phosphor-icons/react';
import { languageLabels, t } from '@utils/i18n';
import { ChainType, type LanguageCode, type Network } from '@/types/index.ts';
import {
    exportAccountPrivateKey,
    exportWalletMnemonic,
    createNextAccount
} from '@core/wallet';
import { addCustomNetwork } from '@core/networks';
import { motion } from 'framer-motion';

export default function Settings() {
    const navigate = useNavigate();
    const { lock, wallet, currentAccount, initialize: refreshAccounts } = useWalletStore();
    const {
        theme,
        language,
        autoLockMinutes,
        initialize,
        setTheme,
        setLanguage,
        setAutoLockMinutes,
    } = useSettingsStore();

    // Export Modal State
    const [exportModalType, setExportModalType] = useState<'privateKey' | 'mnemonic' | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Add Account State
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [accountPassword, setAccountPassword] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountError, setAccountError] = useState<string | null>(null);
    const [accountSuccess, setAccountSuccess] = useState<string | null>(null);

    // Custom Network State
    const [showCustomNetworkModal, setShowCustomNetworkModal] = useState(false);
    const [customNetName, setCustomNetName] = useState('');
    const [customRpcUrl, setCustomRpcUrl] = useState('');
    const [customChainId, setCustomChainId] = useState('');
    const [customSymbol, setCustomSymbol] = useState('');
    const [customExplorer, setCustomExplorer] = useState('');
    const [networkSuccess, setNetworkSuccess] = useState<string | null>(null);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleLock = () => {
        lock();
        navigate('/unlock');
    };

    const handleConfirmExport = async () => {
        if (!passwordInput) return;
        setExportError(null);
        try {
            if (exportModalType === 'privateKey') {
                if (!currentAccount) throw new Error(t(language, 'unselectedAccount'));
                const pk = await exportAccountPrivateKey(passwordInput, currentAccount.id, ChainType.EVM);
                setRevealedSecret(pk);
            } else if (exportModalType === 'mnemonic') {
                if (!wallet) throw new Error(t(language, 'walletNotFound'));
                const phrase = await exportWalletMnemonic(passwordInput, wallet.id);
                setRevealedSecret(phrase);
            }
        } catch (err: any) {
            setExportError(err?.message || t(language, 'passwordAuthFailed'));
        }
    };

    const handleCreateDerivedAccount = async () => {
        if (!accountPassword || !wallet) return;
        setAccountError(null);
        try {
            const nextAcc = await createNextAccount(
                wallet.id,
                accountPassword,
                accountName.trim() || undefined
            );
            if (refreshAccounts) await refreshAccounts();
            setAccountSuccess(t(language, 'derivedAccountSuccess', { name: nextAcc.name }));
            setTimeout(() => {
                setShowAddAccountModal(false);
                setAccountSuccess(null);
                setAccountPassword('');
                setAccountName('');
            }, 1200);
        } catch (err: any) {
            setAccountError(err?.message || t(language, 'deriveAccountFailed'));
        }
    };

    const handleAddCustomNetwork = async () => {
        if (!customNetName || !customRpcUrl || !customChainId) return;
        try {
            const chainIdNum = parseInt(customChainId, 10);
            const net: Network = {
                id: `custom_${chainIdNum}`,
                name: customNetName,
                chainType: ChainType.EVM,
                chainId: chainIdNum,
                rpcUrl: customRpcUrl,
                nativeCurrency: {
                    name: customSymbol || 'ETH',
                    symbol: customSymbol || 'ETH',
                    decimals: 18,
                },
                explorerUrl: customExplorer || '',
                icon: 'evm',
            };
            await addCustomNetwork(net);
            setNetworkSuccess(t(language, 'networkAddedSuccess', { name: customNetName }));
            setTimeout(() => {
                setShowCustomNetworkModal(false);
                setNetworkSuccess(null);
                setCustomNetName('');
                setCustomRpcUrl('');
                setCustomChainId('');
                setCustomSymbol('');
                setCustomExplorer('');
            }, 1200);
        } catch (err: any) {
            alert(err?.message || t(language, 'networkAddFailed'));
        }
    };

    const handleCopySecret = () => {
        if (!revealedSecret) return;
        navigator.clipboard.writeText(revealedSecret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'settingsHeader')}</h1>
                <div className="w-8" />
            </div>

            {/* Scrollable Settings List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {/* General Settings */}
                <div>
                    <h2 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider px-1">{t(language, 'generalPreferencesSection')}</h2>
                    <div className="rounded-2xl bg-[#14161E] border border-white/5 divide-y divide-white/5 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <MoonIcon size={18} className="text-indigo-400" />
                                <span className="text-xs font-medium text-white">{t(language, 'darkModeLabel')}</span>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>

                        <div className="flex items-center justify-between px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <TranslateIcon size={18} className="text-indigo-400" />
                                <span className="text-xs font-medium text-white">{t(language, 'languageLabelText')}</span>
                            </div>
                            <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
                                <SelectTrigger className="w-[105px] h-8 bg-[#1F2330] border-white/10 text-xs text-white/90">
                                    <SelectValue>{languageLabels[language]}</SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-[#14161E] border-white/10 text-white min-w-[110px]">
                                    {Object.entries(languageLabels).map(([code, label]) => (
                                        <SelectItem key={code} value={code}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Account & Derivation */}
                <div>
                    <h2 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider px-1">{t(language, 'accountManagementSection')}</h2>
                    <div className="rounded-2xl bg-[#14161E] border border-white/5 overflow-hidden">
                        <div
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => setShowAddAccountModal(true)}
                        >
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <UserPlusIcon size={18} className="text-indigo-400" />
                                {t(language, 'deriveNewAccountTitle')}
                            </span>
                            <CaretRightIcon size={16} className="text-white/30" />
                        </div>
                    </div>
                </div>

                {/* Security & Backup */}
                <div>
                    <h2 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider px-1">{t(language, 'securityAndBackupSection')}</h2>
                    <div className="rounded-2xl bg-[#14161E] border border-white/5 divide-y divide-white/5 overflow-hidden">
                        <div
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => {
                                setExportModalType('mnemonic');
                                setPasswordInput('');
                                setRevealedSecret(null);
                                setExportError(null);
                            }}
                        >
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <KeyIcon size={18} className="text-indigo-400" />
                                {t(language, 'backupSecretPhraseItem')}
                            </span>
                            <CaretRightIcon size={16} className="text-white/30" />
                        </div>

                        <div
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => {
                                setExportModalType('privateKey');
                                setPasswordInput('');
                                setRevealedSecret(null);
                                setExportError(null);
                            }}
                        >
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <KeyIcon size={18} className="text-indigo-400" />
                                {t(language, 'exportCurrentPrivateKeyItem')}
                            </span>
                            <CaretRightIcon size={16} className="text-white/30" />
                        </div>

                        <div
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => navigate('/settings/contacts')}
                        >
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <BookBookmarkIcon size={18} className="text-indigo-400" />
                                {t(language, 'contactsAddressBookItem')}
                            </span>
                            <CaretRightIcon size={16} className="text-white/30" />
                        </div>

                        <div
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => navigate('/settings/connections')}
                        >
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <GlobeIcon size={18} className="text-indigo-400" />
                                {t(language, 'connectedSitesItem')}
                            </span>
                            <CaretRightIcon size={16} className="text-white/30" />
                        </div>

                        <div className="flex items-center justify-between px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <ClockIcon size={18} className="text-indigo-400" />
                                <span className="text-xs font-medium text-white">{t(language, 'autoLockTimer')}</span>
                            </div>
                            <Select
                                value={String(autoLockMinutes)}
                                onValueChange={(val) => setAutoLockMinutes(Number(val))}
                            >
                                <SelectTrigger className="w-[105px] h-8 bg-[#1F2330] border-white/10 text-xs text-white/90">
                                    <SelectValue>{autoLockMinutes} {t(language, 'minuteUnit')}</SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-[#14161E] border-white/10 text-white min-w-[110px]">
                                    <SelectItem value="5">5 {t(language, 'minuteUnit')}</SelectItem>
                                    <SelectItem value="15">15 {t(language, 'minuteUnit')}</SelectItem>
                                    <SelectItem value="30">30 {t(language, 'minuteUnit')}</SelectItem>
                                    <SelectItem value="60">60 {t(language, 'minuteUnit')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => navigate('/settings/change-password')}
                        >
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <KeyIcon size={18} className="text-indigo-400" />
                                {t(language, 'changePassword')}
                            </span>
                            <CaretRightIcon size={16} className="text-white/30" />
                        </div>
                    </div>
                </div>

                {/* Custom Networks */}
                <div>
                    <h2 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider px-1">{t(language, 'customNetworksSection')}</h2>
                    <div className="rounded-2xl bg-[#14161E] border border-white/5 overflow-hidden">
                        <div
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => setShowCustomNetworkModal(true)}
                        >
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <GlobeIcon size={18} className="text-indigo-400" />
                                {t(language, 'addCustomRpcNetworkItem')}
                            </span>
                            <CaretRightIcon size={16} className="text-white/30" />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div>
                    <h2 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider px-1">{t(language, 'aboutSection')}</h2>
                    <div className="rounded-2xl bg-[#14161E] border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3.5">
                            <span className="flex items-center gap-2.5 text-xs font-medium text-white">
                                <InfoIcon size={18} className="text-indigo-400" />
                                {t(language, 'appVersionLabel')}
                            </span>
                            <span className="text-xs text-white/40 font-mono">v1.0.0 (OKX Web3 Grade)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Lock Button */}
            <div className="p-4 border-t border-white/5 bg-[#070A12]/90 backdrop-blur-md">
                <Button
                    type="button"
                    variant="secondary"
                    size="pill"
                    onClick={handleLock}
                    className="w-full text-white/90 hover:text-white"
                >
                    <LockIcon size={16} weight="bold" className="text-indigo-400" />
                    <span>{t(language, 'lockWalletAction')}</span>
                </Button>
            </div>

            {/* Export Secret Dialog Modal */}
            {exportModalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#14161E] p-5 shadow-2xl">
                        <h3 className="text-base font-semibold text-white">
                            {exportModalType === 'privateKey' ? t(language, 'exportPlainPrivateKey') : t(language, 'viewRecoveryPhrase')}
                        </h3>
                        <p className="mt-1 text-xs text-white/40">
                            {t(language, 'neverLeakSecretWarning')}
                        </p>

                        {!revealedSecret ? (
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="text-xs text-white/50 block mb-1">{t(language, 'enterWalletPasswordLabel')}</label>
                                    <Input
                                        type="password"
                                        placeholder={t(language, 'passwordInputPlaceholder')}
                                        className="h-11 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                {exportError && (
                                    <p className="text-xs text-rose-400">{exportError}</p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="button"
                                        className="flex-1 h-11 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white text-xs font-semibold"
                                        onClick={() => setExportModalType(null)}
                                    >
                                        {t(language, 'cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                                        onClick={handleConfirmExport}
                                    >
                                        {t(language, 'confirmReveal')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                                        <WarningIcon size={16} />
                                        <span>{t(language, 'keepRecoverySafe')}</span>
                                    </div>
                                    <p className="mt-2 break-all font-mono text-xs text-white select-all leading-relaxed">
                                        {revealedSecret}
                                    </p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="button"
                                        className="flex-1 h-11 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                                        onClick={handleCopySecret}
                                    >
                                        {copied ? <CheckIcon size={16} className="text-emerald-400" /> : <CopyIcon size={16} />}
                                        <span>{copied ? t(language, 'copiedItem') : t(language, 'copy')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                                        onClick={() => setExportModalType(null)}
                                    >
                                        {t(language, 'ok')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Derived Account Modal */}
            {showAddAccountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#14161E] p-5 shadow-2xl">
                        <h3 className="text-base font-semibold text-white">{t(language, 'deriveAccountModalTitle')}</h3>
                        <p className="mt-1 text-xs text-white/40">
                            {t(language, 'deriveAccountModalDesc')}
                        </p>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="text-xs text-white/50 block mb-1">{t(language, 'accountNameOptionalLabel')}</label>
                                <Input
                                    placeholder="Account 2"
                                    className="h-11 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/50 block mb-1">{t(language, 'enterWalletPasswordLabel')}</label>
                                <Input
                                    type="password"
                                    placeholder={t(language, 'passwordInputPlaceholder')}
                                    className="h-11 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                    value={accountPassword}
                                    onChange={(e) => setAccountPassword(e.target.value)}
                                />
                            </div>
                            {accountError && (
                                <p className="text-xs text-rose-400">{accountError}</p>
                            )}
                            {accountSuccess && (
                                <p className="text-xs text-emerald-400 font-medium">{accountSuccess}</p>
                            )}
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    className="flex-1 h-11 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white text-xs font-semibold"
                                    onClick={() => setShowAddAccountModal(false)}
                                >
                                    {t(language, 'cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                                    onClick={handleCreateDerivedAccount}
                                >
                                    {t(language, 'createBtn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Network Modal */}
            {showCustomNetworkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#14161E] p-5 shadow-2xl">
                        <h3 className="text-base font-semibold text-white">{t(language, 'addCustomNetworkModalTitle')}</h3>
                        <p className="mt-1 text-xs text-white/40">
                            {t(language, 'addCustomNetworkModalDesc')}
                        </p>
                        <div className="mt-3 space-y-2.5">
                            <div>
                                <label className="text-xs text-white/50 block mb-1">{t(language, 'networkNameLabel')}</label>
                                <Input
                                    placeholder={t(language, 'networkNamePlaceholder')}
                                    className="h-10 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                    value={customNetName}
                                    onChange={(e) => setCustomNetName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/50 block mb-1">{t(language, 'rpcUrlLabel')}</label>
                                <Input
                                    placeholder="https://..."
                                    className="h-10 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                    value={customRpcUrl}
                                    onChange={(e) => setCustomRpcUrl(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-white/50 block mb-1">Chain ID</label>
                                    <Input
                                        placeholder="59144"
                                        className="h-10 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                        value={customChainId}
                                        onChange={(e) => setCustomChainId(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 block mb-1">{t(language, 'currencySymbolLabel')}</label>
                                    <Input
                                        placeholder="ETH"
                                        className="h-10 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                        value={customSymbol}
                                        onChange={(e) => setCustomSymbol(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-white/50 block mb-1">{t(language, 'blockExplorerUrlOptionalLabel')}</label>
                                <Input
                                    placeholder="https://explorer..."
                                    className="h-10 bg-[#0A0D14] border-white/10 text-white placeholder:text-neutral-500 text-xs focus-visible:ring-indigo-500/30"
                                    value={customExplorer}
                                    onChange={(e) => setCustomExplorer(e.target.value)}
                                />
                            </div>
                            {networkSuccess && (
                                <p className="text-xs text-emerald-400 font-medium">{networkSuccess}</p>
                            )}
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    className="flex-1 h-11 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white text-xs font-semibold"
                                    onClick={() => setShowCustomNetworkModal(false)}
                                >
                                    {t(language, 'cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                                    onClick={handleAddCustomNetwork}
                                >
                                    {t(language, 'addNetworkBtn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

