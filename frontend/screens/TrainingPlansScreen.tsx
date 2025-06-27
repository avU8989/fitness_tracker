import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

type TrainingPlan = {
    name: string;
    days: string[];
    exercises: string[];
};

export default function TrainingPlansScreen() {
    const trainingPlans: TrainingPlan[] = [
        { name: 'PUSH A1', days: ['MON'], exercises: ['Bench Press', 'Overhead Press'] },
        { name: 'PULL A1', days: ['TUE'], exercises: ['Deadlift', 'Row'] },
        { name: 'LEGS A1', days: ['WED'], exercises: ['Squat', 'Lunges'] },
    ];

    return (
        <View style={styles.root}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>TRAINING PLANS</Text>

                {trainingPlans.map((plan, index) => (
                    <View key={index} style={styles.planBox}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planDetail}>Days: {plan.days.join(', ')}</Text>
                        <Text style={styles.planDetail}>Exercises: {plan.exercises.join(', ')}</Text>
                        <Pressable style={styles.button}>
                            <Text style={styles.buttonText}>EDIT PLAN</Text>
                        </Pressable>
                    </View>
                ))}

                <Pressable style={[styles.button, { marginTop: 20 }]}>
                    <Text style={styles.buttonText}>+ NEW PLAN</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0A0F1C',
        padding: 20,
    },
    container: {
        paddingBottom: 100,
    },
    title: {
        color: '#BFC7D5',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginBottom: 20,
    },
    planBox: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
        padding: 15,
        marginBottom: 15,
    },
    planName: {
        color: '#BFC7D5',
        fontSize: 18,
        fontFamily: 'monospace',
        marginBottom: 5,
    },
    planDetail: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 14,
    },
    button: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#BFC7D5',
        padding: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
    },
});
