import React, { useState, useContext } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { sanitizeTrainingPlanData, validateTrainingPlanData } from '../../utils/formHelpers';
import { Exercise, WorkoutDay } from '../../requests/trainingPlan';
import { AuthContext } from '../../context/AuthContext';
import { createTrainingPlan } from '../../services/trainingPlanService';

const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

const units = ['kg', 'lbs'];

//MODAL FOR CREATING TRAINING PLANS
export default function TrainingPlanModal({ visible, onClose, onSave }) {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [days, setDays] = useState<WorkoutDay[]>(
        daysOfWeek.map(day => ({
            dayOfWeek: day,
            splitType: '',
            exercises: [],
        }))
    );
    const [loading, setLoading] = useState(false);

    // Update day splitType
    const updateDayField = (index, value) => {
        const newDays = [...days];
        newDays[index].splitType = value.toUpperCase();
        setDays(newDays);
    };

    // Add new exercise to a day
    const addExercise = (dayIndex) => {
        const newDays = [...days];
        newDays[dayIndex].exercises.push({
            name: '',
            sets: '',
            repetitions: '',
            weight: '',
            unit: 'kg',
        });
        setDays(newDays);
    };

    // Update exercise field
    type ExerciseField = keyof Exercise;

    const updateExercise = (
        dayIndex: number,
        exIndex: number,
        field: ExerciseField,
        value: string
    ) => {
        const newDays = [...days];

        if (field === "sets" || field === "repetitions" || field === "weight") {
            newDays[dayIndex].exercises[exIndex][field] = Number(value);
        } else if (field === "unit") {
            const unitValue = value.toLowerCase();
            if (unitValue === "kg" || unitValue === "lbs") {
                newDays[dayIndex].exercises[exIndex].unit = unitValue;
            }
        } else {
            newDays[dayIndex].exercises[exIndex][field] = value;
        }

        setDays(newDays);
    };


    // Remove exercise
    const removeExercise = (dayIndex, exIndex) => {
        const newDays = [...days];
        newDays[dayIndex].exercises.splice(exIndex, 1);
        setDays(newDays);
    };

    // Validate & Save
    const handleSave = async () => {
        const sanitizedDays = sanitizeTrainingPlanData(days);
        const validation = validateTrainingPlanData(name, sanitizedDays);

        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        if (!token) {
            alert('You must be logged in to create a plan.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: name.trim(),
                days: sanitizedDays,
            };

            const response = await createTrainingPlan(token, payload);

            alert('Training plan created successfully!');

            onSave({ name: name.trim(), days: sanitizedDays });
            // Reset form
            setName('');
            setDays(daysOfWeek.map(day => ({
                dayOfWeek: day,
                splitType: '',
                exercises: [],
            })));
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to create training plan');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName('');
        setDays(daysOfWeek.map(day => ({
            dayOfWeek: day,
            splitType: '',
            exercises: [],
        })));
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>▓ CREATE NEW TRAINING PLAN ▓</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Plan Name"
                        placeholderTextColor="#555"
                        value={name}
                        onChangeText={setName}
                    />

                    <ScrollView style={styles.daysContainer} nestedScrollEnabled>
                        {days.map((day, dayIndex) => (
                            <View key={day.dayOfWeek} style={styles.dayBlock}>
                                <Text style={styles.dayLabel}>{day.dayOfWeek}</Text>

                                <TextInput
                                    style={styles.splitTypeInput}
                                    placeholder="Split Type (e.g. PUSH/PULL/LEGS/REST)"
                                    placeholderTextColor="#555"
                                    value={day.splitType}
                                    onChangeText={(text) => updateDayField(dayIndex, text)}
                                    autoCapitalize="characters"
                                />

                                {/* Exercises List */}
                                {day.exercises.map((ex, exIndex) => (
                                    <View key={exIndex} style={styles.exerciseRow}>
                                        <TextInput
                                            style={[styles.exerciseInput, { flex: 3 }]}
                                            placeholder="EXERCISE"
                                            placeholderTextColor="#555"
                                            value={ex.name}
                                            onChangeText={(text) => updateExercise(dayIndex, exIndex, 'name', text)}
                                        />
                                        <TextInput
                                            style={[styles.exerciseInput, { flex: 1 }]}
                                            placeholder="SETS"
                                            placeholderTextColor="#555"
                                            keyboardType="numeric"
                                            value={ex.sets.toString()}
                                            onChangeText={(text) => updateExercise(dayIndex, exIndex, 'sets', text)}
                                        />
                                        <TextInput
                                            style={[styles.exerciseInput, { flex: 1 }]}
                                            placeholder="REPS"
                                            placeholderTextColor="#555"
                                            keyboardType="numeric"
                                            value={ex.repetitions.toString()}
                                            onChangeText={(text) => updateExercise(dayIndex, exIndex, 'repetitions', text)}
                                        />
                                        <TextInput
                                            style={[styles.exerciseInput, { flex: 1 }]}
                                            placeholder="LOAD"
                                            placeholderTextColor="#555"
                                            keyboardType="numeric"
                                            value={ex.weight.toString()}
                                            onChangeText={(text) => updateExercise(dayIndex, exIndex, 'weight', text)}
                                        />
                                        <TextInput
                                            style={[styles.exerciseInput, { flex: 1 }]}
                                            placeholder="Unit (kg/lbs)"
                                            placeholderTextColor="#555"
                                            maxLength={3}
                                            autoCapitalize="none"
                                            value={ex.unit}
                                            onChangeText={(text) => {
                                                const unit = text.toLowerCase();
                                                if (unit === 'kg' || unit === 'lbs' || unit === '') {
                                                    updateExercise(dayIndex, exIndex, 'unit', unit);
                                                }
                                            }}
                                        />
                                        <Pressable
                                            onPress={() => removeExercise(dayIndex, exIndex)}
                                            style={styles.removeBtn}
                                        >
                                            <Text style={{ color: '#ff0055', fontWeight: 'bold' }}>×</Text>
                                        </Pressable>
                                    </View>
                                ))}

                                <Pressable
                                    style={styles.addExerciseBtn}
                                    onPress={() => addExercise(dayIndex)}
                                >
                                    <Text style={{ color: '#00ffcc', fontFamily: 'monospace' }}>+ Add Exercise</Text>
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.buttonRow}>
                        <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                            <Text style={styles.buttonText}>CANCEL</Text>
                        </Pressable>

                        <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.buttonText}>SAVE PLAN</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#0A0F1CCC',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    modalContent: {
        backgroundColor: '#111622',
        borderRadius: 12,
        padding: 20,
        maxHeight: '85%',
    },
    modalTitle: {
        fontFamily: 'monospace',
        fontSize: 18,
        color: '#00ffcc',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: '#00ffcc',
        textShadowRadius: 6,
    },
    input: {
        backgroundColor: '#1A1F2C',
        borderRadius: 6,
        padding: 12,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 14,
        marginBottom: 16,
    },
    daysContainer: {
        marginBottom: 20,
    },
    dayBlock: {
        marginBottom: 18,
    },
    dayLabel: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 2,
        marginBottom: 6,
    },
    splitTypeInput: {
        backgroundColor: '#1A1F2C',
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 1,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    exerciseInput: {
        backgroundColor: '#1A1F2C',
        borderRadius: 6,
        padding: 6,
        marginHorizontal: 3,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 12,
        textAlign: 'center',
    },
    removeBtn: {
        paddingHorizontal: 6,
    },
    addExerciseBtn: {
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 6,
    },
    cancelButton: {
        backgroundColor: '#222',
    },
    saveButton: {
        backgroundColor: '#00ffcc',
    },
    buttonText: {
        color: '#0A0F1C',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
});
