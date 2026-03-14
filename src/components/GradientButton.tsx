import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
    StyleProp,
} from "react-native";
import { colors, spacing, typography } from "@app/theme";
import AppGradient from "./AppGradient";

type GradientDirection = 'vertical' | 'horizontal' | 'diagonal';

export interface GradientButtonProps extends TouchableOpacityProps {
    title: string;
    /** Gradient color stops. Defaults to theme defaultColor. */
    gradientColors?: string[];
    /** Gradient locations. Defaults to empty array. */
    locations?: number[];
    /** Direction of the gradient. Defaults to 'diagonal'. */
    direction?: GradientDirection;
    /** Element rendered to the left of the title. */
    leftIcon?: React.ReactNode;
    /** Element rendered to the right of the title. */
    rightIcon?: React.ReactNode;
    /** Spacing between icon and title. Defaults to spacing.sm. */
    iconSpacing?: number;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    gradientStyle?: StyleProp<ViewStyle>;
}

const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    gradientColors = colors.defaultColor,
    locations = [0, 0.5, 1],
    direction = 'diagonal',
    leftIcon,
    rightIcon,
    iconSpacing = spacing.sm,
    style,
    textStyle,
    gradientStyle,
    disabled,
    ...rest
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={disabled}
            style={[styles.button, disabled && styles.disabled, style]}
            {...rest}
        >
            <AppGradient
                colors={gradientColors}
                direction={direction}
                locations={locations}
                style={[styles.gradient, gradientStyle]}
            />
            <View style={styles.contentRow}>
                {leftIcon && (
                    <View style={{ marginRight: iconSpacing }}>
                        {leftIcon}
                    </View>
                )}
                <Text style={[styles.title, textStyle]}>{title}</Text>
                {rightIcon && (
                    <View style={{ marginLeft: iconSpacing }}>
                        {rightIcon}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: spacing.borderRadius.xl,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    gradient: {
        ...StyleSheet.absoluteFill,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: colors.palette.white,
        fontSize: typography.fontSizes.md,
        fontFamily: typography.fontFamilies.plusJakartaSans.bold,
    },
    disabled: {
        opacity: 0.6,
    },
});

export default GradientButton;
