import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@app/theme/index';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { AUTH_COPY } from '../auth.constants';

const LoginFooter = () => {
    const {bottom} = useSafeAreaInsets();
    return (
        <View style={[styles.footerContainer, { paddingBottom: bottom }]}>
            <Text style={styles.footerText}>{AUTH_COPY.loginFooterPrefix}</Text>
            <View style={styles.footerLinksRow}>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>{AUTH_COPY.termsOfService}</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}> • </Text>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>{AUTH_COPY.privacyPolicy}</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}> • </Text>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>{AUTH_COPY.contentPolicy}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footerContainer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        fontSize: theme.typography.fontSizes.xs,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
        color: theme.colors.textGray1,
        marginBottom: theme.spacing.paddings.xs,
    },
    footerLinksRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLink: {
        fontSize: theme.typography.fontSizes.xs,
        fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
        color: theme.colors.textGray1,
        fontWeight: theme.typography.fontWeights.medium,
    },
    footerDot: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textGray1,
        marginHorizontal: theme.spacing.paddings.xs,
    },
});

export default LoginFooter;
