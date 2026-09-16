import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import { AppBar, Avatar, Button, Input, StickyBar } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useProfile, useUpdateProfile, useUpdateProfileImage } from '../hooks/useProfile';

const EditProfile = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const storedUser = useAuthStore((s) => s.user);
  const { data: user } = useProfile();
  const profile = user ?? storedUser;

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useUpdateProfile();
  const updateProfileImage = useUpdateProfileImage();

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!asset.uri) return;

    updateProfileImage.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? 'profile.jpg',
        type: asset.type ?? 'image/jpeg',
      },
      {
        onError: (apiError) =>
          Alert.alert(
            'Could not update photo',
            apiError instanceof ApiError ? apiError.message : 'Please try again.',
          ),
      },
    );
  };

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
          <Pressable
            onPress={handlePickPhoto}
            disabled={updateProfileImage.isPending}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={({ pressed }) => [styles.avatarPressable, pressed ? styles.avatarPressed : null]}
          >
            <Avatar uri={profile?.profileImage} name={fullName || profile?.fullName} size={92} />
            {updateProfileImage.isPending ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={theme.colors.palette.white} />
              </View>
            ) : (
              <View style={styles.cameraBadge}>
                <Camera size={14} color={theme.colors.palette.white} strokeWidth={2.4} />
              </View>
            )}
          </Pressable>
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
  avatarPressable: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarPressed: {
    opacity: 0.85,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 46,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface.page,
  },
  field: {
    marginTop: theme.spacing.lg,
  },
});
