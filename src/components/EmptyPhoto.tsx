import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useTheme } from '@app/theme/useTheme';

const PHOTOS: Record<'search', ImageSourcePropType> = {
  search: require('../../assets/images/photos/bowl.jpg'),
};

interface EmptyPhotoProps {
  kind: keyof typeof PHOTOS;
  size?: number;
}

/** A real food photo in a soft ring, used as the artwork on empty screens. */
const EmptyPhoto: React.FC<EmptyPhotoProps> = ({ kind, size = 180 }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image source={PHOTOS[kind]} style={[styles.photo, { borderRadius: size / 2 }]} resizeMode="cover" />
    </View>
  );
};

export default EmptyPhoto;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    ring: {
      padding: 6,
      backgroundColor: theme.colors.surface.brandWash,
    },
    photo: { width: '100%', height: '100%' },
  });
