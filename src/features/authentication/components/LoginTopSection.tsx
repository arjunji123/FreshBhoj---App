import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';

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
                <Text style={styles.brandTitle}>FreshBhoj</Text>
            </View>
        </AppGradient>
    );
};

const styles = StyleSheet.create({
    topSection: {
        height: height * 0.4,
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
        width: width * 1.15,
        height: width * 1.15,
        marginTop: -100,
        zIndex: 1,
    },
    brandTitle: {
        fontFamily: theme.typography.fontFamilies.medievalSharp,
        fontSize: theme.typography.fontSizes.display6,
        color: theme.colors.palette.white,
        marginTop: -120,
        zIndex: 10,
    },
});

export default LoginTopSection;
