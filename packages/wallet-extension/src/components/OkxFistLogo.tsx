import React from 'react';

export interface OkxFistLogoProps {
  size?: number;
  mode?: 'f' | 'x' | 'fist';
  colorScheme?: 'indigo' | 'green' | 'cyan' | 'white';
  className?: string;
  glow?: boolean;
}

export const OkxFistLogo: React.FC<OkxFistLogoProps> = ({
  size = 84,
  mode = 'f',
  colorScheme = 'indigo',
  className = '',
  glow: _glow = false,
}) => {
  // If 'f': 9 clusters forming the iconic 1:1 square letter 'F' (4 Top Knuckles + Thumb Bar + Wrist Stem)
  // If 'fist': 13 clusters forming a clenched fist with 4 knuckles, finger segments, thumb lock, and centered wrist
  // If 'x': 5 clusters forming the OKX 3x3 'X'
  const clusters = mode === 'x' ? [
    [0, 0], [2, 0], // Top row left & right
    [1, 1],         // Center
    [0, 2], [2, 2], // Bottom row left & right
  ] : mode === 'fist' ? [
    [0, 0], [1, 0], [2, 0], [3, 0], // 4 Knuckles across top
    [0, 1], [1, 1], [2, 1], [3, 1], // Folded fingers
    [0, 2], [1, 2], [2, 2],         // Thumb locking across
    [1, 3], [2, 3],                 // Wrist base
  ] : [
    [0, 0], [1, 0], [2, 0], [3, 0], // Top 4 Knuckles (Upper bar of F)
    [0, 1],                         // Left stem
    [0, 2], [1, 2], [2, 2],         // Thumb lock crossbar (Middle bar of F)
    [0, 3],                         // Wrist / stem base
  ];

  const totalCols = mode === 'x' ? 3 : 4;
  const totalRows = mode === 'x' ? 3 : 4;
  const bSize = mode === 'x' ? 62 : 48;
  const bGap = mode === 'x' ? 14 : 10;
  const subN = 3;
  const subGap = mode === 'x' ? 3.6 : 2.8;
  const subSize = (bSize - (subN - 1) * subGap) / subN;
  const subRx = 2.8;

  const totalW = totalCols * bSize + (totalCols - 1) * bGap;
  const totalH = totalRows * bSize + (totalRows - 1) * bGap;
  const pad = 24;
  const vbW = totalW + pad * 2;
  const vbH = totalH + pad * 2;
  const startX = pad;
  const startY = pad;
  const vbX = 0;
  const vbY = 0;

  const width = size;
  const height = size;

  const isWhite = colorScheme === 'white';
  const fillColor = isWhite ? '#FFFFFF' : '#6366F1';

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={width}
      height={height}
      className={`shrink-0 select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 3x3 Pixel Clusters forming Fist / F */}
      <g>
        {clusters.map(([col, row], cIdx) => {
          const bx = startX + col * (bSize + bGap);
          const by = startY + row * (bSize + bGap);
          const subRects = [];
          for (let r = 0; r < subN; r++) {
            for (let c = 0; c < subN; c++) {
              const x = bx + c * (subSize + subGap);
              const y = by + r * (subSize + subGap);
              subRects.push(
                <rect
                  key={`${cIdx}-${r}-${c}`}
                  x={x.toFixed(1)}
                  y={y.toFixed(1)}
                  width={subSize.toFixed(1)}
                  height={subSize.toFixed(1)}
                  rx={subRx}
                  fill={fillColor}
                />
              );
            }
          }
          return <g key={`cluster-${cIdx}`}>{subRects}</g>;
        })}
      </g>
    </svg>
  );
};
