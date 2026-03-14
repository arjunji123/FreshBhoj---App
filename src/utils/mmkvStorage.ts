import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const mmkv = createMMKV({
	id: 'freshbhoj-storage',
});

export const mmkvZustandStorage: StateStorage = {
	getItem: (name) => {
		const value = mmkv.getString(name);
		return value ?? null;
	},
	setItem: (name, value) => {
		mmkv.set(name, value);
	},
	removeItem: (name) => {
		mmkv.remove(name);
	},
};
