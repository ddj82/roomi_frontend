import {create} from "zustand";

interface IsMobileState {
    isMobile: boolean;
    setIsMobile: (value: boolean) => void;
}

export const useIsMobileStore = create<IsMobileState>((set) => ({
    isMobile: window.innerWidth < 768,
    setIsMobile: (value) => set({isMobile: value}),
}));