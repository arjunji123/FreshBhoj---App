import { View, Text, Image, useWindowDimensions, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { colors, spacing, typography } from '@app/theme';

interface OnboardingSlideProps {
    item: {
        id: string;
        title: string;
        description: string;
        image: any;
    }
}

const { height } = Dimensions.get('window');
const isIphoneSE = height < 667;

const getTopMargin = () => {
    if (isIphoneSE) return 100;
    return 150;
}

const OnboardingSlide = ({ item }: OnboardingSlideProps) => {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <View style={styles.imageContainer}>
                <Image source={item.image} style={[styles.image, { width: width * 0.8, resizeMode: 'contain' }]} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        marginTop: getTopMargin(),
        width: 600,
        height: 500,
        borderRadius: spacing.borderRadius.round,
    },
    textContainer: {
        flex: 0.3,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: spacing.paddings.xxl,
        marginTop: spacing.paddings.xxl
    },
    title: {
        fontSize: typography.fontSizes.display2,
        fontFamily: typography.fontFamilies.mavenPro,
        fontWeight: 'medium',
        color: colors.palette.white,
        textAlign: 'center',
    },
})

export default OnboardingSlide
