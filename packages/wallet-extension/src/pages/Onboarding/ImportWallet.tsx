import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { validateMnemonic } from '@core/wallet';
import {
    Alert,
    AlertDescription,
    Button,
    Input,
    Label,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Textarea,
} from '@/ui';

export default function ImportWallet() {
    const navigate = useNavigate();
    const { importWallet } = useWalletStore();
    const [importType, setImportType] = useState<'mnemonic' | 'privateKey'>('mnemonic');
    const [mnemonic, setMnemonic] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async () => {
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
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
                await importWallet(password, trimmedMnemonic);
                navigate('/');
            } catch (err) {
                setError('Failed to import wallet. Please check your recovery phrase.');
                console.error(err);
            } finally {
                setIsImporting(false);
            }
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
                    className="mb-4 px-0 text-muted-foreground hover:text-foreground"
                >
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">Import Wallet</h1>
                <p className="text-muted-foreground text-sm mt-2">
                    Restore your wallet using your recovery phrase
                </p>
            </div>

            {/* Import type selector */}
            <Tabs
                value={importType}
                onValueChange={(value) => setImportType(value as 'mnemonic' | 'privateKey')}
                className="mb-6"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mnemonic">Recovery Phrase</TabsTrigger>
                    <TabsTrigger value="privateKey" disabled>
                        Private Key
                    </TabsTrigger>
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

                <div>
                    <Label className="mb-2 block text-sm font-medium">New Password</Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                    />
                </div>

                <div>
                    <Label className="mb-2 block text-sm font-medium">Confirm Password</Label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                    />
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Import button */}
            <Button
                onClick={handleImport}
                disabled={!mnemonic || !password || !confirmPassword || isImporting}
                className="w-full"
            >
                {isImporting ? 'Importing...' : 'Import Wallet'}
            </Button>
        </div>
    );
}
