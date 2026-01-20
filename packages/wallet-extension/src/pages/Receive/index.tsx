import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import QRCode from 'react-qr-code';
import { Alert, AlertDescription, Badge, Button, Card, CardContent } from '@/ui';

export default function Receive() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork } = useWalletStore();
    const [copied, setCopied] = useState(false);

    if (!currentAccount) return null;

    const currentAddress = currentAccount.addresses[currentNetwork.chainType];

    const handleCopy = () => {
        navigator.clipboard.writeText(currentAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4 border-b border-border/60 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="px-0 text-muted-foreground hover:text-foreground"
                >
                    ←
                </Button>
                <h1 className="text-lg font-semibold">Receive {currentNetwork.nativeCurrency.symbol}</h1>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                {/* Network badge */}
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="text-lg">{currentNetwork.icon}</span>
                        <span className="text-sm font-medium">{currentNetwork.name}</span>
                    </span>
                </Badge>

                {/* QR Code */}
                <Card className="mb-6 bg-white">
                    <CardContent className="p-4">
                        <QRCode value={currentAddress} size={200} />
                    </CardContent>
                </Card>

                {/* Address */}
                <div className="w-full">
                    <p className="text-sm text-muted-foreground text-center mb-2">Your Address</p>
                    <Card>
                        <CardContent className="flex items-center justify-between gap-3 p-4">
                            <p className="text-sm font-mono flex-1 break-all">{currentAddress}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopy}
                                className="text-primary hover:text-primary/80 shrink-0"
                            >
                                {copied ? '✓' : '📋'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Warning */}
                <Alert variant="warning" className="mt-6">
                    <AlertDescription>
                        <p className="text-sm text-warning font-medium mb-1">⚠️ Important</p>
                        <p className="text-xs text-muted-foreground">
                            Only send <strong>{currentNetwork.nativeCurrency.symbol}</strong> and tokens on{' '}
                            <strong>{currentNetwork.name}</strong> to this address. Sending other assets may result in permanent loss.
                        </p>
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
