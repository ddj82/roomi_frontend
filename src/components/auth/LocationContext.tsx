import React, {createContext, useContext, useState, ReactNode} from "react";

interface LocationContextType {
    selectedLocation: string;
    setSelectedLocation: (date: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({children}: { children: ReactNode }) => {
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    return (
        <LocationContext.Provider value={{selectedLocation, setSelectedLocation}}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocationContext = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error("useLocationContext must be used within a LocationProvider");
    }
    return context;
};
