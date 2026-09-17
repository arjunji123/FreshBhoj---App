import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, X } from 'lucide-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SheetHandle {
  open: () => void;
  close: () => void;
}

interface SheetProps {
  children: React.ReactNode;
  /** Fraction of screen height, 0–1. Defaults to 0.72. */
  heightRatio?: number;
  title?: string;
  eyebrow?: string;
  onClose?: () => void;
  /** Shows a back button before the title, for a sheet with more than one step. */
  onBack?: () => void;
  closeOnMask?: boolean;
  showHandle?: boolean;
}

/**
 * Shared bottom sheet. Wraps RBSheet with the app's rounded top corners,
 * grab handle and header so every sheet in the product looks the same.
 */
const Sheet = forwardRef<SheetHandle, SheetProps>(
  (
    {
      children,
      heightRatio = 0.72,
      title,
      eyebrow,
      onClose,
      onBack,
      closeOnMask = true,
      showHandle = true,
    },
    ref,
  ) => {
    const sheetRef = useRef<any>(null);
    const insets = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.open(),
      close: () => sheetRef.current?.close(),
    }));

    return (
      <RBSheet
        ref={sheetRef}
        height={SCREEN_HEIGHT * heightRatio}
        openDuration={320}
        closeDuration={260}
        closeOnPressMask={closeOnMask}
        draggable={showHandle}
        onClose={onClose}
        customModalProps={{ statusBarTranslucent: true }}
        customAvoidingViewProps={{ enabled: false }}
        customStyles={{
          wrapper: styles.wrapper,
          container: styles.container,
          draggableIcon: styles.hiddenHandle,
        }}
      >
        {showHandle ? <View style={styles.handle} /> : null}

        {title || eyebrow ? (
          <View style={styles.header}>
            {onBack ? (
              <Pressable
                onPress={onBack}
                hitSlop={theme.layout.hitSlop}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
              >
                <ArrowLeft size={18} color={theme.colors.text.secondary} strokeWidth={2.5} />
              </Pressable>
            ) : null}

            <View style={styles.headerText}>
              {eyebrow ? (
                <Text style={[theme.text.overline, styles.eyebrow]}>{eyebrow}</Text>
              ) : null}
              {title ? (
                <Text style={theme.text.h2} numberOfLines={2}>
                  {title}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => sheetRef.current?.close()}
              hitSlop={theme.layout.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : null]}
            >
              <X size={18} color={theme.colors.text.secondary} strokeWidth={2.5} />
            </Pressable>
          </View>
        ) : null}

        <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, 24) }}>{children}</View>
      </RBSheet>
    );
  },
);

Sheet.displayName = 'Sheet';

export default Sheet;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.overlay.scrim,
  },
  container: {
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    backgroundColor: theme.colors.surface.base,
  },
  hiddenHandle: {
    display: 'none',
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.neutral[200],
    alignSelf: 'center',
    marginTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: theme.colors.primary[600],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
  },
  pressed: {
    opacity: 0.7,
  },
});
