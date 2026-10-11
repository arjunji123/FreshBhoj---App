import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Blob, Leaf, Shadow, Sparkle } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

/** Empty plate with cutlery and a magnifying glass that sways, searching. */
export const EmptySearch = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} />
      <Shadow cx={96} cy={170} rx={56} />
    </Layer>

    <Layer motion="float" amp={2} duration={2800}>
      {/* fork */}
      <G>
        <Rect x={23} y={92} width={5} height={58} rx={2.5} fill={IC.steelDeep} />
        <Path d="M18 62 H34 V78 Q34 90 26 90 Q18 90 18 78Z" fill={IC.steelMid} />
        <Path d="M22 62 V78 M26 62 V78 M30 62 V78" stroke={IC.steelDeep} strokeOpacity={0.5} strokeWidth={1.4} />
      </G>
      {/* plate */}
      <Circle cx={92} cy={112} r={52} fill={IC.night} fillOpacity={0.1} />
      <Circle cx={92} cy={108} r={52} fill="url(#gSteelRing)" />
      <Circle cx={92} cy={108} r={46} fill="url(#gSteel)" />
      <Circle cx={92} cy={108} r={32} fill={IC.steelMid} fillOpacity={0.35} />
      <Circle cx={92} cy={108} r={30} fill="url(#gSteel)" />
      <Path d="M62 92 Q66 78 80 72" stroke={IC.white} strokeOpacity={0.7} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Leaf x={70} y={134} s={0.5} rot={-50} />
    </Layer>

    {/* magnifier sways around its handle end */}
    <Layer motion="sway" amp={9} duration={2400} pivot={[160, 156]}>
      <Path d="M130 120 L162 154" stroke={IC.marigoldDeep} strokeWidth={13} strokeLinecap="round" />
      <Path d="M132 118 L160 148" stroke={IC.marigoldSoft} strokeWidth={5} strokeLinecap="round" />
      <Circle cx={116} cy={90} r={34} fill={IC.ink} />
      <Circle cx={116} cy={90} r={28} fill={IC.mint} fillOpacity={0.85} />
      <Path d="M98 76 Q104 66 116 64" stroke={IC.white} strokeOpacity={0.85} strokeWidth={4} strokeLinecap="round" fill="none" />
      {/* question mark */}
      <Path d="M108 84 Q108 74 117 74 Q126 74 126 82 Q126 88 118 92 V97" stroke={IC.teal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={118} cy={106} r={3.4} fill={IC.teal} />
    </Layer>

    <Layer motion="twinkle" duration={1500} pivot={[40, 36]}>
      <Sparkle x={40} y={36} r={8} />
    </Layer>
    <Layer motion="twinkle" duration={1900} delay={600} pivot={[168, 56]}>
      <Sparkle x={168} y={56} r={6} fill={IC.white} />
    </Layer>
    <Layer motion="twinkle" duration={2100} delay={1100} pivot={[36, 160]}>
      <Circle cx={36} cy={160} r={3.4} fill={IC.marigoldSoft} />
    </Layer>
  </Scene>
);
