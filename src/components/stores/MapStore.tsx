import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface MapStore {
    isMapVisible: boolean;
    setMapVisibility: (isVisible: boolean) => void;
}

// 차단할 경로 목록 (키워드 포함 방식)
const BLOCKED_PREFIXES = ["/map"];

export const useMapStore = create<MapStore>((set) => ({
    isMapVisible: true,
    setMapVisibility: (isMapVisible) => set({ isMapVisible }),
}));

export const useMapVisibility = () => {
    const location = useLocation();
    const { setMapVisibility } = useMapStore();

    React.useEffect(() => {
        const isBlocked = BLOCKED_PREFIXES.some(prefix => location.pathname.startsWith(prefix));
        setMapVisibility(!isBlocked); // 일단 경로 기준으로 설정
    }, [location.pathname]);

    return useMapStore((state) => state.isMapVisible);
};


