import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BICEP_PATH } from '@components/icons/bicep';
import { FIT } from '../fit.constants';

interface FitStreakIconProps {
  size?: number;
  color?: string;
}

/** The Bhoj Fit muscle on its own, for use on any background. */
const FitStreakIcon: React.FC<FitStreakIconProps> = ({ size = 28, color = FIT.lime }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={BICEP_PATH} fill={color} />
  </Svg>
);

export default FitStreakIcon;
