import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { AUTH_COPY } from '../auth.constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "@app/theme/useTheme";

const { height } = Dimensions.get('window');

const PersonalDetailsHeader = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const insets = useSafeAreaInsets();

    return (
        <View
            // colors={theme.colors.defaultColor}
            // locations={theme.colors.defaultLocations}
            // direction="diagonal"
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <Text style={styles.brandTitle}>{AUTH_COPY.brandTitle}</Text>
        </View>
    );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: {
        height: height * 0.18,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandTitle: {
        fontFamily: theme.typography.fontFamilies.medievalSharp,
        fontSize: theme.typography.fontSizes.display3,
        color: theme.colors.palette.white,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 2, height: 4 },
        textShadowRadius: 10,
    },
});

export default PersonalDetailsHeader;
