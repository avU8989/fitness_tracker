import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    token: string | null;
}

//create context with default values, any component wrapped inside this context can use or update these values
/*createContext creates an object with two things:
    - AuthContext.Provider - a react component you use to wrap parts of your app and provide data to all children
    - AuthContext.Consumer - a component to consume/read the context 
*/
export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    login: async () => { },
    logout: async () => { },
    token: null,
});

interface AuthProviderProps {
    children: ReactNode;
}


export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        //as I'm relatively new to TypeScript --> was my question: "Why do we define a function inside a useEffect and not outside"
        //on mount load token from AsyncStorage
        //common pattern in react is define an async function inside the effect, then call it --> keeps code encapsulated and clean 
        //if async function uses variable that can change (state, props), defining it inside the useEffect or passing the latest values as arguments is safer
        //if you define function outside without handling the latest values, you rsik using stale data inside your async calls
        const loadToken = async () => {
            const savedToken = await AsyncStorage.getItem('authToken');

            if (savedToken) {
                setToken(savedToken);
            }

        };
        loadToken();
    }, []);
    // [] --> dependency array, it controls when the effect runs

    /*
        useEffect(() => {
        // runs after every render
        });

        useEffect(() => {
        // runs when `someValue` changes
        }, [someValue]);

        useEffect(() => {
        // code runs once, after first render
        }, []);
    */

    const login = async (newToken: string) => {
        //save Token persistently
        await AsyncStorage.setItem('authToken', newToken);

        //update in-memory state
        setToken(newToken);
    }

    const logout = async () => {
        //remove Token persistently
        await AsyncStorage.removeItem('authToken');

        //clear in-memory state
        setToken(null);
    }

    return (
        /*
        AuthContext.Provider lets us share value to all child components that consume this context
        */
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token, //true if token exists, false otherwise
                login,
                logout,
                token,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
