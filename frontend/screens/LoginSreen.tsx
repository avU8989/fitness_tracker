import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
                setLoading(false);
                return;
            }

            const data = await response.json();
            await AsyncStorage.setItem('authToken', data.token);
        } catch (err: any) {
            setError('Network error. Please try again');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
                style={[styles.button, !(email && password) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={!(email && password) || loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: {
        borderWidth: 1, borderColor: '#ccc', padding: 12, marginVertical: 8, borderRadius: 8,
    },
    button: {
        backgroundColor: '#00ffcc', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#888',
    },
    buttonText: {
        color: '#0a0f1c', fontWeight: 'bold', fontSize: 16,
    },
    errorText: {
        color: 'red', marginTop: 4,
    },
});