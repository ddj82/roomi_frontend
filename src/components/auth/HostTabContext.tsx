import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";

// Context 타입 정의
interface HostTabContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

// Context 생성
const HostTabContext = createContext<HostTabContextType | undefined>(undefined);

// Provider 컴포넌트
export const HostTabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState("my_room"); // 초기값
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 현재 URL이 "/host"가 아니면 "/host"로 강제 이동
        if (location.pathname !== "/host" && location.pathname.startsWith("/host/")) {
            navigate("/host", { replace: true });
        }
    }, [activeTab])

    return (
        <HostTabContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </HostTabContext.Provider>
    );
};

// Context 사용을 위한 커스텀 훅
export const useHostTab = (): HostTabContextType => {
    const context = useContext(HostTabContext);
    if (!context) {
        throw new Error("useHostTab must be used within a HostTabProvider");
    }
    return context;
};
