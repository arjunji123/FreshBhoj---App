import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  size: number;
  stroke: number;
  /** 0..1, clamped. */
  progress: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}

/** A circular progress ring with room for content in the middle. */
const ProgressRing: React.FC<ProgressRingProps> = ({ size, stroke, progress, color, trackColor, children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
};

export default ProgressRing;
