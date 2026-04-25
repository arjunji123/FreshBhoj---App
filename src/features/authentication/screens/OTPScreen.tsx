import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, StatusBar, Vibration } from 'react-native';
import { theme } from '@app/theme/index';
import OTPHeader from '../components/OTPHeader';
import OTPInputSection from '../components/OTPInputSection';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { AUTH_VALUES } from '../auth.constants';
import { OTPScreenRouteProp } from '../auth.types';
import authNavigation from '../hooks/authNavigation';

const { width, height } = Dimensions.get('window');
const OTP_EXPIRY_SECONDS = 5 * 60;
const MAX_OTP_ATTEMPTS = 5;

const OTPScreen = () => {
  const route = useRoute<OTPScreenRouteProp>();
  const phoneNumber = route.params?.phoneNumber;
  const navigation = authNavigation();
  const [otpStatus, setOtpStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [expiresAt, setExpiresAt] = useState(Date.now() + OTP_EXPIRY_SECONDS * 1000);
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [helperText, setHelperText] = useState('');
  const otpImageWidth = Math.min(width * 0.62, 300);
  const otpImageHeight = Math.min(height * 0.22, 180);

  useFocusEffect(() => {
    StatusBar.setBarStyle('dark-content', true);
    return () => {
      StatusBar.setBarStyle('light-content', true);
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const isLocked = failedAttempts >= MAX_OTP_ATTEMPTS;
  const isOtpExpired = secondsLeft <= 0;
  const isResendDisabled = secondsLeft > 0 || isResending;
  const remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - failedAttempts);

  const computedHelperText = useMemo(() => {
    if (helperText) {
      return helperText;
    }

    if (isOtpExpired) {
      return 'OTP expired. Please resend and try again.';
    }

    return '';
  }, [helperText, isOtpExpired]);


  const handleSubmitOTP = async (otp: string) => {
    if (isOtpExpired) {
      setHelperText('OTP expired. Please resend and try again.');
      setOtpStatus('error');
      return;
    }

    if (isLocked) {
      setHelperText('Too many failed attempts. Please resend OTP.');
      return;
    }

    setIsSubmitting(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 600);
    });

    if (otp === AUTH_VALUES.mockOtp) {
      setHelperText('');
      setOtpStatus('success');
      setTimeout(() => {
        navigation.navigate('OTPSuccess');
      }, 300);
    } else {
      setOtpStatus('error');
      setFailedAttempts((prev) => prev + 1);
      setHelperText('Invalid OTP. Please try again.');
      Vibration.vibrate(180);
    }

    setIsSubmitting(false);
  };

  const handleOtpChange = () => {
    if (otpStatus !== 'idle') {
      setOtpStatus('idle');
    }

    if (helperText) {
      setHelperText('');
    }
  };

  const handleResendOTP = async () => {
    if (isResendDisabled) {
      return;
    }

    setIsResending(true);
    setHelperText('');

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 900);
    });

    setExpiresAt(Date.now() + OTP_EXPIRY_SECONDS * 1000);
    setSecondsLeft(OTP_EXPIRY_SECONDS);
    setFailedAttempts(0);
    setOtpStatus('idle');
    setIsResending(false);
    setHelperText('A fresh OTP has been sent.');
  };

  return (
    <View style={styles.container}>
      <OTPHeader phoneNumber={phoneNumber} />

      <OTPInputSection
        onSubmit={handleSubmitOTP}
        onResend={handleResendOTP}
        status={otpStatus}
        onOtpChange={handleOtpChange}
        resendInSeconds={secondsLeft}
        isResendDisabled={isResendDisabled}
        remainingAttempts={remainingAttempts}
        isLocked={isLocked}
        isSubmitting={isSubmitting}
        helperText={computedHelperText}
      />

      <View style={styles.imageContainer}>
        <Image
          source={require('@assets/images/otpscreen.png')}
          style={[styles.image, { width: otpImageWidth, height: otpImageHeight }]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingBottom: 8,
    pointerEvents: 'none',
  },
  image: {
    maxWidth: '100%',
  },
});

export default OTPScreen;