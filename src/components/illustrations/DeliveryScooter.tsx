import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Blob, Shadow, Sparkle } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

const Wheel = ({ cx, cy }: { cx: number; cy: number }) => (
  <G>
    <Circle cx={cx} cy={cy} r={17} fill={IC.inkDeep} />
    <Circle cx={cx} cy={cy} r={10} fill={IC.steelMid} />
    <Path
      d={`M${cx} ${cy - 10} V${cy + 10} M${cx - 10} ${cy} H${cx + 10} M${cx - 7} ${cy - 7} L${cx + 7} ${cy + 7} M${cx + 7} ${cy - 7} L${cx - 7} ${cy + 7}`}
      stroke={IC.steelDeep}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Circle cx={cx} cy={cy} r={3.4} fill={IC.marigold} />
  </G>
);

/** Scooter with a tiffin carrier on the back and speed lines streaming behind. */
export const DeliveryScooter = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} />
      <Shadow cx={102} cy={172} rx={72} ry={5} />
    </Layer>

    <Layer motion="float" amp={1.8} duration={420}>
      {/* tiffin carrier */}
      <Rect x={34} y={64} width={30} height={13} rx={6} fill={IC.tealMid} />
      <Rect x={32} y={76} width={34} height={13} rx={6} fill={IC.aqua} />
      <Rect x={34} y={88} width={30} height={13} rx={6} fill={IC.teal} />
      <Path d="M44 64 Q49 50 54 64" stroke={IC.marigoldDeep} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Path d="M38 70 H60 M36 82 H62" stroke={IC.white} strokeOpacity={0.35} strokeWidth={2.2} strokeLinecap="round" />
      <Rect x={32} y={100} width={34} height={5} rx={2.5} fill={IC.inkDeep} />

      {/* rear body + seat */}
      <Path d="M34 152 Q32 114 70 110 H108 Q116 110 116 120 V152Z" fill="url(#gMarigold)" />
      <Rect x={64} y={100} width={50} height={13} rx={6.5} fill={IC.inkDeep} />
      <Path d="M72 104 H100" stroke={IC.white} strokeOpacity={0.18} strokeWidth={2.4} strokeLinecap="round" />

      {/* floor + front shield */}
      <Rect x={96} y={134} width={46} height={12} rx={6} fill={IC.marigoldDeep} />
      <Path d="M126 146 L136 82 Q138 72 148 75 L154 78 Q160 81 158 90 L148 146Z" fill="url(#gMarigold)" />
      <Path d="M138 100 L136 128" stroke={IC.white} strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />

      {/* handlebar + headlight + mirror */}
      <Path d="M140 76 L136 62" stroke={IC.inkDeep} strokeWidth={4} strokeLinecap="round" />
      <Rect x={128} y={56} width={22} height={8} rx={4} fill={IC.inkDeep} />
      <Circle cx={157} cy={86} r={7} fill={IC.lemon} />
      <Circle cx={157} cy={86} r={3.4} fill={IC.white} />
      <Path d="M130 56 L126 46" stroke={IC.inkDeep} strokeWidth={2.2} strokeLinecap="round" />
      <Circle cx={125} cy={44} r={4} fill={IC.aquaSoft} />

      {/* tail light */}
      <Rect x={33} y={126} width={5} height={10} rx={2.5} fill={IC.tomato} />
    </Layer>

    {/* wheels spin */}
    <Layer motion="spin" duration={700} pivot={[54, 152]}>
      <Wheel cx={54} cy={152} />
    </Layer>
    <Layer motion="spin" duration={700} pivot={[146, 152]}>
      <Wheel cx={146} cy={152} />
    </Layer>

    {/* speed lines */}
    <Layer motion="slide" amp={16} duration={900}>
      <Rect x={10} y={112} width={20} height={4} rx={2} fill={IC.steelMid} />
    </Layer>
    <Layer motion="slide" amp={16} duration={900} delay={300}>
      <Rect x={4} y={128} width={24} height={4} rx={2} fill={IC.aquaSoft} />
    </Layer>
    <Layer motion="slide" amp={16} duration={900} delay={600}>
      <Rect x={10} y={144} width={18} height={4} rx={2} fill={IC.marigoldSoft} />
    </Layer>

    <Layer motion="twinkle" duration={1500} pivot={[164, 44]}>
      <Sparkle x={164} y={44} r={8} />
    </Layer>
    <Layer motion="twinkle" duration={1900} delay={600} pivot={[84, 40]}>
      <Sparkle x={84} y={40} r={5} fill={IC.white} />
    </Layer>
  </Scene>
);
