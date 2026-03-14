import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import { theme } from '@app/theme/index';
import GradientButton from '@components/GradientButton';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { OTPInputSectionProps } from '../auth.types';

const OTPInputSection: React.FC<OTPInputSectionProps> = ({ onSubmit, onResend }) => {
    const [otpValue, setOtpValue] = useState('');

    const handleSubmit = () => {
        onSubmit(otpValue);
    };

    return (
        <View style={styles.container}>
            <OtpInput
                numberOfDigits={AUTH_VALUES.otpDigits}
                onTextChange={setOtpValue}
                focusColor={theme.colors.primary}
                theme={{
                    containerStyle: styles.otpContainer,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
                }}
            />

            <View style={styles.resendContainer}>
                <Text style={styles.resendText}>{AUTH_COPY.otpResendPrefix}</Text>
                <TouchableOpacity onPress={onResend} activeOpacity={0.7}>
                    <Text style={styles.resendLink}>{AUTH_COPY.otpResendAction}</Text>
                    <View style={styles.resendLine} />
                </TouchableOpacity>
            </View>

            <GradientButton
                title={AUTH_COPY.otpSubmit}
                onPress={handleSubmit}
                style={styles.submitButton}
                textStyle={styles.submiteButtonText}
                disabled={otpValue.length < AUTH_VALUES.otpDigits}
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
    resendLine: {
        height: 1,
        backgroundColor: theme.colors.primary,
        width: '100%',
        marginTop: 1,
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
