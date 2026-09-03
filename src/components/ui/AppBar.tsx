import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';

export interface AppBarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  /** Actions rendered on the right, usually icon buttons. */
  right?: React.ReactNode;
  /** Transparent sits over a hero image; `surface` is the default white bar. */
  variant?: 'surface' | 'transparent';
  centerTitle?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Standard top bar. Handles the safe-area inset so screens never do it twice. */
const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  onBack,
  right,
  variant = 'surface',
  centerTitle = true,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const isTransparent = variant === 'transparent';

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + theme.spacing.sm },
        isTransparent ? styles.transparent : styles.surface,
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={theme.layout.hitSlop}
              style={({ pressed }) => [
                styles.iconButton,
                isTransparent ? styles.iconButtonFloating : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <ArrowLeft size={20} color={theme.colors.text.primary} strokeWidth={2.5} />
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.titleWrap, centerTitle ? styles.titleCenter : styles.titleLeft]}>
          {title ? (
            <Text style={theme.text.h3} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              style={[theme.text.caption, { color: theme.colors.text.secondary }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    </View>
  );
};

/** Circular icon button matching the app bar's back button. */
export const AppBarAction: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  floating?: boolean;
  accessibilityLabel?: string;
}> = ({ children, onPress, floating = false, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    hitSlop={theme.layout.hitSlop}
    style={({ pressed }) => [
      styles.iconButton,
      floating ? styles.iconButtonFloating : null,
      pressed ? styles.pressed : null,
    ]}
  >
    {children}
  </Pressable>
);

export default AppBar;

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.layout.screenPadding,
  },
  surface: {
    backgroundColor: theme.colors.surface.base,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: {
    minWidth: 44,
    justifyContent: 'center',
  },
  sideRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  titleWrap: {
    flex: 1,
  },
  titleCenter: {
    alignItems: 'center',
  },
  titleLeft: {
    alignItems: 'flex-start',
    paddingLeft: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
  },
  iconButtonFloating: {
    backgroundColor: theme.colors.surface.base,
    ...theme.elevation.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
});
