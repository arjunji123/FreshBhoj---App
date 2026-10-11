import React from 'react';
import { Circle, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Blob, Sparkle } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

const CONFETTI: { x: number; y: number; w: number; h: number; rot: number; fill: string }[] = [
  { x: 42, y: 52, w: 12, h: 5, rot: -30, fill: IC.marigold },
  { x: 150, y: 44, w: 12, h: 5, rot: 35, fill: IC.tomato },
  { x: 164, y: 118, w: 10, h: 5, rot: -50, fill: IC.leaf },
  { x: 30, y: 128, w: 10, h: 5, rot: 40, fill: IC.cabbage },
  { x: 120, y: 24, w: 9, h: 5, rot: 15, fill: IC.aquaSoft },
  { x: 70, y: 172, w: 10, h: 5, rot: -20, fill: IC.marigoldSoft },
];

/** Big teal check that springs in, then sparkles and confetti twinkle. */
export const SuccessCheck = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} cy={100} />
    </Layer>

    <Layer motion="pulse" amp={0.08} duration={1800} delay={700} pivot={[100, 100]}>
      <Circle cx={100} cy={100} r={64} fill={IC.aqua} fillOpacity={0.22} />
    </Layer>

    <Layer motion="pop" pivot={[100, 100]}>
      <Circle cx={100} cy={106} r={52} fill={IC.night} fillOpacity={0.14} />
      <Circle cx={100} cy={100} r={52} fill="url(#gTeal)" />
      <Path d="M62 84 Q70 62 94 56" stroke={IC.white} strokeOpacity={0.35} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M76 102 L94 120 L126 82" stroke={IC.white} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Layer>

    {CONFETTI.map((c, i) => (
      <Layer key={`${c.x}-${c.y}`} motion="twinkle" duration={1300 + i * 170} delay={500 + i * 130} pivot={[c.x, c.y]}>
        <Rect x={c.x - c.w / 2} y={c.y - c.h / 2} width={c.w} height={c.h} rx={2.5} fill={c.fill} transform={`rotate(${c.rot} ${c.x} ${c.y})`} />
      </Layer>
    ))}
    <Layer motion="twinkle" duration={1400} delay={600} pivot={[162, 70]}>
      <Sparkle x={162} y={70} r={10} />
    </Layer>
    <Layer motion="twinkle" duration={1700} delay={900} pivot={[36, 88]}>
      <Sparkle x={36} y={88} r={7} fill={IC.white} />
    </Layer>
    <Layer motion="twinkle" duration={1500} delay={1200} pivot={[148, 162]}>
      <Sparkle x={148} y={162} r={6} fill={IC.marigoldSoft} />
    </Layer>
  </Scene>
);
