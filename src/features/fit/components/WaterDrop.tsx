import React from 'react';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

/** Teardrop outline on a 40×52 canvas. */
const DROP = 'M20 2C20 2 4 21.5 4 33.5C4 42.9 11.2 50 20 50S36 42.9 36 33.5C36 21.5 20 2 20 2Z';

interface WaterDropProps {
  width?: number;
  /** A filled drop is water; an empty one is a faint glass shell waiting to be filled. */
  filled: boolean;
}

/** A glossy water drop drawn with gradients, a rim of reflected light and a highlight. */
const WaterDrop: React.FC<WaterDropProps> = ({ width = 30, filled }) => (
  <Svg width={width} height={width * 1.3} viewBox="0 0 40 52">
    <Defs>
      <LinearGradient id="body" x1="0.15" y1="0" x2="0.85" y2="1">
        <Stop offset="0" stopColor="#BDEBFF" />
        <Stop offset="0.45" stopColor="#4FB8FF" />
        <Stop offset="1" stopColor="#0A5FD1" />
      </LinearGradient>
      {/* light gathering at the bottom of the drop, the way real water refracts it */}
      <RadialGradient id="glow" cx="0.55" cy="0.82" r="0.45">
        <Stop offset="0" stopColor="#C9F6FF" stopOpacity="0.9" />
        <Stop offset="1" stopColor="#C9F6FF" stopOpacity="0" />
      </RadialGradient>
      <LinearGradient id="empty" x1="0.2" y1="0" x2="0.8" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
        <Stop offset="1" stopColor="#B9DDF7" stopOpacity="0.55" />
      </LinearGradient>
    </Defs>

    {filled ? (
      <>
        <Path d={DROP} fill="url(#body)" />
        <Path d={DROP} fill="url(#glow)" />
        <Path d={DROP} fill="none" stroke="#0A5FD1" strokeOpacity={0.35} strokeWidth={1} />
        {/* specular highlight and a small sparkle */}
        <Path
          d="M11.5 31C11.8 25.5 15 19.5 18 15.5"
          stroke="#FFFFFF"
          strokeOpacity={0.85}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />
        <Ellipse cx={13} cy={37.5} rx={1.8} ry={2.2} fill="#FFFFFF" fillOpacity={0.75} />
      </>
    ) : (
      <>
        <Path d={DROP} fill="url(#empty)" />
        <Path d={DROP} fill="none" stroke="#6FB6F2" strokeOpacity={0.7} strokeWidth={1.6} />
        <Path
          d="M11.5 31C11.8 25.5 15 19.5 18 15.5"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </>
    )}
  </Svg>
);

export default WaterDrop;
