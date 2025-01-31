import React, { createContext, useEffect, useState } from 'react';

interface AuthContextType {
    authToken: string | null;
    setAuthToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
    authToken: null,
    setAuthToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authToken, setAuthToken] = useState<string | null>(null);

    useEffect(() => {
        const loadToken = () => {
            const token = localStorage.getItem('authToken');
            setAuthToken(token);
        };
        loadToken();
    }, []);

    const updateAuthToken = (token: string | null) => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
        setAuthToken(token);
    };

    return (
        <AuthContext.Provider value={{ authToken, setAuthToken: updateAuthToken }}>
            {children} {/* 전달받은 children을 렌더링 */}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
