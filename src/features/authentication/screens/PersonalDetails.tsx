import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import authNavigation from '../hooks/authNavigation';

// Theme
import { theme } from '@app/theme/index';

// Components
import GradientButton from '@components/GradientButton';
import PersonalDetailsHeader from '../components/PersonalDetailsHeader';
import ProfileImagePicker from '../components/ProfileImagePicker';
import PersonalDetailsForm from '../components/PersonalDetailsForm';

const PersonalDetails = () => {
  const navigation = authNavigation();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleSaveAndContinue = () => {
    navigation.navigate('SelectLocation');
  };

  return (
    <View style={styles.screen}>
      {/* Red Gradient Header */}
      <PersonalDetailsHeader />

      {/* White Content Card */}
      <View style={styles.contentCard}>

        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pull Handle */}
          <View style={styles.pullHandle} />
          {/* Top Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Personal Details</Text>
          </View>

          {/* Profile Image Picker */}
          <ProfileImagePicker />

          {/* Form Fields */}
          <PersonalDetailsForm
            fullName={fullName}
            email={email}
            onFullNameChange={setFullName}
            onEmailChange={setEmail}
          />

          {/* Save & Continue Button */}
          <View style={styles.buttonContainer}>
            <GradientButton
              title="Save & Continue"
              onPress={handleSaveAndContinue}
              rightIcon={<ArrowRight size={12} color={theme.colors.palette.white} strokeWidth={2.5} />}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.gradient1,
  },
  flex: {
    flex: 1,
  },
  contentCard: {
    flex: 1,
    backgroundColor: theme.colors.palette.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
    overflow: 'hidden',
  },
  pullHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    alignSelf: 'center',
    marginTop: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 36,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
    lineHeight: 28,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    marginTop: 48,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 24,
  },
  saveButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },
});