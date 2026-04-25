import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import GradientButton from '@components/GradientButton';
import ProfileImagePicker from './ProfileImagePicker';
import PersonalDetailsForm from './PersonalDetailsForm';
import { useAuthStore } from '../store/authStore';
import { useNetInfo } from '@react-native-community/netinfo';

interface PersonalDetailsContentProps {
  onSaveAndContinue: () => void;
}

const PersonalDetailsContent: React.FC<PersonalDetailsContentProps> = ({
  onSaveAndContinue,
}) => {
  const netInfo = useNetInfo();
  const fullName = useAuthStore((s) => s.fullName);
  const email = useAuthStore((s) => s.email);
  const setFullName = useAuthStore((s) => s.setFullName);
  const setEmail = useAuthStore((s) => s.setEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const validation = useMemo(() => {
    const trimmedName = fullName.trim().replace(/\s+/g, ' ');
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasName = trimmedName.length > 0;
    const hasEmail = trimmedEmail.length > 0;

    const fullNameError =
      hasName && trimmedName.length < 3
          ? 'Full name must be at least 3 characters.'
          : '';

    const emailError =
      hasEmail && !emailRegex.test(trimmedEmail)
          ? 'Enter a valid email address.'
          : '';

    return {
      fullNameError,
      emailError,
      isFormValid: hasName && hasEmail && !fullNameError && !emailError,
    };
  }, [fullName, email]);

  const handleSaveAndContinue = async () => {
    if (!validation.isFormValid || isSaving) {
      return;
    }

    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    if (isOffline) {
      setSaveError('No internet connection. Please try again once you are online.');
      return;
    }

    setSaveError('');
    setIsSaving(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });

    setIsSaving(false);
    onSaveAndContinue();
  };


  return (
    <View>
      {/* Profile Image Picker */}
      <ProfileImagePicker />

      {/* Form Fields */}
      <PersonalDetailsForm
        fullName={fullName}
        email={email}
        onFullNameChange={setFullName}
        onEmailChange={setEmail}
        fullNameError={validation.fullNameError}
        emailError={validation.emailError}
      />

      {!!saveError && <Text style={styles.saveErrorText}>{saveError}</Text>}

      {/* Save & Continue Button */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title={isSaving ? 'Saving...' : 'Save & Continue'}
          onPress={handleSaveAndContinue}
          disabled={!validation.isFormValid}
          loading={isSaving}
          rightIcon={<ArrowRight size={12} color={theme.colors.palette.white} strokeWidth={2.5} />}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
        />
      </View>

      {/* Page Indicator Dots */}
      <View style={styles.dotsContainer}>
        {/* <View style={styles.dotInactive} /> */}
        <View style={styles.dotActive} />
        <View style={styles.dotInactive} />
      </View>
    </View>
  );
};

export default PersonalDetailsContent;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 32,
    marginTop: 48,
  },
  saveErrorText: {
    marginTop: 14,
    paddingHorizontal: 28,
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 24,
    ...theme.Shadows.medium,
  },
  saveButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  dotInactive: {
    width: 8,
    height: 6,
    borderRadius: 9999,
    backgroundColor: theme.colors.palette.inactive,
  },
  dotActive: {
    width: 32,
    height: 6,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: theme.colors.gradient2,
  },
});
