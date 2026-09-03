import React from 'react';
import { StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';

interface ScreenProps {
  children: React.ReactNode;
  /** `page` is the off-white app background; `base` is pure white. */
  background?: 'page' | 'base' | 'subtle';
  edges?: readonly Edge[];
  barStyle?: 'light-content' | 'dark-content';
  style?: StyleProp<ViewStyle>;
}

/** Screen shell: background token, safe-area edges and status-bar style in one. */
const Screen: React.FC<ScreenProps> = ({
  children,
  background = 'page',
  edges = ['top'],
  barStyle = 'dark-content',
  style,
}) => (
  <SafeAreaView
    edges={edges}
    style={[styles.flex, { backgroundColor: theme.colors.surface[background] }, style]}
  >
    <StatusBar barStyle={barStyle} backgroundColor="transparent" translucent />
    <View style={styles.flex}>{children}</View>
  </SafeAreaView>
);

export default Screen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
