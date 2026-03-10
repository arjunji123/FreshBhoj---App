import React from 'react';
import { View, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { theme } from '@app/theme/index';
import OTPHeader from '../components/OTPHeader';
import OTPInputSection from '../components/OTPInputSection';
import { useRoute, RouteProp } from '@react-navigation/native';
import { PublicStackParamList } from '@app/navigation/public/PublicStack';

const { width, height } = Dimensions.get('window');

type OTPScreenRouteProp = RouteProp<PublicStackParamList, 'OTP'>;

const OTPScreen = () => {
  const route = useRoute<OTPScreenRouteProp>();
  const phoneNumber = route.params?.phoneNumber;
  const handleSubmitOTP = (otp: string) => {
    console.log('OTP Submitted:', otp);
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 100,//theme.spacing.paddings.xxxl,
    minHeight: height * 0.4,
  },
  image: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: width * 0.8,
    height: '100%',
  },
});

export default OTPScreen;