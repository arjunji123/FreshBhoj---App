import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useKitchenMedia } from '../hooks/useKitchens';

type Route = RouteProp<PrivateStackParamList, 'KitchenGallery'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Full-screen, swipeable viewer for the kitchen gallery. */
const KitchenGallery = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<Route>();

  const { data: media } = useKitchenMedia(params.kitchenId);
  const [index, setIndex] = useState(params.initialIndex ?? 0);
  const listRef = useRef<FlatList>(null);

  const items = media ?? [];
  const current = items[index];

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        initialScrollIndex={params.initialIndex ?? 0}
        getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
        onMomentumScrollEnd={({ nativeEvent }) =>
          setIndex(Math.round(nativeEvent.contentOffset.x / SCREEN_WIDTH))
        }
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Image source={{ uri: item.url }} style={styles.image} resizeMode="contain" />
            {item.type === 'VIDEO' ? (
              <View style={styles.playOverlay}>
                <Play
                  size={26}
                  color={theme.colors.text.inverse}
                  fill={theme.colors.text.inverse}
                  strokeWidth={0}
                />
              </View>
            ) : null}
          </View>
        )}
      />

      <Pressable
        onPress={navigation.goBack}
        hitSlop={theme.layout.hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Close gallery"
        style={[styles.closeButton, { top: insets.top + theme.spacing.md }]}
      >
        <X size={20} color={theme.colors.text.inverse} strokeWidth={2.5} />
      </Pressable>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.xl }]}>
        {current?.caption ? (
          <Text style={[theme.text.bodyLarge, styles.caption]}>{current.caption}</Text>
        ) : null}
        <Text style={[theme.text.caption, styles.counter]}>
          {items.length ? `${index + 1} of ${items.length}` : ''}
        </Text>
      </View>
    </View>
  );
};

export default KitchenGallery;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  closeButton: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.sm,
  },
  caption: {
    color: theme.colors.text.inverse,
  },
  counter: {
    color: 'rgba(255,255,255,0.6)',
  },
});
