import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';

interface StickyBarProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bottom action bar that stays put while the page scrolls (Add to Cart,
 * Proceed to Checkout, Place Order). Owns the bottom safe-area inset so the
 * button never sits under the home indicator.
 */
const StickyBar: React.FC<StickyBarProps> = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.md) },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default StickyBar;

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.surface.base,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.subtle,
    ...theme.elevation.bar,
  },
});
