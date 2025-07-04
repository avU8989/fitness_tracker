import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/authService';

export default function LoginScreen({ navigation }) {
    const { login: contextLogin } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const glitchAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glitchAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(glitchAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(glitchAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.timing(glitchAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.delay(2000),
            ])
        ).start();
    }, []);

    const handleLogin = async () => {
        try {
            setError('');
            const data = await login(email, password);
            await contextLogin(data.token);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSignUp = () => {
        // Navigate to SignUp screen or show signup modal
        if (navigation) {
            navigation.navigate('SignUpCredentials');
        } else {
            alert('Sign Up action not implemented yet.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.glitchContainer}>
                <Text style={[styles.title, { color: '#00ffcc' }]}>HARDLOGGER</Text>

                <Animated.Text
                    style={[
                        styles.title,
                        styles.glitchText,
                        {
                            color: '#00FFD1   ',
                            position: 'absolute',
                            transform: [
                                {
                                    translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }),
                                },
                                {
                                    translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                                },
                            ],
                            opacity: glitchAnim,
                        },
                    ]}
                >
                    HARDLOGGER
                </Animated.Text>

                <Animated.Text
                    style={[
                        styles.title,
                        styles.glitchText,
                        {
                            color: '#00ffff',
                            position: 'absolute',
                            transform: [
                                {
                                    translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }),
                                },
                                {
                                    translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }),
                                },
                            ],
                            opacity: glitchAnim,
                        },
                    ]}
                >
                    HARDLOGGER
                </Animated.Text>

            </View>

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#5599AA"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#5599AA"
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
                {loading ? (
                    <ActivityIndicator color="#0a0f1c" />
                ) : (
                    <Text style={styles.buttonText}>LOG IN</Text>
                )}
            </Pressable>

            <Text style={styles.signUpPrompt}>Don't have an account? Click here</Text>

            <Pressable style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={styles.signUpText}>SIGN UP</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0A0F1C' },

    glitchContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginBottom: 40,
    },

    title: {
        fontSize: 46,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 6,
        textAlign: 'center',
    },

    glitchText: {
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },

    label: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        letterSpacing: 3,
        fontSize: 13,
        marginBottom: 6,
        marginTop: 12,
        textTransform: 'uppercase',
    },

    input: {
        borderWidth: 1,
        borderColor: '#00ffcc',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 14,
    },

    button: {
        backgroundColor: '#00ffff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },

    buttonDisabled: {
        backgroundColor: '#555',
    },

    buttonText: {
        color: '#0a0f1c',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },

    errorText: {
        color: 'red',
        marginTop: 4,
        fontFamily: 'monospace',
        textAlign: 'center',
    },

    signUpButton: {
        marginTop: 12,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ff4444',
        backgroundColor: '#0A0F1C',
    },

    signUpPrompt: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 1,
        marginTop: 16,
        marginBottom: 6,
        textAlign: 'center',
        opacity: 0.7,
    },

    signUpText: {
        color: '#ff4444',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
});
