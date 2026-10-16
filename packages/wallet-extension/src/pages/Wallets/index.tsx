import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "@store/wallet";
import {
    ArrowLeftIcon,
    CheckIcon,
    PlusIcon,
    HardDrivesIcon,
    CopyIcon,
} from "@phosphor-icons/react";
import { BottomDock } from "@/components/BottomDock";
import { toast } from "sonner";

export default function Wallets() {
    const navigate = useNavigate();
    const { wallets, switchWallet, currentAccount } = useWalletStore();
    const [chainFamily, setChainFamily] = useState<"evm" | "solana" | "bitcoin">("evm");

    const handleSelectWallet = (walletId: string) => {
        switchWallet(walletId);
        toast.success("Account switched");
        navigate("/");
    };

    const handleCreateNextAccount = () => {
        navigate("/add-wallet");
    };

    const handleCopy = (address: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        toast.success(`${label} address copied`);
    };

    // Chain-specific configuration
    const chainConfig = {
        evm: {
            label: "EVM",
            badge: "Ethereum & L2s",
            addr1: currentAccount?.addresses?.evm || "0x887Fee96F34C2084bC2B904FeB97208539ff1a",
            addr2: "0x442C009a25bA56eE1a98075fC0A842bc01",
            addr3: "0x71C941D20b5e2dE452dC6B4592aF887Fee39F1",
            bal1: "$28,495.80",
            bal2: "$4,120.50",
            bal3: "$105,240.00",
            sub1: "4.25 ETH + Tokens",
            sub2: "1.20 ETH",
            sub3: "30.5 ETH Cold Storage",
        },
        solana: {
            label: "Solana",
            badge: "SPL Tokens & DeFi",
            addr1: currentAccount?.addresses?.solana || "7UdMzWv84N8XQ92FqA4t9xGepHj3KmmbU2yL99e2K",
            addr2: "4wTtC85nKx92ZpQ8L1Y7u4mVg2j6XnPtW3xPq88a",
            addr3: "9xLkPq77bXnQ88Y7a2ZpM4t9xGepHj3KmmbU2yL22Ja",
            bal1: "$28,495.80",
            bal2: "$4,120.50",
            bal3: "$105,240.00",
            sub1: "184.8 SOL",
            sub2: "26.7 SOL",
            sub3: "682.4 SOL Cold Storage",
        },
        bitcoin: {
            label: "Bitcoin",
            badge: "Native SegWit & Taproot",
            addr1: currentAccount?.addresses?.bitcoin || "bc1qmxrw6qdh5g3ztfcwm0et5l8mvws4eva24kmp8m",
            addr2: "bc1q887fee96f34c2084bc2b904feb97208539ff1a",
            addr3: "bc1q71c941d20b5e2de452dc6b4592af887fee39f1",
            bal1: "$28,495.80",
            bal2: "$4,120.50",
            bal3: "$105,240.00",
            sub1: "0.415 BTC",
            sub2: "0.060 BTC",
            sub3: "1.536 BTC Cold Storage",
        },
    };

    const currentChain = chainConfig[chainFamily];

    const formatShortAddr = (addr: string) => {
        if (!addr) return "";
        if (addr.length <= 14) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className="h-full w-full flex flex-col justify-between bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans select-none relative">
            {/* Header (Figma Screen 10) */}
            <div className="h-[52px] px-3.5 flex items-center justify-between border-b border-[#1D263B] bg-[#0A0E18]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-[#131826] hover:bg-[#1C2538] border border-[#253147] text-[#CBD5E1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon size={16} />
                </button>
                <h1 className="text-sm font-bold text-white tracking-tight">Manage Accounts</h1>
                <div className="w-8" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {/* Multi-Chain Family Selector (EVM / Solana / Bitcoin) */}
                <div className="p-1 rounded-xl bg-[#101522] border border-[#253248] flex items-center">
                    {(["evm", "solana", "bitcoin"] as const).map((fam) => {
                        const isAct = chainFamily === fam;
                        return (
                            <button
                                key={fam}
                                type="button"
                                onClick={() => setChainFamily(fam)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                    isAct
                                        ? "bg-[#6366F1] text-white shadow-xs"
                                        : "text-[#94A3B8] hover:text-white"
                                }`}
                            >
                                {fam}
                            </button>
                        );
                    })}
                </div>

                {/* Accounts List Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
                            {currentChain.label} Accounts (HD Derived)
                        </span>
                        <span className="text-[10px] text-[#00E599] font-semibold bg-[#00E599]/10 px-2 py-0.5 rounded-full border border-[#00E599]/20">
                            {currentChain.badge}
                        </span>
                    </div>

                    {/* Account 1 (Active) */}
                    <div
                        onClick={() => wallets[0] && handleSelectWallet(wallets[0].id)}
                        className="p-3.5 rounded-xl border border-[#00F5A0] bg-[#141E32] flex items-center justify-between cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.12)] transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#818CF8] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                                1
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">
                                    {currentAccount?.name || "Account 1 (Primary)"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-xs font-mono text-[#94A3B8]">
                                        {formatShortAddr(currentChain.addr1)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => handleCopy(currentChain.addr1, "Primary", e)}
                                        className="text-[#64748B] hover:text-white p-0.5 transition-colors cursor-pointer"
                                    >
                                        <CopyIcon size={11} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-2.5">
                            <div>
                                <span className="font-extrabold text-sm text-white font-mono block">
                                    {currentChain.bal1}
                                </span>
                                <span className="text-[10px] text-[#00E599] font-mono">
                                    {currentChain.sub1}
                                </span>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-[#00E599] flex items-center justify-center text-[#042F2E]">
                                <CheckIcon size={12} weight="bold" />
                            </div>
                        </div>
                    </div>

                    {/* Account 2 (Trading) */}
                    <div
                        className="p-3.5 rounded-xl border border-[#253248] hover:border-white/20 bg-[#101522] flex items-center justify-between cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                                2
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">Trading / DApp Vault</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-xs font-mono text-[#94A3B8]">
                                        {formatShortAddr(currentChain.addr2)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => handleCopy(currentChain.addr2, "Trading", e)}
                                        className="text-[#64748B] hover:text-white p-0.5 transition-colors cursor-pointer"
                                    >
                                        <CopyIcon size={11} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-sm text-white font-mono block">
                                {currentChain.bal2}
                            </span>
                            <span className="text-[10px] text-[#94A3B8] font-mono">
                                {currentChain.sub2}
                            </span>
                        </div>
                    </div>

                    {/* Account 3 (Ledger Hardware) */}
                    <div
                        onClick={() => navigate("/connect-hardware")}
                        className="p-3.5 rounded-xl border border-[#253248] hover:border-amber-500/40 bg-[#101522] flex items-center justify-between cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/15 text-[#FBBF24] flex items-center justify-center border border-amber-500/20">
                                <HardDrivesIcon size={18} weight="bold" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                                    Ledger Nano S Plus
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-xs font-mono text-[#94A3B8]">
                                        {formatShortAddr(currentChain.addr3)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => handleCopy(currentChain.addr3, "Ledger", e)}
                                        className="text-[#64748B] hover:text-white p-0.5 transition-colors cursor-pointer"
                                    >
                                        <CopyIcon size={11} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-sm text-white font-mono block">
                                {currentChain.bal3}
                            </span>
                            <span className="text-[10px] text-[#FBBF24] font-mono">
                                {currentChain.sub3}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions: Add & Connect */}
                <div className="space-y-2 pt-2">
                    <button
                        type="button"
                        onClick={handleCreateNextAccount}
                        className="w-full h-11 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-[#263147] hover:border-white/20 text-[#E2E8F0] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-[#818CF8] flex items-center justify-center">
                            <PlusIcon size={12} weight="bold" />
                        </div>
                        <span>Create Next HD Account</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/connect-hardware")}
                        className="w-full h-11 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-[#263147] hover:border-white/20 text-[#E2E8F0] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-[#FBBF24] flex items-center justify-center">
                            <HardDrivesIcon size={12} weight="bold" />
                        </div>
                        <span>Connect Hardware / Import Key</span>
                    </button>
                </div>
            </div>

            {/* Bottom Dock */}
            <BottomDock activeTab="wallet" />
        </div>
    );
}
