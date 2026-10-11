import React from 'react';
import Svg from 'react-native-svg';
import { ICON_INK } from './colors';

export interface IconProps {
  size?: number;
  /** Stroke / detail colour. */
  color?: string;
  /** Soft fill-layer colour. Falls back to a faint wash of `color`. */
  tint?: string;
}

export const STROKE = 1.9;

/** Shared prop bundles for the three layers every duotone icon is built from. */
export const layers = (color: string = ICON_INK, tint?: string) => ({
  line: {
    stroke: color,
    strokeWidth: STROKE,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  },
  fill: {
    fill: tint ?? color,
    fillOpacity: tint ? 1 : 0.16,
    stroke: 'none',
  },
  solid: { fill: color, stroke: 'none' },
});

export const IconFrame: React.FC<{ size?: number; children: React.ReactNode }> = ({ size = 24, children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    {children}
  </Svg>
);
