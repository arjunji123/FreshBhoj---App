import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import GlassButton from '@components/GlassButton';
import { theme } from '@app/theme/index';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import LoginTopSection from '../components/LoginTopSection';
import LoginTitle from '../components/LoginTitle';
import LoginPhoneInput from '../components/LoginPhoneInput';
import SocialLogin from '../components/SocialLogin';
import LoginFooter from '../components/LoginFooter';
import useAuthNavigation from '../hooks/useAuthNavigation';
import GradientButton from '@components/GradientButton';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { phoneNumberSchema } from '../auth.types';
import { useAuthStore } from '../store/authStore';
import { useSendOtp } from '../hooks/useAuth';
import { useSendKitchenOtp } from '@features/kitchenPartner/hooks/useKitchenAuth';
import { authApi, ApiError } from '@api';

const Login = () => {
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const rememberMe = useAuthStore((state) => state.rememberMe);
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);
  const setRememberMe = useAuthStore((state) => state.setRememberMe);
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);
  const navigation = useAuthNavigation();
  const sendOtp = useSendOtp();
  const sendKitchenOtp = useSendKitchenOtp();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isDetecting, setIsDetecting] = React.useState(false);

  const isPhoneValid = useMemo(() => phoneNumberSchema.safeParse(phoneNumber).success, [phoneNumber]);

  const handlePhoneChange = (text: string) => {
    const sanitizedValue = text
      .replace(AUTH_VALUES.phoneNonDigitRegex, '')
      .slice(0, AUTH_VALUES.phoneMaxLength);

    setErrorMessage(null);
    setPhoneNumber(sanitizedValue);
  };

  // One phone-entry screen for both customer and kitchen-partner accounts —
  // the backend resolves which one this number belongs to before any OTP is
  // sent, and an existing kitchen account always wins that check.
  const handleContinue = async () => {
    if (!isPhoneValid || isDetecting) return;
    setErrorMessage(null);
    setIsDetecting(true);

    try {
      const { accountType } = await authApi.accountType(phoneNumber);
      const otpMutation = accountType === 'KITCHEN' ? sendKitchenOtp : sendOtp;

      otpMutation.mutate(phoneNumber, {
        onSuccess: () => navigation.navigate('OTP', { phoneNumber, accountType }),
        onError: (error) =>
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'We could not send the code. Please try again.',
          ),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'We could not send the code. Please try again.',
      );
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <GlassButton style={{}} title={AUTH_COPY.loginSkip} onPress={continueAsGuest} />
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
            tintColors={{ true: theme.colors.primary[600], false: theme.colors.border }}
            boxType="square"
            onCheckColor={theme.colors.palette.white}
            onFillColor={theme.colors.primary[600]}
            onTintColor={theme.colors.primary[600]}
            style={Platform.OS === 'ios' ? styles.checkboxIOS : styles.checkboxAndroid}
          />
          <Text onPress={() => { setRememberMe(!rememberMe) }} style={styles.checkboxText}>{AUTH_COPY.loginRememberMe}</Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <GradientButton
          title={isDetecting || sendOtp.isPending || sendKitchenOtp.isPending ? 'Sending code…' : AUTH_COPY.loginContinue}
          onPress={handleContinue}
          disabled={!isPhoneValid || isDetecting || sendOtp.isPending || sendKitchenOtp.isPending}
          style={styles.continueButton}
          textStyle={styles.continueButtonText}
          gradientColors={theme.colors.defaultColor}
          direction="diagonal"
          locations={theme.colors.defaultLocations}
        />

        <SocialLogin />

        <View style={styles.flexSpacer} />

        <LoginFooter />
      </View>
      {/* </ScrollView> */}
    </KeyboardAwareScrollView>
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
    justifyContent: 'center',
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
  errorText: {
    ...theme.text.caption,
    color: theme.colors.state.error,
    marginBottom: theme.spacing.sm,
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
  flexSpacer: {
    flex: 1,
    minHeight: theme.spacing.paddings.xl,
  },
});

export default Login;