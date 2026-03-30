import React, { useState, useRef, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import authNavigation from '../hooks/authNavigation';
import { useAuthStore } from '../store/authStore';

// Theme
import { theme } from '@app/theme/index';

// Components
import PersonalDetailsHeader from '../components/PersonalDetailsHeader';
import PersonalDetailsContent from '../components/PersonalDetailsContent';
import SelectLocationContent from '../components/SelectLocationContent';
import AppGradient from '@components/AppGradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.82;

const PersonalDetails = () => {
  const navigation = authNavigation();
  const sheetRef = useRef<any>(null);
  const [step, setStep] = useState(0); // 0 = Personal Details, 1 = Select Location

  useEffect(() => {
    // Open the bottom sheet on mount
    const timer = setTimeout(() => {
      sheetRef.current?.open();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handlePersonalDetailsSave = () => {
    setStep(1);
  };

  const setIsAuthenticated = useAuthStore((s) => s.setisAuthenticated);

  const handleLocationSave = () => {
    setIsAuthenticated(true);
  };

  const handleBack = () => {
    if (step === 1) {
      setStep(0);
    } else {
      navigation.goBack();
    }
  };

  const headerTitle = step === 0 ? 'Personal Details' : 'Select Location';

  return (
    <AppGradient
      colors={theme.colors.defaultColor}
      locations={theme.colors.defaultLocations}
      direction="diagonal"
      style={styles.screen}>
      {/* Red Gradient Header */}
      <PersonalDetailsHeader />

      <RBSheet
        ref={sheetRef}
        height={SHEET_HEIGHT}
        openDuration={400}
        closeDuration={300}
        closeOnPressMask={false}
        closeOnPressBack={false}
        draggable={true}
        customModalProps={{ statusBarTranslucent: true }}
        customAvoidingViewProps={{ enabled: false }}
        customStyles={{
          wrapper: styles.sheetWrapper,
          container: styles.sheetContainer,
          draggableIcon: styles.draggableIcon,
        }}
      >
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pull Handle */}
          <View style={styles.pullHandle} />

          {/* Top Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>

          {/* Step Content */}
          {step === 0 ? (
            <PersonalDetailsContent
              onSaveAndContinue={handlePersonalDetailsSave}
            />
          ) : (
            <SelectLocationContent
              onSaveAndContinue={handleLocationSave}
            />
          )}
        </KeyboardAwareScrollView>
      </RBSheet>
    </AppGradient>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  sheetWrapper: {
    backgroundColor: 'transparent',
  },
  sheetContainer: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: theme.colors.palette.white,
  },
  draggableIcon: {
    display: 'none',
  },
  pullHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    alignSelf: 'center',
    marginTop: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 36,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
    lineHeight: 28,
  },
});
