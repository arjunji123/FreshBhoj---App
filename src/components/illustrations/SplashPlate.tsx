import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Sparkle } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

/** Top-down dinner plate with fork and spoon. Bobs gently; made for splash corners. */
export const SplashPlate = ({ size = 200 }: IllustrationProps) => (
  <Scene size={size}>
    <Layer motion="float" amp={4} duration={2800}>
      {/* fork */}
      <G>
        <Rect x={15} y={92} width={7} height={80} rx={3.5} fill={IC.steelMid} />
        <Path d="M8 34 H29 V62 Q29 84 18.500 84 Q8 84 8 62Z" fill={IC.steel} />
        <Path d="M13 34 V60 M18.500 34 V60 M24 34 V60" stroke={IC.steelDeep} strokeOpacity={0.55} strokeWidth={1.8} strokeLinecap="round" />
      </G>
      {/* spoon */}
      <G>
        <Rect x={178} y={92} width={7} height={80} rx={3.500} fill={IC.steelMid} />
        <Path d="M181.500 30 C196 30 196 78 181.500 78 C167 78 167 30 181.500 30Z" fill={IC.steel} />
        <Path d="M176 42 Q176 56 180 66" stroke={IC.white} strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" fill="none" />
      </G>
      {/* plate */}
      <Circle cx={100} cy={108} r={66} fill={IC.night} fillOpacity={0.14} />
      <Circle cx={100} cy={102} r={66} fill="url(#gCream)" />
      <Circle cx={100} cy={102} r={56} fill={IC.creamDeep} fillOpacity={0.55} />
      <Circle cx={100} cy={102} r={54} fill="url(#gCream)" />
      <Path d="M62 78 Q70 60 90 54" stroke={IC.white} strokeOpacity={0.8} strokeWidth={4} strokeLinecap="round" fill="none" />
      {/* marigold flower motif */}
      <Circle cx={100} cy={102} r={30} fill={IC.marigold} fillOpacity={0.22} />
      <Circle cx={100} cy={82} r={10} fill={IC.marigold} />
      <Circle cx={119} cy={96} r={10} fill={IC.marigold} />
      <Circle cx={112} cy={118} r={10} fill={IC.marigold} />
      <Circle cx={88} cy={118} r={10} fill={IC.marigold} />
      <Circle cx={81} cy={96} r={10} fill={IC.marigold} />
      <Circle cx={100} cy={102} r={9} fill={IC.tomato} />
      <Circle cx={97} cy={99} r={2.6} fill={IC.tomatoLight} />
    </Layer>

    <Layer motion="twinkle" duration={1600} pivot={[154, 40]}>
      <Sparkle x={154} y={40} r={9} />
    </Layer>
    <Layer motion="twinkle" duration={2000} delay={800} pivot={[48, 164]}>
      <Sparkle x={48} y={164} r={6} fill={IC.white} />
    </Layer>
  </Scene>
);
