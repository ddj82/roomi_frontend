import React, {createContext, useContext, useState, ReactNode} from "react";

interface GuestsContextType {
    guestCount: number;
    setGuestCount: React.Dispatch<React.SetStateAction<number>>;
}

const GuestsContext = createContext<GuestsContextType | undefined>(undefined);

export const GuestsProvider = ({children}: { children: ReactNode }) => {
    const [guestCount, setGuestCount] = useState<number>(0);

    return (
        <GuestsContext.Provider value={{guestCount, setGuestCount}}>
            {children}
        </GuestsContext.Provider>
    );
};

export const useGuestsContext = () => {
    const context = useContext(GuestsContext);
    if (!context) {
        throw new Error("useGuestsContext must be used within a GuestsProvider");
    }
    return context;
};
