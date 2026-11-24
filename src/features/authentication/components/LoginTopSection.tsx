import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import AppGradient from '@components/AppGradient';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { useTheme } from "@app/theme/useTheme";

const { height } = Dimensions.get('window');

/** Real food photography behind the brand mark. */
const HERO_PHOTO = require('../../../../assets/images/photos/login_cover.jpg');

const LoginTopSection = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.topSection}>
            <Image source={HERO_PHOTO} style={styles.photo} resizeMode="cover" />
            <AppGradient
                colors={['rgba(6,18,12,0.35)', 'rgba(6,18,12,0.05)', 'rgba(6,18,12,0.78)']}
                locations={[0, 0.45, 1]}
                direction="vertical"
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            {/* Fixed distance from the bottom so it always clears the sheet's overlap. */}
            <View style={styles.brandBlock}>
                <Text
                    style={styles.brandTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                    maxFontSizeMultiplier={1}
                >
                    {AUTH_COPY.brandTitle}
                </Text>
                <Text style={styles.tagline}>Real food from real kitchens</Text>
            </View>
        </View>
    );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    topSection: {
        height: height * AUTH_VALUES.loginTopSectionHeightRatio,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#06120C',
    },
    photo: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    brandBlock: {
        position: 'absolute',
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        bottom: 44,
        alignItems: 'center',
        gap: 4,
    },
    brandTitle: {
        fontFamily: theme.typography.fontFamilies.medievalSharp,
        fontSize: theme.typography.fontSizes.display4,
        color: theme.colors.palette.white,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    tagline: {
        color: 'rgba(255,255,255,0.88)',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});

export default LoginTopSection;
