import { View, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { spacing, colors } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const ACTIVE_DOT_WIDTH = spacing.paddings.xxl;
const SLOT_WIDTH = ACTIVE_DOT_WIDTH;
const INACTIVE_DOT_WIDTH = spacing.paddings.sm;
const DOT_HEIGHT = spacing.paddings.xs + 2;
const DOT_GAP = spacing.paddings.sm;
const CONTAINER_HEIGHT = spacing.paddings.xxl;
const STEP = SLOT_WIDTH + DOT_GAP;

interface OnboardingPaginatorProps {
    data: any[];
    currentIndex: number;
}

const OnboardingPaginator = ({ data, currentIndex }: OnboardingPaginatorProps) => {
    const translateX = useSharedValue(currentIndex * STEP);

    useEffect(() => {
        translateX.value = withTiming(currentIndex * STEP, {
            duration: 260,
            easing: Easing.out(Easing.cubic),
        });
    }, [currentIndex, translateX]);

    const activeIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View
            style={[
                styles.container,
                {
                    width: data.length * SLOT_WIDTH + Math.max(data.length - 1, 0) * DOT_GAP,
                },
            ]}
        >
            <View style={styles.inactiveRow}>
                {data.map((_, i) => (
                    <View key={i.toString()} style={styles.dotSlot}>
                        <View style={styles.inactiveDot} />
                    </View>
                ))}
            </View>

            <Animated.View style={[styles.activeDotWrap, activeIndicatorStyle]}>
                <AppGradient direction="horizontal" style={styles.activeDot} />
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: CONTAINER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    inactiveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DOT_GAP,
    },
    dotSlot: {
        width: SLOT_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDotWrap: {
        position: 'absolute',
        left: 0,
        top: (CONTAINER_HEIGHT - DOT_HEIGHT) / 2,
    },
    activeDot: {
        width: ACTIVE_DOT_WIDTH,
        height: DOT_HEIGHT,
        borderRadius: spacing.borderRadius.round,
    },
    inactiveDot: {
        width: INACTIVE_DOT_WIDTH,
        height: DOT_HEIGHT,
        borderRadius: spacing.borderRadius.round,
        backgroundColor: colors.palette.gray2,
    }
})

export default OnboardingPaginator
