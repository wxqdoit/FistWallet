import React from "react";

interface CryptoIconProps {
    symbol: string;
    size?: number;
    className?: string;
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ symbol, size = 36, className = "" }) => {
    const sym = symbol.toUpperCase();

    if (sym === "ETH" || sym === "WETH" || sym === "ETHEREUM") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(98,126,234,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#ethGrad_comp)" />
                <defs>
                    <linearGradient id="ethGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#627EEA" />
                        <stop offset="100%" stopColor="#3B4F99" />
                    </linearGradient>
                </defs>
                <path d="M18 5 L25.5 18.5 L18 23 Z" fill="#FFFFFF" fillOpacity="0.95" />
                <path d="M18 5 L10.5 18.5 L18 23 Z" fill="#FFFFFF" fillOpacity="0.7" />
                <path d="M18 24 L25.5 19.5 L18 32 Z" fill="#FFFFFF" fillOpacity="0.95" />
                <path d="M18 24 L10.5 19.5 L18 32 Z" fill="#FFFFFF" fillOpacity="0.7" />
                <path d="M18 23 L25.5 18.5 L18 15 Z" fill="#FFFFFF" fillOpacity="0.45" />
                <path d="M18 23 L10.5 18.5 L18 15 Z" fill="#FFFFFF" fillOpacity="0.3" />
            </svg>
        );
    }

    if (sym === "USDT" || sym === "TETHER") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(38,161,123,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#usdtGrad_comp)" />
                <defs>
                    <linearGradient id="usdtGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#26A17B" />
                        <stop offset="100%" stopColor="#166B50" />
                    </linearGradient>
                </defs>
                <path d="M10 11 H26 V15 H20.5 V26 H15.5 V15 H10 Z" fill="#FFFFFF" />
                <ellipse cx="18" cy="19" rx="8" ry="3" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
            </svg>
        );
    }

    if (sym === "USDC") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(39,117,202,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#usdcGrad_comp)" />
                <defs>
                    <linearGradient id="usdcGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#2775CA" />
                        <stop offset="100%" stopColor="#184D87" />
                    </linearGradient>
                </defs>
                <circle cx="18" cy="18" r="13" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
                <text x="18" y="24" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="17" fontWeight="800">
                    $
                </text>
            </svg>
        );
    }

    if (sym === "SOL" || sym === "SOLANA") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(153,69,255,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#solGrad_comp)" />
                <defs>
                    <linearGradient id="solGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#9945FF" />
                        <stop offset="100%" stopColor="#14F195" />
                    </linearGradient>
                </defs>
                <g transform="translate(10, 12)">
                    <path d="M0 0 L13 0 L16 3 L3 3 Z" fill="#FFFFFF" />
                    <path d="M16 5 L3 5 L0 8 L13 8 Z" fill="#FFFFFF" />
                    <path d="M0 10 L13 10 L16 13 L3 13 Z" fill="#FFFFFF" />
                </g>
            </svg>
        );
    }

    if (sym === "BTC" || sym === "WBTC" || sym === "BITCOIN") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(247,147,26,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#btcGrad_comp)" />
                <defs>
                    <linearGradient id="btcGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#F7931A" />
                        <stop offset="100%" stopColor="#D67500" />
                    </linearGradient>
                </defs>
                <text x="18" y="24" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="900">
                    ₿
                </text>
            </svg>
        );
    }

    if (sym === "BNB" || sym === "BSC") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(240,185,11,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#bnbGrad_comp)" />
                <defs>
                    <linearGradient id="bnbGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#F3BA2F" />
                        <stop offset="100%" stopColor="#C49010" />
                    </linearGradient>
                </defs>
                <g fill="#FFFFFF" transform="translate(18, 18) scale(0.9)">
                    <rect x="-3" y="-3" width="6" height="6" transform="rotate(45)" />
                    <rect x="-10" y="-3" width="4" height="4" transform="rotate(45 -8 -1)" />
                    <rect x="6" y="-3" width="4" height="4" transform="rotate(45 8 -1)" />
                    <rect x="-3" y="-10" width="4" height="4" transform="rotate(45 -1 -8)" />
                    <rect x="-3" y="6" width="4" height="4" transform="rotate(45 -1 8)" />
                </g>
            </svg>
        );
    }

    if (sym === "ARB" || sym === "ARBITRUM") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(40,160,240,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#arbGrad_comp)" />
                <defs>
                    <linearGradient id="arbGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#28A0F0" />
                        <stop offset="100%" stopColor="#0E5B99" />
                    </linearGradient>
                </defs>
                <path d="M18 8 L26 26 H21 L18 19 L15 26 H10 Z" fill="#FFFFFF" />
            </svg>
        );
    }

    if (sym === "MATIC" || sym === "POL" || sym === "POLYGON") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(130,71,229,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#maticGrad_comp)" />
                <defs>
                    <linearGradient id="maticGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#8247E5" />
                        <stop offset="100%" stopColor="#5B29B3" />
                    </linearGradient>
                </defs>
                <path d="M18 10 L24 14 V22 L18 26 L12 22 V14 Z" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
            </svg>
        );
    }

    if (sym === "AVAX" || sym === "AVALANCHE") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(232,65,66,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#avaxGrad_comp)" />
                <defs>
                    <linearGradient id="avaxGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#E84142" />
                        <stop offset="100%" stopColor="#9B1C1D" />
                    </linearGradient>
                </defs>
                <path d="M18 9 L26 25 H21.5 L18 17 L14.5 25 H10 Z" fill="#FFFFFF" />
            </svg>
        );
    }

    if (sym === "OP" || sym === "OPTIMISM") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(255,4,32,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#opGrad_comp)" />
                <defs>
                    <linearGradient id="opGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF0420" />
                        <stop offset="100%" stopColor="#B30013" />
                    </linearGradient>
                </defs>
                <text x="18" y="24" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="900">
                    OP
                </text>
            </svg>
        );
    }

    if (sym === "SUI") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(30,169,255,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#suiGrad_comp)" />
                <defs>
                    <linearGradient id="suiGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4DA2FF" />
                        <stop offset="100%" stopColor="#0B5FBF" />
                    </linearGradient>
                </defs>
                <path d="M18 9 C18 9 12 18 12 22 C12 25.3 14.7 28 18 28 C21.3 28 24 25.3 24 22 C24 18 18 9 18 9 Z" fill="#FFFFFF" />
            </svg>
        );
    }

    if (sym === "TON" || sym === "TONCOIN") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 drop-shadow-[0_2px_8px_rgba(0,152,234,0.3)] ${className}`}
            >
                <circle cx="18" cy="18" r="18" fill="url(#tonGrad_comp)" />
                <defs>
                    <linearGradient id="tonGrad_comp" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0098EA" />
                        <stop offset="100%" stopColor="#00669E" />
                    </linearGradient>
                </defs>
                <path d="M10 13 L18 27 L26 13 H10 Z" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                <path d="M10 13 L18 19 L26 13" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </svg>
        );
    }

    // Default Fallback Token Badge
    return (
        <div
            style={{ width: size, height: size }}
            className={`rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-700/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm ${className}`}
        >
            {sym.slice(0, 3)}
        </div>
    );
};
