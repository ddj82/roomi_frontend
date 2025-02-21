import { create } from "zustand";

interface AuthState {
    authToken: string | null;
    setAuthToken: (token: string | null) => void;
}

// Zustand Store
export const useAuthStore = create<AuthState>((set) => ({
    authToken: localStorage.getItem("authToken") || null,

    setAuthToken: (token) => {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
        set({ authToken: token });
    },
}));
