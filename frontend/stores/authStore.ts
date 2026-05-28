import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	schoolName: string;
	city: string;
	avatarId: string;
}

export interface RegistrationDraft {
	name: string;
	email: string;
	password: string;
	schoolName: string;
	city: string;
}

interface AuthStore {
	user: AuthUser | null;
	isAuthenticated: boolean;
	registrationDraft: RegistrationDraft | null;
	setUser: (user: AuthUser) => void;
	logout: () => void;
	setRegistrationDraft: (draft: RegistrationDraft) => void;
	clearRegistrationDraft: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			registrationDraft: null,
			setUser: (user) => set({ user, isAuthenticated: true }),
			logout: () => set({ user: null, isAuthenticated: false }),
			setRegistrationDraft: (draft) => set({ registrationDraft: draft }),
			clearRegistrationDraft: () => set({ registrationDraft: null }),
		}),
		{
			name: "veda_auth",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
