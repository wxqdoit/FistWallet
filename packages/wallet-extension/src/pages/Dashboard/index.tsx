import { useWalletStore } from '@store/wallet';
import { useNavigate } from 'react-router-dom';
import { NETWORKS } from '@core/networks';
import { Button, Card, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui';
import { ArrowsClockwise, DownloadSimple, GearSix, Lock, PaperPlaneTilt } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';

export default function Dashboard() {
    const navigate = useNavigate();
    const { wallet, currentAccount, currentNetwork, lock, switchNetwork } = useWalletStore();

    if (!wallet || !currentAccount) {
        return null;
    }

    const currentAddress = currentAccount.addresses[currentNetwork.chainType];

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4 border-b border-border/60">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                            {currentAccount.name[0]}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{currentAccount.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => lock()}
                        title="Lock Wallet"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Lock size={18} />
                    </Button>
                </div>

                {/* Network selector */}
                <Select value={currentNetwork.id} onValueChange={switchNetwork}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <NetworkIcon chainType={currentNetwork.chainType} className="text-foreground" size={18} />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(NETWORKS).map((network) => (
                            <SelectItem key={network.id} value={network.id}>
                                {network.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Balance */}
            <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
                <h2 className="text-4xl font-bold mb-1">$0.00</h2>
                <p className="text-sm text-muted-foreground">0 {currentNetwork.nativeCurrency.symbol}</p>
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 grid grid-cols-4 gap-3">
                <Button
                    onClick={() => navigate('/send')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <PaperPlaneTilt size={20} />
                    <span className="text-xs">Send</span>
                </Button>
                <Button
                    onClick={() => navigate('/receive')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <DownloadSimple size={20} />
                    <span className="text-xs">Receive</span>
                </Button>
                <Button
                    onClick={() => navigate('/swap')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <ArrowsClockwise size={20} />
                    <span className="text-xs">Swap</span>
                </Button>
                <Button
                    onClick={() => navigate('/settings')}
                    variant="secondary"
                    className="h-auto flex-col gap-2 py-3"
                >
                    <GearSix size={20} />
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
                                    <NetworkIcon chainType={currentNetwork.chainType} className="text-foreground" size={20} />
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
