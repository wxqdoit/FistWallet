import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { ChainType } from '@/types';
import { validateMnemonic } from '@core/wallet';
import {
    Alert,
    AlertDescription,
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
import { ArrowLeft } from '@phosphor-icons/react';

export default function ImportWallet() {
    const navigate = useNavigate();
    const { importWallet, importFromPrivateKey } = useWalletStore();
    const [importType, setImportType] = useState<'mnemonic' | 'privateKey'>('mnemonic');
    const [mnemonic, setMnemonic] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [chainType, setChainType] = useState<ChainType>(ChainType.EVM);
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [tempPassword, setTempPassword] = useState('');

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
        const storedPassword = sessionStorage.getItem('tempPassword');
        if (!storedPassword) {
            navigate('/create-password?mode=import');
            return;
        }
        setTempPassword(storedPassword);
    }, [navigate]);

    const handleImport = async () => {
        setError('');

        if (!tempPassword) {
            setError('Please create a password first.');
            return;
        }

        if (importType === 'mnemonic') {
            const trimmedMnemonic = mnemonic.trim().toLowerCase();

            if (!validateMnemonic(trimmedMnemonic)) {
                setError('Invalid recovery phrase');
                return;
            }

            setIsImporting(true);
            try {
                await importWallet(tempPassword, trimmedMnemonic);
                sessionStorage.removeItem('tempPassword');
                navigate('/');
            } catch (err) {
                setError('Failed to import wallet. Please check your recovery phrase.');
                console.error(err);
            } finally {
                setIsImporting(false);
            }
            return;
        }

        const trimmedPrivateKey = privateKey.trim();
        if (!trimmedPrivateKey) {
            setError('Private key is required');
            return;
        }

        setIsImporting(true);
        try {
            await importFromPrivateKey(tempPassword, trimmedPrivateKey, chainType);
            sessionStorage.removeItem('tempPassword');
            navigate('/');
        } catch (err) {
            setError('Failed to import wallet. Please check your private key.');
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
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Import Wallet</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    Restore your wallet using your recovery phrase
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
                    <TabsTrigger value="mnemonic">Recovery Phrase</TabsTrigger>
                    <TabsTrigger value="privateKey">Private Key</TabsTrigger>
                </TabsList>
                <TabsContent value="mnemonic" />
                <TabsContent value="privateKey" />
            </Tabs>

            {/* Form */}
            <div className="flex-1 space-y-4 mb-6">
                {importType === 'mnemonic' && (
                    <div>
                        <Label className="mb-2 block text-sm font-medium">
                            Recovery Phrase (12 or 24 words)
                        </Label>
                        <Textarea
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                            className="min-h-[120px] resize-none font-mono text-sm"
                            placeholder="Enter your recovery phrase separated by spaces"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Separate each word with a space
                        </p>
                    </div>
                )}
                {importType === 'privateKey' && (
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block text-sm font-medium">Network</Label>
                            <Select value={chainType} onValueChange={(value) => setChainType(value as ChainType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select network" />
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
                            <Label className="mb-2 block text-sm font-medium">Private Key</Label>
                            <Input
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                className="font-mono text-sm"
                                placeholder="Enter your private key"
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
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
                {isImporting ? 'Importing...' : 'Import Wallet'}
            </Button>
        </div>
    );
}
