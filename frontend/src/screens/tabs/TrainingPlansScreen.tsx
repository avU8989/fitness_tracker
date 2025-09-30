import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    Modal,
    FlatList,
} from 'react-native';
import TrainingPlanModal from '../../components/modals/TrainingPlanModal';
import Ticker from '../../components/Ticker';
import VHSGlowDivider from '../../components/VHSGlowDivider';
import CustomDatePickerModal from '../../components/modals/CustomDatePickerModal';
import VHSButton from '../../components/VHSButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { getTrainingPlans } from '../../services/trainingPlanService';
import { BasePlanDTO, DayOfWeek, TrainingPlanAssignment, TrainingPlanUI, WorkoutDay } from '../../types/trainingPlan';
import * as Haptics from 'expo-haptics';
import { getActivePlan } from '../../services/planAssignmentsService';
import { toUIPlan } from '../../utils/apiHelpers';
import { homeStyles } from './HomeScreen';
import { useDashboard } from '../../context/DashboardContext';

export default function TrainingPlansScreen() {
    const { token } = useContext(AuthContext);
    const [plans, setPlans] = useState<TrainingPlanUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [blinkVisible, setBlinkVisible] = useState(true);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [activePlan, setActivePlan] = useState<TrainingPlanAssignment | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [completedDays, setCompletedDays] = useState<DayOfWeek[]>([]);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const { state } = useDashboard();

    const progress = state.plannedWorkoutDaysForWeek
        ? state.workoutsThisWeek / state.plannedWorkoutDaysForWeek
        : 0;

    // Blink animation for session status
    useEffect(() => {
        const interval = setInterval(() => {
            setBlinkVisible((v) => !v);
        }, 600);
        return () => clearInterval(interval);
    }, []);

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
            yearLine: yearStart === yearEnd ? `${yearStart}` : `${yearStart}/${yearEnd}`,
        };
    };

    const formatFullDateRange = (startDate: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");

        const dayStart = pad(startDate.getDate());
        const monthStart = pad(startDate.getMonth() + 1);
        const yearStart = startDate.getFullYear();

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const dayEnd = pad(endDate.getDate());
        const monthEnd = pad(endDate.getMonth() + 1);
        const yearEnd = endDate.getFullYear();

        return `${dayStart}.${monthStart}.${yearStart} — ${dayEnd}.${monthEnd}.${yearEnd}`;
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

    const getPlanStatus = () => {
        if (activePlan) {
            // if endDate is missing, treat as ongoing/active
            if (!activePlan.endDate) return "ACTIVE";

            const now = new Date();
            const start = new Date(activePlan.startDate);
            const end = new Date(activePlan.endDate);

            if (now >= start && now <= end) return "ACTIVE";
            if (now >= start && end === null) return "ACTIVE";
            if (now > end) return "COMPLETED";
            if (now < start) return "UPCOMING";
        }

        return "UPCOMING";
    };

    const planStatus = getPlanStatus();


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
        <ScrollView style={styles.root} contentContainerStyle={styles.rootcontent}>

            <View style={styles.planStatusContainer}>
                <View
                    style={[
                        styles.recIndicator,
                        {
                            backgroundColor:
                                planStatus === "ACTIVE"
                                    ? "limegreen"
                                    : planStatus === "COMPLETED"
                                        ? "gray"
                                        : "orange",
                            opacity: blinkVisible ? 1 : 0.3,
                        },
                    ]}
                />
                <Text
                    style={[
                        styles.planStatusText,
                        {
                            color:
                                planStatus === "ACTIVE"
                                    ? "limegreen"
                                    : planStatus === "COMPLETED"
                                        ? "gray"
                                        : "orange",
                        },
                    ]}
                >
                    {`TRAINING PLAN: ${planStatus}`}
                </Text>
            </View>


            <Text style={styles.vhsHudTitle}>▓CHANNEL 04 — TRAIN PLAN▓</Text>
            <View style={styles.titleContainer}>
                <Text style={styles.vhsSubHeader}>↳ {activePlan ? toUIPlan(activePlan.trainingPlan).name : currentPlan?.name ?? "No plan"} ↲</Text>

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
                                    ? `${new Date(activePlan.startDate).toLocaleDateString("de-DE")}—${activePlan.endDate
                                        ? new Date(activePlan.endDate).toLocaleDateString("de-DE")
                                        : "ongoing"
                                    }`
                                    : formatFullDateRange(new Date())}
                            </Text>


                            <Ionicons name="calendar-outline" size={24} color="#00ffcc" style={styles.calendarIcon} />
                        </View>
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

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.weekContainer}
                >
                    {(activePlan ? toUIPlan(activePlan.trainingPlan) : currentPlan)?.days.map(
                        (day, idx) => {
                            const isCompleted = completedDays.includes(day.dayOfWeek);

                            return (
                                <Pressable
                                    key={idx}
                                    onLongPress={() => {
                                        setHighlightedIndex(idx);
                                        setSelectedDay(day);
                                        setTrainingPlanModalVisible(true);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    style={[
                                        styles.dayCard,
                                        isCompleted && styles.completedCard,
                                        highlightedIndex === idx && styles.highlightedCard,
                                    ]}
                                >
                                    {/* Header */}
                                    <View style={styles.dayHeader}>
                                        <Text style={styles.dayTitle}>{day.dayOfWeek}</Text>
                                        <Text style={styles.splitType}>{day.splitType}</Text>
                                    </View>

                                    {/* Exercises */}
                                    {day.exercises?.length > 0 ? (
                                        <View style={styles.exercisePreview}>
                                            {day.exercises.slice(0, 2).map((ex, exIdx) => (
                                                <Text key={exIdx} style={styles.exerciseLine}>
                                                    ▸ {ex.name} — {ex.sets[0].reps} x {ex.sets[0].weight}{ex.sets[0].unit}
                                                </Text>
                                            ))}
                                            {day.exercises.length > 2 && (
                                                <Text style={styles.moreExercises}>
                                                    + {day.exercises.length - 2} more...
                                                </Text>
                                            )}
                                        </View>
                                    ) : (
                                        <Text style={styles.restText}>Rest Day</Text>
                                    )}
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
            </View>

            <VHSGlowDivider />



            <View style={styles.powerBarContainer}>
                <View style={styles.logFeed}>

                    <Text style={styles.feedHeader}>▓ TRAINING FEED ▓</Text>

                    <Text style={styles.summaryText}>Total Exercises Planned: {totalExercises}</Text>
                    <Text style={styles.summaryText}>Estimated Volume: {estimatedVolume.toLocaleString()} kg</Text>
                </View>

                <Text style={styles.powerBarSubLabel}>
                    ↳ Workouts Completed: {state.workoutsThisWeek} / {state.plannedWorkoutDaysForWeek}
                </Text>

                <View style={styles.powerBarTrack}>
                    <View
                        style={[
                            styles.powerBarFill,
                            { width: `${Math.min(progress * 100, 100)}%` },
                        ]}
                    />
                </View>

                <View style={homeStyles.barTickRow}>
                    <Text style={homeStyles.tickLabel}>NONE</Text>
                    <Text style={homeStyles.tickLabel}>PLAN GOAL</Text>
                </View>

                <Text style={styles.diagnosticNote}>
                    &gt;&gt;KEEP PUSHING — FINISH STRONG&lt;&lt;
                </Text>
            </View>


            <View style={styles.newPlanContainer}>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    style={({ pressed }) => [
                        styles.endButton,
                        pressed && { opacity: 0.7 }, // little feedback when pressed
                    ]}
                >
                    <Text style={styles.endButtonText}>■ CREATE NEW PLAN</Text>
                </Pressable>

                <TrainingPlanModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSavePlan}
                />
            </View>

        </ScrollView >
    );
}

const styles = StyleSheet.create({
    vhsSubHeader: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 20,
        marginTop: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    root: {
        flex: 1,
        backgroundColor: '#0A0F1C',
    },
    planStatusText: {
        color: "#BFC7D5",
        fontFamily: "monospace",
        fontSize: 13,
        letterSpacing: 2,
        textTransform: "uppercase",
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },

    planStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        alignSelf: 'center',
    },
    recIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff0055',
        marginRight: 10,
        shadowColor: '#ff0055',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
    },
    endButton: {
        backgroundColor: '#00ffcc',
        marginTop: 20,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#00ffcc',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        width: '100%',
    },
    endButtonText: {
        color: '#0A0F1C',
        fontFamily: 'monospace',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    powerBarContainer: {
        padding: 12,
        backgroundColor: '#0A0F1C',
        borderColor: '#rgba(0, 255, 204, 0.1)',
        borderWidth: 1.2,
        borderRadius: 6,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    powerBarLabel: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#00ffcc',
        letterSpacing: 2,
        marginBottom: 4,
    },
    feedHeader: {
        color: '#00ffcc',
        fontSize: 13,
        fontFamily: 'monospace',
        marginBottom: 6,
        letterSpacing: 2,
    },
    container: {
        height: 400,
    },
    weekContainer: {
        flexDirection: "row",
        paddingVertical: 12,
    },
    powerBarSubLabel: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#BFC7D5',
        marginBottom: 8,
        opacity: 0.8,
    },
    powerBarTrack: {
        height: 10,
        backgroundColor: '#1A1F2C',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    powerBarFill: {
        height: '100%',
        backgroundColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    diagnosticNote: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 11,
        letterSpacing: 0.88,
        opacity: 0.9,
        textAlign: 'center',
        marginTop: 6,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
        textTransform: 'uppercase',
    },

    dayCard: {
        width: 160,
        height: 200,
        marginRight: 14,
        borderWidth: 1,
        borderColor: "#rgba(0, 255, 204, 0.1)",
        borderRadius: 12,
        padding: 14,
        backgroundColor: "#111622",
    },

    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    dayTitle: {
        fontFamily: "monospace",
        fontSize: 16,
        fontWeight: "bold",
        color: "#00ffcc",
    },

    splitType: {
        fontFamily: "monospace",
        fontSize: 14,
        color: "#BFC7D5",
    },

    exercisePreview: {
        marginTop: 4,
    },

    exerciseLine: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#BFC7D5",
        marginBottom: 2,
    },

    moreExercises: {
        fontFamily: "monospace",
        fontSize: 12,
        fontStyle: "italic",
        color: "#7ACFCF",
        marginTop: 4,
    },

    restText: {
        fontFamily: "monospace",
        fontSize: 12,
        fontStyle: "italic",
        color: "#888",
    },

    completedCard: {
        backgroundColor: "rgba(0,255,204,0.08)",
    },

    highlightedCard: {
        borderColor: "#ff4444",
        shadowColor: "#ff4444",
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },

    summaryCard: {
        borderWidth: 1,
        borderColor: "#00ffcc",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        backgroundColor: "#0A0F1C",
    },

    summaryTitle: {
        fontFamily: "monospace",
        fontSize: 14,
        fontWeight: "bold",
        color: "#00ffcc",
        marginBottom: 6,
    },


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

    rootcontent: {
        padding: 20,
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
        fontSize: 16,
        letterSpacing: 0,
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

    headerContainer: {
        alignItems: 'center',
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
        flex: 1,
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

    logFeed: {
        marginTop: 0,
        flex: 1,
    },

    summaryText: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 12,
        paddingVertical: 3,
        letterSpacing: 2,
        marginBottom: 2,
    },
    newPlanContainer: {
        alignItems: 'center',
    },
});
