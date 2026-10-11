import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ICON_ACCENT } from './colors';
import { IconFrame, IconProps, layers } from './base';

interface TabIconProps extends IconProps {
  /** Active tabs get a filled body; idle tabs stay outline-only. */
  active?: boolean;
}

/** House with an arched door. Filled body when active. */
export const HomeTabIcon: React.FC<TabIconProps> = ({ size, color, tint, active }) => {
  const l = layers(color, tint);
  const body = 'M5.2 10.4V18.4a1.9 1.9 0 0 0 1.9 1.9h9.8a1.9 1.9 0 0 0 1.9-1.9V10.4L12 4.2z';
  return (
    <IconFrame size={size}>
      <Path d={body} {...l.fill} fillOpacity={active ? 0.28 : 0.1} />
      <Path d="M3.4 11.3L12 3.8l8.6 7.5" {...l.line} />
      <Path d="M5.2 10.4V18.4a1.9 1.9 0 0 0 1.9 1.9h9.8a1.9 1.9 0 0 0 1.9-1.9V10.4" {...l.line} />
      <Path d="M9.9 20.3v-4.1a2.1 2.1 0 0 1 4.2 0v4.1" {...(active ? { ...l.line, fill: color } : l.line)} />
    </IconFrame>
  );
};

/** Head and shoulders. Filled when active. */
export const ProfileTabIcon: React.FC<TabIconProps> = ({ size, color, tint, active }) => {
  const l = layers(color, tint);
  return (
    <IconFrame size={size}>
      <Path
        d="M4.6 20.2a7.4 7.4 0 0 1 14.8 0z"
        {...l.fill}
        fillOpacity={active ? 0.28 : 0.1}
      />
      <Path d="M4.6 20.2a7.4 7.4 0 0 1 14.8 0" {...l.line} />
      <Circle cx={12} cy={8.2} r={3.9} {...l.fill} fillOpacity={active ? 0.28 : 0.1} />
      <Circle cx={12} cy={8.2} r={3.9} {...l.line} />
    </IconFrame>
  );
};

/** Reel: a bold rounded play triangle with two marigold sparkles. Meant for white-on-gradient. */
export const ReelTabIcon: React.FC<IconProps> = ({ size, color }) => {
  const l = layers(color);
  return (
    <IconFrame size={size}>
      <Path
        d="M8.4 5.6v12.8c0 1 1.1 1.6 2 1.1l9.6-6.4c.8-.5.8-1.7 0-2.2L10.4 4.5c-.9-.5-2 .1-2 1.1z"
        fill={color}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M4.6 4.2l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z"
        {...l.solid}
        fill={ICON_ACCENT}
      />
      <Circle cx={19.6} cy={4.6} r={1.1} fill={ICON_ACCENT} />
    </IconFrame>
  );
};

/**
 * Feed tab artwork: a chunky, very rounded play triangle (soft "bubble"
 * geometry) meant to sit white on the glossy teal Feed button.
 */
export const FeedPlayIcon: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="26 22 34 36">
    <Path
      d="M34 28.5v17c0 2.6 2.8 4.2 5 2.8l14-8.5c2.1-1.3 2.1-4.3 0-5.6L39 25.7c-2.2-1.4-5 .2-5 2.8z"
      fill={color}
      stroke={color}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </Svg>
);
