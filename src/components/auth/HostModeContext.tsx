import React, { createContext, useEffect, useState } from 'react';

// Context 타입 정의
interface HostModeContextType {
    hostMode: boolean;
    setHostMode: (status: boolean) => void;
    toggleUserMode: () => void;
    resetUserMode: () => void;
}

export const HostModeContext = createContext<HostModeContextType>({
    hostMode: false,
    setHostMode: () => {},
    toggleUserMode: () => {},
    resetUserMode: () => {},
});

export const HostModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hostMode, setHostMode] = useState<boolean>(false);

    // 저장된 모드 로드
    useEffect(() => {
        const loadHostMode = () => {
            try {
                const storedMode = localStorage.getItem('hostMode');
                if (storedMode !== null) {
                    setHostMode(storedMode === 'true'); // 문자열을 boolean으로 변환
                }
            } catch (error) {
                console.error('호스트 모드 로드 실패:', error);
            }
        };

        loadHostMode();
    }, []);

    // 상태 전환 함수
    const toggleUserMode = () => {
        try {
            setHostMode((prevMode) => {
                const newMode = !prevMode;
                localStorage.setItem('hostMode', newMode.toString()); // 로컬 저장
                return newMode;
            });
        } catch (error) {
            console.error('호스트 모드 저장 실패:', error);
        }
    };

    // 호스트 모드를 초기화하는 함수
    const resetUserMode = () => {
        try {
            localStorage.removeItem('hostMode'); // 로컬 스토리지에서 제거
            setHostMode(false); // 상태 초기화
        } catch (error) {
            console.error('호스트 모드 초기화 실패:', error);
        }
    };

    return (
        <HostModeContext.Provider value={{ hostMode, setHostMode, toggleUserMode, resetUserMode }}>
            {children}
        </HostModeContext.Provider>
    );
};
