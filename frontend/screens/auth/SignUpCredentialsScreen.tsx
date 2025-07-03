import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
    SignUpCredentials: undefined;
    SignUpProfile: { email: string; password: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpCredentials'>;

export default function SignUpCredentialsScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleNext = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        navigation.navigate('SignUpProfile', { email, password });
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: '#00ffcc' }]}>SIGN UP</Text>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Enter your email" placeholderTextColor="#5599AA" />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Enter your password" placeholderTextColor="#5599AA" />

            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm your password" placeholderTextColor="#5599AA" />

            <Pressable style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>NEXT</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 6,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#0A0F1C',
        padding: 20
    },
    label: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        letterSpacing: 3,
        fontSize: 13,
        marginBottom: 6,
        marginTop: 12,
        textTransform: 'uppercase'
    },
    input: {
        borderWidth: 1,
        borderColor: '#00ffcc',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 14
    },
    button: {
        backgroundColor: '#00ffff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20
    },
    buttonText: {
        color: '#0a0f1c',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'monospace',
        letterSpacing: 2
    },
});
