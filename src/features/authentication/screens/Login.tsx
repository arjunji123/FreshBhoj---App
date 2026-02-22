import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AppGradient from '@components/AppGradient';
import GlassButton from '@components/GlassButton';
import GradientText from '@components/GradientText';
import AppButton from '@components/AppButton';
import { theme } from '@app/theme/index';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerRow}>
        <GlassButton style={{}} title="Skip" onPress={() => { }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>

        {/* Top Section */}
        <AppGradient
          colors={[theme.colors.gradient1, theme.colors.gradient2]}
          direction="vertical"
          style={styles.topSection}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require('@assets/images/loginimage.png')}
              style={styles.plateImage}
              resizeMode="cover"
            />

            <Text style={styles.brandTitle}>FreshBhoj</Text>
          </View>
        </AppGradient>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.titleContainer}>
            <GradientText
              colors={[theme.colors.textGradient1, theme.colors.textGradient2]}
              direction="horizontal"
              style={styles.titleText}
            >
              A better way to experience food.
            </GradientText>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Log in or sign up</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.countryCodeContainer}>
              <Image
                source={require('../../../../assets/images/indiaicon.png')}
                style={styles.flagIcon}
              />
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <View style={styles.inputDivider} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter Phone Number"
              placeholderTextColor={theme.colors.textGray1}
              keyboardType="phone-pad"
              value={phoneNumber}
              cursorColor={theme.colors.primary}
              onChangeText={setPhoneNumber}
              maxLength={10}
            />
          </View>

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
            <Text style={styles.checkboxText}>Remember my login for faster Sign-in</Text>
          </View>

          <AppButton title="Continue" onPress={() => { }} style={styles.continueButton} />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require('../../../../assets/images/googleicon.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require('../../../../assets/images/gmailicon.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.flexSpacer} />

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>By continuing , you agree to our</Text>
            <View style={styles.footerLinksRow}>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Terms of service</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}> • </Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}> • </Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Content Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  topSection: {
    height: height * 0.4, // Give the top section a dedicated height
    width: '100%',
    position: 'relative',
    overflow: 'hidden', // Optional: prevents the background pattern from bleeding down
  },
  headerRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 50, // Adjust this based on your Safe Area
    right: 20,
    zIndex: 20, // Ensures the Skip button stays clickable and above the food
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  plateImage: {
    width: width * 1.15, // Make it wider than the screen to let it bleed off edges
    height: width * 1.15,
    marginTop: -100, // Negative margin pulls the image up and out of the screen top
    zIndex: 1,
  },
  brandTitle: {
    fontFamily: theme.typography.fontFamilies.medievalSharp,
    fontSize: theme.typography.fontSizes.display6,
    color: theme.colors.palette.white,
    marginTop: -120,
    zIndex: 10,
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.paddings.xl,
  },
  titleText: {
    fontSize: theme.typography.fontSizes.display2,
    fontFamily: theme.typography.fontFamilies.adlamDisplay,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.display1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.paddings.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.palette.gray3,
  },
  dividerText: {
    marginHorizontal: theme.spacing.paddings.sm,
    color: theme.colors.palette.gray4,
    fontFamily: theme.typography.fontFamilies.khula.semibold,
    fontSize: theme.typography.fontSizes.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.palette.gray2,
    borderRadius: theme.spacing.borderRadius.md,
    marginTop: theme.spacing.paddings.sm,
    paddingHorizontal: theme.spacing.paddings.md,
    backgroundColor: theme.colors.palette.white,
    height: theme.spacing.xxxl,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  flagIcon: {
    width: 24,
    height: 18,
    marginRight: theme.spacing.paddings.xs,
  },
  countryCodeText: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.mavenPro.semibold,
    color: theme.colors.palette.black,
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.paddings.md,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.mavenPro.regular,
    color: theme.colors.palette.black,
    paddingVertical: 0,
    includeFontPadding: false,
    height: '100%',
    justifyContent: 'center',
    letterSpacing: 1,
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
    fontFamily: theme.typography.fontFamilies.khula.semibold,
    color: theme.colors.palette.black,
  },
  continueButton: {
    marginBottom: theme.spacing.paddings.md,
    height: 56,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.paddings.xl,
  },
  socialButton: {
    width: theme.spacing.xxxl,
    height: theme.spacing.xxxl,
    borderRadius: theme.spacing.borderRadius.round,
    backgroundColor: theme.colors.palette.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: theme.spacing.huge,
    height: theme.spacing.huge,
  },
  flexSpacer: {
    flex: 1,
    minHeight: theme.spacing.paddings.xl,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.inter,
    color: theme.colors.textGray1,
    marginBottom: theme.spacing.paddings.xs,
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.inter,
    color: theme.colors.textGray1,
    fontWeight: theme.typography.fontWeights.medium,
  },
  footerDot: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textGray1,
    marginHorizontal: theme.spacing.paddings.xs,
  },
});

export default Login;