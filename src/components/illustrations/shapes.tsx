import React from 'react';
import { Circle, Ellipse, G, Path } from 'react-native-svg';
import { IC } from './colors';
import type { IllustrationProps } from './core';

type Tone = IllustrationProps['tone'];

/** Soft backdrop disc that reads on light, dark and brand-teal surfaces. */
export const Blob = ({ tone, cx = 100, cy = 104, r = 86 }: { tone?: Tone; cx?: number; cy?: number; r?: number }) => (
  <G>
    <Circle cx={cx} cy={cy} r={r} fill={tone === 'onBrand' ? IC.white : IC.aqua} fillOpacity={tone === 'onBrand' ? 0.16 : 0.16} />
    <Circle cx={cx} cy={cy} r={r * 0.72} fill={tone === 'onBrand' ? IC.white : IC.aqua} fillOpacity={tone === 'onBrand' ? 0.12 : 0.14} />
  </G>
);

export const Shadow = ({ cx, cy, rx, ry = rx * 0.14 }: { cx: number; cy: number; rx: number; ry?: number }) => (
  <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={IC.night} fillOpacity={0.16} />
);

/** Four-point sparkle centred on (x, y). */
export const Sparkle = ({ x, y, r = 8, fill = IC.marigold }: { x: number; y: number; r?: number; fill?: string }) => {
  const c = r * 0.18;
  return (
    <Path
      d={`M${x} ${y - r} Q${x + c} ${y - c} ${x + r} ${y} Q${x + c} ${y + c} ${x} ${y + r} Q${x - c} ${y + c} ${x - r} ${y} Q${x - c} ${y - c} ${x} ${y - r}Z`}
      fill={fill}
    />
  );
};

/** Heart centred on (x, y); s is its half-width. */
export const Heart = ({ x, y, s = 8, fill = 'url(#gHeart)' }: { x: number; y: number; s?: number; fill?: string }) => {
  const k = s / 14;
  return (
    <G transform={`translate(${x} ${y}) scale(${k})`}>
      <Path d="M0 12 C-18 -2 -10 -17 0 -8 C10 -17 18 -2 0 12Z" fill={fill} />
      <Circle cx={-6} cy={-6} r={2.2} fill={IC.white} fillOpacity={0.55} />
    </G>
  );
};

/** Leaf pointing up, base at (x, y), scaled by s. */
export const Leaf = ({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) => (
  <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Path d="M0 0 C-11 -8 -10 -22 0 -30 C10 -22 11 -8 0 0Z" fill="url(#gLeaf)" />
    <Path d="M0 -3 L0 -22" stroke={IC.leafLight} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
  </G>
);

/** Steam wisp rising from (x, y). */
export const Steam = ({ x, y, color, h = 1 }: { x: number; y: number; color: string; h?: number }) => (
  <Path
    d={`M${x} ${y} C${x - 7} ${y - 9 * h} ${x + 7} ${y - 15 * h} ${x} ${y - 24 * h} C${x - 5} ${y - 30 * h} ${x + 4} ${y - 34 * h} ${x + 1} ${y - 40 * h}`}
    stroke={color}
    strokeWidth={4.5}
    strokeLinecap="round"
    fill="none"
  />
);

export const steamColor = (tone?: Tone) => (tone === 'onBrand' ? IC.white : IC.aquaSoft);
