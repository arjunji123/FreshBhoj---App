import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvZustandStorage } from '@utils/mmkvStorage';
import { queryClient, setSessionExpiredHandler, tokenStore } from '@api';
import { AuthStoreState } from '../auth.types';

const initialAuthState = {
	isAuthenticated: false,
	isProfilePending: false,
	user: null,
	phoneNumber: '',
	rememberMe: false,
	fullName: '',
	email: '',
	location: {
		address: '',
		latitude: 0,
		longitude: 0,
		locality: '',
		city: 'Jaipur',
		pincode: '',
	},
};

export const useAuthStore = create<AuthStoreState>()(
	persist(
		(set) => ({
			...initialAuthState,
			setisAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
			setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
			setRememberMe: (rememberMe) => set({ rememberMe }),
			setFullName: (fullName) => set({ fullName }),
			setEmail: (email) => set({ email }),
			setLocation: (location) => set((state) => ({ location: { ...state.location, ...location } })),
			setUser: (user) => set({ user }),

			signIn: ({ accessToken, refreshToken, user, isNewUser }) => {
				tokenStore.setTokens(accessToken, refreshToken);
				set({
					user,
					phoneNumber: user.phone?.replace('+91', '') ?? '',
					fullName: user.fullName ?? '',
					email: user.email ?? '',
					// A returning user with a completed profile lands straight on Home;
					// a new one is routed through the profile + location steps first.
					isProfilePending: isNewUser || user.status === 'PENDING_PROFILE',
					isAuthenticated: !isNewUser && user.status !== 'PENDING_PROFILE',
				});
			},

			signOut: () => {
				tokenStore.clear();
				// Cached carts and orders belong to the previous session.
				queryClient.clear();
				set({ ...initialAuthState });
			},

			reset: () => set(initialAuthState),
		}),
		{
			name: 'auth-store',
			storage: createJSONStorage(() => mmkvZustandStorage),
			partialize: (state) => ({
				isAuthenticated: state.isAuthenticated,
				isProfilePending: state.isProfilePending,
				user: state.user,
				rememberMe: state.rememberMe,
				phoneNumber: state.phoneNumber,
				fullName: state.fullName,
				email: state.email,
				location: state.location,
			}),
		},
	),
);

/**
 * When a refresh token finally expires the API client can't navigate, so it
 * calls back here and the navigation gate does the rest.
 */
setSessionExpiredHandler(() => {
	useAuthStore.getState().signOut();
});
