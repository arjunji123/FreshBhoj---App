import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvZustandStorage } from '@utils/mmkvStorage';
import { AuthStoreState } from '../auth.types';

const initialAuthState = {
	phoneNumber: '',
	rememberMe: false,
};

export const useAuthStore = create<AuthStoreState>()(
	persist(
		(set) => ({
			...initialAuthState,
			setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
			setRememberMe: (rememberMe) => set({ rememberMe }),
			reset: () => set(initialAuthState),
		}),
		{
			name: 'auth-store',
			storage: createJSONStorage(() => mmkvZustandStorage),
			partialize: (state) => ({
				phoneNumber: state.phoneNumber,
				rememberMe: state.rememberMe,
			}),
		},
	),
);
