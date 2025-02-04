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

    // 특정 URL에서 버튼 숨기기
    const hiddenPaths = ["/host"]; // 숨기고 싶은 경로 추가
    const isVisible = !hiddenPaths.includes(location.pathname);

    return (
        <HeaderBtnContext.Provider value={{ isVisible }}>
            {children}
        </HeaderBtnContext.Provider>
    );
};

// 컨텍스트를 사용하는 커스텀 훅
export const useHeaderBtnContext = () => useContext(HeaderBtnContext);
