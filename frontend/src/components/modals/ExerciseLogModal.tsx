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

interface ExerciseLogModalProps {
    visible: boolean;
    onClose: () => void;
    exerciseName: string;
    plannedSets: { reps: number; weight: number; unit: string }[];
    onSave: (exerciseName: string, logs: LoggedSet[]) => void;
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
    const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);

    // Reset logged sets when modal opens or plannedSets change
    useEffect(() => {
        setLoggedSets(
            plannedSets.map(() => ({ actualReps: '', actualWeight: '', rpe: '' }))
        );
    }, [plannedSets, visible]);

    const handleChange = (index: number, field: keyof LoggedSet, value: string) => {
        const updated = [...loggedSets];
        updated[index][field] = value;
        setLoggedSets(updated);
    };

    const handleSave = () => {
        onSave(exerciseName, loggedSets);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>LOG: {exerciseName.toUpperCase()}</Text>
                    <ScrollView>
                        {plannedSets.map((set, i) => (
                            <View key={i} style={styles.setRow}>
                                {/* Planned set info */}
                                <Text style={styles.setLabel}>
                                    Set {i + 1}: {set.reps} reps @ {set.weight} {set.unit}
                                </Text>

                                {/* Actual logging */}
                                <View style={styles.inputsRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Reps"
                                        keyboardType="numeric"
                                        value={loggedSets[i]?.actualReps}
                                        onChangeText={(v) => handleChange(i, 'actualReps', v)}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginLeft: 6 }]}
                                        placeholder="Weight"
                                        keyboardType="numeric"
                                        value={loggedSets[i]?.actualWeight}
                                        onChangeText={(v) => handleChange(i, 'actualWeight', v)}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginLeft: 6 }]}
                                        placeholder="RPE"
                                        keyboardType="numeric"
                                        value={loggedSets[i]?.rpe}
                                        onChangeText={(v) => handleChange(i, 'rpe', v)}
                                    />
                                </View>
                            </View>
                        ))}
                    </ScrollView>

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
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        borderRadius: 10,
        borderColor: '#00ffcc',
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 16,
        color: '#00ffcc',
        fontFamily: 'monospace',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: 2,
    },
    setRow: { marginBottom: 14 },
    setLabel: { color: '#BFC7D5', fontSize: 13, marginBottom: 6 },
    inputsRow: { flexDirection: 'row' },
    input: {
        borderWidth: 1,
        borderColor: '#2A2F3C',
        borderRadius: 4,
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
