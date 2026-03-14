import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { theme } from '@app/theme/index';
import { AUTH_COPY } from '../auth.constants';

const SocialLogin = () => {
    return (
        <>
            <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{AUTH_COPY.socialDivider}</Text>
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
        </>
    );
};

const styles = StyleSheet.create({
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
        fontFamily: theme.typography.fontFamilies.aBeeZee.regular,
        fontSize: theme.typography.fontSizes.md,
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
});

export default SocialLogin;
