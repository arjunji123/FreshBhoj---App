import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Play } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import SectionHeader from '@components/SectionHeader';
import { STORIES } from '../home.constants';

const KitchenStories = () => {
  return (
    <View style={styles.container}>
      <SectionHeader
        title="Kitchen Stories"
        actionLabel="View All"
        onActionPress={() => {}}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STORIES.map((story) => (
          <TouchableOpacity key={story.id} activeOpacity={0.8}>
            <ImageBackground
              source={{ uri: story.image }}
              style={styles.storyCard}
              imageStyle={styles.storyImage}
            >
              {/* Play Button */}
              <View style={styles.playButton}>
                <Play size={18} color={theme.colors.palette.white} fill={theme.colors.palette.white} />
              </View>
              {/* Kitchen Name */}
              <Text style={styles.storyName}>{story.name}</Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default KitchenStories;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  storyCard: {
    width: 159,
    height: 239,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    borderRadius: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  storyName: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.palette.white,
  },
});
