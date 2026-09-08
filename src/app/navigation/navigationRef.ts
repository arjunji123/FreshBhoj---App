import { createNavigationContainerRef } from '@react-navigation/native';
import type { PrivateStackParamList } from './navigation.types';

/**
 * Lets components mounted outside the navigator tree (e.g. the global
 * `MiniCartBar`) navigate and read the active route without being a screen.
 */
export const navigationRef = createNavigationContainerRef<PrivateStackParamList>();

/** Walks nested navigator state down to the deepest focused route name. */
export function getActiveRouteNames(state: ReturnType<typeof navigationRef.getRootState> | undefined): string[] {
  if (!state || state.index == null) return [];
  const route = state.routes[state.index] as { name: string; state?: typeof state };
  if (route.state) return [route.name, ...getActiveRouteNames(route.state)];
  return [route.name];
}
