import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface HeaderState {
    isVisible: boolean;
    setVisibility: (isVisible: boolean) => void;
}

// 차단할 경로 목록 (키워드 포함 방식)
const BLOCKED_PREFIXES = ["/myPage"];

export const useHeaderStore = create<HeaderState>((set) => ({
    isVisible: true,
    setVisibility: (isVisible) => set({ isVisible }),
}));

export const useHeaderVisibility = () => {
    const location = useLocation();
    const { setVisibility } = useHeaderStore();

    React.useEffect(() => {
        const isBlocked = BLOCKED_PREFIXES.some(prefix => location.pathname.startsWith(prefix));
        setVisibility(!isBlocked); // 일단 경로 기준으로 설정
    }, [location.pathname]);
};


