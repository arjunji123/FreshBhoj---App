import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';
import { getInitials } from '@utils/format';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

/** Profile picture with an initials fallback — never an empty grey circle. */
const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 44, style }) => {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[dimension, styles.image, style as StyleProp<ImageStyle>]} />;
  }

  return (
    <View style={[dimension, styles.fallback, style as StyleProp<ViewStyle>]}>
      <Text style={[theme.text.label, styles.initials, { fontSize: size * 0.36 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  image: {
    backgroundColor: theme.colors.neutral[100],
  },
  fallback: {
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.primary[700],
  },
});
