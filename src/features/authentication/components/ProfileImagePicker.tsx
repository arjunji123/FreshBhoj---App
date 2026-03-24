import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { User, Camera } from 'lucide-react-native';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';

const AVATAR_SIZE = 128;
const BADGE_SIZE = 33;
const BRAND_RED = 'rgba(212, 17, 27, 1)';
const BRAND_RED_LIGHT = 'rgba(212, 17, 27, 0.05)';
const BRAND_RED_BORDER = 'rgba(212, 17, 27, 0.2)';
const BRAND_RED_ICON = 'rgba(212, 17, 27, 0.4)';

const ProfileImagePicker = () => {
    return (
        <View style={styles.container}>
            {/* Avatar Circle */}
            <TouchableOpacity style={styles.avatarCircle} activeOpacity={0.7}>
                <User size={24} color={BRAND_RED_ICON} strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Camera Badge */}
            <View style={styles.badgeWrapper}>
                <View style={styles.badgeShadow}>
                    <AppGradient
                        colors={theme.colors.defaultColor}
                        locations={theme.colors.defaultLocations}
                        direction="diagonal"
                        style={styles.cameraBadge}
                    >
                        <Camera size={13} color={theme.colors.palette.white} strokeWidth={2} />
                    </AppGradient>
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
