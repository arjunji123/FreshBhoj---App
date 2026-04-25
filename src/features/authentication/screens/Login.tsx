import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
  ScrollView,
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import CheckBox from '@react-native-community/checkbox';
import GlassButton from '@components/GlassButton';
import { theme } from '@app/theme/index';
import LoginTopSection from '../components/LoginTopSection';
import LoginTitle from '../components/LoginTitle';
import LoginPhoneInput from '../components/LoginPhoneInput';
import SocialLogin from '../components/SocialLogin';
import LoginFooter from '../components/LoginFooter';
import authNavigation from '../hooks/authNavigation';
import GradientButton from '@components/GradientButton';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { phoneNumberSchema } from '../auth.types';
import { useAuthStore } from '../store/authStore';

const normalizePhoneInput = (input: string): string => {
  // Convert common non-ASCII digit ranges to ASCII so Hindi/Arabic keyboard digits also work.
  return input.replace(/[\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\uFF10-\uFF19]/g, (char) => {
    const code = char.charCodeAt(0);

    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    if (code >= 0x06F0 && code <= 0x06F9) return String(code - 0x06F0);
    if (code >= 0x0966 && code <= 0x096F) return String(code - 0x0966);
    if (code >= 0xFF10 && code <= 0xFF19) return String(code - 0xFF10);

    return char;
  });
};

const Login = () => {
  const netInfo = useNetInfo();
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const rememberMe = useAuthStore((state) => state.rememberMe);
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);
  const setRememberMe = useAuthStore((state) => state.setRememberMe);
  const navigation = authNavigation();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [sendOtpError, setSendOtpError] = useState('');

  const isPhoneValid = useMemo(() => phoneNumberSchema.safeParse(phoneNumber).success, [phoneNumber]);

  const handlePhoneChange = (text: string) => {
    if (sendOtpError) {
      setSendOtpError('');
    }

    const sanitizedValue = normalizePhoneInput(text)
      .replace(AUTH_VALUES.phoneNonDigitRegex, '')
      .slice(0, AUTH_VALUES.phoneMaxLength);

    setPhoneNumber(sanitizedValue);
  };

  const handleContinue = async () => {
    if (!isPhoneValid || isSendingOtp) {
      return;
    }

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    if (isOffline) {
      setSendOtpError('No internet connection. Please check your network and try again.');
      return;
    }

    setSendOtpError('');
    setIsSendingOtp(true);

    try {
      // Simulate OTP send API latency.
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1200);
      });
      navigation.navigate('OTP', { phoneNumber: phoneNumber });
    } catch (_error) {
      setSendOtpError('Unable to send OTP right now. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.headerRow}>
        <GlassButton style={{}} title={AUTH_COPY.loginSkip} onPress={() => { }} />
      </View>

      {/* Top Section */}
      <LoginTopSection />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <LoginTitle />

        <LoginPhoneInput value={phoneNumber} onChangeText={handlePhoneChange} />

        <View style={styles.checkboxContainer}>
          <CheckBox
            value={rememberMe}
            onValueChange={setRememberMe}
            tintColors={{ true: theme.colors.primary, false: theme.colors.border }}
            boxType="square"
            onCheckColor={theme.colors.palette.white}
            onFillColor={theme.colors.primary}
            onTintColor={theme.colors.primary}
            style={Platform.OS === 'ios' ? styles.checkboxIOS : styles.checkboxAndroid}
          />
          <Text onPress={() => { setRememberMe(!rememberMe) }} style={styles.checkboxText}>{AUTH_COPY.loginRememberMe}</Text>
        </View>

        <GradientButton
          title={isSendingOtp ? 'Sending OTP...' : AUTH_COPY.loginContinue}
          onPress={handleContinue}
          disabled={!isPhoneValid}
          loading={isSendingOtp}
          style={styles.continueButton}
          textStyle={styles.continueButtonText}
          gradientColors={theme.colors.defaultColor}
          direction="diagonal"
          locations={theme.colors.defaultLocations}
        />

        {!!sendOtpError && <Text style={styles.sendOtpErrorText}>{sendOtpError}</Text>}

        <SocialLogin />

        <View style={styles.flexSpacer} />

        <LoginFooter />
      </View>
      {/* </ScrollView> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? AUTH_VALUES.loginHeaderTopIos : AUTH_VALUES.loginHeaderTopAndroid,
    right: 20,
    zIndex: 20, // Ensures the Skip button stays clickable and above the food
  },
  bottomSection: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.spacing.borderRadius.xxxl,
    borderTopRightRadius: theme.spacing.borderRadius.xxxl,
    marginTop: -theme.spacing.paddings.xl,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.paddings.xxl,
    paddingBottom: theme.spacing.paddings.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: theme.spacing.paddings.lg,
    marginBottom: theme.spacing.paddings.xl,
  },
  checkboxIOS: {
    width: theme.spacing.xxxl,
    height: theme.spacing.xxxl,
    marginRight: theme.spacing.paddings.sm,
  },
  checkboxAndroid: {
    marginRight: theme.spacing.paddings.xs,
  },
  checkboxText: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: theme.colors.palette.black,
  },
  continueButton: {
    marginBottom: theme.spacing.paddings.md,
    alignContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontRoles.bodyBold,
  },
  sendOtpErrorText: {
    marginTop: -theme.spacing.paddings.xs,
    marginBottom: theme.spacing.paddings.md,
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: theme.colors.error,
  },
  flexSpacer: {
    flex: 1,
    minHeight: theme.spacing.paddings.xl,
  },
});

export default Login;