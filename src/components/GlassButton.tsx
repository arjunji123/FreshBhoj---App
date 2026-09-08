import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native'
import React from 'react'
import { BlurView } from '@react-native-community/blur';
import { colors, spacing, typography } from '@app/theme/index';
import AppGradient from './AppGradient';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

/**
 * A real frosted-glass ("Liquid Glass") button — a native backdrop blur, a
 * soft diagonal light sheen, and a hairline highlight border, instead of a
 * flat translucent fill. Used for the Skip button over the Login hero image.
 */
const GlassButton = ({ title, onPress, style, textStyle }: GlassButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.container, pressed ? styles.pressed : null, style]}
        >
            <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={14}
                reducedTransparencyFallbackColor="rgba(255,255,255,0.35)"
            />
            <AppGradient
                colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.06)']}
                direction="diagonal"
                style={[StyleSheet.absoluteFill, styles.noPointerEvents]}
            />
            <View style={styles.topHighlight} pointerEvents="none" />
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.paddings.sm, // 8
        paddingHorizontal: spacing.paddings.lg, // 16
        borderRadius: spacing.borderRadius.round,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: spacing.layout.borderWidth,
        borderColor: 'rgba(255,255,255,0.55)',
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.75,
    },
    noPointerEvents: {
        pointerEvents: 'none',
    },
    topHighlight: {
        position: 'absolute',
        top: 0,
        left: 8,
        right: 8,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    text: {
        color: colors.palette.white,
        fontFamily: typography.fontFamilies.plusJakartaSans.semibold,
        fontSize: typography.fontSizes.sm,
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    }
})

export default GlassButton
