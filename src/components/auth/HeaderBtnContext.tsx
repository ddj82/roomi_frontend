import React, { createContext, useContext, ReactNode } from "react";
import { useLocation } from "react-router-dom";

// 컨텍스트의 기본 구조 정의
interface HeaderBtnContextType {
    isVisible: boolean; // 버튼의 가시성
}

// 기본값 정의
const HeaderBtnContext = createContext<HeaderBtnContextType>({ isVisible: true });

// 차단할 경로 목록 (키워드 포함 방식)
const BLOCKED_KEYWORDS = ["reservation", ];
const BLOCKED_PREFIXES = ["/host", ];

// Provider 컴포넌트
export const HeaderBtnProvider = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const pathSegments = location.pathname.split("/");

    // 차단 조건
    const isBlocked =
        BLOCKED_KEYWORDS.some(keyword => pathSegments.includes(keyword)) || // 특정 키워드 포함 여부 확인
        BLOCKED_PREFIXES.some(prefix => location.pathname.startsWith(prefix)); // 특정 접두사 포함 여부 확인

    const isVisible = !isBlocked;

    return (
        <HeaderBtnContext.Provider value={{ isVisible }}>
            {children}
        </HeaderBtnContext.Provider>
    );
};

// 컨텍스트를 사용하는 커스텀 훅
export const useHeaderBtnContext = () => useContext(HeaderBtnContext);
