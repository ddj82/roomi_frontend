import { createContext, useContext, useState, ReactNode } from "react";

// Context 타입 정의
interface DataUpdateContextType {
    dataUpdate: boolean;
    toggleDataUpdate: () => void;
}

// Context 생성
const DataUpdateContext = createContext<DataUpdateContextType | undefined>(undefined);

// Provider 컴포넌트
export const DataUpdateProvider = ({ children }: { children: ReactNode }) => {
    const [dataUpdate, setDataUpdate] = useState(false);

    // 상태 반전 함수
    const toggleDataUpdate = () => {
        setDataUpdate((prev) => !prev);
        console.log('전역 상태 업뎃');
    };

    return (
        <DataUpdateContext.Provider value={{ dataUpdate, toggleDataUpdate }}>
            {children}
        </DataUpdateContext.Provider>
    );
};

// Context 사용을 위한 커스텀 훅
export const useDataUpdate = (): DataUpdateContextType => {
    const context = useContext(DataUpdateContext);
    if (!context) {
        throw new Error("useDataUpdate must be used within a DataUpdateProvider");
    }
    return context;
};
