import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useSettingsStore } from '@store/settings';
import { useEffect, useMemo } from 'react';
import { Toaster } from '@/ui';
import { cn } from '@/utils';

// Onboarding pages
import Welcome from '@pages/Onboarding/Welcome';
import CreatePassword from '@pages/Onboarding/CreatePassword';
import BackupMnemonic from '@pages/Onboarding/BackupMnemonic';
import VerifyMnemonic from '@pages/Onboarding/VerifyMnemonic';
import ImportWallet from '@pages/Onboarding/ImportWallet';

// Main pages
import Unlock from '@pages/Unlock';
import Dashboard from '@pages/Dashboard';
import Send from '@pages/Send';
import Receive from '@pages/Receive';
import Swap from '@pages/Swap';
import Settings from '@pages/Settings';
import ChangePassword from '@pages/Settings/ChangePassword';
import ChainSelect from '@pages/Chains';
import Wallets from '@pages/Wallets';
import WalletManage from '@pages/Wallets/Manage';
import AddWallet from '@pages/Wallets/AddWallet';

function App() {
    const { isInitialized, isLocked, initialize } = useWalletStore();
    const { theme, language, initialize: initializeSettings } = useSettingsStore();
    const isSidePanel = useMemo(
        () => new URLSearchParams(window.location.search).get('view') === 'sidepanel',
        []
    );
    useEffect(() => {
        initialize();
    }, [initialize]);
    useEffect(() => {
        initializeSettings();
    }, [initializeSettings]);
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.lang = language;
    }, [theme, language]);

    // Show loading state while initializing
    if (isInitialized === null) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="w-[375px] h-[600px] flex items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div
                className={cn(
                    'w-full bg-background flex',
                    isSidePanel ? 'h-full items-start justify-start' : 'min-h-screen items-center justify-center'
                )}
            >
                <div
                    className={cn(
                        'bg-background overflow-x-hidden overflow-y-auto scrollbar-thin border border-border',
                        isSidePanel
                            ? 'w-full h-full rounded-none'
                            : 'w-[375px] h-[600px] rounded-[var(--radius)]'
                    )}
                >
                    <Routes>
                    {/* Onboarding routes */}
                    {!isInitialized && (
                        <>
                            <Route path="/welcome" element={<Welcome />} />
                            <Route path="/create-password" element={<CreatePassword />} />
                            <Route path="/backup-mnemonic" element={<BackupMnemonic />} />
                            <Route path="/verify-mnemonic" element={<VerifyMnemonic />} />
                            <Route path="/import-wallet" element={<ImportWallet />} />
                            <Route path="*" element={<Navigate to="/welcome" replace />} />
                        </>
                    )}

                    {/* Locked state */}
                    {isInitialized && isLocked && (
                        <>
                            <Route path="/unlock" element={<Unlock />} />
                            <Route path="*" element={<Navigate to="/unlock" replace />} />
                        </>
                    )}

                    {/* Main app routes */}
                    {isInitialized && !isLocked && (
                        <>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/chains" element={<ChainSelect />} />
                            <Route path="/wallets" element={<Wallets />} />
                            <Route path="/wallets/manage" element={<WalletManage />} />
                            <Route path="/add-wallet" element={<AddWallet />} />
                            <Route path="/backup-mnemonic" element={<BackupMnemonic />} />
                            <Route path="/verify-mnemonic" element={<VerifyMnemonic />} />
                            <Route path="/import-wallet" element={<ImportWallet />} />
                            <Route path="/send" element={<Send />} />
                            <Route path="/receive" element={<Receive />} />
                            <Route path="/swap" element={<Swap />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/settings/change-password" element={<ChangePassword />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    )}
                    </Routes>
                </div>
                <Toaster />
            </div>
        </BrowserRouter>
    );
}

export default App;
