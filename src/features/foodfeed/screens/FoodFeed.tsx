import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FoodFeed = () => {
  return (
    <View style={styles.screen}>
      <Text>Food Feed</Text>
    </View>
  );
};

export default FoodFeed;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
