import React from 'react';

export interface FistWalletLogoProps {
  size?: number;
  variant?: 'emblem' | 'app_icon';
  className?: string;
  glow?: boolean;
}

export const FistWalletLogo: React.FC<FistWalletLogoProps> = ({
  size = 64,
  variant = 'emblem',
  className = '',
  glow = true,
}) => {
  const isEmblem = variant === 'emblem';
  // If emblem: tightly frame the gauntlet so it renders large, bold, and punchy without empty padding.
  // If app_icon: full 512x512 with the squircle metallic badge.
  const viewBox = isEmblem ? '130 120 256 310' : '0 0 512 512';
  const width = size;
  const height = isEmblem ? Math.round(size * (310 / 256)) : size;

  return (
    <svg
      viewBox={viewBox}
      width={width}
      height={height}
      className={`shrink-0 select-none ${glow ? 'drop-shadow-[0_0_18px_rgba(99,102,241,0.45)]' : ''} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Ambient Radial Glow */}
        <radialGradient id="fw-logo-glow" cx="50%" cy="44%" r="60%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#070A12" stopOpacity="0" />
        </radialGradient>

        {/* Squircle Card Gradient (for app_icon variant) */}
        <linearGradient id="fw-logo-card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#131826" />
          <stop offset="50%" stopColor="#0D111D" />
          <stop offset="100%" stopColor="#070A12" />
        </linearGradient>

        {/* Squircle Rim Gradient */}
        <linearGradient id="fw-logo-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#6366F1" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0.6" />
        </linearGradient>

        {/* Specular White Platinum Bevel */}
        <linearGradient id="fw-k-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>

        {/* Knuckle 1 (Index Finger): Electric Cyan */}
        <linearGradient id="fw-k1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="45%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        {/* Knuckle 2 (Middle Finger): Electric Indigo */}
        <linearGradient id="fw-k2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="40%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>

        {/* Knuckle 3 (Ring Finger): Cyber Violet */}
        <linearGradient id="fw-k3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="45%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>

        {/* Knuckle 4 (Pinky Finger): Neon Magenta */}
        <linearGradient id="fw-k4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="45%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#831843" />
        </linearGradient>

        {/* Thumb Latch: Multi-spectral Cyber Armor */}
        <linearGradient id="fw-thumb-latch" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="40%" stopColor="#8B5CF6" />
          <stop offset="75%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        <linearGradient id="fw-thumb-rim" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>

        {/* Metacarpal Shield: Left (Bright Radiant Indigo) */}
        <linearGradient id="fw-shield-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>

        {/* Metacarpal Shield: Right (Cyber Violet Depth) */}
        <linearGradient id="fw-shield-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#2E1065" />
        </linearGradient>

        {/* Forearm & Wrist Gauntlet: Luminous Metallic Indigo */}
        <linearGradient id="fw-wrist-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#3730A3" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* Central Quantum Vault Core Gem */}
        <linearGradient id="fw-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#38BDF8" />
          <stop offset="70%" stopColor="#00F2FE" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      {/* Background card only for app_icon variant */}
      {!isEmblem && (
        <>
          <circle cx="256" cy="230" r="240" fill="url(#fw-logo-glow)" />
          <rect
            x="36"
            y="36"
            width="440"
            height="440"
            rx="96"
            fill="url(#fw-logo-card)"
            stroke="url(#fw-logo-rim)"
            strokeWidth="2.5"
          />
        </>
      )}

      {/* Heroic Gauntlet Fist Mark */}
      <g>
        {/* Forearm & Wrist Gauntlet */}
        <path
          d="M 186,350 L 256,336 L 326,350 L 310,420 L 202,420 Z"
          fill="url(#fw-wrist-main)"
          stroke="#818CF8"
          strokeWidth="1.2"
        />
        <line
          x1="256"
          y1="336"
          x2="256"
          y2="420"
          stroke="#00F2FE"
          strokeWidth="2"
          opacity="0.85"
        />
        <polygon points="166,328 186,350 202,420 176,380" fill="#312E81" />
        <polygon points="346,328 326,350 310,420 336,380" fill="#2E1065" />

        {/* Metacarpal Shield Plate */}
        <polygon
          points="186,238 256,216 256,336 186,350"
          fill="url(#fw-shield-left)"
        />
        <polygon
          points="256,216 326,238 326,350 256,336"
          fill="url(#fw-shield-right)"
        />
        <line
          x1="256"
          y1="216"
          x2="256"
          y2="336"
          stroke="#C7D2FE"
          strokeWidth="2"
          opacity="0.8"
        />
        {/* Cyber Neon Shield Circuit Pattern */}
        <path
          d="M 256,236 L 256,336 M 236,268 L 256,280 L 276,268 M 230,296 L 256,310 L 282,296"
          fill="none"
          stroke="#00F2FE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {/* Knuckle 1 (Index Finger) */}
        <path
          d="M 186,238 L 168,198 L 194,166 L 218,180 L 220,230 Z"
          fill="url(#fw-k1)"
        />
        <polygon points="168,198 194,166 218,180 196,206" fill="url(#fw-k-bevel)" />
        <polyline
          points="168,198 194,166 218,180"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Knuckle 2 (Middle Finger - Prominent Power Peak) */}
        <path
          d="M 220,230 L 218,180 L 248,136 L 278,154 L 264,224 Z"
          fill="url(#fw-k2)"
        />
        <polygon points="218,180 248,136 278,154 252,192" fill="url(#fw-k-bevel)" />
        <polyline
          points="218,180 248,136 278,154"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Knuckle 3 (Ring Finger) */}
        <path
          d="M 264,224 L 278,154 L 310,146 L 334,174 L 304,232 Z"
          fill="url(#fw-k3)"
        />
        <polygon points="278,154 310,146 334,174 306,196" fill="url(#fw-k-bevel)" />
        <polyline
          points="278,154 310,146 334,174"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Knuckle 4 (Pinky Finger) */}
        <path
          d="M 304,232 L 334,174 L 364,184 L 374,218 L 326,238 Z"
          fill="url(#fw-k4)"
        />
        <polygon points="334,174 364,184 374,218 348,212" fill="url(#fw-k-bevel)" />
        <polyline
          points="334,174 364,184 374,218"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <polygon points="374,218 382,254 346,328 326,350 326,238" fill="#3B0764" opacity="0.85" />

        {/* Thumb Latch (Locking the Knuckles) */}
        <path d="M 148,318 L 166,248 L 186,238 L 186,350 L 166,328 Z" fill="#312E81" />
        <path
          d="M 142,284 L 158,210 L 182,192 L 174,244 L 154,302 Z"
          fill="url(#fw-thumb-latch)"
        />
        <polyline
          points="142,284 158,210 182,192"
          fill="none"
          stroke="url(#fw-thumb-rim)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glowing Central Quantum Vault Core Gem */}
        <polygon
          points="256,204 274,220 256,236 238,220"
          fill="url(#fw-core)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <circle cx="256" cy="220" r="3.2" fill="#FFFFFF" />
        <line x1="256" y1="194" x2="256" y2="246" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
        <line x1="230" y1="220" x2="282" y2="220" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />

        {/* Knuckle Separation Laser Channels */}
        <line x1="218" y1="180" x2="220" y2="230" stroke="#070A12" strokeWidth="2.5" />
        <line x1="278" y1="154" x2="264" y2="224" stroke="#070A12" strokeWidth="2.5" />
        <line x1="334" y1="174" x2="304" y2="232" stroke="#070A12" strokeWidth="2.5" />
      </g>
    </svg>
  );
};
