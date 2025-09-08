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
    Switch,
} from 'react-native';
import { sanitizeTrainingPlanData, validateTrainingPlanData } from '../../utils/formHelpers';
import { CreateTrainingAssignmentRequest, Exercise, PlanType, WorkoutDay } from '../../types/trainingPlan';
import { AuthContext } from '../../context/AuthContext';
import { createTrainingPlan } from '../../services/trainingPlanService';
import CustomDatePickerModal from './CustomDatePickerModal';
import { createTrainingPlanAssignment } from '../../services/planAssignmentsService';

const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const planTypes = ['Bodybuilding', 'Powerlifting', 'Crossfit'];

//MODAL FOR CREATING TRAINING PLANS
export default function TrainingPlanModal({ visible, onClose, onSave }) {
    const [planType, setPlanType] = useState<PlanType>("");
    const { token } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [days, setDays] = useState<WorkoutDay[]>(
        daysOfWeek.map(day => ({
            dayOfWeek: day,
            splitType: '',
            exercises: [],
        }))
    );

    //new state for activation
    const [activateNow, setActivateNow] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
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
            sets: [
                { reps: 0, weight: 0, unit: 'kg' }
            ],
        });
        setDays(newDays);
    };

    const updateExercise = (dayIndex: number, exIndex: number, field: ExerciseField, value: string) => {
        const newDays = [...days]; if (field === "sets" || field === "repetitions" || field === "weight") {
            newDays[dayIndex].exercises[exIndex][field] = Number(value);
        } else if (field === "unit") {
            const unitValue = value.toLowerCase(); if (unitValue === "kg" || unitValue === "lbs") { newDays[dayIndex].exercises[exIndex].unit = unitValue; }
        }
        else { newDays[dayIndex].exercises[exIndex][field] = value; } setDays(newDays);
    };


    // Update exercise field
    type ExerciseField = keyof Exercise;

    const updateSetField = (dayIndex: number, exIndex: number, setIndex: number, field: "reps" | "weight" | "unit", value: string | number) => {
        const newDays = [...days];
        if (field === "reps" || field === "weight") {
            newDays[dayIndex].exercises[exIndex].sets[setIndex][field] = Number(value);
        } else if (field === "unit") {
            if (value === "kg" || value === "lbs") {
                newDays[dayIndex].exercises[exIndex].sets[setIndex].unit = value;
            }
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
            const createTrainingPlanPayload = {
                name: name.trim(),
                type: planType,
                days: sanitizedDays,
            };

            const createPlanResponse = await createTrainingPlan(token, createTrainingPlanPayload);
            console.log(createPlanResponse);

            if (activateNow && startDate) {
                const assignTrainingPlanPayload: CreateTrainingAssignmentRequest = {
                    trainingPlanId: createPlanResponse.plan._id,
                    startDate: startDate.toISOString(),
                    endDate: endDate ? endDate.toISOString() : null,
                };

                const assignTrainingResponse = await createTrainingPlanAssignment(token, assignTrainingPlanPayload);

                console.log("Assignment created", assignTrainingResponse);
            }

            alert('Training plan created successfully!');

            onSave({ name: name.trim(), days: sanitizedDays });
            resetForm();
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

    const resetForm = () => {
        setName('');
        setPlanType('');
        setDays(daysOfWeek.map(day => ({
            dayOfWeek: day,
            splitType: '',
            exercises: [],
        })));
        setActivateNow(false);
        setStartDate(null);
        setEndDate(null);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>▓ CREATE NEW TRAINING PLAN ▓</Text>

                    <ScrollView style={styles.daysContainer} nestedScrollEnabled>


                        <TextInput
                            style={styles.input}
                            placeholder="Plan Name"
                            placeholderTextColor="#555"
                            value={name}
                            onChangeText={setName}
                        />
                        <View style={styles.planTypeContainer}>
                            {planTypes.map((type) => (
                                <Pressable
                                    key={type}
                                    onPress={() => setPlanType(type)}
                                    style={[
                                        styles.planTypeOption,
                                        planType === type && styles.planTypeOptionActive
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.planTypeText,
                                            planType === type && styles.planTypeTextActive
                                        ]}
                                    >
                                        {type.toUpperCase()}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Activate Now Toggle */}
                        <View style={styles.activateRow}>
                            <Text style={styles.activateLabel}>Start this Trainingplan</Text>
                            <Switch
                                value={activateNow}
                                onValueChange={setActivateNow}
                                thumbColor={activateNow ? '#00ffcc' : '#ccc'}
                            />
                        </View>

                        {activateNow && (
                            <View style={styles.dateRangeContainer}>
                                <Pressable
                                    onPress={() => setDatePickerVisible(true)}
                                    style={styles.dateRangeBtn}
                                >
                                    <Text style={styles.dateRangeText}>
                                        {startDate
                                            ? `${startDate.toLocaleDateString()} — ${endDate ? endDate.toLocaleDateString() : 'Ongoing'}`
                                            : 'Select Start & End Date'}
                                    </Text>
                                </Pressable>

                                <CustomDatePickerModal
                                    visible={datePickerVisible}
                                    onClose={() => setDatePickerVisible(false)}
                                    date={new Date()}
                                    onChange={(start, end) => {
                                        setStartDate(start);
                                        setEndDate(end);
                                    }}
                                />
                            </View>
                        )}

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
                                    <View key={exIndex} style={{ marginBottom: 12 }}>
                                        {/* Exercise name input */}

                                        <TextInput
                                            style={[styles.exerciseInput, { flex: 3 }]}
                                            placeholder="EXERCISE"
                                            placeholderTextColor="#555"
                                            value={ex.name}
                                            onChangeText={(text) => updateExercise(dayIndex, exIndex, 'name', text)}
                                        />

                                        {/* Render sets vertically */}
                                        <View style={{ marginTop: 6 }}>
                                            {ex.sets.map((set, setIndex) => (
                                                <View
                                                    key={setIndex}
                                                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                                                >
                                                    {/* Set number */}
                                                    <Text
                                                        style={{
                                                            color: '#00ffcc',
                                                            fontFamily: 'monospace',
                                                            marginRight: 8,
                                                            width: 20,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {setIndex + 1}
                                                    </Text>
                                                    <TextInput
                                                        style={[styles.exerciseInput, { flex: 1 }]}
                                                        placeholder="Reps"
                                                        placeholderTextColor="#555"
                                                        keyboardType="numeric"
                                                        value={set.reps === 0 ? "" : set.reps.toString()}
                                                        onChangeText={(text) => updateSetField(dayIndex, exIndex, setIndex, 'reps', text)}
                                                    />
                                                    <TextInput
                                                        style={[styles.exerciseInput, { flex: 1 }]}
                                                        placeholder="Load"
                                                        placeholderTextColor="#555"
                                                        keyboardType="numeric"
                                                        value={set.weight === 0 ? "" : set.weight.toString()}
                                                        onChangeText={(text) => updateSetField(dayIndex, exIndex, setIndex, 'weight', text)}
                                                    />
                                                    <TextInput
                                                        style={[styles.exerciseInput, { flex: 1 }]}
                                                        placeholder="Unit"
                                                        placeholderTextColor="#555"
                                                        value={set.unit}
                                                        onChangeText={(text) => updateSetField(dayIndex, exIndex, setIndex, 'unit', text)}
                                                    />

                                                    {/* Delete Set Button */}
                                                    <Pressable
                                                        onPress={() => {
                                                            const newDays = [...days];
                                                            newDays[dayIndex].exercises[exIndex].sets.splice(setIndex, 1);
                                                            setDays(newDays);
                                                        }}
                                                        style={styles.deleteSetBtn}
                                                    >
                                                        <Text style={styles.deleteSetText}>✕</Text>
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </View>

                                        <Pressable
                                            onPress={() => {
                                                const newDays = [...days];
                                                newDays[dayIndex].exercises[exIndex].sets.push({
                                                    reps: 0,
                                                    weight: 0,
                                                    unit: 'kg',
                                                });
                                                setDays(newDays);
                                            }}
                                            style={styles.addSetBtn}
                                        >
                                            <Text style={styles.addSetText}>+ Add Set</Text>
                                        </Pressable>
                                    </View>
                                ))}


                                <Pressable
                                    style={styles.addExerciseBtn}
                                    onPress={() => addExercise(dayIndex)}
                                >
                                    <Text style={styles.addExerciseText}>+ Add Exercise</Text>
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
    deleteSetBtn: {
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: 'rgba(255, 0, 85, 0.1)',
        borderRadius: 4,
    },

    deleteSetText: {
        color: '#ff0055',
        fontSize: 14,
        fontWeight: 'bold',
    },

    addSetBtn: {
        alignSelf: 'flex-start',
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },

    addSetText: {
        color: '#7ACFCF', // softer cyan
        fontFamily: 'monospace',
        fontSize: 12,
        opacity: 0.8,
    },

    addExerciseBtn: {
        marginTop: 10,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0, 255, 204, 0.05)',
    },

    addExerciseText: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    activateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
    },
    activateLabel: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 14,
    },
    planTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
        backgroundColor: '#1A1F2C',
        padding: 8,
        borderRadius: 6,
    },
    dateRangeContainer: {
        marginBottom: 16,
    },
    dateRangeBtn: {
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#1A1F2C',
    },
    dateRangeText: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 13,
        textAlign: 'center',
    },

    planTypeOption: {
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: '#111622',
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#444',
        alignItems: 'center',
    },

    planTypeOptionActive: {
        backgroundColor: '#00ffcc22',
        borderColor: '#00ffcc',
        elevation: 4,
    },

    planTypeText: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 12,
    },

    planTypeTextActive: {
        color: '#00ffcc',
        fontWeight: 'bold',
    },

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
