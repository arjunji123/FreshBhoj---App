import { RouteProp } from '@react-navigation/native';
import { PublicStackParamList } from '@app/navigation/public/PublicStack';
import { z } from 'zod';
import type { UserProfile } from '@api/types';
import { AUTH_COPY, AUTH_VALUES } from './auth.constants';

export const phoneNumberSchema = z
	.string()
	.regex(AUTH_VALUES.phoneDigitsRegex, AUTH_COPY.phoneValidationMessage);

export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

export interface LoginPhoneInputProps {
	value: string;
	onChangeText: (text: string) => void;
}

export interface OTPHeaderProps {
	phoneNumber: string;
}

export interface OTPInputSectionProps {
	onSubmit: (otp: string) => void;
	onResend: () => void;
	/** Rendered under the boxes when the backend rejects the code. */
	errorMessage?: string | null;
	isSubmitting?: boolean;
}

export type OTPScreenRouteProp = RouteProp<PublicStackParamList, 'OTP'>;

export type LocationStoreState = {
	address: string;
	latitude: number;
	longitude: number;
	/** Serviceable locality picked during onboarding, e.g. "Malviya Nagar". */
	locality?: string;
	city?: string;
	pincode?: string;
};

export interface AuthStoreState {
	isAuthenticated?: boolean;
	/** True between OTP verification and profile completion. */
	isProfilePending: boolean;
	user: UserProfile | null;
	phoneNumber: string;
	rememberMe: boolean;
	fullName: string;
	email: string;
	location: LocationStoreState;
	setisAuthenticated: (isAuthenticated: boolean) => void;
	setPhoneNumber: (phoneNumber: string) => void;
	setRememberMe: (rememberMe: boolean) => void;
	setFullName: (fullName: string) => void;
	setEmail: (email: string) => void;
	setLocation: (location: Partial<LocationStoreState>) => void;
	setUser: (user: UserProfile | null) => void;
	/** Stores tokens, hydrates the user, and flips the navigation gate. */
	signIn: (payload: { accessToken: string; refreshToken: string; user: UserProfile; isNewUser: boolean }) => void;
	signOut: () => void;
	reset: () => void;
}
