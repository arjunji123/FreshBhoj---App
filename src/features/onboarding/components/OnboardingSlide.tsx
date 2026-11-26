import { View, Text, StyleSheet, ImageSourcePropType, Pressable, useWindowDimensions } from 'react-native';
import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import AppGradient from '@components/AppGradient';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';

export interface OnboardingItem {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    /** Real food photograph, shown full-bleed behind the copy. */
    photo: ImageSourcePropType;
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
    onSkipPress?: () => void;
}

const OnboardingSlide = ({ item, itemIndex, totalSlides, onPrimaryPress, onBackPress, onSkipPress }: OnboardingSlideProps) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const isLast = itemIndex === totalSlides - 1;

    return (
        <View style={styles.container}>
            <Animated.Image
                key={item.id}
                entering={FadeIn.duration(350)}
                source={item.photo}
                style={{ position: 'absolute', width, height }}
                resizeMode="cover"
            />
            {/* Top scrim keeps the logo/Skip legible; bottom scrim carries the copy. */}
            <AppGradient
                colors={['rgba(6,18,12,0.55)', 'rgba(6,18,12,0)']}
                direction="vertical"
                style={[styles.scrimTop, { height: 160 + insets.top }]}
                pointerEvents="none"
            />
            <AppGradient
                colors={['rgba(6,18,12,0)', 'rgba(6,18,12,0.72)', 'rgba(6,18,12,0.96)']}
                locations={[0, 0.5, 1]}
                direction="vertical"
                style={styles.scrimBottom}
                pointerEvents="none"
            />

            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.logo}>FreshBhoj</Text>
                {!isLast ? (
                    <Pressable onPress={onSkipPress} hitSlop={12} accessibilityRole="button" accessibilityLabel="Skip">
                        <Text style={styles.skip}>Skip</Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 20 }]}>
                <Animated.View key={`${item.id}-copy`} entering={FadeInDown.duration(380)}>
                    <View style={styles.eyebrowPill}>
                        <Text style={styles.eyebrowText}>{item.eyebrow}</Text>
                    </View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </Animated.View>

                <View style={styles.footer}>
                    <View style={styles.dots}>
                        {Array.from({ length: totalSlides }).map((_, i) => (
                            <View key={i} style={[styles.dot, i === itemIndex ? styles.dotActive : null]} />
                        ))}
                    </View>
                    <View style={styles.actions}>
                        {itemIndex > 0 ? (
                            <Pressable onPress={onBackPress} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
                                <Text style={styles.back}>Back</Text>
                            </Pressable>
                        ) : (
                            <View />
                        )}
                        <PressableScale onPress={onPrimaryPress} scaleTo={0.97} accessibilityRole="button" style={styles.cta}>
                            <Text style={styles.ctaText}>{item.ctaLabel}</Text>
                            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
                        </PressableScale>
                    </View>
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#06120C' },
    scrimTop: { position: 'absolute', top: 0, left: 0, right: 0 },
    scrimBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '62%' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    logo: {
        fontFamily: theme.typography.fontFamilies.medievalSharp,
        fontSize: 30,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    skip: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '700' },
    bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24 },
    eyebrowPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(52,201,138,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(52,201,138,0.55)',
        marginBottom: 14,
    },
    eyebrowText: { color: '#7DE3B2', fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
    title: { color: '#FFFFFF', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.6 },
    description: { color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 24, marginTop: 12 },
    footer: { marginTop: 28, gap: 22 },
    dots: { flexDirection: 'row', gap: 6 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
    dotActive: { width: 26, backgroundColor: '#34C98A' },
    actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    back: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700', paddingVertical: 12 },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 28,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary[600],
    },
    ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});

export default OnboardingSlide;
