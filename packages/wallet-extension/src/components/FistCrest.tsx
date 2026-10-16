import React from 'react';

interface FistCrestProps {
    size?: number;
    locked?: boolean;
}

export const FistCrest: React.FC<FistCrestProps> = ({ size = 110, locked = false }) => {
    return (
        <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
            {/* Ambient Radial Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-500/20 blur-xl scale-125 pointer-events-none" />

            <svg
                width={size}
                height={size}
                viewBox="0 0 110 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 drop-shadow-[0_10px_25px_rgba(79,70,229,0.4)]"
            >
                <defs>
                    <linearGradient id="crestGrad" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* Outer Dashed Orbital Ellipse */}
                <ellipse
                    cx="55"
                    cy="55"
                    rx="50"
                    ry="24"
                    stroke="#818CF8"
                    strokeOpacity="0.4"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    transform="rotate(-25 55 55)"
                />

                {/* Base Outer Ring */}
                <circle cx="55" cy="55" r="44" fill="#121624" stroke="#2D384E" strokeWidth="1.5" />

                {/* Inner Gradient Shield */}
                <circle cx="55" cy="55" r="36" fill="url(#crestGrad)" />

                {/* Specular Inner Ring */}
                <circle cx="55" cy="55" r="35" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" fill="none" />

                {/* Center Icon */}
                {locked ? (
                    <g transform="translate(42, 40)" stroke="#FFFFFF" strokeWidth="2.2" fill="none">
                        <rect x="3" y="11" width="20" height="15" rx="3.5" />
                        <path d="M7 11 V7 C7 3.5 10 1 13 1 C16 1 19 3.5 19 7 V11" strokeLinecap="round" />
                        <circle cx="13" cy="18" r="2.2" fill="#FFFFFF" />
                    </g>
                ) : (
                    <g transform="translate(37, 36)">
                        <path
                            d="M6 11 C6 8.5 8.2 6.5 11 6.5 C13.5 6.5 15.5 8.5 15.5 11 V15 M15.5 9 C15.5 6.5 17.5 4.5 20 4.5 C22.5 4.5 24.5 6.5 24.5 9 V15 M24.5 10 C24.5 7.5 26.5 5.5 29 5.5 C31.5 5.5 33.5 7.5 33.5 10 V20 C33.5 27 27.5 33 20 33 H16 C10 33 5 28 5 22 V16.5 C5 14 7.2 12 9.5 12 H11"
                            stroke="#FFFFFF"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </g>
                )}
            </svg>
        </div>
    );
};
