import React, { createContext, useContext, ReactNode } from "react";
import { useLocation } from "react-router-dom";

// 컨텍스트의 기본 구조 정의
interface HeaderBtnContextType {
    isVisibleHostScreen: boolean; // 버튼의 가시성
}

// 기본값 정의
const HostHeaderBtnContext = createContext<HeaderBtnContextType>({ isVisibleHostScreen: false });

const ALLOWED_PREFIX = "/host"; // 허용할 경로

// Provider 컴포넌트
export const HostHeaderBtnProvider = ({ children }: { children: ReactNode }) => {
    const location = useLocation();

    // `/host` 경로가 아니면 차단
    const isBlocked = !location.pathname.startsWith(ALLOWED_PREFIX);

    const isVisibleHostScreen = !isBlocked;

    return (
        <HostHeaderBtnContext.Provider value={{ isVisibleHostScreen }}>
            {children}
        </HostHeaderBtnContext.Provider>
    );
};

// 컨텍스트를 사용하는 커스텀 훅
export const useHostHeaderBtnContext = () => useContext(HostHeaderBtnContext);
