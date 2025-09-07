import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Animated,
    Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function SetupScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const glitchAnim = useRef(new Animated.Value(0)).current;
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => {
                        alert('Logged out!');
                    }}
                    style={{ marginRight: 16 }}
                >
                    <Text style={{ color: '#00ffff', fontWeight: 'bold', fontFamily: 'monospace', fontSize: 16 }}>
                        LOGOUT
                    </Text>
                </Pressable>
            ),
        });
    }, [navigation]);

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

    const handleSaveSetup = () => {
        if (!username || !age || !weight) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        // Here you could save the setup info in AsyncStorage or send to backend

        Alert.alert('Setup Saved', `Welcome, ${username}!`);
        // Then navigate somewhere:
        if (navigation) {
            navigation.replace('Main'); // or wherever your main app is
        }
    };

    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => {
                    // Logout logic
                    handleLogout();
                    alert('Logged out!');
                    navigation.replace('Login');
                }}
                style={{
                    position: 'absolute',
                    top: 40,
                    right: 20,
                    zIndex: 10,
                    padding: 8,
                    backgroundColor: 'rgba(0,255,255,0.2)',
                    borderRadius: 6,
                }}
            >
                <Text style={{ color: '#00ffff', fontWeight: 'bold', fontFamily: 'monospace' }}>LOGOUT</Text>
            </Pressable>

            <View style={styles.glitchContainer}>
                <Text style={[styles.title, { color: '#00ffcc' }]}>SETUP</Text>

                <Animated.Text
                    style={[
                        styles.title,
                        styles.glitchText,
                        {
                            color: '#00FFD1',
                            position: 'absolute',
                            transform: [
                                { translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                                { translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                            ],
                            opacity: glitchAnim,
                        },
                    ]}
                >
                    SETUP
                </Animated.Text>



                <Animated.Text
                    style={[
                        styles.title,
                        styles.glitchText,
                        {
                            color: '#00ffff',
                            position: 'absolute',
                            transform: [
                                { translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }) },
                                { translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
                            ],
                            opacity: glitchAnim,
                        },
                    ]}
                >
                    SETUP
                </Animated.Text>
            </View>

            <Text style={styles.label}>USERNAME</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#5599AA"
                autoCapitalize="characters"
                value={username}
                onChangeText={setUsername}
            />

            <Text style={styles.label}>AGE</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor="#5599AA"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
            />

            <Text style={styles.label}>WEIGHT (kg)</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your weight"
                placeholderTextColor="#5599AA"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
            />

            <Pressable style={styles.button} onPress={handleSaveSetup}>
                <Text style={styles.buttonText}>SAVE SETUP</Text>
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
        fontSize: 48,
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

    buttonText: {
        color: '#0a0f1c',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
});
