import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { useEffect } from 'react';

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

function App() {
    const { isInitialized, isLocked, initialize } = useWalletStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    // Show loading state while initializing
    if (isInitialized === null) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="w-[375px] h-[680px] flex items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="w-[375px] h-[680px] bg-background overflow-x-hidden overflow-y-auto scrollbar-thin border border-border rounded-[var(--radius)]">
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
                            <Route path="/send" element={<Send />} />
                            <Route path="/receive" element={<Receive />} />
                            <Route path="/swap" element={<Swap />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    )}
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
