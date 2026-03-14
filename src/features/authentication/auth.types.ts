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
}

export type OTPScreenRouteProp = RouteProp<PublicStackParamList, 'OTP'>;

export interface AuthStoreState {
	phoneNumber: string;
	rememberMe: boolean;
	setPhoneNumber: (phoneNumber: string) => void;
	setRememberMe: (rememberMe: boolean) => void;
	reset: () => void;
}
