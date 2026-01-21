import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Card,
    CardContent,
    Input,
    Label,
} from '@/ui';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { t } from '@utils/i18n';

export default function Send() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork } = useWalletStore();
    const { language } = useSettingsStore();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [isNotReadyOpen, setIsNotReadyOpen] = useState(false);

    const handleSend = () => {
        // TODO: Implement send transaction
        setIsNotReadyOpen(true);
    };

    if (!currentAccount) return null;

    const currentAddress = currentAccount.addresses[currentNetwork.chainType];
    const needsMemo = ['ton', 'near'].includes(currentNetwork.chainType);

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
                    {t(language, 'sendTitle', { symbol: currentNetwork.nativeCurrency.symbol })}
                </Button>
            </div>

            {/* Form */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
                {/* From */}
                <div>
                    <Label className="mb-2 block text-sm font-medium">{t(language, 'from')}</Label>
                    <Card>
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-medium">{currentAccount.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {currentAddress.slice(0, 10)}...{currentAddress.slice(-8)}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">{t(language, 'balanceZero')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* To */}
                <div>
                    <Label className="mb-2 block text-sm font-medium">{t(language, 'to')}</Label>
                    <Input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder={t(language, 'enterChainAddress', { chain: currentNetwork.chainType.toUpperCase() })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {t(language, 'addressSupportsDomains')}
                    </p>
                </div>

                {/* Amount */}
                <div>
                    <Label className="mb-2 block text-sm font-medium">{t(language, 'amount')}</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pr-16"
                            placeholder="0.0"
                            step="any"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAmount('0')} // TODO: Calculate max amount
                            className="absolute right-2 top-1/2 h-7 -translate-y-1/2 px-2 text-primary hover:text-primary/80"
                        >
                            {t(language, 'max')}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">≈ $0.00</p>
                </div>

                {/* Memo (for specific chains) */}
                {needsMemo && (
                    <div>
                        <Label className="mb-2 block text-sm font-medium">
                            {currentNetwork.chainType === 'ton'
                                ? t(language, 'memoRequired')
                                : t(language, 'memo')}
                        </Label>
                        <Input
                            type="text"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder={t(language, 'enterMemo')}
                        />
                    </div>
                )}

                {/* Gas fee */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{t(language, 'networkFee')}</span>
                            <Button variant="link" className="h-auto px-0 text-sm text-primary hover:text-primary/80">
                                {t(language, 'edit')}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">{t(language, 'estimated')}</span>
                            <span className="text-sm font-medium">~$0.00</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total */}
                <Card className="border-primary/30 bg-primary/10">
                    <CardContent className="flex items-center justify-between p-4">
                        <span className="text-sm font-medium">{t(language, 'totalAmount')}</span>
                        <div className="text-right">
                            <p className="font-semibold">{amount || '0'} {currentNetwork.nativeCurrency.symbol}</p>
                            <p className="text-xs text-muted-foreground">≈ $0.00</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Send button */}
            <div className="p-4 border-t border-border/60">
                <Button onClick={handleSend} disabled={!recipient || !amount} className="w-full">
                    {t(language, 'reviewTransaction')}
                </Button>
            </div>

            <AlertDialog open={isNotReadyOpen} onOpenChange={setIsNotReadyOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(language, 'sendNotReadyTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(language, 'sendNotReadyBody')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>{t(language, 'ok')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
