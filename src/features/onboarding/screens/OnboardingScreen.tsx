import { View, StyleSheet } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import OnboardingSlide from '../components/OnboardingSlide'
import { onboardingStore } from '../onboardingStore'
// @ts-ignore
import { onboardingData } from '../constants/onboardingData'

const OnboardingScreen = () => {
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentItem = useMemo(() => onboardingData[currentIndex], [currentIndex]);

    const handlePrimaryAction = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            return;
        }

        onboardingStore.markSeen();
        navigation.navigate('Login');
    }

    const handleBack = () => {
        if (currentIndex === 0) {
            return;
        }

        setCurrentIndex((prev) => prev - 1);
    };

    const handleSkip = () => {
        onboardingStore.markSeen();
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <OnboardingSlide
                item={currentItem}
                itemIndex={currentIndex}
                currentIndex={currentIndex}
                totalSlides={onboardingData.length}
                isActive={true}
                onPrimaryPress={handlePrimaryAction}
                onBackPress={handleBack}
                onSkipPress={handleSkip}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#06120C',
    },
})

export default OnboardingScreen
