import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { IC } from './colors';
import { Blob, Shadow, Sparkle, Steam, steamColor } from './shapes';
import { IllustrationProps, Layer, Scene } from './core';

/** Phone showing OTP boxes, an OTP chat bubble and a warm bowl of food. */
export const LoginHero = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} />
      <Shadow cx={100} cy={176} rx={64} />
    </Layer>

    <Layer motion="float" amp={3.5} duration={2700}>
      <G transform="rotate(-5 90 100)">
        <Rect x={42} y={26} width={86} height={146} rx={17} fill={IC.paper} />
        <Rect x={42} y={26} width={86} height={146} rx={17} fill={IC.steelMid} fillOpacity={0.35} />
        <Rect x={47} y={31} width={76} height={136} rx={13} fill="url(#gInk)" />
        <Rect x={72} y={35} width={26} height={5} rx={2.5} fill={IC.night} fillOpacity={0.6} />
        {/* lock badge */}
        <Circle cx={85} cy={62} r={14} fill="url(#gTeal)" />
        <Rect x={78} y={61} width={14} height={11} rx={3} fill={IC.white} />
        <Path d="M81 61 V57 Q81 51 85 51 Q89 51 89 57 V61" stroke={IC.white} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <Circle cx={85} cy={66} r={1.8} fill={IC.teal} />
        {/* OTP boxes */}
        <Rect x={54} y={90} width={14} height={18} rx={5} fill={IC.white} fillOpacity={0.14} />
        <Rect x={72} y={90} width={14} height={18} rx={5} fill={IC.white} fillOpacity={0.14} />
        <Rect x={90} y={90} width={14} height={18} rx={5} fill={IC.white} fillOpacity={0.14} />
        <Rect x={108} y={90} width={14} height={18} rx={5} fill={IC.white} fillOpacity={0.14} />
        <Circle cx={61} cy={99} r={2.8} fill={IC.white} />
        <Circle cx={79} cy={99} r={2.8} fill={IC.white} />
        <Rect x={90} y={105} width={14} height={3} rx={1.5} fill={IC.marigold} />
        {/* button + hint */}
        <Rect x={54} y={124} width={68} height={16} rx={8} fill="url(#gMarigold)" />
        <Rect x={72} y={130} width={32} height={4} rx={2} fill={IC.inkDeep} fillOpacity={0.7} />
        <Rect x={64} y={150} width={48} height={3.4} rx={1.7} fill={IC.white} fillOpacity={0.3} />
      </G>
    </Layer>

    {/* OTP chat bubble */}
    <Layer motion="float" amp={5} duration={2200} delay={300}>
      <Rect x={104} y={26} width={72} height={36} rx={16} fill="url(#gMarigold)" />
      <Path d="M118 60 L112 74 L130 62Z" fill={IC.marigoldDeep} />
      <Circle cx={124} cy={44} r={4.2} fill={IC.inkDeep} />
      <Circle cx={140} cy={44} r={4.2} fill={IC.inkDeep} />
      <Circle cx={156} cy={44} r={4.2} fill={IC.inkDeep} />
    </Layer>

    {/* bowl */}
    <Layer motion="float" amp={3} duration={2400} delay={700}>
      <Ellipse cx={148} cy={128} rx={28} ry={7} fill={IC.cream} />
      <Circle cx={138} cy={122} r={9} fill={IC.leaf} />
      <Circle cx={152} cy={119} r={10} fill={IC.leafDeep} />
      <Circle cx={162} cy={125} r={6} fill={IC.tomato} />
      <Circle cx={146} cy={126} r={4.4} fill={IC.carrot} />
      <Path d="M120 128 Q148 140 176 128 C176 154 164 164 148 164 C132 164 120 154 120 128Z" fill="url(#gMarigold)" />
      <Path d="M120 128 Q148 140 176 128 L175.500 132 Q148 144 120.500 132Z" fill={IC.cream} />
      <Path d="M128 142 Q132 152 142 156" stroke={IC.white} strokeOpacity={0.45} strokeWidth={3.4} strokeLinecap="round" fill="none" />
    </Layer>
    <Layer motion="rise" amp={14} duration={2800} delay={400}>
      <Steam x={142} y={108} color={steamColor(tone)} h={0.6} />
    </Layer>
    <Layer motion="rise" amp={14} duration={3000} delay={1300}>
      <Steam x={158} y={106} color={steamColor(tone)} h={0.6} />
    </Layer>

    <Layer motion="twinkle" duration={1500} pivot={[26, 52]}>
      <Sparkle x={26} y={52} r={8} />
    </Layer>
    <Layer motion="twinkle" duration={1900} delay={700} pivot={[178, 92]}>
      <Sparkle x={178} y={92} r={6} fill={IC.white} />
    </Layer>
  </Scene>
);
