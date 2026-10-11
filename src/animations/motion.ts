import { Easing, FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

/** Shared spring / timing feel so every screen moves the same way. */
export const SPRING_PRESS = { damping: 18, stiffness: 420, mass: 0.6 } as const;
export const SPRING_RELEASE = { damping: 11, stiffness: 320, mass: 0.7 } as const;
export const SPRING_POP = { damping: 9, stiffness: 260, mass: 0.7 } as const;
export const EASE_OUT = Easing.out(Easing.cubic);

const STAGGER_MS = 55;
const MAX_STAGGER_ITEMS = 8;

/**
 * Entrance for the Nth item of a list / section stack: rises 14px while
 * fading in, each item slightly after the previous one. Capped so a long
 * list never makes the last row wait a full second to appear.
 */
export const enterRise = (index = 0) =>
  FadeInDown.delay(Math.min(index, MAX_STAGGER_ITEMS) * STAGGER_MS)
    .duration(420)
    .easing(EASE_OUT)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 14 }] });

export const enterFade = (index = 0) =>
  FadeIn.delay(Math.min(index, MAX_STAGGER_ITEMS) * STAGGER_MS).duration(320);

export const enterDrop = (index = 0) =>
  FadeInUp.delay(Math.min(index, MAX_STAGGER_ITEMS) * STAGGER_MS).duration(380).easing(EASE_OUT);

export const enterPop = (index = 0) =>
  ZoomIn.delay(Math.min(index, MAX_STAGGER_ITEMS) * STAGGER_MS).springify().damping(14);
