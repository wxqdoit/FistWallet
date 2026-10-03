import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch
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
    WarningIcon
} from '@phosphor-icons/react';
import { languageLabels, t } from '@utils/i18n';
import { ChainType, type LanguageCode, type Network } from '@/types/index.ts';
import {
    exportAccountPrivateKey,
    exportWalletMnemonic,
    createNextAccount
} from '@core/wallet';
import { addCustomNetwork } from '@core/networks';

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
                if (!currentAccount) throw new Error('No active account selected');
                const pk = await exportAccountPrivateKey(passwordInput, currentAccount.id, ChainType.EVM);
                setRevealedSecret(pk);
            } else if (exportModalType === 'mnemonic') {
                if (!wallet) throw new Error('No active wallet found');
                const phrase = await exportWalletMnemonic(passwordInput, wallet.id);
                setRevealedSecret(phrase);
            }
        } catch (err: any) {
            setExportError(err?.message || 'Authentication failed. Please verify password.');
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
            setAccountSuccess(`Derived ${nextAcc.name} successfully!`);
            setTimeout(() => {
                setShowAddAccountModal(false);
                setAccountSuccess(null);
                setAccountPassword('');
                setAccountName('');
            }, 1200);
        } catch (err: any) {
            setAccountError(err?.message || 'Failed to create derived account.');
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
            setNetworkSuccess(`Network ${customNetName} added successfully!`);
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
            alert(err?.message || 'Failed to add custom network');
        }
    };

    const handleCopySecret = () => {
        if (!revealedSecret) return;
        navigator.clipboard.writeText(revealedSecret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    {t(language, 'settings')}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {/* General */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t(language, 'general')}</h2>
                    <div className="space-y-2">
                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <MoonIcon size={20} className="text-primary" />
                                <span className="text-sm">{t(language, 'darkMode')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                />
                            </div>
                        </div>
                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-2">
                            <div className="flex items-center gap-2">
                                <TranslateIcon size={20} className="text-warning" />
                                <span className="text-sm">{t(language, 'language')}</span>
                            </div>
                            <Select
                                value={language}
                                onValueChange={(value) => setLanguage(value as LanguageCode)}
                            >
                                <SelectTrigger className="ml-auto h-9 w-auto gap-1 border-none bg-transparent px-0 shadow-none focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
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

                {/* Account & Derivation Management */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">Account & Derivation</h2>
                    <div className="space-y-2">
                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer hover:bg-muted/40"
                            onClick={() => setShowAddAccountModal(true)}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <UserPlusIcon size={20} className="text-primary" />
                                Add Derived Account (Account 2, 3...)
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* Security & Backup */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t(language, 'security')}</h2>
                    <div className="space-y-3">
                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer hover:bg-muted/40"
                            onClick={() => {
                                setExportModalType('mnemonic');
                                setPasswordInput('');
                                setRevealedSecret(null);
                                setExportError(null);
                            }}
                        >
                            <span className="flex items-center gap-2 text-sm text-warning">
                                <KeyIcon size={20} />
                                Backup Secret Recovery Phrase
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>

                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer hover:bg-muted/40"
                            onClick={() => {
                                setExportModalType('privateKey');
                                setPasswordInput('');
                                setRevealedSecret(null);
                                setExportError(null);
                            }}
                        >
                            <span className="flex items-center gap-2 text-sm text-destructive">
                                <KeyIcon size={20} />
                                Export Current Private Key
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>

                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer hover:bg-muted/40"
                            onClick={() => navigate('/settings/contacts')}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <KeyIcon size={20} className="text-secondary-foreground" />
                                Address Book
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>

                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer hover:bg-muted/40"
                            onClick={() => navigate('/settings/connections')}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <GlobeIcon size={20} className="text-indigo-400" />
                                Connected Sites
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>

                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <ClockIcon size={20} className="text-success" />
                                <span className="text-sm">{t(language, 'autoLockTimer')}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {autoLockMinutes} {t(language, 'minutes')}
                            </span>
                        </div>

                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer hover:bg-muted/40"
                            onClick={() => navigate('/settings/change-password')}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <KeyIcon size={20} className="text-primary" />
                                {t(language, 'changePassword')}
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* Networks Management */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">Custom Networks</h2>
                    <div className="space-y-2">
                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer hover:bg-muted/40"
                            onClick={() => setShowCustomNetworkModal(true)}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <GlobeIcon size={20} className="text-primary" />
                                Add Custom Network (RPC)
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t(language, 'about')}</h2>
                    <div className="space-y-2">
                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                            <span className="flex items-center gap-2 text-sm">
                                {t(language, 'version')}
                            </span>
                            <span className="text-sm text-muted-foreground">v1.0.0 (OKX Production Grade)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lock wallet */}
            <div className="p-4">
                <Button
                    variant="destructive"
                    onClick={handleLock}
                    className="w-full"
                >
                    <LockIcon size={16} />
                    {t(language, 'lockWallet')}
                </Button>
            </div>

            {/* Export Secret Dialog Modal */}
            {exportModalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl">
                        <h3 className="text-base font-semibold text-foreground">
                            {exportModalType === 'privateKey' ? 'Export Private Key' : 'Secret Recovery Phrase'}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Never disclose this key or phrase. Anyone with it can access all funds.
                        </p>

                        {!revealedSecret ? (
                            <div className="mt-4 space-y-3">
                                <div>
                                    <Label className="text-xs">Enter Wallet Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        className="mt-1"
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                    />
                                </div>
                                {exportError && (
                                    <p className="text-xs text-destructive">{exportError}</p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setExportModalType(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={handleConfirmExport}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                                        <WarningIcon size={16} />
                                        Keep it confidential!
                                    </div>
                                    <p className="mt-2 break-all font-mono text-xs text-foreground select-all">
                                        {revealedSecret}
                                    </p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleCopySecret}
                                    >
                                        {copied ? <CheckIcon size={16} className="text-success" /> : <CopyIcon size={16} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={() => setExportModalType(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Derived Account Modal */}
            {showAddAccountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl">
                        <h3 className="text-base font-semibold text-foreground">Add Derived Account</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Derive a new address from your existing secret recovery phrase.
                        </p>
                        <div className="mt-4 space-y-3">
                            <div>
                                <Label className="text-xs">Account Name (Optional)</Label>
                                <Input
                                    placeholder="Account 2"
                                    className="mt-1"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Enter Wallet Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="mt-1"
                                    value={accountPassword}
                                    onChange={(e) => setAccountPassword(e.target.value)}
                                />
                            </div>
                            {accountError && (
                                <p className="text-xs text-destructive">{accountError}</p>
                            )}
                            {accountSuccess && (
                                <p className="text-xs text-success font-medium">{accountSuccess}</p>
                            )}
                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowAddAccountModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleCreateDerivedAccount}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Network Modal */}
            {showCustomNetworkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl">
                        <h3 className="text-base font-semibold text-foreground">Add Custom Network</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Connect to custom EVM compatible testnets or sidechains.
                        </p>
                        <div className="mt-3 space-y-2">
                            <div>
                                <Label className="text-xs">Network Name</Label>
                                <Input
                                    placeholder="e.g. Linea Mainnet"
                                    className="mt-1"
                                    value={customNetName}
                                    onChange={(e) => setCustomNetName(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">RPC URL</Label>
                                <Input
                                    placeholder="https://..."
                                    className="mt-1"
                                    value={customRpcUrl}
                                    onChange={(e) => setCustomRpcUrl(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Chain ID</Label>
                                    <Input
                                        placeholder="59144"
                                        className="mt-1"
                                        value={customChainId}
                                        onChange={(e) => setCustomChainId(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Currency Symbol</Label>
                                    <Input
                                        placeholder="ETH"
                                        className="mt-1"
                                        value={customSymbol}
                                        onChange={(e) => setCustomSymbol(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">Block Explorer URL (Optional)</Label>
                                <Input
                                    placeholder="https://explorer..."
                                    className="mt-1"
                                    value={customExplorer}
                                    onChange={(e) => setCustomExplorer(e.target.value)}
                                />
                            </div>
                            {networkSuccess && (
                                <p className="text-xs text-success font-medium">{networkSuccess}</p>
                            )}
                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowCustomNetworkModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleAddCustomNetwork}
                                >
                                    Add Network
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
