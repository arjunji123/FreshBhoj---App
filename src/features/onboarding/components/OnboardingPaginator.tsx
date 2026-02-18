import { View, StyleSheet, useWindowDimensions } from 'react-native'
import React from 'react'
import { spacing, colors } from '@app/theme/index';

interface OnboardingPaginatorProps {
    data: any[];
    currentIndex: number;
}

const OnboardingPaginator = ({ data, currentIndex }: OnboardingPaginatorProps) => {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.container}>
            {data.map((_, i) => {
                return (
                    <View
                        key={i.toString()}
                        style={[
                            styles.dot,
                            {
                                width: (width - data.length * 32) / data.length,
                                backgroundColor: i === currentIndex
                                    ? colors.palette.white
                                    : colors.palette.glass
                            }
                        ]}
                    />
                );
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: spacing.paddings.xxxl,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.paddings.lg,
        gap: spacing.paddings.md
    },
    dot: {
        height: 2,
        borderRadius: spacing.borderRadius.xs,
    }
})

export default OnboardingPaginator
