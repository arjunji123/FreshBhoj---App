import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientText from '@components/GradientText';
import { theme } from '@app/theme/index';

const LoginTitle = () => {
    return (
        <>
            <View style={styles.titleContainer}>
                <GradientText
                    colors={[theme.colors.textGradient1, theme.colors.textGradient2]}
                    direction="diagonal"
                    style={styles.titleText}
                >
                    A better way to experience food.
                </GradientText>
            </View>

            <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Log in or sign up</Text>
                <View style={styles.dividerLine} />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.paddings.xl,
    },
    titleText: {
        fontSize: theme.typography.fontSizes.display2,
        fontFamily: theme.typography.fontFamilies.adlamDisplay,
        textAlign: 'center',
        lineHeight: theme.typography.lineHeights.display1,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.paddings.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.palette.gray3,
    },
    dividerText: {
        marginHorizontal: theme.spacing.paddings.sm,
        color: theme.colors.palette.gray4,
        fontFamily: theme.typography.fontFamilies.khula.semibold,
        fontSize: theme.typography.fontSizes.md,
    },
});

export default LoginTitle;
