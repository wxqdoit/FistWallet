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
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
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

    return (
        <div className="h-full flex flex-col p-6 bg-background overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-4 px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    {t(language, 'back')}
                </Button>
                <h1 className="text-2xl font-bold">{t(language, 'importWalletTitle')}</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    {t(language, 'importWalletSubtitle')}
                </p>
            </div>

            {/* Import type selector */}
            <Tabs
                value={importType}
                onValueChange={(value) => {
                    setError('');
                    setImportType(value as 'mnemonic' | 'privateKey');
                }}
                className="mb-6"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mnemonic">{t(language, 'recoveryPhrase')}</TabsTrigger>
                    <TabsTrigger value="privateKey">{t(language, 'privateKey')}</TabsTrigger>
                </TabsList>
                <TabsContent value="mnemonic" />
                <TabsContent value="privateKey" />
            </Tabs>

            {/* Form */}
            <div className="flex-1 space-y-4 mb-6">
                {importType === 'mnemonic' && (
                    <div>
                        <Label className="mb-2 block text-sm font-medium">
                            {t(language, 'recoveryPhraseHint')}
                        </Label>
                        <Textarea
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                            className="min-h-[120px] resize-none font-mono text-sm"
                            placeholder={t(language, 'enterRecoveryPhrase')}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {t(language, 'separateWordsHint')}
                        </p>
                    </div>
                )}
                {importType === 'privateKey' && (
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block text-sm font-medium">{t(language, 'network')}</Label>
                            <Select value={chainType} onValueChange={(value) => setChainType(value as ChainType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t(language, 'selectNetwork')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {chainOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm font-medium">{t(language, 'privateKey')}</Label>
                            <Input
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                className="font-mono text-sm"
                                placeholder={t(language, 'enterPrivateKey')}
                            />
                        </div>
                    </div>
                )}

            </div>

            {/* Import button */}
            <Button
                onClick={handleImport}
                disabled={
                    isImporting ||
                    (importType === 'mnemonic' ? !mnemonic : !privateKey)
                }
                className="w-full"
            >
                {isImporting ? t(language, 'importing') : t(language, 'importWallet')}
            </Button>

            <AlertDialog open={Boolean(error)} onOpenChange={handleErrorDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'importFailed')}</AlertDialogTitle>
                        <AlertDialogDescription>{error}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
