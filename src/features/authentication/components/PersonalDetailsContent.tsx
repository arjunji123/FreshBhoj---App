import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { z } from 'zod';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import { Button } from '@components/ui';
import ProfileImagePicker from './ProfileImagePicker';
import PersonalDetailsForm from './PersonalDetailsForm';
import { useAuthStore } from '../store/authStore';
import { useCompleteProfile } from '../hooks/useAuth';

interface PersonalDetailsContentProps {
  onSaveAndContinue: () => void;
}

const nameSchema = z.string().trim().min(2, 'Please enter your name');
const emailSchema = z.string().trim().email('Enter a valid email address');

const PersonalDetailsContent: React.FC<PersonalDetailsContentProps> = ({ onSaveAndContinue }) => {
  const fullName = useAuthStore((s) => s.fullName);
  const email = useAuthStore((s) => s.email);
  const setFullName = useAuthStore((s) => s.setFullName);
  const setEmail = useAuthStore((s) => s.setEmail);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const completeProfile = useCompleteProfile();

  const isValid = useMemo(() => {
    if (!nameSchema.safeParse(fullName).success) return false;
    // Email is optional — but if the user typed something, it has to be valid.
    return !email.trim() || emailSchema.safeParse(email).success;
  }, [fullName, email]);

  const handleSave = () => {
    if (!isValid) {
      setErrorMessage(
        nameSchema.safeParse(fullName).success
          ? 'Enter a valid email address, or leave it blank'
          : 'Please enter your name',
      );
      return;
    }

    setErrorMessage(null);
    completeProfile.mutate(
      { fullName: fullName.trim(), email: email.trim() || undefined },
      {
        onSuccess: onSaveAndContinue,
        onError: (error) =>
          setErrorMessage(
            error instanceof ApiError ? error.message : 'Could not save your details. Try again.',
          ),
      },
    );
  };

  return (
    <View>
      <ProfileImagePicker />

      <PersonalDetailsForm
        fullName={fullName}
        email={email}
        onFullNameChange={(value) => {
          setErrorMessage(null);
          setFullName(value);
        }}
        onEmailChange={(value) => {
          setErrorMessage(null);
          setEmail(value);
        }}
      />

      {errorMessage ? (
        <Text style={[theme.text.caption, styles.error]}>{errorMessage}</Text>
      ) : null}

      <View style={styles.buttonContainer}>
        <Button
          title="Save & Continue"
          onPress={handleSave}
          loading={completeProfile.isPending}
          disabled={!isValid}
          rightIcon={<ArrowRight size={16} color={theme.colors.text.inverse} strokeWidth={2.6} />}
        />
      </View>

      <View style={styles.dotsContainer}>
        <View style={styles.dotActive} />
        <View style={styles.dotInactive} />
      </View>
    </View>
  );
};

export default PersonalDetailsContent;

const styles = StyleSheet.create({
  error: {
    color: theme.colors.state.error,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  dotActive: {
    width: 32,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary[600],
  },
  dotInactive: {
    width: 8,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary[200],
  },
});
