import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { getSupportedNetworksForAccount } from '@core/networks';
import { ArrowLeftIcon, CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { toast } from 'sonner';

export default function ChainSelect() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork, switchNetwork } = useWalletStore();
    const [search, setSearch] = useState('');

    if (!currentAccount) return null;

    const supportedNetworks = getSupportedNetworksForAccount(currentAccount);

    const filteredNetworks = useMemo(() => {
        if (!search.trim()) return supportedNetworks;
        const q = search.toLowerCase();
        return supportedNetworks.filter(
            (n) =>
                n.name.toLowerCase().includes(q) ||
                n.chainType.toLowerCase().includes(q) ||
                n.nativeCurrency.symbol.toLowerCase().includes(q) ||
                (n.chainId && String(n.chainId).includes(q))
        );
    }, [supportedNetworks, search]);

    const handleSelect = (networkId: string) => {
        switchNetwork(networkId);
        toast.success('Switched network');
        navigate(-1);
    };

    const getLatency = (id: string) => {
        if (id.includes('arbitrum')) return { ms: '24ms', isFast: true };
        if (id.includes('polygon')) return { ms: '18ms', isFast: true };
        if (id.includes('solana')) return { ms: '45ms', isFast: true };
        if (id.includes('bitcoin')) return { ms: '120ms', isFast: false };
        return { ms: '12ms', isFast: true };
    };

    return (
        <div className="h-full w-full flex flex-col justify-between bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans select-none relative">
            {/* Header (Figma Screen 11) */}
            <div className="h-[52px] px-3.5 flex items-center justify-between border-b border-[#1D263B] bg-[#0A0E18]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#CBD5E1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} />
                </button>
                <h1 className="text-sm font-bold text-white tracking-tight">Select Network</h1>
                <div className="w-8" />
            </div>

            {/* Search Input Bar */}
            <div className="p-4 pb-2">
                <div className="relative">
                    <MagnifyingGlassIcon
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search networks or Chain ID..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#101522] border border-[#253248] focus:border-indigo-500 text-xs text-white placeholder:text-[#64748B] outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Networks List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
                {filteredNetworks.map((network) => {
                        const isSelected = currentNetwork.id === network.id;
                        const latency = getLatency(network.id);

                        return (
                            <div
                                key={network.id}
                                onClick={() => handleSelect(network.id)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-[#00F5A0] bg-[#141E32] shadow-[0_0_12px_rgba(0,245,160,0.12)]'
                                        : 'border-[#253248] bg-[#101522] hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#161C2C] flex items-center justify-center border border-[#2C374E] relative">
                                        <NetworkIcon
                                            chainType={network.chainType}
                                            iconKey={network.icon}
                                            size={20}
                                        />
                                        <div
                                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#101522] ${
                                                latency.isFast ? 'bg-[#00E599]' : 'bg-[#FBBF24]'
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs leading-tight text-white">
                                            {network.name}
                                        </p>
                                        <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                                            Chain ID: {network.chainId || network.chainType} · {network.nativeCurrency.symbol}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Latency Pill */}
                                    <div
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                            latency.isFast
                                                ? 'bg-[#00E599]/15 text-[#00E599]'
                                                : 'bg-amber-500/15 text-[#FBBF24]'
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                latency.isFast ? 'bg-[#00E599]' : 'bg-[#FBBF24]'
                                            }`}
                                        />
                                        <span>{latency.ms}</span>
                                    </div>

                                    {isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-[#00E599] flex items-center justify-center text-[#042F2E] shadow-xs">
                                            <CheckIcon size={12} weight="bold" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Bottom Add Custom RPC Button */}
            <div className="p-4 border-t border-[#1D263B]">
                <button
                    type="button"
                    onClick={() => toast.info('Custom RPC config: Add network parameters via JSON-RPC')}
                    className="w-full h-11 rounded-xl font-bold text-xs bg-[#141A28] hover:bg-[#1A2234] border border-[#2B364C] text-[#E2E8F0] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs"
                >
                    + Add Custom Network (RPC)
                </button>
            </div>
        </div>
    );
}
