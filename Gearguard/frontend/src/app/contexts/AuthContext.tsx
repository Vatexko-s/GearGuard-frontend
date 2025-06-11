'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    token: string | null;
    username: string | null;
    setToken: (token: string | null) => void;
    setUsername: (username: string | null) => void;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const router = useRouter();

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch('http://127.0.0.1:8081/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa('Gear_Guard:e3c4fee966668652948bb255b3f352283b67b91886ddf8eaaa7f135e0af0dcd1')}`,
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }

            const data = await response.json();
            setToken(data.token);
            setUsername(data.username); // Store the username
            router.push('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('An unknown error occurred');
            }
        }
    };

    const logout = () => {
        setToken(null);
        setUsername(null); // Clear the username
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ token, username, setToken, setUsername, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};