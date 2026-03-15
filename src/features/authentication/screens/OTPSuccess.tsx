import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

// theme
import { theme } from '@app/theme/index';
import { Check } from 'lucide-react-native';

// Components
import AppGradient from '@components/AppGradient';
import RippleEffect from '../../../animations/RippleEffect';
import AppButton from '@components/AppButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OTPSuccess = () => {
  const insets = useSafeAreaInsets();
  return (
    <AppGradient
      style={styles.container}
      colors={theme.colors.defaultColor}
      locations={theme.colors.defaultLocations}
    >
      <View style={styles.content}>
        <RippleEffect
          style={styles.glowWrapper}
          ringSize={60}
        >
          <View style={styles.checkIcon}>
            <Check size={theme.typography.fontSizes.display3} color={theme.colors.gradient1} />
          </View>
        </RippleEffect>

        <Text style={styles.text}>You're In!</Text>
        <Text style={styles.description}>
          Let’s personalize your food journey with FreshBhoj.
        </Text>
      </View>

        <AppButton
          title='Start Discovering'
          showOverlay={false}
          textStyle={styles.buttonText}
          style={[styles.button, { marginBottom: insets.bottom }]} />
    </AppGradient>
  );
};

export default OTPSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.typography.fontSizes.display2,
    fontFamily: theme.typography.fontRoles.heading,
    color: '#fff',
    marginTop: 40,
  },
  description: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  glowWrapper: {
    marginBottom: 20,
  },
  checkIcon: {
    backgroundColor: '#fff',
    borderRadius: theme.spacing.borderRadius.round,
    padding: 20,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 24,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: theme.spacing.borderRadius.round,
    width:"90%",

    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: theme.colors.gradient2,
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },
});