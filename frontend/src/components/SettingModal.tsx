import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    ScrollView,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import { getPlanStats } from '../utils/planStats';
import VHSGlowDivider from './VHSGlowDivider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CreateTrainingAssignmentRequest } from '../requests/CreateTrainingAssignmentRequest';
import { TrainingPlanUI } from '../types/trainingPlan';
import { createTrainingPlanAssignment, deleteTrainingPlanAssignment } from '../services/planAssignmentsService';
import { AuthContext } from '../context/AuthContext';
import { useTrainingPlan } from '../context/TrainingPlanContext';
import { useWorkout } from '../context/WorkoutContext';

type SettingModalProps = {
    visible: boolean;
    onClose: () => void;
    onPlanActivated?: () => void;
    plan: TrainingPlanUI | null;
    isActive: boolean;
}

export default function SettingModal({ visible, onClose, onPlanActivated, plan, isActive }: SettingModalProps) {
    if (!plan) {
        return (
            <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
                <Pressable style={styles.backdrop} onPress={onClose} />
            </Modal>
        );
    }

    const { totalExercises } = getPlanStats(plan);
    const { token } = useContext(AuthContext);
    const { setRefreshedTrainingPlanAssignment, setPlanDeactivated } = useTrainingPlan();
    const { resetWorkoutState } = useWorkout();

    useEffect(() => {
        console.log(plan);
    }, []);

    const handleSetActivePlan = async () => {
        if (!token) {
            alert('You must be logged in to create a plan.');
            return;
        }

        if (isActive === null || plan === null) {
            console.warn("Training plan not existing or Assignment is already set to active!");
            return;
        }

        const startDate = new Date().toISOString();
        console.log(startDate);

        try {
            // create a trainingplan assignment that ends indefinetly
            const assignTrainingPlanPayload: CreateTrainingAssignmentRequest = {
                trainingPlanId: plan._id,
                startDate: startDate,
                endDate: null,
            }

            const assignTrainingResponse = await createTrainingPlanAssignment(token, assignTrainingPlanPayload);
            console.log(assignTrainingResponse);

            setRefreshedTrainingPlanAssignment(true);
            resetWorkoutState();
            setPlanDeactivated(false);
            await onPlanActivated?.();

            onClose();
        } catch (err) {
            console.error("Failed to create Training Plan Assignment!");
        }
    }

    const handleDeactivatePlan = async () => {
        if (!token) {
            alert('You must be logged in to create a plan.');
            return;
        }


        if (isActive === null || plan === null) {
            console.warn("Training plan not existing or Assignment is already inactive!");
            return;
        }

        try {
            const deletTrainingPlanAssignmentResponse = await deleteTrainingPlanAssignment(token, plan._id);
            console.log(deletTrainingPlanAssignmentResponse);
            setPlanDeactivated(true);
            await onPlanActivated?.();

            onClose();
        } catch (err) {
            console.error("Failed to delete Training Plan Assignment!");

        }
    }

    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
            {/*touching the background will close the modal  */}
            <Pressable style={styles.backdrop} onPress={onClose}>
                {plan && (
                    <View style={styles.sheet}>
                        <View style={styles.previewRow}>
                            <ImageBackground
                                // TODO: after adding imageURL in database entity we want to add the functionality that user can upload image by pressing imagebackground here
                                source={require('../assets/training_plan_test_image.png')}
                                style={styles.previewThumb}
                                imageStyle={{ borderRadius: 8 }}
                            />

                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={styles.previewTitle}>{plan.name}</Text>

                                {isActive && (
                                    <Text style={[styles.statText, { color: "#00ffcc", marginTop: 2, letterSpacing: 2 }]}>
                                        ACTIVE PLAN
                                    </Text>
                                )}
                                <Text style={[styles.statText, { letterSpacing: 2 }]}>{totalExercises} Exercises</Text>

                            </View>
                        </View>

                        <VHSGlowDivider></VHSGlowDivider>

                        {/* === ACTIVE / INACTIVE LOGIC === */}
                        {!isActive ? (
                            <Pressable style={styles.option} onPress={handleSetActivePlan}>
                                <View style={styles.optionRow}>
                                    <Ionicons name="play-circle-outline" size={18} color="#fff" />
                                    <Text style={styles.optionText}>Set as Active</Text>
                                </View>
                            </Pressable>
                        ) : (
                            <Pressable style={styles.option} onPress={handleDeactivatePlan}>
                                <View style={styles.optionRow}>
                                    <Ionicons name="remove-circle-outline" size={18} color="#fff" />
                                    <Text style={styles.optionText}>Deactivate plan</Text>
                                </View>
                            </Pressable>
                        )}

                        {/* === EDIT === */}
                        <Pressable style={styles.option}>
                            <View style={styles.optionRow}>
                                <Ionicons name="create-outline" size={18} color="#fff" />
                                <Text style={styles.optionText}>Edit plan</Text>
                            </View>
                        </Pressable>

                        {/* === ENABLE NOTIFCIATIONSS === */}
                        <Pressable style={styles.option}>
                            <View style={styles.optionRow}>
                                <Ionicons name="notifications-outline" size={18} color="#fff" />
                                <Text style={[styles.optionText]}>
                                    Enable notifications
                                </Text>
                            </View>
                        </Pressable>

                        {/* === DUPLICATE === */}
                        <Pressable style={styles.option}>
                            <View style={styles.optionRow}>
                                <Ionicons name="duplicate-outline" size={18} color="#fff" />
                                <Text style={styles.optionText}>Duplicate plan</Text>
                            </View>
                        </Pressable>

                        {/* === DELETE === */}
                        <Pressable style={styles.option}>
                            <View style={styles.optionRow}>
                                <Ionicons name="close" size={18} color="#ff4444" />
                                <Text style={[styles.optionText, { color: "#ff4444" }]}>
                                    Delete plan
                                </Text>
                            </View>
                        </Pressable>


                        {/* === ADD SETTING OPTION TO GENERATE HARDER TRAININGPLAN (COULD INCREASE VOL/INTENSITY, ADD NEW EXERCISES ETC)=== */}
                    </View>
                )}
            </Pressable>
        </Modal >
    )
}

const styles = StyleSheet.create({
    previewRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },


    previewThumb: {
        width: 70,
        height: 70,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        borderColor: "#00ffcc44",
        overflow: "hidden",
    },

    preview: {
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#00ffcc44",
        borderRadius: 12,
        overflow: "hidden",
    },
    previewOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)"
    },

    previewTitle: {
        fontFamily: "monospace",
        color: "#00ffcc",
        fontSize: 18,
        letterSpacing: 2,
        textShadowColor: "#00ffcc",
        textShadowRadius: 6,
        textTransform: "uppercase",
    },

    previewStats: {
        padding: 12,
        backgroundColor: "#0A0F1C",
    },

    statText: {
        color: "#BFC7D5",
        fontFamily: "monospace",
        fontSize: 12,
        marginBottom: 4,
        letterSpacing: 1,
    },

    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: 20,
        backgroundColor: "#0A0F1C",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderWidth: 1,
    },
    sheetTitle: {
        color: "#00ffcc",
        fontFamily: "monospace",
        fontSize: 18,
        marginBottom: 16,
        letterSpacing: 2,
        textTransform: "uppercase",
        textAlign: "center",
    },
    option: {
        paddingBottom: 26
    },
    optionText: {
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 14,
        letterSpacing: 2,
    },
    closeButton: {
        marginTop: 14,
        padding: 12,
        backgroundColor: "#00ffcc",
        borderRadius: 8,
        alignItems: "center",
    },
    closeText: {
        color: "#0A0F1C",
        fontFamily: "monospace",
        fontWeight: "bold",
        letterSpacing: 1,
    },
});