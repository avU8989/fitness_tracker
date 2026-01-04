import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    ScrollView,
    StyleSheet,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import WarmupIcon from '../icons/WarmupIcon';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

interface ExerciseLogModalProps {
    visible: boolean;
    onClose: () => void;
    exerciseName: string;
    plannedSets: { reps: number; weight: number; unit: string }[];
    onSave: (exerciseName: string, logs: LoggedSet[], warmupSets: LoggedSet[]) => void;
}

type LoggedSet = {
    actualReps: string;
    actualWeight: string;
    rpe: string;
};

const ExerciseLogModal = ({
    visible,
    onClose,
    exerciseName,
    plannedSets,
    onSave,
}: ExerciseLogModalProps) => {

    const [warmupSets, setWarmupSets] = useState<LoggedSet[]>([])

    const [loggedSets, setLoggedSets] = useState<LoggedSet[]>(
        plannedSets.map(() => ({ actualReps: '', actualWeight: '', rpe: '' }))
    );

    const handleChange = (index: number, field: keyof LoggedSet, value: string) => {
        const updated = [...loggedSets];
        updated[index][field] = value;
        setLoggedSets(updated);
    };

    const addWarmupSet = () => {
        setWarmupSets([...warmupSets, { actualReps: '', actualWeight: '', rpe: '' }]);
    }

    const updateWarmupSet = (
        index: number,
        field: keyof LoggedSet,
        value: string,
    ) => {
        const updated = [...warmupSets];
        updated[index][field] = value;
        setWarmupSets(updated);
    }

    const addExtraSet = () => {
        setLoggedSets(prev => [
            ...prev,
            { actualReps: '', actualWeight: '', rpe: '' }
        ])
    }

    const removeWarmupSet = (index: number) => {
        setWarmupSets(warmupSets.filter((_, i) => i !== index));
    }

    const handleSave = () => {
        onSave(exerciseName, loggedSets, warmupSets);
        onClose();
    };

    const removeExtraSet = (index: number) => {
        setLoggedSets(prev => prev.filter((_, i) => i !== index));


    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            {/*ADD WARMUP EXERCISE WITH ICON WARMUP --> ADD FUNCTION TO ADD EXERCISE*/}
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{exerciseName.toUpperCase()}</Text>
                    <View>
                        <Pressable onPress={addWarmupSet} style={styles.addWarmupBtn}>
                            <MaterialIcon name="add" size={16} color="#00ffcc" />
                            <Text style={styles.addWarmupText}>WARM-UP SET</Text>
                        </Pressable>
                        {/*WARMUP SETS*/}

                        {warmupSets.map((set, i) => (
                            <View key={i} style={styles.setRow}>
                                <View style={styles.inputsRow}>
                                    <WarmupIcon size={26}></WarmupIcon>

                                    <TextInput style={[styles.input, { flex: 1 }]}
                                        placeholder="Reps"
                                        placeholderTextColor="#4A5160"
                                        keyboardType="numeric"
                                        value={set.actualReps}
                                        onChangeText={(v) => updateWarmupSet(i, 'actualReps', v)}
                                    />

                                    <TextInput style={[styles.input, { flex: 1 }]}
                                        placeholder="Weight"
                                        placeholderTextColor="#4A5160"
                                        keyboardType="numeric"
                                        value={set.actualWeight}
                                        onChangeText={(v) => updateWarmupSet(i, 'actualWeight', v)}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="RPE"
                                        placeholderTextColor="#4A5160"
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={''}
                                        onChangeText={(v) =>
                                            handleChange(i, 'rpe', v)
                                        }
                                    />

                                    <Pressable onPress={() => removeWarmupSet(i)}>
                                        <Icon name="close-circle" size={20} color="#ff6b6b" />
                                    </Pressable>
                                </View>
                            </View>))}


                        {/*PLANNED SETS TODO*/}
                        {loggedSets.map((log, i) => {
                            const planned = plannedSets[i];
                            const isExtraSet = i >= plannedSets.length;

                            return (
                                <Pressable key={i}
                                    style={styles.setRow}
                                    onLongPress={() => {
                                        if (isExtraSet) {
                                            Haptics.impactAsync(
                                                Haptics.ImpactFeedbackStyle.Light
                                            );
                                            removeExtraSet(i);
                                        }
                                    }}
                                >
                                    <View style={styles.inputsRow}>
                                        <View style={styles.iconCircleWorkout}>
                                            <Text style={styles.setDotText}>{i + 1}</Text>
                                        </View>

                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder={planned ? `${planned.reps} reps` : 'Reps'}
                                            placeholderTextColor="#4A5160"
                                            keyboardType="numeric"
                                            value={log.actualReps ?? ''}
                                            onChangeText={(v) =>
                                                handleChange(i, 'actualReps', v)
                                            }
                                        />

                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder={
                                                planned
                                                    ? `${planned.weight} ${planned.unit}`
                                                    : 'Weight'
                                            }
                                            placeholderTextColor="#4A5160"
                                            keyboardType="numeric"
                                            value={log.actualWeight ?? ''}
                                            onChangeText={(v) =>
                                                handleChange(i, 'actualWeight', v)
                                            }
                                        />

                                        <TextInput
                                            style={styles.input}
                                            placeholder="RPE"
                                            placeholderTextColor="#4A5160"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={log.rpe ?? ''}
                                            onChangeText={(v) =>
                                                handleChange(i, 'rpe', v)
                                            }
                                        />
                                        <Pressable onPress={() => removeExtraSet(i)}>
                                            <Icon name="close-circle" size={20} color="#ff6b6b" />
                                        </Pressable>
                                    </View>
                                </Pressable>
                            );
                        })}

                        <Pressable onPress={addExtraSet} style={styles.addWarmupBtn}>
                            <MaterialIcon name="add" size={16} color="#00ffcc" />
                            <Text style={styles.addWarmupText}>SET</Text>
                        </Pressable>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable onPress={handleSave} style={styles.saveBtn}>
                            <Text style={styles.saveText}>SAVE SETS</Text>
                        </Pressable>
                        <Pressable onPress={onClose} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal >
    );
};


const styles = StyleSheet.create({
    deleteAction: {
        backgroundColor: '#ff6b6b',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    deleteText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 2,
    },
    endSlot: {
        width: 70, // SAME as RPE input width
        justifyContent: 'center',
        alignItems: 'center',
    },

    rpeCircle: {
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: '#1A1F2C', // amber/yellow for RPE
        justifyContent: 'center',
        alignItems: 'center',
    },

    rpeInput: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        color: '#0A0F1C',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 12,
        padding: 0,
    },

    setDotText: {
        color: "#0A0F1C",
        alignSelf: "center",
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "bold",
    },
    iconCircleWorkout: {
        width: 28,
        height: 28,
        borderRadius: 999,
        backgroundColor: "#66AAFF",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    sectionTitle: {
        marginLeft: 6,
        color: '#ff9f43',
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 1,
    },
    addWarmupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    addWarmupText: {
        marginLeft: 6,
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 1,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: '#0A0F1Cdd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#111622',
        padding: 20,
        borderRadius: 14,
    },
    modalTitle: {
        fontFamily: 'monospace',
        paddingBottom: 8,
        fontSize: 18,
        color: '#BFC7D5',
        letterSpacing: 1,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 2,
        marginBottom: 8,
    },
    setRow: {
        justifyContent: "center",
        marginBottom: 14
    },
    setLabel: { color: '#BFC7D5', fontSize: 13, marginBottom: 6 },
    inputsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#2A2F3C',
        borderRadius: 8,
        padding: 8,
        color: '#fff',
        backgroundColor: '#1A1F2C',
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    saveBtn: {
        backgroundColor: '#00ffcc',
        padding: 10,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
        marginRight: 6,
    },
    saveText: {
        color: '#0A0F1C',
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: 'monospace',
    },
    cancelBtn: {
        padding: 10,
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
        marginLeft: 6,
    },
    cancelText: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
});

export default ExerciseLogModal;
