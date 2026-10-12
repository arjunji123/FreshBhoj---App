import React, { useMemo } from 'react';
import { View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useTheme } from '@app/theme/useTheme';
import { useThemeStore } from '@app/theme/themeStore';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';
import { KitchenPartnerStack } from './kitchenPartner/KitchenPartnerStack';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useKitchenAuthStore } from '@features/kitchenPartner/store/kitchenAuthStore';
import LoginGateSheet from '@features/authentication/components/LoginGateSheet';
import { navigationRef } from './navigationRef';
import MiniCartBar from '@components/MiniCartBar';

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isKitchenAuthenticated = useKitchenAuthStore((state) => state.isAuthenticated);
  const theme = useTheme();
  const isDark = useThemeStore((state) => state.resolvedScheme) === 'dark';

  // Without this, React Navigation paints its own light default behind every
  // screen (visible during transitions and on screens with no own background).
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary[600],
        background: theme.colors.surface.page,
        card: theme.colors.surface.base,
        text: theme.colors.text.primary,
        border: theme.colors.borders.subtle,
      },
    };
  }, [isDark, theme]);

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
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
