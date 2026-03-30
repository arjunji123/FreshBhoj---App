import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import GradientButton from '@components/GradientButton';
import ProfileImagePicker from './ProfileImagePicker';
import PersonalDetailsForm from './PersonalDetailsForm';
import { useAuthStore } from '../store/authStore';

interface PersonalDetailsContentProps {
  onSaveAndContinue: () => void;
}

const PersonalDetailsContent: React.FC<PersonalDetailsContentProps> = ({
  onSaveAndContinue,
}) => {
  const fullName = useAuthStore((s) => s.fullName);
  const email = useAuthStore((s) => s.email);
  const setFullName = useAuthStore((s) => s.setFullName);
  const setEmail = useAuthStore((s) => s.setEmail);

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
      />

      {/* Save & Continue Button */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title="Save & Continue"
          onPress={onSaveAndContinue}
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
