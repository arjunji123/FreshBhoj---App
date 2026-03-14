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
                <Text style={styles.brandTitle}>{AUTH_COPY.brandTitle}</Text>
            </View>
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
    },
    plateImage: {
        width: width * AUTH_VALUES.loginPlateImageWidthRatio,
        height: width * AUTH_VALUES.loginPlateImageWidthRatio,
        marginTop: AUTH_VALUES.loginPlateImageTopOffset,
        zIndex: 1,
    },
    brandTitle: {
        fontFamily: theme.typography.fontFamilies.medievalSharp,
        fontSize: theme.typography.fontSizes.display6,
        color: theme.colors.palette.white,
        marginTop: AUTH_VALUES.loginBrandTitleTopOffset,
        zIndex: 10,
    },
});

export default LoginTopSection;
