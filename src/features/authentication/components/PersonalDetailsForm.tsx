import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { User, Mail } from 'lucide-react-native';
import { theme } from '@app/theme/index';

interface PersonalDetailsFormProps {
    fullName: string;
    email: string;
    onFullNameChange: (text: string) => void;
    onEmailChange: (text: string) => void;
    fullNameError?: string;
    emailError?: string;
}

const INPUT_ICON_COLOR = '#94A3B8';
const INPUT_BG = '#F8FAFC';
const INPUT_BORDER = '#E2E8F0';
const LABEL_COLOR = '#334155';
const PLACEHOLDER_COLOR = '#94A3B8';

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
    fullName,
    email,
    onFullNameChange,
    onEmailChange,
    fullNameError,
    emailError,
}) => {
    return (
        <View style={styles.container}>
            {/* Full Name Field */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrapper, fullNameError ? styles.inputWrapperError : null]}>
                    <View style={styles.iconContainer}>
                        <User size={14} color={INPUT_ICON_COLOR} strokeWidth={1.8} />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Rahul Sharma"
                        placeholderTextColor={PLACEHOLDER_COLOR}
                        value={fullName}
                        onChangeText={onFullNameChange}
                        autoCapitalize="words"
                        returnKeyType="next"
                    />
                </View>
                {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
            </View>

            {/* Email Address Field */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
                    <View style={styles.iconContainer}>
                        <Mail size={16} color={INPUT_ICON_COLOR} strokeWidth={1.8} />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="rahul@freshbhoj.com"
                        placeholderTextColor={PLACEHOLDER_COLOR}
                        value={email}
                        onChangeText={onEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="done"
                    />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 32,
        paddingHorizontal: 28,
    },
    fieldContainer: {
        gap: 8,
    },
    label: {
        fontSize: theme.typography.fontSizes.sm,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
        color: LABEL_COLOR,
        paddingLeft: 4,
    },
    inputWrapper: {
        height: 56,
        backgroundColor: INPUT_BG,
        borderWidth: 1,
        borderColor: INPUT_BORDER,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: theme.typography.fontSizes.md,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
        color: '#0F172A',
        padding: 0,
    },
    inputWrapperError: {
        borderColor: theme.colors.error,
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        paddingLeft: 6,
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.error,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    },
});

export default PersonalDetailsForm;
