import { View, StyleSheet } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import OnboardingSlide from '../components/OnboardingSlide'
import AppGradient from '@components/AppGradient'
import { spacing } from '@app/theme'
// @ts-ignore
import { onboardingData } from '../constants/onboardingData'

const OnboardingScreen = () => {
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentItem = useMemo(() => onboardingData[currentIndex], [currentIndex]);
    const { top } = useSafeAreaInsets();

    const handlePrimaryAction = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            return;
        }

        navigation.navigate('Login');
    }

    const handleBack = () => {
        if (currentIndex === 0) {
            return;
        }

        setCurrentIndex((prev) => prev - 1);
    };

    return (
        <View style={styles.container}>
            <AppGradient
                locations={[0.09, .48, 1.0]}
                style={{ flex: 1 }}>

                <View style={[styles.safeArea, { paddingTop: top}]}>
                    <View style={styles.listContainer}>
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
