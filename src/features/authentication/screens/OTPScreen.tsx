import React from 'react';
import { View, Image, StyleSheet, Dimensions, Alert, StatusBar } from 'react-native';
import { theme } from '@app/theme/index';
import OTPHeader from '../components/OTPHeader';
import OTPInputSection from '../components/OTPInputSection';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { AUTH_VALUES } from '../auth.constants';
import { OTPScreenRouteProp } from '../auth.types';
import authNavigation from '../hooks/authNavigation';

const { width, height } = Dimensions.get('window');

const OTPScreen = () => {
  const route = useRoute<OTPScreenRouteProp>();
  const phoneNumber = route.params?.phoneNumber;
  const navigation = authNavigation();

  useFocusEffect(() => {
    StatusBar.setBarStyle('dark-content', true);
    return () => {
      StatusBar.setBarStyle('light-content', true);
    }
  });


  const handleSubmitOTP = (otp: string) => {
    if(otp === AUTH_VALUES.mockOtp) {
      Alert.alert('OTP Verified', 'Your OTP has been verified successfully!');
      navigation.navigate('OTPSuccess');
    } else {
      Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
      // Show error message to user
    }
    // Add OTP verification logic here
  };

  const handleResendOTP = () => {
    console.log('Resend OTP clicked');
    // Add OTP resend logic here
  };

  return (
    <View style={styles.container}>
      <OTPHeader phoneNumber={phoneNumber} />

      <OTPInputSection
        onSubmit={handleSubmitOTP}
        onResend={handleResendOTP}
      />

      <View style={styles.imageContainer}>
        <Image
          source={require('@assets/images/otpscreen.png')}
          style={styles.image}
          resizeMode="cover"
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
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: width * AUTH_VALUES.otpImageWidthRatio,
    height: height * AUTH_VALUES.otpImageHeightRatio,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',

  },
});

export default OTPScreen;