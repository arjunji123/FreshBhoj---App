import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@app/theme/index';
import GradientText from './GradientText';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  actionStyle?: StyleProp<TextStyle>;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onActionPress,
  style,
  titleStyle,
  actionStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <GradientText
            colors={theme.colors.defaultColor}
            direction="diagonal"
          >
            <Text style={[styles.actionText, actionStyle]}>{actionLabel}</Text>
          </GradientText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.aBeeZee.regular,
    color: theme.colors.palette.black,
  },
  actionText: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.aBeeZee.regular,
    // color: theme.colors.gradient2,
  },
});
