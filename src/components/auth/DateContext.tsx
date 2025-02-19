import React, { createContext, useContext, useState, ReactNode } from "react";

interface DateContextType {
    startDate: string | null;
    setStartDate: (date: string | null) => void;
    endDate: string | null;
    setEndDate: (date: string | null) => void;
    calUnit: boolean;
    setCalUnit: (value: boolean) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [calUnit, setCalUnit] = useState(true);

    return (
        <DateContext.Provider value={{ startDate, setStartDate, endDate, setEndDate, calUnit, setCalUnit }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDateContext = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error("useDateContext must be used within a DateProvider");
    }
    return context;
};
