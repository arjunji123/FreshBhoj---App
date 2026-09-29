import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, type InitialState } from '@react-navigation/native';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';
import { KitchenPartnerStack } from './kitchenPartner/KitchenPartnerStack';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useKitchenAuthStore } from '@features/kitchenPartner/store/kitchenAuthStore';
import LoginGateSheet from '@features/authentication/components/LoginGateSheet';
import { navigationRef } from './navigationRef';
import MiniCartBar from '@components/MiniCartBar';
import { mmkv } from '@utils/mmkvStorage';
import { PENDING_NAV_RESTORE_KEY } from '@app/theme/commitThemeMode';

/**
 * Only non-null right after a theme-triggered restart (see
 * `commitThemeMode.ts`) — a normal cold launch never has this key set, so
 * every ordinary app open still goes through the regular
 * Public/Onboarding/Home entry flow untouched. One-shot: read once at module
 * load (before the first render, so there's no flash of the default screen
 * first) and immediately cleared so a *later*, unrelated restart (e.g. a
 * crash recovery) never resurrects a stale position.
 */
function consumePendingNavRestore(): InitialState | undefined {
  const raw = mmkv.getString(PENDING_NAV_RESTORE_KEY);
  if (!raw) return undefined;
  mmkv.remove(PENDING_NAV_RESTORE_KEY);
  try {
    return JSON.parse(raw) as InitialState;
  } catch {
    return undefined;
  }
}

const pendingNavRestore = consumePendingNavRestore();

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isKitchenAuthenticated = useKitchenAuthStore((state) => state.isAuthenticated);
  // Captured once per app process (module scope, above) rather than per-mount
  // state, since AppNavigator itself only ever mounts once per process too —
  // but going through useState's lazy initializer keeps this explicit and
  // stable across any parent re-render.
  const [initialState] = useState(pendingNavRestore);

  return (
    <NavigationContainer ref={navigationRef} initialState={initialState}>
      {isKitchenAuthenticated ? (
        // A phone signed in as a kitchen partner never sees the customer app —
        // the two modes are mutually exclusive, kitchen takes priority.
        <KitchenPartnerStack />
      ) : isAuthenticated || isGuest ? (
        <View style={{ flex: 1 }}>
          <PrivateTabs />
          <MiniCartBar />
          <LoginGateSheet />
        </View>
      ) : (
        <PublicStack />
      )}
    </NavigationContainer>
  );
}
