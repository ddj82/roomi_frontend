import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface IsHostContextType {
    isHost: boolean;
    setIsHost: (status: boolean) => void;
}

export const IsHostContext = createContext<IsHostContextType>({
    isHost: false,
    setIsHost: () => {},
});

export const IsHostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // localStorage에서 초기값을 가져옴
    const [isHost, setIsHost] = useState<boolean>(() => {
        const storedValue = localStorage.getItem("userIsHost");
        return storedValue === "true"; // 문자열 "true"를 boolean으로 변환
    });

    // 상태가 변경될 때 localStorage에 저장
    useEffect(() => {
        localStorage.setItem("userIsHost", isHost.toString());
    }, [isHost]);

    return (
        <IsHostContext.Provider value={{ isHost, setIsHost }}>
            {children}
        </IsHostContext.Provider>
    );
};

export const useIsHost = () => useContext(IsHostContext);
