import React, { useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Image,
    PermissionsAndroid,
    ActionSheetIOS,
    Alert,
} from 'react-native';
import { User, Camera } from 'lucide-react-native';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuthStore } from '../store/authStore';

const AVATAR_SIZE = 128;
const BADGE_SIZE = 33;
const BRAND_RED_LIGHT = 'rgba(212, 17, 27, 0.05)';
const BRAND_RED_BORDER = 'rgba(212, 17, 27, 0.2)';
const BRAND_RED_ICON = 'rgba(212, 17, 27, 0.4)';

const ProfileImagePicker = () => {
    const selectedImageUri = useAuthStore((s) => s.profileImageUri);
    const setProfileImageUri = useAuthStore((s) => s.setProfileImageUri);

    const requestGalleryPermission = useCallback(async () => {
        if (Platform.OS !== 'android') {
            return true;
        }

        const androidVersion = Number(Platform.Version);
        const permission = androidVersion >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const status = await PermissionsAndroid.request(permission);
        return status === PermissionsAndroid.RESULTS.GRANTED;
    }, []);

    const requestCameraPermission = useCallback(async () => {
        if (Platform.OS !== 'android') {
            return true;
        }

        const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        return status === PermissionsAndroid.RESULTS.GRANTED;
    }, []);

    const handleOpenGallery = useCallback(async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
            return;
        }

        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.9,
            includeBase64: false,
        });

        const pickedImageUri = result.assets?.[0]?.uri;
        if (pickedImageUri) {
            setProfileImageUri(pickedImageUri);
        }
    }, [requestGalleryPermission, setProfileImageUri]);

    const handleOpenCamera = useCallback(async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            return;
        }

        const result = await launchCamera({
            mediaType: 'photo',
            quality: 0.9,
            saveToPhotos: false,
        });

        const pickedImageUri = result.assets?.[0]?.uri;
        if (pickedImageUri) {
            setProfileImageUri(pickedImageUri);
        }
    }, [requestCameraPermission, setProfileImageUri]);

    const handleRemoveImage = useCallback(() => {
        setProfileImageUri('');
    }, [setProfileImageUri]);

    const openPickerOptions = useCallback(() => {
        const hasImage = Boolean(selectedImageUri);

        if (Platform.OS === 'ios') {
            const options = hasImage
                ? ['Take Photo', 'Choose from Gallery', 'Remove Photo', 'Cancel']
                : ['Take Photo', 'Choose from Gallery', 'Cancel'];
            const cancelButtonIndex = options.length - 1;
            const destructiveButtonIndex = hasImage ? 2 : undefined;

            ActionSheetIOS.showActionSheetWithOptions(
                { options, cancelButtonIndex, destructiveButtonIndex },
                (buttonIndex) => {
                    if (buttonIndex === 0) {
                        handleOpenCamera();
                        return;
                    }

                    if (buttonIndex === 1) {
                        handleOpenGallery();
                        return;
                    }

                    if (hasImage && buttonIndex === 2) {
                        handleRemoveImage();
                    }
                },
            );

            return;
        }

        const androidButtons = hasImage
            ? [
                { text: 'Take Photo', onPress: handleOpenCamera },
                { text: 'Choose from Gallery', onPress: handleOpenGallery },
                { text: 'Remove Photo', style: 'destructive' as const, onPress: handleRemoveImage },
                { text: 'Cancel', style: 'cancel' as const },
            ]
            : [
                { text: 'Take Photo', onPress: handleOpenCamera },
                { text: 'Choose from Gallery', onPress: handleOpenGallery },
                { text: 'Cancel', style: 'cancel' as const },
            ];

        Alert.alert('Profile Photo', 'Choose an option', androidButtons);
    }, [selectedImageUri, handleOpenCamera, handleOpenGallery, handleRemoveImage]);

    return (
        <View style={styles.container}>
            {/* Avatar Circle */}
            <TouchableOpacity style={styles.avatarCircle} activeOpacity={0.8} onPress={openPickerOptions}>
                {selectedImageUri ? (
                    <Image source={{ uri: selectedImageUri }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                    <User size={24} color={BRAND_RED_ICON} strokeWidth={1.5} />
                )}
            </TouchableOpacity>

            {/* Camera Badge */}
            <View style={styles.badgeWrapper}>
                <View style={styles.badgeShadow}>
                    <TouchableOpacity activeOpacity={0.85} onPress={openPickerOptions}>
                        <AppGradient
                            colors={theme.colors.defaultColor}
                            locations={theme.colors.defaultLocations}
                            direction="diagonal"
                            style={styles.cameraBadge}
                        >
                            <Camera size={13} color={theme.colors.palette.white} strokeWidth={2} />
                        </AppGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        alignSelf: 'center',
        marginTop: 24,
        marginBottom: 36,
    },
    avatarCircle: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: BRAND_RED_LIGHT,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: BRAND_RED_BORDER,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    badgeWrapper: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    badgeShadow: {
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.25)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    cameraBadge: {
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        borderRadius: BADGE_SIZE / 2,
        borderWidth: 2,
        borderColor: theme.colors.palette.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProfileImagePicker;
