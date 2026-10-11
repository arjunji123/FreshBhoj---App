import React from 'react';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { IC } from './colors';

type GradProps = { id: string; from: string; to: string; vertical?: boolean };

const Grad = ({ id, from, to, vertical = true }: GradProps) => (
  <LinearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
    <Stop offset="0" stopColor={from} />
    <Stop offset="1" stopColor={to} />
  </LinearGradient>
);

/** Gradients shared by every illustration (ids are scoped per <Svg>). */
export const SharedDefs = () => (
  <Defs>
    <Grad id="gTeal" from={IC.aqua} to={IC.teal} />
    <Grad id="gTealDeep" from={IC.tealMid} to={IC.ink} />
    <Grad id="gInk" from={IC.ink} to={IC.inkDeep} />
    <Grad id="gSteel" from={IC.paper} to={IC.steelMid} />
    <Grad id="gSteelRing" from={IC.steelMid} to={IC.steelDeep} />
    <Grad id="gMarigold" from={IC.marigoldSoft} to={IC.marigoldDeep} />
    <Grad id="gTomato" from={IC.tomatoLight} to={IC.tomatoDeep} />
    <Grad id="gLeaf" from={IC.leafLight} to={IC.leafDeep} />
    <Grad id="gCream" from={IC.paper} to={IC.creamDeep} />
    <Grad id="gHeart" from={IC.heart} to={IC.heartDeep} />
    <Grad id="gScreen" from={IC.aqua} to={IC.ink} />
    <Grad id="gRoti" from={IC.roti} to={IC.rotiDeep} />
  </Defs>
);
