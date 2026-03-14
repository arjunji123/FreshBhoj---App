import React from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';
import { theme } from '@app/theme/index';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { LoginPhoneInputProps } from '../auth.types';

const LoginPhoneInput: React.FC<LoginPhoneInputProps> = ({ value, onChangeText }) => {
    return (
        <View style={styles.inputWrapper}>
            <View style={styles.countryCodeContainer}>
                <Image
                    source={require('../../../../assets/images/indiaicon.png')}
                    style={styles.flagIcon}
                />
                <Text style={styles.countryCodeText}>{AUTH_COPY.countryCode}</Text>
            </View>
            <View style={styles.inputDivider} />
            <TextInput
                style={styles.textInput}
                placeholder={AUTH_COPY.phonePlaceholder}
                placeholderTextColor={theme.colors.textGray1}
                keyboardType="phone-pad"
                value={value}
                cursorColor={theme.colors.primary}
                onChangeText={onChangeText}
                maxLength={AUTH_VALUES.phoneMaxLength}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.palette.gray2,
        borderRadius: theme.spacing.borderRadius.md,
        marginTop: theme.spacing.paddings.sm,
        paddingHorizontal: theme.spacing.paddings.md,
        backgroundColor: theme.colors.palette.white,
        height: theme.spacing.xxxl,
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    flagIcon: {
        width: 24,
        height: 18,
        marginRight: theme.spacing.paddings.xs,
    },
    countryCodeText: {
        fontSize: theme.typography.fontSizes.lg,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
        color: theme.colors.palette.black,
    },
    inputDivider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.paddings.md,
    },
    textInput: {
        flex: 1,
        fontSize: theme.typography.fontSizes.lg,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
        color: theme.colors.palette.black,
        paddingVertical: 0,
        includeFontPadding: false,
        height: '100%',
        justifyContent: 'center',
        letterSpacing: 0.5,
    },
});

export default LoginPhoneInput;
