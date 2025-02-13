import React, { createContext, useContext, ReactNode } from "react";
import { useLocation } from "react-router-dom";

// 컨텍스트의 기본 구조 정의
interface HeaderBtnContextType {
    isVisible: boolean; // 버튼의 가시성
}

// 기본값 정의
const HeaderBtnContext = createContext<HeaderBtnContextType>({ isVisible: true });

// Provider 컴포넌트
export const HeaderBtnProvider = ({ children }: { children: ReactNode }) => {
    const location = useLocation();

    // `/host`로 시작하는 모든 경로 차단
    const isVisible = !location.pathname.startsWith("/host");

    return (
        <HeaderBtnContext.Provider value={{ isVisible }}>
            {children}
        </HeaderBtnContext.Provider>
    );
};

// 컨텍스트를 사용하는 커스텀 훅
export const useHeaderBtnContext = () => useContext(HeaderBtnContext);
