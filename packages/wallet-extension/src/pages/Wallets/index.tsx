import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { Button, Card, CardContent } from '@/ui';
import { ArrowLeftIcon, CheckIcon, PlusIcon, WrenchIcon } from '@phosphor-icons/react';
import { cn } from '@/utils';
import { t } from '@utils/i18n';

export default function Wallets() {
    const navigate = useNavigate();
    const { wallets, currentWalletId, switchWallet } = useWalletStore();
    const { language } = useSettingsStore();
    const handleSelectWallet = (walletId: string) => {
        switchWallet(walletId);
        navigate('/');
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
                    {t(language, 'back')}
                </Button>
            </div>

            {/* Wallet list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {wallets.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        {t(language, 'noWalletsFound')}
                    </div>
                ) : (
                    wallets.map((wallet, index) => {
                        const isSelected = wallet.id === currentWalletId;
                        const primaryAccount = wallet.accounts[0];
                        const primaryAddress = primaryAccount
                            ? Object.values(primaryAccount.addresses)[0]
                            : '';
                        const addressLabel = primaryAddress
                            ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}`
                            : `Wallet ${index + 1}`;

                        return (
                            <Card
                                key={wallet.id}
                                className={cn(
                                    'cursor-pointer transition-colors',
                                    isSelected ? 'border-primary/60 bg-primary/5' : 'hover:border-border'
                                )}
                                onClick={() => handleSelectWallet(wallet.id)}
                            >
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium font-mono">{addressLabel}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="uppercase text-xs text-muted-foreground">
                                                {wallet.type === 'mnemonic'
                                                    ? t(language, 'recoveryPhraseLabel')
                                                    : t(language, 'privateKeyLabel')}
                                            </p>
                                            {primaryAccount && (
                                                <p className="text-xs text-muted-foreground">
                                                    {primaryAccount.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && <CheckIcon size={18} className="text-primary" />}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex gap-2">
                <Button
                    variant="secondary"
                    className="flex-1 justify-center"
                    onClick={() => navigate('/wallets/manage')}
                    disabled={wallets.length === 0}
                >
                    <WrenchIcon size={16} />
                    {t(language, 'manage')}
                </Button>
                <Button
                    variant="default"
                    className="flex-1 justify-center"
                    onClick={() => navigate('/add-wallet')}
                >
                    <PlusIcon size={16} />
                    {t(language, 'addWallet')}
                </Button>
                </div>
            </div>
        </div>
    );
}
