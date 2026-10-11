import { useCallback, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

/** Visual height of the floating pill. */
export const TAB_BAR_HEIGHT = 64;
/** Minimum gap between the pill and the bottom screen edge. */
export const TAB_BAR_MIN_BOTTOM_GAP = 16;
/** Breathing room kept between content / floating UI and the pill's top edge. */
const TAB_BAR_TOP_GAP = 12;

/** Shared show/hide timing — no overshoot. */
export const TAB_BAR_TOGGLE = { duration: 240, easing: Easing.out(Easing.cubic) } as const;

const HIDE_AFTER_Y = 40;
const DELTA_THRESHOLD = 8;

type TabBarVisibilityState = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

export const useTabBarVisibility = create<TabBarVisibilityState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set((s) => (s.hidden === hidden ? s : { hidden })),
}));

/** Gap between the pill's bottom edge and the screen bottom. */
export function useTabBarBottomGap(): number {
  const { bottom } = useSafeAreaInsets();
  return Math.max(bottom, TAB_BAR_MIN_BOTTOM_GAP);
}

/**
 * Total vertical space the floating pill occupies from the screen bottom
 * (bar + gap below + breathing room). Tab screens add this to their scroll
 * content's bottom padding because the bar floats over them.
 */
export function useTabBarFootprint(): number {
  return TAB_BAR_HEIGHT + useTabBarBottomGap() + TAB_BAR_TOP_GAP;
}

/**
 * Returns a plain JS `onScroll` handler (use with `scrollEventThrottle={16}`)
 * that hides the tab bar while scrolling down and shows it while scrolling up.
 * Also re-shows the bar whenever the host screen regains focus.
 */
export function useTabBarScrollHandler() {
  const lastY = useRef(0);
  const travelled = useRef(0);

  useFocusEffect(
    useCallback(() => {
      lastY.current = 0;
      travelled.current = 0;
      useTabBarVisibility.getState().setHidden(false);
    }, []),
  );

  return useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const y = contentOffset.y;
    const { setHidden } = useTabBarVisibility.getState();

    if (y <= 0) {
      lastY.current = 0;
      travelled.current = 0;
      setHidden(false);
      return;
    }
    // Bottom rubber-band: ignore overscroll so the bounce-back does not
    // register as an upward scroll.
    const maxY = Math.max(0, contentSize.height - layoutMeasurement.height);
    if (y > maxY) return;

    const dy = y - lastY.current;
    lastY.current = y;
    // A direction change restarts the accumulated travel, filtering jitter.
    if (dy === 0 || Math.sign(dy) !== Math.sign(travelled.current)) travelled.current = 0;
    travelled.current += dy;

    if (travelled.current > DELTA_THRESHOLD && y > HIDE_AFTER_Y) {
      setHidden(true);
      travelled.current = 0;
    } else if (travelled.current < -DELTA_THRESHOLD) {
      setHidden(false);
      travelled.current = 0;
    }
  }, []);
}
