import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';

interface DividerProps {
  spacing?: number;
  /** Dashed reads as a "tear line" on receipts and bill summaries. */
  dashed?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Divider: React.FC<DividerProps> = ({ spacing = theme.spacing.md, dashed = false, style }) => (
  <View
    style={[
      styles.line,
      dashed ? styles.dashed : null,
      { marginVertical: spacing },
      style,
    ]}
  />
);

export default Divider;

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: theme.colors.borders.subtle,
  },
  dashed: {
    height: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.borders.subtle,
  },
});
