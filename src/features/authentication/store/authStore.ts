import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvZustandStorage } from '@utils/mmkvStorage';
import { AuthStoreState } from '../auth.types';

const initialAuthState = {
	isAuthenticated: false,
	phoneNumber: '',
	rememberMe: false,
	profileImageUri: '',
	fullName: '',
	email: '',
	location: {
		address: '',
		latitude: 0,
		longitude: 0,
	},
};

export const useAuthStore = create<AuthStoreState>()(
	persist(
		(set) => ({
			...initialAuthState,
			setisAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
			setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
			setRememberMe: (rememberMe) => set({ rememberMe }),
			setProfileImageUri: (profileImageUri) => set({ profileImageUri }),
			setFullName: (fullName) => set({ fullName }),
			setEmail: (email) => set({ email }),
			setLocation: (location) => set((state) => ({ location: { ...state.location, ...location } })),
			reset: () => set(initialAuthState),
		}),
		{
			name: 'auth-store',
			storage: createJSONStorage(() => mmkvZustandStorage),
			partialize: (state) => ({
				isAuthenticated: state.isAuthenticated,
				rememberMe: state.rememberMe,
				profileImageUri: state.profileImageUri,
				fullName: state.fullName,
				email: state.email,
				location: state.location,
			}),
		},
	),
);
