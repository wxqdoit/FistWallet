import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    WalletIcon,
    ArrowsLeftRightIcon,
    GlobeHemisphereWestIcon,
    GearSixIcon,
} from '@phosphor-icons/react';

interface BottomDockProps {
    activeTab?: 'wallet' | 'swap' | 'dapps' | 'settings';
}

export const BottomDock: React.FC<BottomDockProps> = ({ activeTab }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const current =
        activeTab ||
        (location.pathname === '/' || location.pathname.startsWith('/wallets')
            ? 'wallet'
            : location.pathname.startsWith('/swap')
            ? 'swap'
            : location.pathname.startsWith('/settings/connections')
            ? 'dapps'
            : location.pathname.startsWith('/settings')
            ? 'settings'
            : 'wallet');

    const tabs = [
        {
            id: 'wallet',
            label: 'Wallet',
            icon: WalletIcon,
            onClick: () => navigate('/'),
        },
        {
            id: 'swap',
            label: 'Swap',
            icon: ArrowsLeftRightIcon,
            onClick: () => navigate('/swap'),
        },
        {
            id: 'dapps',
            label: 'DApps',
            icon: GlobeHemisphereWestIcon,
            onClick: () => navigate('/settings/connections'),
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: GearSixIcon,
            onClick: () => navigate('/settings'),
        },
    ];

    return (
        <div className="h-[64px] bg-[#0A0E18] border-t border-[#1D263B] px-3 flex items-center justify-around shrink-0 relative z-20 select-none">
            {/* Top Specular Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/[0.06]" />

            {tabs.map((tab) => {
                const isActive = current === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={tab.onClick}
                        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer group relative"
                    >
                        {isActive && (
                            <div className="absolute -top-1 w-10 h-7 rounded-full bg-[#00F5A0]/10 blur-[1px]" />
                        )}
                        <div
                            className={`p-1 rounded-full transition-transform duration-150 ${
                                isActive ? 'text-[#00F5A0] scale-110' : 'text-[#64748B] group-hover:text-white'
                            }`}
                        >
                            <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                        </div>
                        <span
                            className={`text-[10px] tracking-tight transition-colors duration-150 ${
                                isActive ? 'text-[#00F5A0] font-bold' : 'text-[#64748B] font-medium group-hover:text-white/80'
                            }`}
                        >
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
