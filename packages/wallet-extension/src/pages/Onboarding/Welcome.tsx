import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-muted/40 to-background">
            {/* Logo and branding */}
            <div className="text-center mb-12">
                <div className="text-6xl mb-4">👊</div>
                <h1 className="text-4xl font-bold text-gradient mb-2">FistWallet</h1>
                <p className="text-muted-foreground text-sm">Gateway to Web3</p>
            </div>

            {/* Main actions */}
            <div className="w-full max-w-sm space-y-4">
                <Button onClick={() => navigate('/create-password')} className="w-full">
                    Create New Wallet
                </Button>

                <Button variant="secondary" onClick={() => navigate('/import-wallet')} className="w-full">
                    Import Existing Wallet
                </Button>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-muted-foreground">
                <p>Secured by industry-standard encryption</p>
                <p className="mt-1">Non-custodial • Open Source</p>
            </div>
        </div>
    );
}
