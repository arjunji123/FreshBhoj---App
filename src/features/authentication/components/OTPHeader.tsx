import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import GradientText from '@components/GradientText';
import { theme } from '@app/theme/index';
import { AUTH_COPY, AUTH_VALUES } from '../auth.constants';
import { OTPHeaderProps } from '../auth.types';

const OTPHeader: React.FC<OTPHeaderProps> = ({ phoneNumber }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.container, { paddingTop: insets.top + theme.spacing.lg }]}>
            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + theme.spacing.lg }]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
            >
                <ArrowLeft color={theme.colors.palette.white} size={20} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
                <GradientText
                    colors={[theme.colors.palette.gradient7, theme.colors.palette.gradient8]}
                    direction="diagonal"
                    location={AUTH_VALUES.otpHeaderGradientLocations}
                    style={styles.titleText}
                >
                    {AUTH_COPY.otpTitle}
                </GradientText>
            </View>

            <Text style={styles.subtitleText}>
                {AUTH_COPY.otpSubtitlePrefix}{'\n'}{AUTH_COPY.countryCode} {phoneNumber}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.screenPadding,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 0, // overridden inline with insets
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
        fontFamily: theme.typography.fontFamilies.aBeeZee.regular,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: theme.typography.fontSizes.md,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
        color: theme.colors.textGray1,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: theme.spacing.paddings.xl,
    },
});

export default OTPHeader;
