import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { ChainType } from '@/types';
import { validateMnemonic } from '@core/wallet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/ui';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

export default function ImportWallet() {
    const navigate = useNavigate();
    const { importWallet, importFromPrivateKey, addWalletFromMnemonic, addWalletFromPrivateKey } = useWalletStore();
    const { language } = useSettingsStore();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const isAddMode = mode === 'add';
    const [importType, setImportType] = useState<'mnemonic' | 'privateKey'>('mnemonic');
    const [mnemonic, setMnemonic] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [chainType, setChainType] = useState<ChainType>(ChainType.EVM);
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const handleErrorDialogChange = (open: boolean) => {
        if (!open) {
            setError('');
        }
    };

    const chainOptions = [
        { value: ChainType.EVM, label: 'EVM' },
        { value: ChainType.BITCOIN, label: 'Bitcoin' },
        { value: ChainType.SOLANA, label: 'Solana' },
        { value: ChainType.APTOS, label: 'Aptos' },
        { value: ChainType.SUI, label: 'Sui' },
        { value: ChainType.TRON, label: 'Tron' },
        { value: ChainType.TON, label: 'TON' },
        { value: ChainType.NEAR, label: 'Near' },
        { value: ChainType.FILECOIN, label: 'Filecoin' },
    ];

    useEffect(() => {
        if (isAddMode) {
            return;
        }

        const storedPassword = sessionStorage.getItem('tempPassword');
        if (!storedPassword) {
            navigate('/create-password?mode=import');
            return;
        }
        setTempPassword(storedPassword);
    }, [isAddMode, navigate]);

    const handleImport = async () => {
        setError('');

        if (!tempPassword && !isAddMode) {
            setError(t(language, 'createPasswordFirst'));
            return;
        }

        if (importType === 'mnemonic') {
            const trimmedMnemonic = mnemonic.trim().toLowerCase();

            if (!validateMnemonic(trimmedMnemonic)) {
                setError(t(language, 'invalidRecoveryPhrase'));
                return;
            }

            setIsImporting(true);
            try {
                if (isAddMode) {
                    await addWalletFromMnemonic(trimmedMnemonic);
                    navigate('/');
                } else {
                    await importWallet(tempPassword, trimmedMnemonic);
                    sessionStorage.removeItem('tempPassword');
                    navigate('/');
                }
            } catch (err) {
                setError(t(language, 'importRecoveryFailed'));
                console.error(err);
            } finally {
                setIsImporting(false);
            }
            return;
        }

        const trimmedPrivateKey = privateKey.trim();
        if (!trimmedPrivateKey) {
            setError(t(language, 'privateKeyRequired'));
            return;
        }

        setIsImporting(true);
        try {
            if (isAddMode) {
                await addWalletFromPrivateKey(trimmedPrivateKey, chainType);
                navigate('/');
            } else {
                await importFromPrivateKey(tempPassword, trimmedPrivateKey, chainType);
                sessionStorage.removeItem('tempPassword');
                navigate('/');
            }
        } catch (err) {
            if (err instanceof Error && err.message === 'Private key already imported') {
                setError(t(language, 'duplicatePrivateKey'));
            } else {
                setError(t(language, 'importPrivateKeyFailed'));
            }
            console.error(err);
        } finally {
            setIsImporting(false);
        }
    };

    const handlePasteMnemonic = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setMnemonic(text.trim());
        } catch {}
    };

    const handlePastePrivateKey = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setPrivateKey(text.trim());
        } catch {}
    };

    return (
        <div className="h-full flex flex-col justify-between p-6 bg-[#070A12] text-white selection:bg-indigo-500/30 select-none relative overflow-y-auto scrollbar-thin">
            {/* Top Navigation & Title */}
            <div className="relative z-10 mb-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, 'importWalletTitle')}</h1>
                <p className="text-xs text-white/40 mt-1">
                    {t(language, 'importWalletSubtitle')}
                </p>
            </div>

            {/* Segmented Import Type Tab Selector */}
            <div className="relative z-10 mb-5">
                <div className="grid grid-cols-2 p-1 rounded-xl bg-[#14161E] border border-white/10">
                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            setImportType('mnemonic');
                        }}
                        className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            importType === 'mnemonic'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        {t(language, 'recoveryPhrase')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            setImportType('privateKey');
                        }}
                        className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            importType === 'privateKey'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        {t(language, 'privateKey')}
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4 mb-4 relative z-10">
                {importType === 'mnemonic' && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                                {t(language, 'recoveryPhraseHint')}
                            </Label>
                            <button
                                type="button"
                                onClick={handlePasteMnemonic}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                                {t(language, 'pasteRecoveryPhrase')}
                            </button>
                        </div>
                        <Textarea
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                            className="min-h-[130px] resize-none font-mono text-xs leading-relaxed bg-[#0A0D14] border-white/10 rounded-xl focus:border-indigo-500/50 text-white placeholder:text-neutral-500"
                            placeholder={t(language, 'enterRecoveryPhrase')}
                        />
                        <p className="text-[11px] text-white/40">
                            {t(language, 'separateWordsHint')}
                        </p>
                    </div>
                )}
                {importType === 'privateKey' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                                {t(language, 'network')}
                            </Label>
                            <Select value={chainType} onValueChange={(value) => setChainType(value as ChainType)}>
                                <SelectTrigger className="h-12 rounded-xl bg-[#0A0D14] border-white/10 text-white text-xs">
                                    <SelectValue placeholder={t(language, 'selectNetwork')} />
                                </SelectTrigger>
                                <SelectContent className="bg-[#14161E] border-white/10 text-white rounded-xl">
                                    {chainOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="text-xs hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                                    {t(language, 'privateKey')}
                                </Label>
                                <button
                                    type="button"
                                    onClick={handlePastePrivateKey}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                >
                                    {t(language, 'pastePrivateKey')}
                                </button>
                            </div>
                            <Input
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                className="font-mono text-xs h-12 rounded-xl bg-[#0A0D14] border-white/10 text-white focus:border-indigo-500/50"
                                placeholder={t(language, 'enterPrivateKey')}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Import Action Button */}
            <div className="w-full relative z-10 pt-2">
                <button
                    type="button"
                    onClick={handleImport}
                    disabled={
                        isImporting ||
                        (importType === 'mnemonic' ? !mnemonic.trim() : !privateKey.trim())
                    }
                    className={`w-full h-12 rounded-full font-bold text-[14px] transition-all flex items-center justify-center ${
                        !isImporting && (importType === 'mnemonic' ? Boolean(mnemonic.trim()) : Boolean(privateKey.trim()))
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:opacity-85 cursor-pointer'
                            : 'bg-[#14161E] text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                >
                    {isImporting ? t(language, 'importing') : t(language, 'importWallet')}
                </button>
            </div>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent className="rounded-3xl border border-white/10 bg-[#14161E] text-white p-5 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-white">{t(language, 'importFailed')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-white/50 mt-1">{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogAction className="rounded-full h-11 text-xs font-bold bg-indigo-600 text-white w-full">{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
