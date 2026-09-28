import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
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
  // Reached either pre-login (no params) or from a signed-in customer's
  // Profile screen with `intent: 'KITCHEN'` — see PrivateStack.tsx, which
  // mounts this same screen under the private stack so registering a
  // kitchen doesn't sign the customer out of their session.
  const route = useRoute<any>();
  const isKitchenIntent = route.params?.intent === 'KITCHEN';
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
  // sent, and an existing kitchen account always wins that check. When
  // reached with an explicit kitchen intent (the "Register your Kitchen"
  // entry point), skip that lookup entirely and always send a kitchen OTP.
  const handleContinue = async () => {
    if (!isPhoneValid || isDetecting) return;
    setErrorMessage(null);

    if (isKitchenIntent) {
      sendKitchenOtp.mutate(phoneNumber, {
        onSuccess: () => navigation.navigate('OTP', { phoneNumber, accountType: 'KITCHEN' }),
        onError: (error) =>
          setErrorMessage(
            error instanceof ApiError ? error.message : 'We could not send the code. Please try again.',
          ),
      });
      return;
    }

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
      {!isKitchenIntent ? (
        <View style={styles.headerRow}>
          <GlassButton style={{}} title={AUTH_COPY.loginSkip} onPress={continueAsGuest} />
        </View>
      ) : null}

      {/* Top Section */}
      <LoginTopSection />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <LoginTitle />

        {isKitchenIntent ? (
          <Text style={styles.kitchenIntentBanner}>Register your Kitchen — verify your phone number to get started.</Text>
        ) : null}

        <LoginPhoneInput value={phoneNumber} onChangeText={handlePhoneChange} />

        {!isKitchenIntent ? (
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
        ) : null}

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

        {!isKitchenIntent ? <SocialLogin /> : null}

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
  kitchenIntentBanner: {
    ...theme.text.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.paddings.lg,
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