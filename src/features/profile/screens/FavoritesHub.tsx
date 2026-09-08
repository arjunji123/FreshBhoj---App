import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChefHat, Heart } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Card, Divider, ListItem } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';

const ICON_PROPS = { size: 18, strokeWidth: 2.2 };

/** Settings → Favourites: a two-way split into saved dishes and followed kitchens. */
const FavoritesHub = () => {
  const navigation = useNavigation<PrivateNavigation>();

  return (
    <View style={styles.screen}>
      <AppBar title="Favourites" onBack={navigation.goBack} />

      <View style={styles.content}>
        <Card padding="none" elevation="xs">
          <ListItem
            title="Favourite Dishes"
            subtitle="Meals you've hearted"
            icon={<Heart {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Favorites')}
          />
          <Divider spacing={0} />
          <ListItem
            title="Favourite Kitchens"
            subtitle="Kitchens you follow"
            icon={<ChefHat {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('FollowedKitchens')}
          />
        </Card>
      </View>
    </View>
  );
};

export default FavoritesHub;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  content: {
    padding: theme.layout.screenPadding,
  },
});
