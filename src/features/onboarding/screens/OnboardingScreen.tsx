import { View, StyleSheet, PanResponder } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import OnboardingSlide from '../components/OnboardingSlide'
import AppGradient from '@components/AppGradient'
import { spacing } from '@app/theme'
import { mmkv, STORAGE_KEYS } from '@utils/mmkvStorage'
// @ts-ignore
import { onboardingData } from '../constants/onboardingData'

const OnboardingScreen = () => {
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentItem = useMemo(() => onboardingData[currentIndex], [currentIndex]);
    const { top } = useSafeAreaInsets();
    const swipeDistanceThreshold = 40;
    const swipeVelocityThreshold = 0.2;

    const handlePrimaryAction = useCallback(() => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            return;
        }

        mmkv.set(STORAGE_KEYS.hasSeenOnboarding, true);
        navigation.navigate('Login');
    }, [currentIndex, navigation]);

    const handleBack = useCallback(() => {
        if (currentIndex === 0) {
            return;
        }

        setCurrentIndex((prev) => prev - 1);
    }, [currentIndex]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 12,
                onPanResponderRelease: (_, gestureState) => {
                    const isSwipeLeft =
                        gestureState.dx < -swipeDistanceThreshold || gestureState.vx < -swipeVelocityThreshold;
                    const isSwipeRight =
                        gestureState.dx > swipeDistanceThreshold || gestureState.vx > swipeVelocityThreshold;

                    if (isSwipeLeft) {
                        handlePrimaryAction();
                        return;
                    }

                    if (isSwipeRight) {
                        handleBack();
                    }
                },
            }),
        [handleBack, handlePrimaryAction],
    );

    return (
        <View style={styles.container}>
            <AppGradient
                locations={[0.09, .48, 1.0]}
                style={{ flex: 1 }}>

                <View style={[styles.safeArea, { paddingTop: top}]}>
                    <View style={styles.listContainer} {...panResponder.panHandlers}>
                        <OnboardingSlide
                            item={currentItem}
                            itemIndex={currentIndex}
                            currentIndex={currentIndex}
                            totalSlides={onboardingData.length}
                            isActive={true}
                            onPrimaryPress={handlePrimaryAction}
                            onBackPress={handleBack}
                        />
                    </View>
                </View>
            </AppGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        paddingTop: spacing.paddings.sm,
    },
})

export default OnboardingScreen
