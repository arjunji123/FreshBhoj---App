import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@app/theme/index';

const LoginFooter = () => {
    return (
        <View style={styles.footerContainer}>
            <Text style={styles.footerText}>By continuing , you agree to our</Text>
            <View style={styles.footerLinksRow}>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>Terms of service</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}> • </Text>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}> • </Text>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>Content Policy</Text>
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
        fontFamily: theme.typography.fontFamilies.inter,
        color: theme.colors.textGray1,
        marginBottom: theme.spacing.paddings.xs,
    },
    footerLinksRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLink: {
        fontSize: theme.typography.fontSizes.xs,
        fontFamily: theme.typography.fontFamilies.inter,
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
