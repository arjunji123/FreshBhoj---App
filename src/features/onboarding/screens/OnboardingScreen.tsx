import { View, Text, StyleSheet, FlatList, Animated, TouchableOpacity } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import OnboardingSlide from '../components/OnboardingSlide'
import OnboardingPaginator from '../components/OnboardingPaginator'
import AppGradient from '@components/AppGradient'
import GlassButton from '@components/GlassButton'
import { colors, spacing, typography } from '@app/theme'
// @ts-ignore
import { onboardingData } from '../constants/onboardingData'

const OnboardingScreen = () => {
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleSkip = () => {
        navigation.navigate('Login');
    }

    return (
        <View style={styles.container}>
            <AppGradient
                locations={[0.09, .48, 1.0]}
                style={{ flex: 1 }}>

                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <Text style={styles.appTitle}>FreshBhoj</Text>
                    </View>

                    <View style={{ flex: 3 }}>
                        <FlatList
                            data={onboardingData}
                            renderItem={({ item }) => <OnboardingSlide item={item} />}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                            bounces={false}
                            keyExtractor={(item) => item.id}
                            scrollEventThrottle={32}
                            onViewableItemsChanged={viewableItemsChanged}
                            viewabilityConfig={viewConfig}
                            ref={slidesRef}
                        />
                    </View>

                    <View style={styles.paginatorContainer}>
                        <OnboardingPaginator data={onboardingData} currentIndex={currentIndex} />
                    </View>

                    <View style={styles.footer}>
                        <GlassButton
                            onPress={handleSkip}
                            title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Skip'}
                        />
                    </View>

                </SafeAreaView>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: spacing.paddings.xxxl
    },
    appTitle: {
        fontSize: typography.fontSizes.display3,
        color: colors.palette.white,
        fontFamily: typography.fontFamilies.medievalSharp,
    },
    paginatorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    footer: {
        paddingVertical: spacing.paddings.xxl,
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '100%',
        paddingHorizontal: spacing.paddings.xxl
    },
})

export default OnboardingScreen
