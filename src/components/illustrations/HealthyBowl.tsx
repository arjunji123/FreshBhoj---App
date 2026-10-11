import React from 'react';
import { Circle, Ellipse, G, Path } from 'react-native-svg';
import { IC } from './colors';
import { IllustrationProps, Layer, Scene } from './core';
import { Blob, Leaf, Shadow, Sparkle, Steam, steamColor } from './shapes';

/** Hero: colourful salad/grain bowl with steam, floating leaves and sparkles. */
export const HealthyBowl = ({ size = 200, tone }: IllustrationProps) => (
  <Scene size={size}>
    <Layer>
      <Blob tone={tone} />
      <Shadow cx={100} cy={170} rx={62} />
    </Layer>

    <Layer motion="float" amp={3} duration={2600}>
      {/* back of the rim */}
      <Ellipse cx={100} cy={100} rx={70} ry={15} fill={IC.aquaSoft} />
      <Ellipse cx={100} cy={101} rx={64} ry={11} fill={IC.tealMid} />

      {/* leafy greens */}
      <Circle cx={58} cy={88} r={17} fill={IC.leaf} />
      <Circle cx={82} cy={78} r={19} fill={IC.leafDeep} />
      <Circle cx={112} cy={77} r={19} fill={IC.leaf} />
      <Circle cx={140} cy={88} r={17} fill={IC.leafDeep} />
      <Circle cx={100} cy={86} r={17} fill={IC.leafLight} />
      <Path d="M78 84 Q86 70 94 80" stroke={IC.leafLight} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <Path d="M122 80 Q130 68 138 80" stroke={IC.leafLight} strokeWidth={2.4} fill="none" strokeLinecap="round" />

      {/* purple cabbage */}
      <Circle cx={122} cy={100} r={9} fill={IC.cabbage} />
      <Circle cx={120} cy={98} r={4} fill={IC.cabbageDeep} />

      {/* tomato half */}
      <Circle cx={64} cy={100} r={14} fill="url(#gTomato)" />
      <Circle cx={64} cy={100} r={9} fill={IC.tomatoLight} />
      <Circle cx={61} cy={99} r={1.8} fill={IC.cream} />
      <Circle cx={67} cy={102} r={1.8} fill={IC.cream} />
      <Circle cx={64} cy={96} r={1.8} fill={IC.cream} />

      {/* avocado */}
      <Ellipse cx={96} cy={99} rx={15} ry={12} fill={IC.avocadoDeep} />
      <Ellipse cx={96} cy={99} rx={12} ry={9.5} fill={IC.avocado} />
      <Circle cx={96} cy={101} r={5} fill={IC.pit} />
      <Circle cx={94.5} cy={99.5} r={1.5} fill={IC.creamDeep} fillOpacity={0.6} />

      {/* egg half */}
      <Ellipse cx={142} cy={100} rx={13} ry={10} fill={IC.eggWhite} />
      <Circle cx={142} cy={100} r={6} fill={IC.yolk} />
      <Circle cx={140} cy={98} r={1.8} fill={IC.marigoldSoft} />

      {/* carrot coins */}
      <Circle cx={80} cy={110} r={6} fill={IC.carrot} />
      <Circle cx={80} cy={110} r={2.4} fill={IC.marigoldSoft} />
      <Circle cx={116} cy={110} r={6} fill={IC.carrot} />
      <Circle cx={116} cy={110} r={2.4} fill={IC.marigoldSoft} />

      {/* sesame / seeds */}
      <Circle cx={104} cy={108} r={1.6} fill={IC.cream} />
      <Circle cx={130} cy={110} r={1.6} fill={IC.cream} />
      <Circle cx={52} cy={108} r={1.6} fill={IC.cream} />

      {/* front of the bowl */}
      <Path d="M30 100 Q100 132 170 100 C170 144 140 170 100 170 C60 170 30 144 30 100Z" fill="url(#gTealDeep)" />
      <Path d="M30 100 Q100 132 170 100 L169 107 Q100 140 31 107Z" fill={IC.aquaSoft} />
      <Path d="M44 128 Q52 150 78 160" stroke={IC.white} strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" fill="none" />
      <G>
        <Circle cx={100} cy={148} r={4} fill={IC.marigold} />
        <Circle cx={84} cy={146} r={3} fill={IC.marigoldSoft} />
        <Circle cx={116} cy={146} r={3} fill={IC.marigoldSoft} />
      </G>
    </Layer>

    <Layer motion="rise" amp={16} duration={2800}>
      <Steam x={82} y={56} color={steamColor(tone)} />
    </Layer>
    <Layer motion="rise" amp={18} duration={3200} delay={900}>
      <Steam x={102} y={52} color={steamColor(tone)} h={1.1} />
    </Layer>
    <Layer motion="rise" amp={16} duration={3000} delay={1700}>
      <Steam x={122} y={56} color={steamColor(tone)} />
    </Layer>

    <Layer motion="float" amp={6} duration={2200} delay={300}>
      <Leaf x={34} y={70} s={0.9} rot={-35} />
    </Layer>
    <Layer motion="float" amp={7} duration={2800} delay={800}>
      <Leaf x={168} y={62} s={0.75} rot={40} />
    </Layer>
    <Layer motion="sway" amp={14} duration={2400} pivot={[160, 130]}>
      <Leaf x={166} y={140} s={0.6} rot={65} />
    </Layer>

    <Layer motion="twinkle" duration={1300} pivot={[40, 38]}>
      <Sparkle x={40} y={38} r={9} />
    </Layer>
    <Layer motion="twinkle" duration={1700} delay={500} pivot={[168, 100]}>
      <Sparkle x={168} y={100} r={6} fill={IC.white} />
    </Layer>
    <Layer motion="twinkle" duration={1500} delay={900} pivot={[150, 34]}>
      <Sparkle x={150} y={34} r={5} fill={IC.marigoldSoft} />
    </Layer>
  </Scene>
);
