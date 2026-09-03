import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { AlertCircle } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Button } from '@components/ui';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { OTPInputSectionProps } from '../auth.types';
import { useResendCooldown } from '../hooks/useResendCooldown';

const OTPInputSection: React.FC<OTPInputSectionProps> = ({
  onSubmit,
  onResend,
  errorMessage,
  isSubmitting = false,
}) => {
  const [otpValue, setOtpValue] = useState('');
  const { canResend, label, restart } = useResendCooldown();

  const handleResend = () => {
    if (!canResend) return;
    restart();
    onResend();
  };

  return (
    <View style={styles.container}>
      <OtpInput
        numberOfDigits={AUTH_VALUES.otpDigits}
        onTextChange={setOtpValue}
        // Auto-submitting on the last digit saves a tap; the button stays for
        // anyone who pastes a code or edits after filling.
        onFilled={(code) => !isSubmitting && onSubmit(code)}
        focusColor={errorMessage ? theme.colors.state.error : theme.colors.primary[600]}
        theme={{
          containerStyle: styles.otpContainer,
          pinCodeContainerStyle: [
            styles.pinCodeContainer,
            errorMessage ? styles.pinCodeContainerError : null,
          ] as any,
          pinCodeTextStyle: styles.pinCodeText,
          focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
        }}
      />

      {errorMessage ? (
        <View style={styles.errorRow}>
          <AlertCircle size={14} color={theme.colors.state.error} strokeWidth={2.4} />
          <Text style={[theme.text.caption, styles.errorText]}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.resendContainer}>
        <Text style={[theme.text.bodySmall, styles.resendText]}>{AUTH_COPY.otpResendPrefix}</Text>
        {canResend ? (
          <Pressable onPress={handleResend} hitSlop={theme.layout.hitSlop}>
            <Text style={[theme.text.label, styles.resendLink]}>{AUTH_COPY.otpResendAction}</Text>
            <View style={styles.resendLine} />
          </Pressable>
        ) : (
          <Text style={[theme.text.label, styles.resendCountdown]}>Resend in {label}</Text>
        )}
      </View>

      <Button
        title={AUTH_COPY.otpSubmit}
        onPress={() => onSubmit(otpValue)}
        loading={isSubmitting}
        disabled={otpValue.length < AUTH_VALUES.otpDigits}
      />
    </View>
  );
};

export default OTPInputSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.screenPadding,
    alignItems: 'center',
    width: '100%',
  },
  otpContainer: {
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  pinCodeContainer: {
    width: 48,
    height: 58,
    borderRadius: theme.radius.control,
    borderColor: theme.colors.borders.subtle,
    borderWidth: 1.5,
    backgroundColor: theme.colors.neutral[50],
  },
  pinCodeContainerError: {
    borderColor: theme.colors.state.error,
    backgroundColor: theme.colors.state.errorBg,
  },
  focusedPinCodeContainer: {
    borderColor: theme.colors.primary[600],
    borderWidth: 2,
    backgroundColor: theme.colors.surface.base,
  },
  pinCodeText: {
    ...theme.text.h2,
    color: theme.colors.text.primary,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.state.error,
    flexShrink: 1,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    gap: 4,
  },
  resendText: {
    color: theme.colors.text.secondary,
  },
  resendLink: {
    color: theme.colors.primary[600],
  },
  resendLine: {
    height: 1.5,
    backgroundColor: theme.colors.primary[600],
    width: '100%',
    marginTop: 1,
  },
  resendCountdown: {
    color: theme.colors.text.tertiary,
  },
});
