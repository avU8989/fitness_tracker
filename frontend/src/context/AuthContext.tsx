import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from "react-native-keychain"

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string, email: string) => Promise<void>;
    logout: () => Promise<void>;
    token: string | null;
    loading: boolean;
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
    loading: true,
});

interface AuthProviderProps {
    children: ReactNode;
}


export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //as I'm relatively new to TypeScript --> was my question: "Why do we define a function inside a useEffect and not outside"
        //on mount load token from AsyncStorage
        //common pattern in react is define an async function inside the effect, then call it --> keeps code encapsulated and clean 
        //if async function uses variable that can change (state, props), defining it inside the useEffect or passing the latest values as arguments is safer
        //if you define function outside without handling the latest values, you rsik using stale data inside your async calls
        const loadToken = async () => {
            try {
                const credentials = await Keychain.getGenericPassword({ service: "com.example.session" });

                if (credentials) {
                    setToken(credentials.password);
                } else {
                    console.warn("No stored credentials");
                }
            } catch (e) {
                console.error("Failed to load credentials");
            } finally {
                setLoading(false);
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

    const login = async (newToken: string, email: string) => {
        //store the token credentials
        await Keychain.setGenericPassword(email, newToken, {
            service: "com.example.session",
            accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
            storage: Keychain.STORAGE_TYPE.AES_GCM
        });

        setToken(newToken);
    }

    const logout = async () => {
        try {
            //remove Token persistently
            await Keychain.resetGenericPassword({ service: "com.example.session" })

        } catch (e) {
            console.error("Failed to clear credentials list")
        } finally {
            //clear in-memory state
            setToken(null);
        }
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
                loading
            }}>
            {children}
        </AuthContext.Provider>
    );
}
