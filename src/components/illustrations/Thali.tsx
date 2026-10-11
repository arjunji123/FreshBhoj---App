import React from 'react';
import { Circle, Ellipse, G, Path } from 'react-native-svg';
import { IC } from './colors';
import { IllustrationProps, Layer, Scene } from './core';
import { Blob, Leaf, Shadow, Sparkle, Steam, steamColor } from './shapes';

const Katori = ({ x, y, fill, fillDeep, children }: { x: number; y: number; fill: string; fillDeep: string; children?: React.ReactNode }) => (
  <G>
    <Circle cx={x} cy={y + 2} r={17} fill={IC.night} fillOpacity={0.14} />
    <Circle cx={x} cy={y} r={17} fill="url(#gSteelRing)" />
    <Circle cx={x} cy={y} r={13.5} fill={fillDeep} />
    <Circle cx={x} cy={y + 1} r={11.5} fill={fill} />
    <Path d={`M${x - 8} ${y - 4} Q${x - 5} ${y - 9} ${x} ${y - 9.5}`} stroke={IC.white} strokeOpacity={0.55} strokeWidth={2.2} strokeLinecap="round" fill="none" />
    {children}
  </G>
);

/** Indian thali: steel plate, katori bowls, roti, rice and a lemon wedge. */
export const Thali = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} cy={112} />
      <Shadow cx={100} cy={178} rx={62} ry={6} />
    </Layer>

    <Layer motion="float" amp={3} duration={2800}>
      <G transform="translate(10 16) scale(0.9)">
      {/* plate */}
      <Circle cx={100} cy={118} r={78} fill={IC.night} fillOpacity={0.12} />
      <Circle cx={100} cy={114} r={78} fill="url(#gSteelRing)" />
      <Circle cx={100} cy={114} r={72} fill="url(#gSteel)" />
      <Circle cx={100} cy={114} r={64} fill={IC.steelMid} fillOpacity={0.5} />
      <Circle cx={100} cy={114} r={62} fill="url(#gSteel)" />

      {/* katoris */}
      <Katori x={60} y={80} fill={IC.dal} fillDeep={IC.dalDeep}>
        <Circle cx={56} cy={82} r={1.6} fill={IC.marigoldSoft} />
        <Circle cx={64} cy={86} r={1.6} fill={IC.marigoldSoft} />
      </Katori>
      <Katori x={100} y={62} fill={IC.curry} fillDeep={IC.tomatoDeep}>
        <Circle cx={96} cy={64} r={2.6} fill={IC.cream} />
        <Circle cx={105} cy={66} r={2.2} fill={IC.cream} />
      </Katori>
      <Katori x={140} y={80} fill={IC.palak} fillDeep={IC.leafDeep}>
        <Circle cx={135} cy={82} r={2.4} fill={IC.cream} />
        <Circle cx={144} cy={85} r={2.4} fill={IC.cream} />
      </Katori>

      {/* rice */}
      <Ellipse cx={66} cy={136} rx={26} ry={22} fill={IC.paperShade} />
      <Ellipse cx={66} cy={133} rx={25} ry={21} fill={IC.rice} />
      <Path d="M48 130 Q56 118 70 120" stroke={IC.paperShade} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Circle cx={60} cy={128} r={1.4} fill={IC.steelMid} />
      <Circle cx={74} cy={132} r={1.4} fill={IC.steelMid} />
      <Circle cx={64} cy={142} r={1.4} fill={IC.steelMid} />
      <Circle cx={78} cy={144} r={1.4} fill={IC.steelMid} />
      <Leaf x={66} y={132} s={0.45} rot={20} />

      {/* rotis */}
      <Circle cx={128} cy={128} r={24} fill={IC.rotiDeep} />
      <Circle cx={126} cy={126} r={24} fill={IC.roti} />
      <Circle cx={138} cy={140} r={24} fill={IC.rotiDeep} />
      <Circle cx={136} cy={137} r={24} fill="url(#gRoti)" />
      <Circle cx={129} cy={131} r={3.6} fill={IC.rotiDeep} fillOpacity={0.75} />
      <Circle cx={143} cy={138} r={3} fill={IC.rotiDeep} fillOpacity={0.75} />
      <Circle cx={133} cy={146} r={2.6} fill={IC.rotiDeep} fillOpacity={0.75} />
      <Circle cx={148} cy={128} r={2.2} fill={IC.rotiDeep} fillOpacity={0.75} />
      <Path d="M118 128 Q122 118 132 114" stroke={IC.white} strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" fill="none" />

      {/* lemon + chilli */}
      <Circle cx={100} cy={108} r={10} fill={IC.lemon} />
      <Circle cx={100} cy={108} r={7.5} fill={IC.marigoldSoft} />
      <Path d="M100 101 V115 M93 108 H107 M95 103 L105 113 M105 103 L95 113" stroke={IC.lemon} strokeWidth={1.2} fill="none" />
      <Path d="M96 150 Q106 142 118 150 Q108 156 96 150Z" fill={IC.chilli} />
      <Path d="M96 150 L92 148" stroke={IC.leafDeep} strokeWidth={2.4} strokeLinecap="round" />
      </G>
    </Layer>

    <Layer motion="rise" amp={14} duration={2800}>
      <Steam x={68} y={56} color={steamColor(tone)} h={0.8} />
    </Layer>
    <Layer motion="rise" amp={16} duration={3200} delay={1000}>
      <Steam x={100} y={48} color={steamColor(tone)} h={0.9} />
    </Layer>
    <Layer motion="rise" amp={14} duration={3000} delay={1800}>
      <Steam x={132} y={56} color={steamColor(tone)} h={0.8} />
    </Layer>

    <Layer motion="twinkle" duration={1400} pivot={[26, 100]}>
      <Sparkle x={26} y={100} r={8} />
    </Layer>
    <Layer motion="twinkle" duration={1800} delay={600} pivot={[176, 112]}>
      <Sparkle x={176} y={112} r={6} fill={IC.white} />
    </Layer>
  </Scene>
);
