import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';

const NetworkErrorScreen = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await NetInfo.refresh();
    setTimeout(() => setIsRetrying(false), 350);
  };

  return (
    <View style={styles.container}>
      <AppGradient
        colors={theme.colors.defaultColor}
        locations={theme.colors.defaultLocations}
        direction="diagonal"
        style={styles.iconWrap}
      >
        <WifiOff size={30} color={theme.colors.palette.white} strokeWidth={2.2} />
      </AppGradient>

      <Text style={styles.title}>You're offline</Text>
      <Text style={styles.subtitle}>
        We cannot connect to the internet right now. Check your connection and try again.
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.retryButton}
        onPress={handleRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <ActivityIndicator size="small" color={theme.colors.palette.white} />
        ) : (
          <RefreshCw size={16} color={theme.colors.palette.white} strokeWidth={2.2} />
        )}
        <Text style={styles.retryText}>{isRetrying ? 'Checking...' : 'Try again'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NetworkErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: theme.colors.background,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: theme.typography.fontSizes.display1,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    color: theme.colors.textGray1,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.gradient2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    color: theme.colors.palette.white,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },
});

