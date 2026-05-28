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
	keepSignedIn: boolean;
	hasHydrated: boolean;
	registrationDraft: RegistrationDraft | null;
	setUser: (user: AuthUser) => void;
	logout: () => void;
	setKeepSignedIn: (keepSignedIn: boolean) => void;
	setHasHydrated: (hasHydrated: boolean) => void;
	setRegistrationDraft: (draft: RegistrationDraft) => void;
	clearRegistrationDraft: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			keepSignedIn: true,
			hasHydrated: false,
			registrationDraft: null,
			setUser: (user) => set({ user, isAuthenticated: true }),
			logout: () => set({ user: null, isAuthenticated: false }),
			setKeepSignedIn: (keepSignedIn) => set({ keepSignedIn }),
			setHasHydrated: (hasHydrated) => set({ hasHydrated }),
			setRegistrationDraft: (draft) => set({ registrationDraft: draft }),
			clearRegistrationDraft: () => set({ registrationDraft: null }),
		}),
		{
			name: "veda_auth",
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				keepSignedIn: state.keepSignedIn,
			}),
		}
	)
);
