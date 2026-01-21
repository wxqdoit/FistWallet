import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui';
import { useSettingsStore } from '@store/settings';
import { t } from '@utils/i18n';

export default function Welcome() {
    const navigate = useNavigate();
    const { language } = useSettingsStore();

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-muted/40 to-background">
            {/* Logo and branding */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gradient mb-2">FistWallet</h1>
                <p className="text-muted-foreground text-sm">{t(language, 'welcomeTagline')}</p>
            </div>

            {/* Main actions */}
            <div className="w-full max-w-sm space-y-4">
                <Button onClick={() => navigate('/create-password')} className="w-full">
                    {t(language, 'createNewWallet')}
                </Button>

                <Button
                    variant="secondary"
                    onClick={() => navigate('/create-password?mode=import')}
                    className="w-full"
                >
                    {t(language, 'importExistingWallet')}
                </Button>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-muted-foreground">
                <p>{t(language, 'securedByEncryption')}</p>
                <p className="mt-1">{t(language, 'nonCustodialOpenSource')}</p>
            </div>
        </div>
    );
}
