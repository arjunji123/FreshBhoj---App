import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { User, Mail } from 'lucide-react-native';
import { useTheme } from '@app/theme/useTheme';

interface PersonalDetailsFormProps {
    fullName: string;
    email: string;
    onFullNameChange: (text: string) => void;
    onEmailChange: (text: string) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
    fullName,
    email,
    onFullNameChange,
    onEmailChange,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const INPUT_ICON_COLOR = theme.colors.text.tertiary;
    const PLACEHOLDER_COLOR = theme.colors.text.tertiary;
    return (
        <View style={styles.container}>
            {/* Full Name Field */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                    <View style={styles.iconContainer}>
                        <User size={14} color={INPUT_ICON_COLOR} strokeWidth={1.8} />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Rahul Sharma"
                        placeholderTextColor={PLACEHOLDER_COLOR}
                        selectionColor={theme.colors.primary[600]}
                        value={fullName}
                        onChangeText={onFullNameChange}
                        autoCapitalize="words"
                        returnKeyType="next"
                    />
                </View>
            </View>

            {/* Email Address Field */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                    <View style={styles.iconContainer}>
                        <Mail size={16} color={INPUT_ICON_COLOR} strokeWidth={1.8} />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="rahul@freshbhoj.com"
                        placeholderTextColor={PLACEHOLDER_COLOR}
                        selectionColor={theme.colors.primary[600]}
                        value={email}
                        onChangeText={onEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="done"
                    />
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
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
        color: theme.colors.text.secondary,
        paddingLeft: 4,
    },
    inputWrapper: {
        height: 56,
        backgroundColor: theme.colors.surface.base,
        borderWidth: 1,
        borderColor: theme.colors.borders.subtle,
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
        color: theme.colors.text.primary,
        padding: 0,
    },
});

export default PersonalDetailsForm;
