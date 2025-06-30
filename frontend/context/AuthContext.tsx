import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    token: string | null;
}

//create context with default values, any component wrapped inside this context can use or update these values
export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    login: async () => { },
    logout: async () => { },
    token: null,
});

