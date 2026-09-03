import { View, Text, Image, Dimensions, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { colors, spacing, theme, typography } from '@app/theme';
import OnboardingPaginator from './OnboardingPaginator';
import GradientButton from '@components/GradientButton';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import GradientText from '@components/GradientText';

export interface OnboardingItem {
    id: string;
    heroTitle: string;
    title: string;
    subtitle?: string;
    description: string;
    image: any;
    variant: 'plate' | 'reel' | 'thali';
    ctaLabel: string;
}

interface OnboardingSlideProps {
    item: OnboardingItem;
    itemIndex: number;
    currentIndex: number;
    totalSlides: number;
    isActive: boolean;
    onPrimaryPress: () => void;
    onBackPress: () => void;
}

const { width, height } = Dimensions.get('window');

const OnboardingSlide = ({ item, itemIndex, currentIndex, totalSlides, isActive, onPrimaryPress, onBackPress }: OnboardingSlideProps) => {
    const isMiddleSlide = item.variant === 'reel';
    const showBack = itemIndex > 0;

    const cardTranslateY = useSharedValue(isActive ? 0 : 28);
    const cardOpacity = useSharedValue(isActive ? 1 : 0.75);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        cardTranslateY.value = withTiming(isActive ? 0 : 28, { duration: 280 });
        cardOpacity.value = withTiming(isActive ? 1 : 0.75, { duration: 220 });
    }, [isActive, cardOpacity, cardTranslateY]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: cardTranslateY.value }],
        opacity: cardOpacity.value,
    }));

    const renderSubtitle = () => {
        if (!item.subtitle) {
            return null;
        }
        return (
            <GradientText
                style={styles.subtitle}
                location={theme.colors.defaultLocations}>
                {item.subtitle}
            </GradientText>
        );
    };

    const renderHeroVisual = () => {
        if (item.variant === 'reel') {
            return (
                <View style={styles.reelCardShell}>
                    <Image source={item.image} style={styles.reelImage} resizeMode="cover" />
                </View>
            );
        }

        return (
            <View style={styles.plateVisualWrap}>
                {/* <Image source={require('@assets/images/plate_bottom.png')} style={styles.platePattern} resizeMode="contain" /> */}
                <Image source={item.image} style={styles.mainPlateImage} resizeMode="contain" />

                {item.variant === 'plate' ? (
                    <>
                        {/* <View style={styles.floatChipRight}>
                            <Sparkles size={16} color={colors.gradient2} />
                        </View>
                        <View style={styles.floatChipLeft}>
                            <Utensils size={14} color={'#3B82F6'} />
                        </View> */}
                    </>
                ) : null}
            </View>
        );
    };

    return (
        <View style={[styles.container, { width: width }]}>
            {
                !isMiddleSlide ? (
                    <Text style={styles.logo}>FreshBhoj</Text>
                ) : null
            }
            {/* <Text style={styles.logo}>FreshBhoj</Text> */}

            <View style={styles.imageContainer}>
                {renderHeroVisual()}
                {/* {isMiddleSlide || !item.heroTitle ? null : <Text style={styles.heroTitle}>{item.heroTitle}</Text>} */}
            </View>

            <Animated.View
                style={[
                    styles.textContainer,
                    { paddingBottom: spacing.paddings.lg + insets.bottom },
                    cardAnimatedStyle,
                ]}
            >
                <View style={styles.copyBlock}>
                    <Text style={styles.title}>{item.title}</Text>
                    {renderSubtitle()}
                    <Text style={styles.description}>{item.description}</Text>
                </View>

                <View style={styles.controlsBlock}>
                    <OnboardingPaginator
                        data={Array.from({ length: totalSlides })}
                        currentIndex={currentIndex}
                    />
                    <GradientButton
                        title={item.ctaLabel}
                        gradientColors={colors.defaultColor}
                        direction="diagonal"
                        locations={theme.colors.defaultLocations}
                        onPress={onPrimaryPress}
                        style={styles.ctaButton}
                        textStyle={styles.ctaText}
                        rightIcon={<ArrowRight size={18} color={colors.palette.white} />}
                    />

                    <View style={styles.backSlot}>
                        {showBack ? (
                            <Text onPress={onBackPress} style={styles.backText}>Back</Text>
                        ) : null}
                    </View>
                </View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    logo: {
        marginTop: spacing.paddings.lg,
        fontSize: typography.fontSizes.display3,
        color: colors.palette.white,
        fontFamily: typography.fontFamilies.medievalSharp,
        textShadowColor: 'rgba(0,0,0,0.22)',
        textShadowOffset: { width: 0, height: 6 },
        textShadowRadius: 12,
        zIndex: 1,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        paddingHorizontal: spacing.paddings.lg,
    },
    plateVisualWrap: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    platePattern: {
        width: 320,
        height: 320,
        opacity: 0.16,
        position: 'absolute',
    },
    mainPlateImage: {
        width: 400,
        height: 400,
    },
    mainThaliImage: {
        width: 472,
        height: 472,
    },
    heroTitle: {
        position: 'absolute',
        right: 0,
        left: 0,

        // marginTop: spacing.paddings.md,
        color: colors.palette.white,
        fontSize: typography.fontSizes.display1,
        // lineHeight: typography.lineHeights.xxl,
        fontFamily: typography.fontFamilies.aBeeZee.regular,
        // textAlign: 'center',
    },
    floatChipRight: {
        position: 'absolute',
        right: 18,
        top: 24,
        width: 42,
        height: 42,
        borderRadius: spacing.borderRadius.xl,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatChipLeft: {
        position: 'absolute',
        left: 20,
        bottom: 40,
        width: 34,
        height: 34,
        borderRadius: spacing.borderRadius.round,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reelCardShell: {
        width: '100%',
        height: 500,
        marginTop: 100,
        borderRadius: spacing.borderRadius.xxxl,
        overflow: 'hidden',
        zIndex: 0,
    },
    reelImage: {
        width: '100%',
        height: '100%',
        paddingTop: spacing.paddings.sm,
        marginTop: spacing.paddings.xl,
        // ...StyleSheet.absoluteFill,
    },
    textContainer: {
        width: '100%',
        height: height * 0.45,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: spacing.borderRadius.xxxl,
        borderTopRightRadius: spacing.borderRadius.xxxl,
        paddingTop: spacing.paddings.xl,
        paddingHorizontal: spacing.paddings.xl,
        paddingBottom: spacing.paddings.lg,
    },
    copyBlock: {
        width: '100%',
        alignItems: 'center',
        minHeight: 130,
    },
    title: {
        fontSize: typography.fontSizes.display2,
        lineHeight: typography.lineHeights.display1,
        fontFamily: typography.fontFamilies.aBeeZee.regular,
        color: '#111827',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: spacing.paddings.xs,
        fontSize: typography.fontSizes.display2,
        lineHeight: typography.lineHeights.display1,
        fontFamily: typography.fontFamilies.aBeeZee.regular,
        textAlign: 'center',
    },
    description: {
        marginTop: spacing.paddings.md,
        fontSize: typography.fontSizes.xl,
        // lineHeight: typography.lineHeights.,
        fontFamily: typography.fontFamilies.plusJakartaSans.regular,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: spacing.paddings.xs,
    },
    controlsBlock: {
        width: '100%',
        marginTop: 'auto',
        alignItems: 'center',
    },
    ctaButton: {
        width: '100%',
        borderRadius: spacing.borderRadius.xl,
        paddingVertical: spacing.paddings.md,
        marginTop: spacing.paddings.sm,
    },
    ctaText: {
        color: colors.palette.white,
        fontFamily: typography.fontFamilies.plusJakartaSans.semibold,
        fontSize: typography.fontSizes.xxl,
        alignSelf: 'center',
    },
    backText: {
        marginTop: spacing.paddings.sm,
        color: '#9CA3AF',
        fontFamily: typography.fontFamilies.plusJakartaSans.semibold,
        fontSize: typography.fontSizes.lg,
    },
    backSlot: {
        height: 32,
        justifyContent: 'center',
    },
})

export default OnboardingSlide
