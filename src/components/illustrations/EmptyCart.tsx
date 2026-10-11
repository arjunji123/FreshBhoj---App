import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Blob, Leaf, Shadow, Sparkle } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

/** Shopping cart with nothing in it; a single leaf drifts down toward it. */
export const EmptyCart = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} />
      <Shadow cx={102} cy={172} rx={58} />
    </Layer>

    <Layer motion="float" amp={3} duration={2600}>
      {/* handle */}
      <Path d="M24 56 H44 Q50 56 52 62 L64 108" stroke={IC.steelDeep} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* basket back wall */}
      <Path d="M58 70 H166 L152 128 Q150 136 142 136 H82 Q74 136 72 128Z" fill={IC.ink} fillOpacity={0.4} />
      {/* basket */}
      <Path d="M54 70 H162 Q168 70 166 76 L152 126 Q150 132 144 132 H78 Q72 132 70 126Z" fill="url(#gTeal)" />
      <Rect x={54} y={70} width={112} height={9} rx={4.5} fill={IC.aquaSoft} />
      {/* slats */}
      <Path d="M82 84 L86 126 M104 84 L106 126 M126 84 L126 126 M148 84 L146 126" stroke={IC.white} strokeOpacity={0.32} strokeWidth={4} strokeLinecap="round" />
      <Path d="M62 100 H156" stroke={IC.white} strokeOpacity={0.22} strokeWidth={4} strokeLinecap="round" />
      {/* chassis + wheels */}
      <Path d="M76 140 H144" stroke={IC.steelDeep} strokeWidth={5} strokeLinecap="round" />
      <Circle cx={86} cy={152} r={10} fill={IC.steelDeep} />
      <Circle cx={86} cy={152} r={4} fill={IC.marigold} />
      <Circle cx={136} cy={152} r={10} fill={IC.steelDeep} />
      <Circle cx={136} cy={152} r={4} fill={IC.marigold} />
    </Layer>

    {/* leaf drifting toward the empty basket */}
    <Layer motion="float" amp={9} duration={2000} delay={200}>
      <G>
        <Leaf x={106} y={62} s={0.9} rot={25} />
      </G>
    </Layer>

    <Layer motion="twinkle" duration={1500} pivot={[40, 34]}>
      <Sparkle x={40} y={34} r={8} />
    </Layer>
    <Layer motion="twinkle" duration={1800} delay={600} pivot={[170, 44]}>
      <Sparkle x={170} y={44} r={6} fill={IC.white} />
    </Layer>
    <Layer motion="twinkle" duration={2000} delay={1000} pivot={[176, 110]}>
      <Circle cx={176} cy={110} r={3.4} fill={IC.marigoldSoft} />
    </Layer>
  </Scene>
);
