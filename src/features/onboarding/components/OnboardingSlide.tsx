import { View, Text, Dimensions, StyleSheet } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import { colors, spacing, typography } from '@app/theme';
import { useTheme } from '@app/theme/useTheme';
import OnboardingPaginator from './OnboardingPaginator';
import GradientButton from '@components/GradientButton';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import GradientText from '@components/GradientText';
import type { IllustrationProps } from '@components/illustrations';

export interface OnboardingItem {
    id: string;
    heroTitle: string;
    title: string;
    subtitle?: string;
    description: string;
    /** Animated vector hero for this slide (see src/components/illustrations). */
    Illustration: React.ComponentType<IllustrationProps>;
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

/** Hero illustration edge; the old PNGs were 400dp, capped to the screen width here. */
const HERO_SIZE = Math.min(400, width * 0.96);

const OnboardingSlide = ({ item, itemIndex, currentIndex, totalSlides, isActive, onPrimaryPress, onBackPress }: OnboardingSlideProps) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
        const { Illustration } = item;
        return (
            <View style={styles.plateVisualWrap}>
                <Illustration size={HERO_SIZE} tone="onBrand" />
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
                    { paddingBottom: spacing.paddings.lg + Math.max(insets.bottom, 24) },
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

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
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
    textContainer: {
        width: '100%',
        height: height * 0.45,
        alignItems: 'center',
        backgroundColor: theme.colors.surface.base,
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
        color: theme.colors.text.primary,
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
        color: theme.colors.text.secondary,
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
        color: theme.colors.text.tertiary,
        fontFamily: typography.fontFamilies.plusJakartaSans.semibold,
        fontSize: typography.fontSizes.lg,
    },
    backSlot: {
        height: 32,
        justifyContent: 'center',
    },
})

export default OnboardingSlide
