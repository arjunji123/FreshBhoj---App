import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme as staticTheme } from '@app/theme/index';
import { useTheme } from "@app/theme/useTheme";

interface DividerProps {
  spacing?: number;
  /** Dashed reads as a "tear line" on receipts and bill summaries. */
  dashed?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Divider: React.FC<DividerProps> = ({ spacing = staticTheme.spacing.md, dashed = false, style }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  return (
(
  <View
    style={[
      styles.line,
      dashed ? styles.dashed : null,
      { marginVertical: spacing },
      style,
    ]}
  />
)
  );
};

export default Divider;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
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
