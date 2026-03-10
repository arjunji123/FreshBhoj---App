import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import GlassButton from '@components/GlassButton';
import AppButton from '@components/AppButton';
import { theme } from '@app/theme/index';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import LoginTopSection from '../components/LoginTopSection';
import LoginTitle from '../components/LoginTitle';
import LoginPhoneInput from '../components/LoginPhoneInput';
import SocialLogin from '../components/SocialLogin';
import LoginFooter from '../components/LoginFooter';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PublicStackParamList } from '@app/navigation/public/PublicStack';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigation = useNavigation<NavigationProp<PublicStackParamList>>();

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <GlassButton style={{}} title="Skip" onPress={() => { }} />
      </View>

      {/* <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}> */}

      {/* Top Section */}
      <LoginTopSection />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <LoginTitle />

        <LoginPhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />

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
          <Text onPress={() => { setRememberMe(!rememberMe) }} style={styles.checkboxText}>Remember my login for faster Sign-in</Text>
        </View>

        <AppButton title="Continue" onPress={() => { navigation.navigate('OTP', { phoneNumber: phoneNumber }) }} style={styles.continueButton} />

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
    top: Platform.OS === 'ios' ? 70 : 50, // Adjust this based on your Safe Area
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
    fontFamily: theme.typography.fontFamilies.inter,
    color: theme.colors.palette.black,
  },
  continueButton: {
    marginBottom: theme.spacing.paddings.md,
    height: 56,
  },
  flexSpacer: {
    flex: 1,
    minHeight: theme.spacing.paddings.xl,
  },
});

export default Login;