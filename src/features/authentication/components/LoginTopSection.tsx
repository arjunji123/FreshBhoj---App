import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';

const { width, height } = Dimensions.get('window');

const LoginTopSection = () => {
    return (
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
            </View>
            {/* Positioned independent of the image's own flow/size so it always
                clears the white sheet's overlap, regardless of device aspect ratio. */}
            <Text
                style={styles.brandTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
                maxFontSizeMultiplier={1}
            >
                {AUTH_COPY.brandTitle}
            </Text>
        </AppGradient>
    );
};

const styles = StyleSheet.create({
    topSection: {
        height: height * AUTH_VALUES.loginTopSectionHeightRatio,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: theme.spacing.lg,
    },
    plateImage: {
        width: width * AUTH_VALUES.loginPlateImageWidthRatio,
        height: width * AUTH_VALUES.loginPlateImageWidthRatio,
        marginTop: AUTH_VALUES.loginPlateImageTopOffset,
        zIndex: 1,
    },
    brandTitle: {
        position: 'absolute',
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        // A fixed distance from the bottom of the red section — always clears
        // the white sheet below (which overlaps it by only ~24dp), no matter
        // how tall the plate image renders on a given device.
        bottom: 40,
        fontFamily: theme.typography.fontFamilies.medievalSharp,
        fontSize: theme.typography.fontSizes.display4,
        color: theme.colors.palette.white,
        zIndex: 10,
        textAlign: 'center',
    },
});

export default LoginTopSection;
