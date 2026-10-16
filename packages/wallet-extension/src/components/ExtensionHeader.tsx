import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { CaretDownIcon, LockIcon, ArrowSquareOutIcon } from '@phosphor-icons/react';
import { NetworkIcon } from './NetworkIcon';

interface ExtensionHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
}

export const ExtensionHeader: React.FC<ExtensionHeaderProps> = () => {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork, lock } = useWalletStore();

    const handleLock = () => {
        lock();
        navigate('/unlock');
    };

    const handleExpandTab = () => {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
            chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
        } else {
            window.open(window.location.href, '_blank');
        }
    };

    return (
        <div className="h-[52px] px-3.5 flex items-center justify-between border-b border-[#1D263B] bg-[#0A0E18]/90 backdrop-blur-md sticky top-0 z-30 select-none">
            {/* Account Selector Pill */}
            <button
                type="button"
                onClick={() => navigate('/wallets/manage')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#141926] hover:bg-[#1A2234] border border-[#263147] hover:border-white/20 active:opacity-80 transition-all cursor-pointer shadow-sm group"
            >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-[10px] text-white font-bold shadow-xs">
                    {currentAccount?.name?.slice(0, 1).toUpperCase() || 'A'}
                </div>
                <span className="text-xs font-bold text-white max-w-[85px] truncate">
                    {currentAccount?.name || 'Account 1'}
                </span>
                <CaretDownIcon size={12} className="text-[#94A3B8] group-hover:text-white transition-colors" />
            </button>

            {/* Network Selector Pill */}
            <button
                type="button"
                onClick={() => navigate('/chains')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#141926] hover:bg-[#1A2234] border border-[#263147] hover:border-white/20 active:opacity-80 transition-all cursor-pointer shadow-sm group"
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E599]"></span>
                </span>
                <NetworkIcon
                    chainType={currentNetwork?.chainType}
                    iconKey={currentNetwork?.icon}
                    size={14}
                    className="shrink-0"
                />
                <span className="text-xs font-semibold text-[#E2E8F0] max-w-[80px] truncate">
                    {currentNetwork?.name || 'Ethereum'}
                </span>
                <CaretDownIcon size={12} className="text-[#94A3B8] group-hover:text-white transition-colors" />
            </button>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={handleLock}
                    className="w-7 h-7 rounded-full bg-[#141926] hover:bg-[#1C2538] border border-[#263147] hover:border-white/20 text-[#94A3B8] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Lock Wallet"
                >
                    <LockIcon size={13} weight="bold" />
                </button>
                <button
                    type="button"
                    onClick={handleExpandTab}
                    className="w-7 h-7 rounded-full bg-[#141926] hover:bg-[#1C2538] border border-[#263147] hover:border-white/20 text-[#94A3B8] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Expand View"
                >
                    <ArrowSquareOutIcon size={13} weight="bold" />
                </button>
            </div>
        </div>
    );
};
