import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 10_000,
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});
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
import Contacts from '@pages/Settings/Contacts';
import ConnectedSites from '@pages/Settings/ConnectedSites';
import Activity from '@pages/Activity';
import Notification from '@pages/Notification';
import ChainSelect from '@pages/Chains';
import Wallets from '@pages/Wallets';
import WalletManage from '@pages/Wallets/Manage';
import AddWallet from '@pages/Wallets/AddWallet';
import ConnectHardware from '@pages/Wallets/ConnectHardware';

function App() {
    const { isInitialized, isLocked, initialize } = useWalletStore();
    const { theme, language, initialize: initializeSettings } = useSettingsStore();
    const isSidePanel = useMemo(
        () => new URLSearchParams(window.location.search).get('view') === 'sidepanel',
        []
    );
    const isExtensionPopup = useMemo(
        () => typeof window !== 'undefined' && (window.innerWidth <= 480 || isSidePanel),
        [isSidePanel]
    );

    useEffect(() => {
        initialize();
        const watchdog = setTimeout(() => {
            const state = useWalletStore.getState();
            if (state.isInitialized === null) {
                console.warn('Wallet initialization timed out, falling back to onboarding');
                useWalletStore.setState({ isInitialized: false, isLocked: false });
            }
        }, 2500);
        return () => clearTimeout(watchdog);
    }, [initialize]);
    useEffect(() => {
        initializeSettings();
    }, [initializeSettings]);
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.lang = language;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [theme, language]);

    // Show loading state while initializing
    if (isInitialized === null) {
        return (
            <div className="h-full w-full min-h-[600px] flex items-center justify-center bg-[#070A12] text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-500"></div>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
        <HashRouter>
            <div
                className={cn(
                    'w-full bg-[#070A12] flex font-sans',
                    isExtensionPopup ? 'h-full w-full' : 'min-h-screen items-center justify-center p-4'
                )}
            >
                <div
                    className={cn(
                        'bg-[#070A12] overflow-hidden',
                        isExtensionPopup
                            ? 'w-full h-full rounded-none border-0'
                            : 'w-[375px] h-[600px] rounded-2xl border border-white/10 shadow-2xl'
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
                            <Route path="/notification" element={<Notification />} />
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
                            <Route path="/connect-hardware" element={<ConnectHardware />} />
                            <Route path="/backup-mnemonic" element={<BackupMnemonic />} />
                            <Route path="/verify-mnemonic" element={<VerifyMnemonic />} />
                            <Route path="/import-wallet" element={<ImportWallet />} />
                            <Route path="/send" element={<Send />} />
                            <Route path="/receive" element={<Receive />} />
                            <Route path="/swap" element={<Swap />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/settings/contacts" element={<Contacts />} />
                            <Route path="/settings/connections" element={<ConnectedSites />} />
                            <Route path="/activity" element={<Activity />} />
                            <Route path="/notification" element={<Notification />} />
                            <Route path="/settings/change-password" element={<ChangePassword />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    )}
                    </Routes>
                </div>
                <Toaster />
            </div>
        </HashRouter>
        </QueryClientProvider>
    );
}

export default App;
