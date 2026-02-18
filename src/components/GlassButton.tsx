import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import React from 'react'
import { colors, spacing, typography } from '@app/theme/index';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const GlassButton = ({ title, onPress, style, textStyle }: GlassButtonProps) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.glass,
        paddingVertical: spacing.paddings.sm, // 8
        paddingHorizontal: spacing.paddings.lg, // 16
        borderRadius: spacing.borderRadius.round,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: spacing.layout.borderWidth,
        borderColor: colors.palette.gradient4,
    },
    text: {
        color: colors.palette.white,
        fontWeight: typography.fontWeights.semiBold,
        fontSize: typography.fontSizes.sm
    }
})

export default GlassButton
