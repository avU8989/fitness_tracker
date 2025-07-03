import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated } from 'react-native';


type RootStackParamList = {
    SignUpCredentials: undefined;
    SignUpProfile: { email: string; password: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpProfile'>;


const trainingStyles = ['Powerlifting', 'Bodybuilding', 'General Fitness'];
const trainingFrequency = ['1–2 days/week', '3–4 days/week', '5+ days/week'];
const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

export default function SignUpProfileScreen({ route, navigation }: Props) {
    const { email, password } = route.params;

    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [frequency, setFrequency] = useState(trainingFrequency[0]);
    const [experience, setExperience] = useState(experienceLevels[0]);
    const [preference, setPreference] = useState('');
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

    const userData = {
        email,
        password,
        username,
        age: Number(age),
        weight: Number(weight),
    }

    const handleSignUp = () => {
        // Pass collected data or navigate forward
        // e.g. navigation.navigate('NextScreen', { age, weight, style, frequency, experience });
        console.log({ age, weight, preference, frequency, experience });

        //TO-DO LOGIC IMPLEMENTATION
    };

    return (
        <View style={styles.container}>
            <View style={styles.glitchContainer}>
                <Text style={[styles.title, { color: '#00ffcc' }]}>PROFILE SETUP</Text>

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
        </View>
    );
}

const styles = StyleSheet.create({
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

