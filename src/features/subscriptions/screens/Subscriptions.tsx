import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Subscriptions = () => {
  return (
    <View style={styles.screen}>
      <Text>Subscriptions</Text>
    </View>
  );
};

export default Subscriptions;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
