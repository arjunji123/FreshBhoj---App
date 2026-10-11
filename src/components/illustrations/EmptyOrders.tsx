import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Blob, Shadow, Sparkle } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

/** Zig-zag torn edge running right-to-left along y. */
const zig = (x0: number, x1: number, y: number, n: number, d: number) => {
  const step = (x1 - x0) / n;
  let p = '';
  for (let i = 0; i < n; i += 1) {
    p += ` L${x1 - step * (i + 0.5)} ${y + d} L${x1 - step * (i + 1)} ${y}`;
  }
  return p;
};

/** Blank receipt with a covered-dish icon: "no orders yet". */
export const EmptyOrders = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} />
      <Shadow cx={100} cy={176} rx={46} />
    </Layer>

    <Layer motion="float" amp={3.5} duration={2700}>
      <G transform="rotate(4 100 100)">
        {/* paper */}
        <Path d={`M52 28 Q52 22 58 22 H142 Q148 22 148 28 V160${zig(52, 148, 160, 8, 9)} Z`} fill="url(#gCream)" />
        {/* header badge */}
        <Circle cx={100} cy={52} r={19} fill="url(#gTeal)" />
        <Path d="M86 58 H114" stroke={IC.white} strokeWidth={3.6} strokeLinecap="round" />
        <Path d="M89 56 Q89 43 100 43 Q111 43 111 56Z" fill={IC.white} />
        <Circle cx={100} cy={41} r={2.6} fill={IC.white} />
        {/* empty rows */}
        <Rect x={68} y={86} width={64} height={5} rx={2.5} fill={IC.paperShade} />
        <Rect x={68} y={100} width={46} height={5} rx={2.5} fill={IC.paperShade} />
        <Rect x={68} y={114} width={56} height={5} rx={2.5} fill={IC.paperShade} />
        <Path d="M66 130 H134" stroke={IC.steelMid} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="2 6" />
        <Rect x={68} y={140} width={26} height={7} rx={3.5} fill={IC.marigold} />
        <Rect x={104} y={140} width={28} height={7} rx={3.5} fill={IC.paperShade} />
      </G>
    </Layer>

    <Layer motion="float" amp={5} duration={2200} delay={300}>
      <G transform="translate(160 118)">
        <Circle r={15} fill={IC.cream} />
        <Path d="M-8 4 H8" stroke={IC.teal} strokeWidth={3} strokeLinecap="round" />
        <Path d="M-7 2 Q-7 -9 0 -9 Q7 -9 7 2Z" fill={IC.aqua} />
        <Circle cy={-11} r={2} fill={IC.aqua} />
      </G>
    </Layer>

    <Layer motion="twinkle" duration={1500} pivot={[36, 56]}>
      <Sparkle x={36} y={56} r={9} />
    </Layer>
    <Layer motion="twinkle" duration={1900} delay={600} pivot={[168, 40]}>
      <Sparkle x={168} y={40} r={6} fill={IC.white} />
    </Layer>
    <Layer motion="twinkle" duration={2100} delay={1100} pivot={[34, 140]}>
      <Circle cx={34} cy={140} r={3.4} fill={IC.marigoldSoft} />
    </Layer>
  </Scene>
);
