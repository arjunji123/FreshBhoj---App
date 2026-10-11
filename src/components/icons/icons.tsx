import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { IconFrame, IconProps, layers } from './base';

/** Receipt with a torn, zig-zag edge. */
export const OrdersIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const d = 'M5.5 4.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V20.5l-2.17-1.4-2.16 1.4-2.17-1.4-2.17 1.4-2.16-1.4-2.17 1.4z';
  return (
    <IconFrame size={size}>
      <Path d={d} {...l.fill} />
      <Path d={d} {...l.line} />
      <Path d="M9 8.5h6M9 12h6M9 15.5h3" {...l.line} />
    </IconFrame>
  );
};

/** Map pin with a solid centre dot. */
export const AddressIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const d = 'M12 21.5s6.5-5.6 6.5-11.2a6.5 6.5 0 0 0-13 0C5.5 15.9 12 21.5 12 21.5z';
  return (
    <IconFrame size={size}>
      <Path d={d} {...l.fill} />
      <Path d={d} {...l.line} />
      <Circle cx={12} cy={10.2} r={2.3} {...l.solid} />
    </IconFrame>
  );
};

/** Plump heart with a small highlight stroke. */
export const HeartIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const d = 'M12 20.5C6 16.3 3.5 13 3.5 9.4A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8.5 1.8c0 3.6-2.5 6.9-8.5 11.1z';
  return (
    <IconFrame size={size}>
      <Path d={d} {...l.fill} />
      <Path d={d} {...l.line} />
      <Path d="M7.3 10a2 2 0 0 1 1.5-1.9" {...l.line} />
    </IconFrame>
  );
};

/** Chef hat: three puffs over a banded base. */
export const KitchenIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const hat = 'M7.5 14.5a3.6 3.6 0 0 1-.9-7.1A4.6 4.6 0 0 1 12 4a4.6 4.6 0 0 1 5.4 3.4 3.6 3.6 0 0 1-.9 7.1';
  const band = 'M7.5 14.5h9v4.5a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 19z';
  return (
    <IconFrame size={size}>
      <Path d={hat} {...l.fill} />
      <Path d={band} {...l.fill} />
      <Path d={hat} {...l.line} />
      <Path d={band} {...l.line} />
    </IconFrame>
  );
};

/** Wallet with a tucked flap and a clasp. */
export const WalletIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  return (
    <IconFrame size={size}>
      <Rect x={3} y={6.5} width={18} height={13.5} rx={3.5} {...l.fill} />
      <Rect x={3} y={6.5} width={18} height={13.5} rx={3.5} {...l.line} />
      <Path d="M6 6.5l9.8-2.7a1.5 1.5 0 0 1 1.9 1.4v1.3" {...l.line} />
      <Path d="M21 11.5h-3.8a2 2 0 0 0 0 4H21" {...l.line} />
      <Circle cx={17.4} cy={13.5} r={0.8} {...l.solid} />
    </IconFrame>
  );
};

/** Payment card with a magnetic stripe and chip. */
export const CardIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  return (
    <IconFrame size={size}>
      <Rect x={2.5} y={5} width={19} height={14} rx={3.5} {...l.fill} />
      <Rect x={2.5} y={5} width={19} height={14} rx={3.5} {...l.line} />
      <Path d="M2.5 9.6h19" {...l.line} />
      <Rect x={6} y={13} width={4} height={2.6} rx={0.9} {...l.solid} />
      <Path d="M14 14.3h3.5" {...l.line} />
    </IconFrame>
  );
};

/** Gift box with a two-loop bow. */
export const GiftIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const box = 'M4.5 11.5h15v7a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z';
  const lid = 'M3.5 8h17a1 1 0 0 1 1 1v2.5h-19V9a1 1 0 0 1 1-1z';
  return (
    <IconFrame size={size}>
      <Path d={box} {...l.fill} />
      <Path d={lid} {...l.fill} />
      <Path d={box} {...l.line} />
      <Path d={lid} {...l.line} />
      <Path d="M12 8v12.5" {...l.line} />
      <Path d="M12 8C9.5 8 7.5 7 7.5 5.5S9 3.5 10.3 4.2C11.3 4.8 12 8 12 8zM12 8c2.5 0 4.5-1 4.5-2.5S15 3.5 13.7 4.2C12.7 4.8 12 8 12 8z" {...l.line} />
    </IconFrame>
  );
};

/** Shopfront: scalloped awning over a doorway. */
export const StoreIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const awning = 'M3.5 9L5 4.5h14L20.5 9a2.83 2.83 0 0 1-5.67 0 2.83 2.83 0 0 1-5.66 0 2.83 2.83 0 0 1-5.67 0z';
  const wall = 'M5.5 11.6V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-7.4';
  return (
    <IconFrame size={size}>
      <Path d={awning} {...l.fill} />
      <Path d={awning} {...l.line} />
      <Path d={wall} {...l.line} />
      <Path d="M10 20.5v-4a2 2 0 0 1 4 0v4" {...l.line} />
    </IconFrame>
  );
};

/** Bell with a short hanger and clapper. */
export const BellIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const d = 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z';
  return (
    <IconFrame size={size}>
      <Path d={d} {...l.fill} />
      <Path d={d} {...l.line} />
      <Path d="M12 3.2v1.8M10 20.6a2 2 0 0 0 4 0" {...l.line} />
    </IconFrame>
  );
};

/** Three sliders with round knobs (a tuning panel, not a gear). */
export const SettingsIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  return (
    <IconFrame size={size}>
      <Path d="M4 6h2.6M11.4 6H20M4 12h8.6M17.4 12H20M4 18h1.6M10.4 18H20" {...l.line} />
      <Circle cx={9} cy={6} r={2.4} {...l.fill} />
      <Circle cx={9} cy={6} r={2.4} {...l.line} />
      <Circle cx={15} cy={12} r={2.4} {...l.fill} />
      <Circle cx={15} cy={12} r={2.4} {...l.line} />
      <Circle cx={8} cy={18} r={2.4} {...l.fill} />
      <Circle cx={8} cy={18} r={2.4} {...l.line} />
    </IconFrame>
  );
};

/** Speech bubble with a question mark. */
export const HelpIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const d = 'M12 3.5a8.5 8.5 0 1 1-4 16l-3.5 1 1-3.4A8.5 8.5 0 0 1 12 3.5z';
  return (
    <IconFrame size={size}>
      <Path d={d} {...l.fill} />
      <Path d={d} {...l.line} />
      <Path d="M9.7 9.6a2.4 2.4 0 0 1 4.6.8c0 1.6-2.3 1.9-2.3 3.3" {...l.line} />
      <Circle cx={12} cy={16.4} r={0.9} {...l.solid} />
    </IconFrame>
  );
};

/** Open door with an exit arrow. */
export const LogoutIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const door = 'M10 4H7a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 7 20h3';
  return (
    <IconFrame size={size}>
      <Path d={`${door}z`} {...l.fill} />
      <Path d={door} {...l.line} />
      <Path d="M10 12h10M16.5 8.5L20 12l-3.5 3.5" {...l.line} />
    </IconFrame>
  );
};

/** Bin with a handled lid and two slots. */
export const TrashIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const body = 'M6 7l.8 11.5a2 2 0 0 0 2 1.9h6.4a2 2 0 0 0 2-1.9L18 7z';
  return (
    <IconFrame size={size}>
      <Path d={body} {...l.fill} />
      <Path d={body} {...l.line} />
      <Path d="M4 7h16M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M10 11v5.5M14 11v5.5" {...l.line} />
    </IconFrame>
  );
};

/** Pencil with a ferrule line and a baseline stroke. */
export const PencilIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  const d = 'M4.5 16.3L15.7 5.1a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L7.7 19.5 3.5 20.5z';
  return (
    <IconFrame size={size}>
      <Path d={d} {...l.fill} />
      <Path d={d} {...l.line} />
      <Path d="M14 6.8l3.2 3.2M13 20.5h7.5" {...l.line} />
    </IconFrame>
  );
};

/** Soft, rounded chevron. */
export const ChevronRightIcon: React.FC<IconProps> = ({ size, color }) => {
  const l = layers(color);
  return (
    <IconFrame size={size}>
      <Path d="M9.5 6l6 6-6 6" {...l.line} />
    </IconFrame>
  );
};

/** FreshBhoj coin: a rimmed disc with a leaf at its centre. */
export const CoinIcon: React.FC<IconProps> = ({ size, color, tint }) => {
  const l = layers(color, tint);
  return (
    <IconFrame size={size}>
      <Circle cx={12} cy={12} r={9} {...l.fill} />
      <Circle cx={12} cy={12} r={9} {...l.line} />
      <Circle cx={12} cy={12} r={6.2} {...l.line} strokeWidth={1} strokeOpacity={0.45} />
      <G>
        <Path d="M8.6 15.4c0-4 2.8-6.5 6.8-6.7 0 4-2.3 6.7-6.8 6.7z" {...l.solid} />
        <Path d="M8.6 15.4l3.9-3.9" stroke={tint ?? 'white'} strokeWidth={1.3} strokeLinecap="round" fill="none" />
      </G>
    </IconFrame>
  );
};
