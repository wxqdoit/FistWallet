import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@/ui';
import { ArrowLeftIcon, CaretRightIcon, ClockIcon, KeyIcon, LockIcon, MoonIcon, TranslateIcon } from '@phosphor-icons/react';
import { languageLabels, t } from '@utils/i18n';
import type { LanguageCode } from '@/types/index.ts';

export default function Settings() {
    const navigate = useNavigate();
    const { lock } = useWalletStore();
    const {
        theme,
        language,
        autoLockMinutes,
        initialize,
        setTheme,
        setLanguage,
    } = useSettingsStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleLock = () => {
        lock();
        navigate('/unlock');
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className=" px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    {t(language, 'settings')}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {/* General */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t(language, 'general')}</h2>
                    <div className="space-y-2">
                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <MoonIcon size={20} className="text-primary" />
                                <span className="text-sm">{t(language, 'darkMode')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                />
                            </div>
                        </div>
                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-2">
                            <div className="flex items-center gap-2">
                                <TranslateIcon size={20} className="text-warning" />
                                <span className="text-sm">{t(language, 'language')}</span>
                            </div>
                            <Select
                                value={language}
                                onValueChange={(value) => setLanguage(value as LanguageCode)}
                            >
                                <SelectTrigger className="ml-auto h-9 w-auto gap-1 border-none bg-transparent px-0 shadow-none focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(languageLabels).map(([code, label]) => (
                                        <SelectItem key={code} value={code}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t(language, 'security')}</h2>
                    <div className="space-y-3">
                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <ClockIcon size={20} className="text-success" />
                                <span className="text-sm">{t(language, 'autoLockTimer')}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {autoLockMinutes} {t(language, 'minutes')}
                            </span>
                        </div>



                        <div
                            className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3 cursor-pointer"
                            onClick={() => navigate('/settings/change-password')}
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <KeyIcon size={20} className="text-primary" />
                                {t(language, 'changePassword')}
                            </span>
                            <CaretRightIcon size={16} className="text-muted-foreground" />
                        </div>


                    </div>
                </div>

                {/* About */}





                <div className="p-4">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t(language, 'about')}</h2>
                    <div className="space-y-2">



                        <div className="w-full flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                            <span className="flex items-center gap-2 text-sm">

                                {t(language, 'version')}
                            </span>
                            <span className="text-sm text-muted-foreground">v1.0.0</span>
                        </div>

                    </div>
                </div>
            </div>

            {/* Lock wallet */}
            <div className="p-4">
                <Button
                    variant="destructive"
                    onClick={handleLock}
                    className="w-full"
                >
                    <LockIcon size={16} />
                    {t(language, 'lockWallet')}
                </Button>
            </div>
        </div>
    );
}
