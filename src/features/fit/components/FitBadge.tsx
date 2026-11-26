import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { BICEP_PATH } from '@components/icons/bicep';
import { FIT } from '../fit.constants';

/** The Bhoj Fit logo: a lime muscle glowing on a deep green tile. */
const FitBadge: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="fitTile" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#1B6B4C" />
        <Stop offset="1" stopColor="#07261B" />
      </LinearGradient>
    </Defs>
    <Rect width={100} height={100} rx={28} fill="url(#fitTile)" />
    <Circle cx={50} cy={50} r={34} fill={FIT.lime} fillOpacity={0.14} />
    <Path d={BICEP_PATH} fill={FIT.lime} transform="translate(18 18) scale(2.667)" />
  </Svg>
);

export default FitBadge;
