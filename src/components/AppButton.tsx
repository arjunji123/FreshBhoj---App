import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
    Image,
    ImageStyle,
    StyleProp,
} from 'react-native';
import { theme } from '@app/theme/index';

export interface AppButtonProps extends TouchableOpacityProps {
    title: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    showOverlay?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({
    title,
    style,
    textStyle,
    imageStyle,
    showOverlay = true,
    disabled,
    ...rest
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                disabled && styles.disabled,
                style,
            ]}
            disabled={disabled}
            activeOpacity={0.8}
            {...rest}
        >
            {showOverlay && (
                <Image
                    source={require('../../assets/images/buttonoverlay.png')}
                    style={[styles.overlayImage, imageStyle]}
                    resizeMode="cover"
                />
            )}
            <Text style={[styles.title, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.spacing.borderRadius.xl,
        paddingVertical: theme.spacing.paddings.lg,
        paddingHorizontal: theme.spacing.paddings.xl,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'row',
    },
    title: {
        color: theme.colors.background,
        fontSize: theme.typography.fontSizes.lg,
        fontFamily: theme.typography.fontFamilies.mavenPro,
        fontWeight: '600',
        zIndex: 1,
    },
    disabled: {
        opacity: 0.6,
    },
    overlayImage: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '50%', // Covers right portion based on visual
        height: '100%',
    },
});

export default AppButton;
