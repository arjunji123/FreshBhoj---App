import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';

export type FoodTypeValue = 'VEG' | 'VEGAN' | 'EGG' | 'NON_VEG';

interface FoodTypeDotProps {
  type: FoodTypeValue;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The bordered-square-with-a-dot marker every Indian food app uses.
 * Green for veg, red for non-veg, amber for egg — a regulated convention, so
 * the colours come straight from `palette.foodType` and are never themed.
 */
const FoodTypeDot: React.FC<FoodTypeDotProps> = ({ type, size = 14, style }) => {
  const color = theme.colors.foodType[type] ?? theme.colors.foodType.VEG;

  return (
    <View
      style={[
        styles.square,
        { width: size, height: size, borderColor: color, borderRadius: size * 0.22 },
        style,
      ]}
    >
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

export default FoodTypeDot;

const styles = StyleSheet.create({
  square: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.base,
  },
});
