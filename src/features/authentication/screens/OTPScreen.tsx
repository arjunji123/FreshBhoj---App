import React, { useCallback, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import OTPHeader from '../components/OTPHeader';
import OTPInputSection from '../components/OTPInputSection';
import { AUTH_VALUES } from '../auth.constants';
import { OTPScreenRouteProp } from '../auth.types';
import { useSendOtp, useVerifyOtp } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import type { PublicNavigation } from '@app/navigation/navigation.types';

const { width, height } = Dimensions.get('window');

const OTPScreen = () => {
  const route = useRoute<OTPScreenRouteProp>();
  const navigation = useNavigation<PublicNavigation>();
  const phoneNumber = route.params?.phoneNumber ?? '';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyOtp = useVerifyOtp();
  const sendOtp = useSendOtp();
  const isProfilePending = useAuthStore((s) => s.isProfilePending);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content', true);
      return () => StatusBar.setBarStyle('light-content', true);
    }, []),
  );

  const handleSubmitOTP = (otp: string) => {
    if (otp.length < AUTH_VALUES.otpDigits) return;
    setErrorMessage(null);

    verifyOtp.mutate(
      { phone: phoneNumber, otp },
      {
        onSuccess: () => {
          // A returning user is already `isAuthenticated`, so the navigation
          // gate swaps to the private stack and this screen unmounts. A new
          // user still needs the profile + location steps.
          if (useAuthStore.getState().isProfilePending || isProfilePending) {
            navigation.navigate('OTPSuccess');
          }
        },
        onError: (error) => {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : 'We could not verify that code. Please try again.',
          );
        },
      },
    );
  };

  const handleResendOTP = () => {
    setErrorMessage(null);
    sendOtp.mutate(phoneNumber);
  };

  return (
    <View style={styles.container}>
      <OTPHeader phoneNumber={phoneNumber} />

      <OTPInputSection
        onSubmit={handleSubmitOTP}
        onResend={handleResendOTP}
        errorMessage={errorMessage}
        isSubmitting={verifyOtp.isPending}
      />

      <View style={styles.imageContainer} pointerEvents="none">
        <Image
          source={require('@assets/images/otpscreen.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.base,
  },
  imageContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: width * AUTH_VALUES.otpImageWidthRatio,
    height: height * AUTH_VALUES.otpImageHeightRatio,
    overflow: 'hidden',
    zIndex: -1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
