import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Heart, Blob, Shadow, Sparkle } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

/** Phone playing a food reel: play button, action rail, floating hearts. */
export const ReelPhone = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} />
      <Shadow cx={100} cy={178} rx={44} />
    </Layer>

    <Layer motion="float" amp={4} duration={2600}>
      <G transform="rotate(-6 100 100)">
        {/* body */}
        <Rect x={56} y={22} width={90} height={152} rx={18} fill="url(#gInk)" />
        <Rect x={61} y={27} width={80} height={142} rx={14} fill="url(#gScreen)" />
        <Rect x={86} y={31} width={30} height={6} rx={3} fill={IC.inkDeep} />

        {/* reel content: bowl on a warm backdrop */}
        <Path d="M61 120 Q100 96 141 120 V155 Q141 169 127 169 H75 Q61 169 61 155Z" fill={IC.marigoldSoft} fillOpacity={0.28} />
        <Ellipse cx={100} cy={102} rx={27} ry={8} fill={IC.cream} />
        <Path d="M73 100 H127 C127 122 116 132 100 132 C84 132 73 122 73 100Z" fill="url(#gMarigold)" />
        <Circle cx={88} cy={95} r={9} fill={IC.leaf} />
        <Circle cx={104} cy={92} r={10} fill={IC.leafDeep} />
        <Circle cx={116} cy={98} r={7} fill={IC.tomato} />
        <Circle cx={94} cy={99} r={5} fill={IC.carrot} />
        <Path d="M73 100 Q100 110 127 100 L126 105 Q100 115 74 105Z" fill={IC.cream} />

        {/* play button */}
        <Circle cx={100} cy={72} r={15} fill={IC.white} fillOpacity={0.9} />
        <Path d="M96 64 L110 72 L96 80Z" fill={IC.teal} />

        {/* action rail */}
        <Circle cx={129} cy={110} r={6.5} fill={IC.white} fillOpacity={0.22} />
        <Heart x={129} y={110} s={4.5} />
        <Circle cx={129} cy={129} r={6.5} fill={IC.white} fillOpacity={0.22} />
        <Rect x={125} y={126} width={8} height={6} rx={2.4} fill={IC.white} />
        <Circle cx={129} cy={148} r={6.5} fill={IC.white} fillOpacity={0.22} />
        <Path d="M125 148 H133 M129 144 V152" stroke={IC.white} strokeWidth={1.8} strokeLinecap="round" />

        {/* caption + progress */}
        <Circle cx={72} cy={142} r={5} fill={IC.marigold} />
        <Rect x={81} y={139} width={28} height={4} rx={2} fill={IC.white} fillOpacity={0.9} />
        <Rect x={68} y={150} width={46} height={3.6} rx={1.8} fill={IC.white} fillOpacity={0.5} />
        <Rect x={68} y={160} width={66} height={3} rx={1.5} fill={IC.white} fillOpacity={0.25} />
        <Rect x={68} y={160} width={36} height={3} rx={1.5} fill={IC.marigold} />
      </G>
    </Layer>

    <Layer motion="rise" amp={44} duration={2600}>
      <Heart x={158} y={110} s={9} />
    </Layer>
    <Layer motion="rise" amp={52} duration={3000} delay={1000}>
      <Heart x={170} y={124} s={6} fill={IC.tomato} />
    </Layer>
    <Layer motion="rise" amp={40} duration={2800} delay={1800}>
      <Heart x={152} y={128} s={5} />
    </Layer>

    <Layer motion="float" amp={5} duration={2300} delay={400}>
      <G transform="translate(36 70)">
        <Circle r={13} fill={IC.cream} />
        <Circle r={9} fill={IC.tomato} />
        <Circle cx={-3} cy={-3} r={2.4} fill={IC.tomatoLight} />
        <Path d="M0 -9 Q-1 -14 4 -15" stroke={IC.leafDeep} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </G>
    </Layer>
    <Layer motion="twinkle" duration={1500} pivot={[38, 36]}>
      <Sparkle x={38} y={36} r={9} />
    </Layer>
    <Layer motion="twinkle" duration={1900} delay={700} pivot={[168, 48]}>
      <Sparkle x={168} y={48} r={7} fill={IC.white} />
    </Layer>
  </Scene>
);
