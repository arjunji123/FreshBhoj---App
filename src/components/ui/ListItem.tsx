import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@app/theme/index';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Replaces the default chevron, e.g. with a Switch. */
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Settings / profile menu row. Used across Profile, Settings and Support. */
const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  icon,
  right,
  onPress,
  showChevron = true,
  destructive = false,
  style,
}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    accessibilityRole={onPress ? 'button' : undefined}
    style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null, style]}
  >
    {icon ? (
      <View style={[styles.iconWrap, destructive ? styles.iconWrapDestructive : null]}>{icon}</View>
    ) : null}

    <View style={styles.textWrap}>
      <Text
        style={[
          theme.text.h4,
          { color: destructive ? theme.colors.state.error : theme.colors.text.primary },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={[theme.text.bodySmall, styles.subtitle]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>

    {right ?? (showChevron && onPress ? (
      <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2.2} />
    ) : null)}
  </Pressable>
);

export default ListItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  pressed: {
    backgroundColor: theme.colors.neutral[50],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  iconWrapDestructive: {
    backgroundColor: theme.colors.state.errorBg,
  },
  textWrap: {
    flex: 1,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});
