import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    Modal,
} from 'react-native';
import TrainingPlanModal from '../../components/modals/TrainingPlanModal';
import Ticker from '../../components/Ticker';
import VHSGlowDivider from '../../components/VHSGlowDivider';
import CustomDatePickerModal from '../../components/modals/CustomDatePickerModal';
import VHSButton from '../../components/VHSButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { getTrainingPlans } from '../../services/trainingPlanService';
import { DayOfWeek, TrainingPlanAssignment, TrainingPlanUI, WorkoutDay } from '../../types/trainingPlan';
import * as Haptics from 'expo-haptics';
import { getActivePlan } from '../../services/planAssignmentsService';
import { toUIPlan } from '../../utils/apiHelpers';

export default function TrainingPlansScreen() {
    const { token } = useContext(AuthContext);
    const [plans, setPlans] = useState<TrainingPlanUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [activePlan, setActivePlan] = useState<TrainingPlanAssignment | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [completedDays, setCompletedDays] = useState<DayOfWeek[]>([]);
    const [datePickerVisible, setDatePickerVisible] = useState(false);


    const loadPlans = async () => {
        if (!token) {
            setError('Missing auth token');
            setLoading(false);
            return;
        }

        console.log(token);

        try {
            setLoading(true);
            setError(null);
            const api = await getTrainingPlans(token);
            const ui = api.map(toUIPlan);


            setPlans(ui);
            setCurrentIndex(0);
            setCompletedDays([]);

        } catch (err: any) {
            setError(err.message ?? 'Failed to fetch training plans');
            console.log(error);
        } finally {
            setLoading(false);
        }

    }

    const [selectedDay, setSelectedDay] = useState<typeof currentPlan.days[0] | null>(null);
    const [trainingPlanModalVisible, setTrainingPlanModalVisible] = useState(false);

    useEffect(() => {
        loadPlans();
    }, [token]);


    const currentPlan = plans[currentIndex];


    const goPrev = () => {
        setCurrentIndex(i => (i === 0 ? plans.length - 1 : i - 1));
        setCompletedDays([]);
    };

    const goNext = () => {
        setCurrentIndex(i => (i === plans.length - 1 ? 0 : i + 1));
        setCompletedDays([]);
    };

    const totalExercises = useMemo(() => {
        if (!currentPlan) return 0;

        let sum = 0;
        if (currentPlan.days != null) {
            for (const day of currentPlan.days) {
                const count = day.exercises ? day.exercises.length : 0;
                sum += count;
            }
        }

        return sum;
    }, [currentPlan]);


    const estimatedVolume = useMemo(() => {
        return currentPlan?.days?.reduce((acc, d) => {
            const list = d?.exercises ?? [];
            return acc + list.reduce((s, ex) =>
                s + ex.sets.reduce((setAcc, set) => setAcc + set.reps * set.weight, 0)
                , 0);
        }, 0) ?? 0;
    }, [currentPlan]);



    const formatSplitDateRange = (startDate: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");

        const dayStart = pad(startDate.getDate());
        const monthStart = pad(startDate.getMonth() + 1);
        const yearStart = startDate.getFullYear();

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        const dayEnd = pad(endDate.getDate());
        const monthEnd = pad(endDate.getMonth() + 1);
        const yearEnd = endDate.getFullYear();

        return {
            rangeLine: `${dayStart}.${monthStart} — ${dayEnd}.${monthEnd}`,
            yearLine: yearStart === yearEnd ? yearStart.toString() : `${yearStart}/${yearEnd}`,
        };
    };

    const { rangeLine, yearLine } = formatSplitDateRange(new Date());
    const daysCompleted = completedDays.length;
    const startDate = currentPlan?.updatedAt ?? new Date();

    const handleSavePlan = newPlan => {
        setPlans([...plans, { ...newPlan, date: new Date() }]);
        setModalVisible(false);
        setCurrentIndex(plans.length);
        setCompletedDays([]);
    };

    const handleWeekChange = async (start: Date, end: Date) => {
        console.log(start);

        try {
            if (!token) {
                console.log('No token provided cannot fetch active training plan');
                return 0;
            }
            const queryDate = start.toLocaleDateString("en-CA");

            const fetchedActivePlan = await getActivePlan(token, queryDate);

            setActivePlan(fetchedActivePlan);
        } catch (err: any) {
            console.error("Failed to fetch active plan:", err);
            setActivePlan(null);
        }
    }

    return (
        <View style={styles.root}>
            <View style={styles.headerContainer}>
                <Text style={styles.vhsHudTitle}>▓CHANNEL 04 — TRAINING FEED▓</Text>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.splitName}>{activePlan ? toUIPlan(activePlan.trainingPlan).name : currentPlan?.name ?? "No plan"}</Text>

                <View style={styles.dateContainer}>
                    <Pressable
                        onPress={() => setDatePickerVisible(true)}
                        style={({ pressed }) => [
                            styles.datePressable,
                            pressed && { opacity: 0.6, backgroundColor: 'rgba(0,255,204,0.1)', borderRadius: 8 },
                        ]}
                        hitSlop={10}
                        android_ripple={{ color: 'rgba(0,255,204,0.2)', borderless: false }}
                    >
                        <View style={styles.dateRow}>
                            <Text style={styles.dateRangeText}>
                                {activePlan
                                    ? `${new Date(activePlan.startDate).toLocaleDateString("en-GB")} — ${activePlan.endDate
                                        ? new Date(activePlan.endDate).toLocaleDateString("en-GB")
                                        : "ongoing"
                                    }`
                                    : rangeLine}
                            </Text>

                            <Ionicons name="calendar-outline" size={24} color="#00ffcc" style={styles.calendarIcon} />
                        </View>
                        <Text style={styles.dateYearText}>{yearLine}</Text>
                    </Pressable>
                </View>
            </View>

            <CustomDatePickerModal
                visible={datePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                date={new Date()}
                onChange={handleWeekChange}
            />

            <View style={styles.carouselContainer}>
                <Pressable onPress={goPrev} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>‹</Text>
                </Pressable>

                <ScrollView style={styles.tableContainer}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlans} />}>

                    {(activePlan ? toUIPlan(activePlan.trainingPlan) : currentPlan)?.days.map(
                        (day, idx) => {
                            if (!day.dayOfWeek) {
                                return null;
                            }

                            const isCompleted = completedDays.includes(day.dayOfWeek);

                            return (
                                <Pressable key={idx} onLongPress={() => {
                                    setHighlightedIndex(idx);
                                    setSelectedDay((activePlan ? toUIPlan(activePlan.trainingPlan).days : currentPlan?.days)[idx]);
                                    setTrainingPlanModalVisible(true);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                    style={[styles.tableRow, isCompleted && styles.completedDayRow, highlightedIndex === idx && styles.longPressHighlight]}>
                                    <Text style={styles.tableDay}>{day.dayOfWeek}</Text>
                                    <Text style={styles.tableType}>{day.splitType}</Text>

                                    <Text
                                        style={[
                                            styles.completionToggle
                                            && styles.completedToggle,
                                        ]}
                                    >
                                        █
                                    </Text>
                                </Pressable>
                            );
                        }
                    )}
                </ScrollView>

                <Modal
                    visible={trainingPlanModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => {
                        setTrainingPlanModalVisible(false)
                        setHighlightedIndex(null);
                    }}
                >
                    <View style={styles.modalBackdrop}>
                        <Pressable
                            onPress={() => {
                                setTrainingPlanModalVisible(false);
                                setHighlightedIndex(null);
                            }}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseText}>✕</Text>
                        </Pressable>

                        <View style={styles.modalHeaderText}>
                            <Text style={styles.modalTitle}>{selectedDay?.dayOfWeek} - {selectedDay?.splitType}</Text>

                            <ScrollView style={styles.modalScroll}>
                                {selectedDay?.exercises.length ? (
                                    selectedDay.exercises.map((exercise, index) => (
                                        <View key={index} style={styles.exerciseRow}>
                                            <Text style={styles.exerciseText}>
                                                ░ {exercise.name?.toUpperCase()} ░
                                            </Text>

                                            {exercise.sets.map((set, sIdx) => (
                                                <Text key={sIdx} style={styles.exerciseDetail}>
                                                    Set {sIdx + 1}: {set.reps} reps @ {set.weight} {set.unit.toUpperCase()}
                                                </Text>
                                            ))}

                                            <View style={styles.scanline} />
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.exerciseText}>No exercises available</Text>
                                )}
                            </ScrollView>
                        </View>
                    </View>

                </Modal>

                <Pressable onPress={goNext} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>›</Text>
                </Pressable>
            </View>

            <VHSGlowDivider />

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Total Exercises Planned: {totalExercises}</Text>
                <Text style={styles.summaryText}>Estimated Volume: {estimatedVolume.toLocaleString()} kg</Text>
                <Text style={styles.summaryText}>Days Completed: {daysCompleted} / {currentPlan?.days?.length}</Text>
            </View>

            <View style={styles.newPlanContainer}>
                <Pressable onPress={() => setModalVisible(true)}>
                    <VHSButton title="+ Create New Plan" onPress={() => setModalVisible(true)} />
                </Pressable>

                <TrainingPlanModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSavePlan}
                />
            </View>

            <Ticker />
        </View >
    );
}

const styles = StyleSheet.create({

    modalCloseButton: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 48,
        height: 48,
        borderRadius: 999,
        backgroundColor: '#00ffcc',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 12,
        elevation: 10,
    },

    modalCloseText: {
        color: '#0A0F1C',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },


    modalBackdrop: {
        flex: 1,
        backgroundColor: '#111622', // dark semi-transparent
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    modalHeaderText: {
        backgroundColor: '#111622',
        padding: 20,
        borderRadius: 10,
        width: '88%',           // <-- wider modal (you can try '95%' or '100%' too)
        maxHeight: '85%',       // <-- taller modal
        shadowColor: '#00ffcc', // optional glow effect
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,           // for Android shadow
    },
    modalTitle: {
        fontFamily: 'monospace',
        fontSize: 18,
        color: '#00ffcc',
        marginBottom: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'center',
        textShadowColor: '#00ffcc',
        textShadowRadius: 6,
    },
    modalScroll: {
        maxHeight: '75%',
    },
    exerciseRow: {
        marginBottom: 12,
    },
    exerciseText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00ffcc',
        fontFamily: 'monospace',
    },
    exerciseDetail: {
        fontSize: 14,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        marginBottom: 6,
    },
    scanline: {
        height: 1,
        backgroundColor: '#00ffcc33',
        marginVertical: 4,
    },
    longPressHighlight: {
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        borderWidth: 1,
        borderColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        shadowOpacity: 0.6,
    },

    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        maxHeight: '70%',
    },
    modalText: {
        fontSize: 16,
        marginVertical: 2,
    },
    dateContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },

    datePressable: {
        alignItems: 'center',
    },

    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateRangeText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 20,
        letterSpacing: 3,
        textShadowColor: '#00ffcc',
        textShadowRadius: 8,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textDecorationLine: 'underline',  // <-- underline here
    },


    dateYearText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 14,
        letterSpacing: 5,
        textShadowColor: '#00ffcc',
        textShadowRadius: 6,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginTop: 2,
    },

    calendarIcon: {
        marginLeft: 8,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },

    root: {
        flex: 1,
        backgroundColor: '#0A0F1C',
        paddingTop: 30,
        justifyContent: 'flex-start',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 30,
    },
    vhsHudTitle: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 18,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 255, 204, 0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#00ffcc',
        borderRadius: 2,
        letterSpacing: 1,
        textTransform: 'uppercase',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
        marginBottom: 12,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    splitName: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2,
        marginBottom: 4,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        textTransform: 'uppercase',
    },
    screenTitle: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 20,
        letterSpacing: 2,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    carouselContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowButton: {
        paddingHorizontal: 10,
        paddingVertical: 30,
    },
    arrowText: {
        color: '#00ffcc',
        fontSize: 40,
        fontWeight: 'bold',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    tableContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#00ffcc',
        borderRadius: 12,
        opacity: 1,
        overflow: 'hidden',
        maxHeight: 300,
        backgroundColor: 'transparent',
    },
    scrollArea: {
        backgroundColor: 'transparent',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    tableDay: {
        flex: 1,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 14,
        textShadowColor: 'rgba(0, 255, 204, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    tableType: {
        flex: 1,
        color: '#7ACFCF',
        fontFamily: 'monospace',
        fontSize: 14,
        textAlign: 'center',
        letterSpacing: 2,
        opacity: 0.8,
    },
    tableStatus: {
        flex: 2,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 14,
        textAlign: 'right',
        letterSpacing: 2,
    },
    completedDayRow: {
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
    },

    completionToggle: {
        fontFamily: 'monospace',
        fontSize: 22,
        marginLeft: 10,
        color: '#333',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
        opacity: 0.4,
    },

    completedToggle: {
        color: '#00ffcc',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
        opacity: 1,
        transform: [{ scale: 1.05 }],
    },

    summaryContainer: {
        padding: 12,
        marginHorizontal: 30,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#00ffcc',
        borderRadius: 10,
        opacity: 0.85,
    },
    summaryText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 2,
    },
    newPlanContainer: {
        alignItems: 'center',
    },
});
