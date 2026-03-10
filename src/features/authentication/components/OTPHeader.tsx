import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import GradientText from '@components/GradientText';
import { theme } from '@app/theme/index';

interface OTPHeaderProps {
    phoneNumber: string;
}

const OTPHeader: React.FC<OTPHeaderProps> = ({ phoneNumber }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
            >
                <ArrowLeft color={theme.colors.palette.white} size={20} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
                <GradientText
                    colors={[theme.colors.textGradient1, theme.colors.textGradient2]}
                    direction="horizontal"
                    style={styles.titleText}
                >
                    OTP Verification
                </GradientText>
            </View>

            <Text style={styles.subtitleText}>
                We have sent a verification code to{'\n'}+91 {phoneNumber}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.screenPadding,
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 70 : 50,
        left: theme.spacing.screenPadding,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.palette.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    titleContainer: {
        marginTop: theme.spacing.paddings.xxxl,
        marginBottom: theme.spacing.paddings.lg,
    },
    titleText: {
        fontSize: theme.typography.fontSizes.display1,
        fontFamily: theme.typography.fontFamilies.adlamDisplay,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: theme.typography.fontSizes.md,
        fontFamily: theme.typography.fontFamilies.mavenPro.medium,
        color: theme.colors.textGray1,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: theme.spacing.paddings.xl,
    },
});

export default OTPHeader;
