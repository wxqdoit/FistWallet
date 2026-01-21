import { useWalletStore } from '@store/wallet';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@/ui';
import { ArrowsClockwiseIcon, CopyIcon, DownloadSimpleIcon, GearSixIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { toast } from 'sonner';

export default function Dashboard() {
    const navigate = useNavigate();
    const { wallet, currentAccount, currentNetwork } = useWalletStore();

    if (!wallet || !currentAccount) {
        return null;
    }

    const currentAddress = currentAccount.addresses[currentNetwork.chainType];
    const handleCopyAddress = async () => {
        const toastId = toast.loading('Copying address...');
        try {
            await navigator.clipboard.writeText(currentAddress);
            toast.success('Address copied', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Failed to copy address', { id: toastId });
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4 ">
                <div className="flex items-center justify-between mb-3">
                    <button
                        type="button"
                        onClick={() => navigate('/wallets')}
                        className="flex items-center gap-2 text-left hover:opacity-90"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                            {currentAccount.name[0]}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{currentAccount.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                            </p>
                        </div>
                    </button>
                    <div className="flex items-center gap-0.5">
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate('/chains')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    navigate('/chains');
                                }
                            }}
                            title="Select Chain"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                        >
                            <NetworkIcon
                                chainType={currentNetwork.chainType}
                                iconKey={currentNetwork.icon}
                                className="text-foreground"
                                size={18}
                            />
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleCopyAddress}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleCopyAddress();
                                }
                            }}
                            title="Copy Address"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                        >
                            <CopyIcon size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance */}
            <div className="px-6 pb-6 ">
                <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
                <h2 className="text-4xl font-bold mb-1">$0.00</h2>
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 grid grid-cols-4 gap-3">
                <Button
                    onClick={() => navigate('/send')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <PaperPlaneTiltIcon size={20} />
                    <span className="text-xs">Send</span>
                </Button>
                <Button
                    onClick={() => navigate('/receive')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <DownloadSimpleIcon size={20} />
                    <span className="text-xs">Receive</span>
                </Button>
                <Button
                    onClick={() => navigate('/swap')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <ArrowsClockwiseIcon size={20} />
                    <span className="text-xs">Swap</span>
                </Button>
                <Button
                    onClick={() => navigate('/settings')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <GearSixIcon size={20} />
                    <span className="text-xs">Settings</span>
                </Button>
            </div>

            {/* Assets */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Assets</h3>
                        <Button variant="link" className="h-auto px-0 text-sm text-primary hover:text-primary/80">
                            + Add Token
                        </Button>
                    </div>

                    {/* Native token */}
                    <Card className="mb-3">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
                                    <NetworkIcon
                                        chainType={currentNetwork.chainType}
                                        iconKey={currentNetwork.icon}
                                        className="text-foreground"
                                        size={20}
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{currentNetwork.nativeCurrency.symbol}</p>
                                    <p className="text-xs text-muted-foreground">{currentNetwork.nativeCurrency.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">0</p>
                                <p className="text-xs text-muted-foreground">$0.00</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Empty state */}
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No tokens found</p>
                        <p className="text-xs mt-1">Tokens will appear here automatically</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
