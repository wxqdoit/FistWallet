import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { Button, Card, CardContent } from '@/ui';

export default function Settings() {
    const navigate = useNavigate();
    const { lock } = useWalletStore();

    const handleLock = () => {
        lock();
        navigate('/unlock');
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
                <h1 className="text-lg font-semibold">Settings</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {/* General */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">GENERAL</h2>
                    <div className="space-y-2">
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Currency</span>
                            <span className="text-sm text-muted-foreground">USD</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Language</span>
                            <span className="text-sm text-muted-foreground">English</span>
                        </Button>
                    </div>
                </div>

                {/* Security */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">SECURITY</h2>
                    <div className="space-y-2">
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Auto-Lock Timer</span>
                            <span className="text-sm text-muted-foreground">15 min</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Reveal Recovery Phrase</span>
                            <span className="text-sm text-muted-foreground">→</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Change Password</span>
                            <span className="text-sm text-muted-foreground">→</span>
                        </Button>
                    </div>
                </div>

                {/* Advanced */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">ADVANCED</h2>
                    <div className="space-y-2">
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Custom RPC</span>
                            <span className="text-sm text-muted-foreground">→</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Developer Mode</span>
                            <span className="text-sm text-muted-foreground">Off</span>
                        </Button>
                    </div>
                </div>

                {/* About */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">ABOUT</h2>
                    <div className="space-y-2">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Version</p>
                                <p className="text-sm font-medium">1.0.0</p>
                            </CardContent>
                        </Card>
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Terms of Service</span>
                            <span className="text-sm text-muted-foreground">→</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                            <span className="text-sm">Privacy Policy</span>
                            <span className="text-sm text-muted-foreground">→</span>
                        </Button>
                    </div>
                </div>

                {/* Lock wallet */}
                <div className="p-4">
                    <Button
                        variant="destructive"
                        onClick={handleLock}
                        className="w-full"
                    >
                        🔒 Lock Wallet
                    </Button>
                </div>
            </div>
        </div>
    );
}
