import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import QRCode from 'react-qr-code';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    Badge,
    Button,
    Card,
    CardContent,
} from '@/ui';
import { ArrowLeftIcon, CheckIcon, CopyIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { toast } from 'sonner';

export default function Receive() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork } = useWalletStore();
    const [copied, setCopied] = useState(false);
    const [isWarningOpen, setIsWarningOpen] = useState(true);

    if (!currentAccount) return null;

    const currentAddress = currentAccount.addresses[currentNetwork.chainType];

    const handleCopy = async () => {
        const toastId = toast.loading('Copying address...');
        try {
            await navigator.clipboard.writeText(currentAddress);
            setCopied(true);
            toast.success('Address copied', { id: toastId });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
            toast.error('Failed to copy address', { id: toastId });
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4  flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className=" px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    Receive {currentNetwork.nativeCurrency.symbol}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                {/* Network badge */}
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                    <span className="flex items-center gap-2">
                        <NetworkIcon
                            chainType={currentNetwork.chainType}
                            iconKey={currentNetwork.icon}
                            className="text-foreground"
                            size={18}
                        />
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
                                {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Warning */}
                <AlertDialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="secondary"
                            className="mt-6 w-full justify-start gap-2 border border-warning/40 bg-warning/10 text-warning hover:bg-warning/20"
                        >
                            <WarningCircleIcon size={16} />
                            Important: Check network before sending
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Important</AlertDialogTitle>
                            <AlertDialogDescription>
                                Only send <strong>{currentNetwork.nativeCurrency.symbol}</strong> and tokens on{' '}
                                <strong>{currentNetwork.name}</strong> to this address. Sending other assets may result in
                                permanent loss.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction>Got it</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
