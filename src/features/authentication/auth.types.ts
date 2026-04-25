import { RouteProp } from '@react-navigation/native';
import { PublicStackParamList } from '@app/navigation/public/PublicStack';
import { z } from 'zod';
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
	status: 'idle' | 'error' | 'success';
	onOtpChange?: () => void;
	resendInSeconds: number;
	isResendDisabled: boolean;
	remainingAttempts: number;
	isLocked: boolean;
	isSubmitting?: boolean;
	helperText?: string;
}

export type OTPScreenRouteProp = RouteProp<PublicStackParamList, 'OTP'>;

export type LocationStoreState = {
	address: string;
	latitude: number;
	longitude: number;
};

export interface AuthStoreState {
	isAuthenticated?: boolean;
	phoneNumber: string;
	rememberMe: boolean;
	profileImageUri: string;
	fullName: string;
	email: string;
	location: LocationStoreState;
	setisAuthenticated: (isAuthenticated: boolean) => void;
	setPhoneNumber: (phoneNumber: string) => void;
	setRememberMe: (rememberMe: boolean) => void;
	setProfileImageUri: (profileImageUri: string) => void;
	setFullName: (fullName: string) => void;
	setEmail: (email: string) => void;
	setLocation: (location: Partial<LocationStoreState>) => void;
	reset: () => void;
}
