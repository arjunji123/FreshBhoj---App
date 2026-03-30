import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Search = () => {
  return (
    <View style={styles.screen}>
      <Text>Search</Text>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
