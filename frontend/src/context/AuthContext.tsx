import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string, username: string) => Promise<void>;
    logout: () => Promise<void>;
    username: string | null;
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
    username: null,
    token: null,
});

interface AuthProviderProps {
    children: ReactNode;
}


export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    useEffect(() => {
        //as I'm relatively new to TypeScript --> was my question: "Why do we define a function inside a useEffect and not outside"
        //on mount load token from AsyncStorage
        //common pattern in react is define an async function inside the effect, then call it --> keeps code encapsulated and clean 
        //if async function uses variable that can change (state, props), defining it inside the useEffect or passing the latest values as arguments is safer
        //if you define function outside without handling the latest values, you rsik using stale data inside your async calls
        const loadToken = async () => {
            const savedToken = await AsyncStorage.getItem('authToken');
            const savedUsername = await AsyncStorage.getItem('username');

            if (savedToken) {
                setToken(savedToken);
            }

            if (savedUsername) {
                setUsername(savedUsername);
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

    const login = async (newToken: string, username: string) => {
        //save Token persistently
        await AsyncStorage.multiSet([
            ["authToken", newToken],
            ["username", username],
        ]);

        //update in-memory state
        setToken(newToken);
        setUsername(username);
    }

    const logout = async () => {
        //remove Token persistently
        await AsyncStorage.multiRemove(["authToken", "username"]);

        //clear in-memory state
        setToken(null);
        setUsername(null);
    }

    return (
        /*
        AuthContext.Provider lets us share value to all child components that consume this context
        */
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token, //true if token exists, false otherwise
                login,
                username,
                logout,
                token,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
