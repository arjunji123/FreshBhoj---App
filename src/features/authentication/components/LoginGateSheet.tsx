import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import { Sheet, type SheetHandle } from '@components/ui';
import GradientButton from '@components/GradientButton';
import { ApiError } from '@api';
import { AUTH_COPY } from '../auth.constants';
import { phoneNumberSchema } from '../auth.types';
import { useSendOtp, useVerifyOtp } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useAuthGateStore } from '../store/authGateStore';
import LoginPhoneInput from './LoginPhoneInput';
import OTPInputSection from './OTPInputSection';

type Step = 'phone' | 'otp';

/**
 * The compact "log in to continue" sheet a guest sees when they follow a
 * kitchen, favourite a meal, or try to check out — a smaller, self-contained
 * two-step phone + OTP flow, not the full Login screen. Mounted once,
 * globally, and driven entirely by `useAuthGateStore` / `useRequireAuth`.
 */
const LoginGateSheet = () => {
  const visible = useAuthGateStore((s) => s.visible);
  const close = useAuthGateStore((s) => s.close);
  const runPending = useAuthGateStore((s) => s.runPending);

  const sheetRef = useRef<SheetHandle>(null);
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const isPhoneValid = useMemo(() => phoneNumberSchema.safeParse(phoneNumber).success, [phoneNumber]);

  useEffect(() => {
    if (visible) {
      setStep('phone');
      setPhoneNumber('');
      setErrorMessage(null);
      sheetRef.current?.open();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const handlePhoneChange = (text: string) => {
    setErrorMessage(null);
    setPhoneNumber(text.replace(/\D/g, '').slice(0, 10));
  };

  const handleContinue = () => {
    if (!isPhoneValid) return;
    setErrorMessage(null);
    // This quick sheet has no "remember me" toggle of its own — someone who
    // logs in here to finish an action (follow, favourite, checkout) is
    // opting into the account, not a one-off session, so stay signed in.
    useAuthStore.getState().setRememberMe(true);
    sendOtp.mutate(phoneNumber, {
      onSuccess: () => setStep('otp'),
      onError: (error) =>
        setErrorMessage(error instanceof ApiError ? error.message : 'We could not send the code. Please try again.'),
    });
  };

  const handleSubmitOtp = (otp: string) => {
    setErrorMessage(null);
    verifyOtp.mutate(
      { phone: phoneNumber, otp },
      {
        // `signIn` (called inside useVerifyOtp) has already merged the guest
        // cart and flipped `isAuthenticated` by the time this runs. A
        // returning user is authenticated immediately, so whatever was
        // pending (a follow, a favourite, "proceed to checkout") can safely
        // fire now — the screen it came from is still mounted. A brand-new
        // phone number isn't authenticated yet (profile setup comes first,
        // which unmounts this sheet along with the screen the action was
        // captured from), so the action is dropped rather than replayed
        // against a stale, torn-down navigator.
        onSuccess: () => {
          if (useAuthStore.getState().isAuthenticated) {
            runPending();
          } else {
            useAuthGateStore.getState().close();
          }
        },
        onError: (error) =>
          setErrorMessage(error instanceof ApiError ? error.message : 'We could not verify that code. Please try again.'),
      },
    );
  };

  const handleResend = () => sendOtp.mutate(phoneNumber);

  return (
    <Sheet
      ref={sheetRef}
      eyebrow={step === 'phone' ? 'LOG IN REQUIRED' : 'VERIFY YOUR NUMBER'}
      title={step === 'phone' ? 'Log in to continue' : `Code sent to +91 ${phoneNumber}`}
      heightRatio={step === 'phone' ? 0.46 : 0.58}
      onClose={close}
    >
      {step === 'phone' ? (
        <View style={styles.phoneStep}>
          <Text style={[theme.text.body, styles.subtitle]}>
            You're browsing as a guest — log in to save this to your account.
          </Text>

          <LoginPhoneInput value={phoneNumber} onChangeText={handlePhoneChange} />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <GradientButton
            title={sendOtp.isPending ? 'Sending code…' : AUTH_COPY.loginContinue}
            onPress={handleContinue}
            disabled={!isPhoneValid || sendOtp.isPending}
            style={styles.continueButton}
            gradientColors={theme.colors.defaultColor}
            direction="diagonal"
            locations={theme.colors.defaultLocations}
          />
        </View>
      ) : (
        <OTPInputSection
          onSubmit={handleSubmitOtp}
          onResend={handleResend}
          errorMessage={errorMessage}
          isSubmitting={verifyOtp.isPending}
        />
      )}
    </Sheet>
  );
};

export default LoginGateSheet;

const styles = StyleSheet.create({
  phoneStep: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.text.secondary,
  },
  errorText: {
    ...theme.text.caption,
    color: theme.colors.state.error,
    marginTop: theme.spacing.sm,
  },
  continueButton: {
    marginTop: theme.spacing.xl,
  },
});
