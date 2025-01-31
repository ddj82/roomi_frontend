import React, { createContext, useEffect, useState } from 'react';

// Context 타입 정의
interface HostModeContextType {
    hostMode: boolean;
    toggleUserMode: () => void;
}

export const HostModeContext = createContext<HostModeContextType>({
    hostMode: false,
    toggleUserMode: () => {},
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

    return (
        <HostModeContext.Provider value={{ hostMode, toggleUserMode }}>
            {children}
        </HostModeContext.Provider>
    );
};
