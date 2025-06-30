import React, { useState } from 'react';
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
    plannedSets: { reps: number; weight: number }[];
    onSave: (exerciseName: string, logs: LoggedSet[]) => void;
}

type LoggedSet = {
    actualReps: string;
    actualWeight: string;
    rpe: string;
};


const ExerciseLogModal = ({ visible, onClose, exerciseName, plannedSets, onSave }: ExerciseLogModalProps) => {
    const [sets, setSets] = useState([]);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');

    const logSet = () => {
        if (weight && reps) {
            setSets([...sets, { weight, reps }]);
            setWeight('');
            setReps('');
        }
    };

    const [loggedSets, setLoggedSets] = useState(
        plannedSets.map(() => ({ actualReps: '', actualWeight: '', rpe: '' }))
    );

    const handleChange = (index, field, value) => {
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
                    <Text style={styles.modalTitle}>LOG: {exerciseName}</Text>
                    <ScrollView>
                        {plannedSets.map((set, i) => (
                            <View key={i} style={styles.setRow}>
                                <Text style={styles.setLabel}>SET {i + 1}: {set.reps}x{set.weight}kg</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Reps"
                                    keyboardType="numeric"
                                    value={loggedSets[i].actualReps}
                                    onChangeText={(v) => handleChange(i, 'actualReps', v)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Weight"
                                    keyboardType="numeric"
                                    value={loggedSets[i].actualWeight}
                                    onChangeText={(v) => handleChange(i, 'actualWeight', v)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="RPE"
                                    keyboardType="numeric"
                                    value={loggedSets[i].rpe}
                                    onChangeText={(v) => handleChange(i, 'rpe', v)}
                                />
                            </View>
                        ))}
                    </ScrollView>

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
    setRow: { marginBottom: 10 },
    setLabel: { color: '#BFC7D5', fontSize: 12, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#2A2F3C',
        borderRadius: 4,
        padding: 8,
        color: '#fff',
        marginBottom: 6,
        backgroundColor: '#1A1F2C',
        fontFamily: 'monospace',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
