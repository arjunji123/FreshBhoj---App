import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import { theme } from '@app/theme/index';
import GradientButton from '@components/GradientButton';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { OTPInputSectionProps } from '../auth.types';

const OTPInputSection: React.FC<OTPInputSectionProps> = ({
    onSubmit,
    onResend,
    status,
    onOtpChange,
    resendInSeconds,
    isResendDisabled,
    remainingAttempts,
    isLocked,
    isSubmitting = false,
    helperText,
}) => {
    const [otpValue, setOtpValue] = useState('');
    const shakeX = useRef(new Animated.Value(0)).current;
    const otpOpacity = useRef(new Animated.Value(1)).current;
    const otpScale = useRef(new Animated.Value(1)).current;
    const otpInputRef = useRef<any>(null);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        if (status !== 'error') {
            return;
        }

        setIsResetting(true);
        Animated.sequence([
            Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: -8, duration: 35, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 8, duration: 35, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 0, duration: 30, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(otpOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
                Animated.timing(otpScale, { toValue: 0.94, duration: 120, useNativeDriver: true }),
            ]),
        ]).start(() => {
            otpInputRef.current?.clear?.();
            setOtpValue('');
            onOtpChange?.();

            Animated.parallel([
                Animated.timing(otpOpacity, { toValue: 1, duration: 140, useNativeDriver: true }),
                Animated.timing(otpScale, { toValue: 1, duration: 140, useNativeDriver: true }),
            ]).start(() => {
                setIsResetting(false);
            });
        });
    }, [status, shakeX, otpOpacity, otpScale, onOtpChange]);

    const statusPinContainerStyle = useMemo<any>(() => {
        if (status === 'error') {
            return [styles.pinCodeContainer, styles.errorPinCodeContainer];
        }

        if (status === 'success') {
            return [styles.pinCodeContainer, styles.successPinCodeContainer];
        }

        return styles.pinCodeContainer;
    }, [status]);

    const statusFocusedPinContainerStyle = useMemo(() => {
        if (status === 'error') {
            return styles.errorFocusedPinCodeContainer;
        }

        if (status === 'success') {
            return styles.successFocusedPinCodeContainer;
        }

        return styles.focusedPinCodeContainer;
    }, [status]);

    const handleSubmit = () => {
        onSubmit(otpValue);
    };

    const handleOtpTextChange = (value: string) => {
        setOtpValue(value);
        onOtpChange?.();
    };

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ translateX: shakeX }, { scale: otpScale }], opacity: otpOpacity }}>
                <OtpInput
                    ref={otpInputRef}
                    numberOfDigits={AUTH_VALUES.otpDigits}
                    onTextChange={handleOtpTextChange}
                    focusColor={status === 'error' ? theme.colors.error : status === 'success' ? theme.colors.success : theme.colors.primary}
                    theme={{
                        containerStyle: styles.otpContainer,
                            pinCodeContainerStyle: statusPinContainerStyle,
                        pinCodeTextStyle: styles.pinCodeText,
                        focusedPinCodeContainerStyle: statusFocusedPinContainerStyle,
                    }}
                />
            </Animated.View>

            <View style={styles.resendContainer}>
                <Text style={styles.resendText}>{AUTH_COPY.otpResendPrefix}</Text>
                <TouchableOpacity onPress={onResend} activeOpacity={0.7} disabled={isResendDisabled}>
                    <Text style={[styles.resendLink, isResendDisabled && styles.resendLinkDisabled]}>
                        {isResendDisabled ? `${AUTH_COPY.otpResendAction} in ${resendInSeconds}s` : AUTH_COPY.otpResendAction}
                    </Text>
                    <View style={[styles.resendLine, isResendDisabled && styles.resendLineDisabled]} />
                </TouchableOpacity>
            </View>

            {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

            <Text style={styles.attemptText}>
                {isLocked ? 'Too many failed attempts. Please resend OTP.' : `${remainingAttempts} attempts left`}
            </Text>

            <GradientButton
                title={isSubmitting ? 'Verifying...' : AUTH_COPY.otpSubmit}
                onPress={handleSubmit}
                style={styles.submitButton}
                textStyle={styles.submiteButtonText}
                loading={isSubmitting}
                disabled={otpValue.length < AUTH_VALUES.otpDigits || isResetting || isLocked}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.screenPadding,
        alignItems: 'center',
        width: '100%',
    },
    otpContainer: {
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.paddings.xl,
    },
    pinCodeContainer: {
        width: 45,
        height: 55,
        borderRadius: theme.spacing.borderRadius.md,
        borderColor: theme.colors.border,
        borderWidth: 1,
        backgroundColor: theme.colors.palette.white,
    },
    focusedPinCodeContainer: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    errorPinCodeContainer: {
        borderColor: theme.colors.error,
        borderWidth: 2,
        backgroundColor: '#FFF2F2',
    },
    errorFocusedPinCodeContainer: {
        borderColor: theme.colors.error,
        borderWidth: 2,
        backgroundColor: '#FFF2F2',
    },
    successPinCodeContainer: {
        borderColor: theme.colors.success,
        borderWidth: 2,
        backgroundColor: '#F1FFF3',
    },
    successFocusedPinCodeContainer: {
        borderColor: theme.colors.success,
        borderWidth: 2,
        backgroundColor: '#F1FFF3',
    },
    pinCodeText: {
        fontSize: theme.typography.fontSizes.xl,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
        color: theme.colors.palette.black,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.paddings.xxxl,
    },
    resendText: {
        fontSize: theme.typography.fontSizes.sm,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
        color: theme.colors.textGray1,
    },
    resendLink: {
        fontSize: theme.typography.fontSizes.sm,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
        color: theme.colors.primary,
    },
    resendLinkDisabled: {
        color: theme.colors.palette.gray1,
    },
    resendLine: {
        height: 1,
        backgroundColor: theme.colors.primary,
        width: '100%',
        marginTop: 1,
    },
    resendLineDisabled: {
        backgroundColor: theme.colors.palette.gray1,
    },
    helperText: {
        marginTop: -theme.spacing.paddings.lg,
        marginBottom: theme.spacing.paddings.sm,
        color: theme.colors.error,
        fontSize: theme.typography.fontSizes.sm,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
        textAlign: 'center',
    },
    attemptText: {
        marginBottom: theme.spacing.paddings.md,
        color: theme.colors.textGray1,
        fontSize: theme.typography.fontSizes.sm,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
        textAlign: 'center',
    },
    submitButton: {
        width: '100%',
    },
    submiteButtonText:{
        fontSize: theme.typography.fontSizes.xxl,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    }
});

export default OTPInputSection;
