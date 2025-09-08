import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { register } from '../../services/authService';
import { RegistrationRequest } from '../../types/auth';
import type { RootStackParameterList } from '../../navigation/navtypes';

type Props = NativeStackScreenProps<RootStackParameterList, 'SignUpProfile'>;


const trainingStyles = ['Powerlifting', 'Bodybuilding', 'General Fitness'];
const trainingFrequency = ['1–2 days/week', '3–4 days/week', '5+ days/week'];
const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

export default function SignUpProfileScreen({ route, navigation }: Props) {
    const { username, email, password } = route.params;
    const { login: contextLogin } = useContext(AuthContext);
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [frequency, setFrequency] = useState(trainingFrequency[0]);
    const [experience, setExperience] = useState(experienceLevels[0]);
    const [preference, setPreference] = useState('');
    const glitchAnim = useRef(new Animated.Value(0)).current;
    const [height, setHeight] = useState('');
    const [error, setError] = useState('');

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

    const handleSignUp = async () => {
        const registerForm: RegistrationRequest = {
            username: username,
            email: email,
            password: password,
            age: Number(age),
            height: Number(height),
            weight: Number(weight),
        };
        try {
            const data = await register(registerForm);
            await contextLogin(data.token);
        } catch (err: any) {
            if (err.errors && err.errors.length > 0) {
                setError(err.errors[0]); // show first validation error message
            } else if (err.message) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.glitchContainer}>
                <Text style={[styles.title, { color: '#00ffcc' }]}>PROFILE SETUP</Text>
                {!!error && <Text style={styles.errorText}>{error}</Text>}

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
                    PROFILE SETUP
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
                    PROFILE SETUP
                </Animated.Text>
            </View>

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

            <Text style={styles.label}>HEIGHT (cm)</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your height"
                placeholderTextColor="#5599AA"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
            />

            <Text style={styles.label}>PREFERRED TRAINING STYLE</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={preference}
                    onValueChange={setPreference}
                    style={styles.picker}
                    dropdownIconColor="#00ffcc"
                >
                    {trainingStyles.map((item) => (
                        <Picker.Item key={item} label={item} value={item} color="#00ffcc" />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>TRAINING FREQUENCY</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={frequency}
                    onValueChange={setFrequency}
                    style={styles.picker}
                    dropdownIconColor="#00ffcc"
                >
                    {trainingFrequency.map((item) => (
                        <Picker.Item key={item} label={item} value={item} color="#00ffcc" />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>EXPERIENCE LEVEL</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={experience}
                    onValueChange={setExperience}
                    style={styles.picker}
                    dropdownIconColor="#00ffcc"
                >
                    {experienceLevels.map((item) => (
                        <Picker.Item key={item} label={item} value={item} color="#00ffcc" />
                    ))}
                </Picker>
            </View>

            <Pressable style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>SIGN UP</Text>
            </Pressable>
        </View >
    );
}

const styles = StyleSheet.create({

    errorText: {
        color: '#ff4444',           // bright red neon color for errors
        fontFamily: 'monospace',    // match your monospace theme
        fontSize: 14,               // readable size
        marginTop: 8,               // space above error message
        marginBottom: 8,            // space below error message
        textAlign: 'center',        // center aligned for better look
        textShadowColor: '#880000', // subtle shadow for neon glow effect
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 5,
    },

    container: { flex: 1, backgroundColor: '#0A0F1C', padding: 20, justifyContent: 'center' },

    glitchContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginBottom: 30,
    },

    title: {
        fontSize: 42,
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
        letterSpacing: 2,
        fontSize: 12,
        marginBottom: 6,
        marginTop: 12,
        textTransform: 'uppercase',
    },

    input: {
        borderWidth: 1,
        borderColor: '#00ffcc',
        borderRadius: 8,
        padding: 12,
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#BFC7D5',
        marginBottom: 8,
    },

    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#00ffcc',
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },

    picker: {
        color: '#00ffcc',
        fontFamily: 'monospace',
    },

    button: {
        backgroundColor: '#00ffff',
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
        alignItems: 'center',
    },

    buttonText: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 16,
        color: '#0a0f1c',
    },
});

