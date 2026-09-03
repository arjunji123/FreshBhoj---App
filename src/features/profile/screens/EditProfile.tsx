import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import { AppBar, Avatar, Button, Input, StickyBar } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';

const EditProfile = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const storedUser = useAuthStore((s) => s.user);
  const { data: user } = useProfile();
  const profile = user ?? storedUser;

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useUpdateProfile();

  const handleSave = () => {
    if (fullName.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address, or leave it blank');
      return;
    }

    setError(null);
    updateProfile.mutate(
      { fullName: fullName.trim(), email: email.trim() || undefined },
      {
        onSuccess: () => navigation.goBack(),
        onError: (apiError) =>
          Alert.alert(
            'Could not save',
            apiError instanceof ApiError ? apiError.message : 'Please try again.',
          ),
      },
    );
  };

  return (
    <View style={styles.screen}>
      <AppBar title="Edit profile" onBack={navigation.goBack} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <View style={styles.avatarWrap}>
          <Avatar uri={profile?.profileImage} name={fullName || profile?.fullName} size={92} />
        </View>

        <Input
          label="Full name"
          value={fullName}
          onChangeText={(value) => {
            setError(null);
            setFullName(value);
          }}
          placeholder="e.g. Rahul Sharma"
          autoCapitalize="words"
          containerStyle={styles.field}
        />

        <Input
          label="Email (optional)"
          value={email}
          onChangeText={(value) => {
            setError(null);
            setEmail(value);
          }}
          placeholder="rahul@freshbhoj.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={error ?? undefined}
          containerStyle={styles.field}
        />

        <Input
          label="Phone number"
          value={profile?.phone ?? ''}
          editable={false}
          helperText="Your phone number is your login and cannot be changed here."
          containerStyle={styles.field}
        />
      </KeyboardAwareScrollView>

      <StickyBar>
        <Button title="Save changes" onPress={handleSave} loading={updateProfile.isPending} />
      </StickyBar>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
  },
  avatarWrap: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  field: {
    marginTop: theme.spacing.lg,
  },
});
