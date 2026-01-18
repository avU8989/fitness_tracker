import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    FlatList,
} from 'react-native';
import TrainingPlanModal from '../../components/modals/TrainingPlanModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { getTrainingPlans } from '../../services/trainingPlanService';
import { DayOfWeek, TrainingPlanAssignment, TrainingPlanUI, WorkoutDay } from '../../types/trainingPlan';
import { getActivePlan } from '../../services/planAssignmentsService';
import { toUIPlan } from '../../utils/apiHelpers';
import { useDashboard } from '../../context/DashboardContext';
import TrainingPlanCard from '../../components/TrainingPlanCard';
import SettingModal from '../../components/SettingModal';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { TrainingPlansStackParamList } from '../../navigation/navtypes';
import DiscoverGenreCard from '../../components/TrainingplanGenreCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TrainingPlanCardLong from '../../components/TrainingPlanCardLong';
import TrainingTopBar from '../../components/TopBar';


type Nav = StackNavigationProp<
    TrainingPlansStackParamList,
    "TrainingPlansScreen"
>;


export default function TrainingPlansScreen() {
    const { token } = useContext(AuthContext);
    const [plans, setPlans] = useState<TrainingPlanUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [blinkVisible, setBlinkVisible] = useState(true);
    const [activePlan, setActivePlan] = useState<TrainingPlanAssignment | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [completedDays, setCompletedDays] = useState<DayOfWeek[]>([]);
    const { state } = useDashboard();
    const navigation = useNavigation<Nav>();
    const TAGS = [
        "All",
        "Push",
        "Pull",
        "Legs",
        "Upper Body",
        "Full Body",
        "Strength",
        "Hypertrophy",
    ];

    const [selectedTag, setSelectedTag] = useState("All");

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
            console.log(plans);

            setCurrentIndex(0);
            setCompletedDays([]);

        } catch (err: any) {
            setError(err.message ?? 'Failed to fetch training plans');
            console.log(error);
        } finally {
            setLoading(false);
        }

    }

    const openPlanDetails = (plan: TrainingPlanUI) => {
        if (plan === null) {
            return;
        }

        navigation.navigate("TrainingPlanScreen", { plan });
    }

    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
    const [trainingPlanModalVisible, setTrainingPlanModalVisible] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<TrainingPlanUI | null>(null);
    const [settingModalVisible, setSettingModalVisible] = useState(false);

    useEffect(() => {
        loadPlans();
        if (activePlan !== null) {
            setCurrentPlan(toUIPlan(activePlan?.trainingPlan));
        }
    }, [token]);

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


    useEffect(() => {
        async function loadActivePlan() {
            try {
                if (!token) {
                    console.log("No token provided, cannot fetch active training plan");
                    return;
                }

                const today = new Date();
                const queryDate = new Date().toISOString().split("T")[0];

                const fetchedActivePlan = await getActivePlan(token, queryDate);

                setActivePlan(fetchedActivePlan);
            } catch (err) {
                console.error("Failed to fetch active plan:", err);
                setActivePlan(null);
            }
        }

        loadActivePlan();
    }, [token]);

    function chunkIntoColumns<T>(arr: T[], size = 2): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    const inactivePlans = React.useMemo(() => {
        if (!plans || plans.length === 0) return [];

        // If you have an active plan
        const activeId = activePlan?.trainingPlan?._id;

        const filtered = activeId
            ? plans.filter(p => p._id !== activeId)
            : plans;

        return chunkIntoColumns(filtered, 1);
    }, [plans, activePlan]);

    function showTrainingPlanModal(plan: TrainingPlanUI) {
        setSelectedPlan(plan);
        setTrainingPlanModalVisible(true);
    }

    function showSetting(plan: TrainingPlanUI) {
        setSelectedPlan(plan);
        setSettingModalVisible(true);
    }

    async function refreshActivePlan() {
        if (!token) return;

        try {
            const today = new Date().toISOString().split("T")[0];
            const fetchedActivePlan = await getActivePlan(token, today);
            setActivePlan(fetchedActivePlan);
        } catch (err) {
            console.log("No active plan → clearing UI");
            setActivePlan(null);
        }
    }


    return (
        <ScrollView style={styles.root} contentContainerStyle={styles.rootcontent}>

            <TrainingTopBar title="Training Plan"
                status={planStatus}
                blinkVisible={blinkVisible}
                onLeftPress={() => setModalVisible(true)}
                onRightPress={() => {
                    // open search
                }}>

            </TrainingTopBar>

            {activePlan && (
                <View style={styles.heroCard}>
                    <View style={styles.heroLeft}>
                        <View style={styles.trainingLabelRow}>
                            <MaterialCommunityIcons
                                name="history"
                                size={16}
                                color="#00ffcc"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.heroEyebrow}>CURRENT PLAN</Text>
                        </View>
                    </View>
                    <View style={{ paddingVertical: 8 }}>
                        <TrainingPlanCard plan={toUIPlan(activePlan.trainingPlan)}
                            isActive={true}
                            big
                            onPress={() => { openPlanDetails(toUIPlan(activePlan.trainingPlan)); }}
                            onLongPress={() => { showSetting(toUIPlan(activePlan.trainingPlan)); }}
                            small={undefined}
                        />
                    </View>

                </View>
            )}
            <View style={styles.heroCardYourTrainingPlans}>
                <View style={styles.heroLeft}>
                    <View style={styles.trainingHeaderRow}>
                        <View style={styles.trainingLeft}>
                            <MaterialCommunityIcons
                                name="history"
                                size={16}
                                color="#00ffcc"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.heroEyebrow}>MY TRAINING PLANS</Text>
                        </View>
                        <Text style={styles.sectionHint}>See All {'>'}</Text>

                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.weekContainer}
                >
                    <FlatList
                        horizontal
                        data={inactivePlans}
                        keyExtractor={(col, idx) => idx.toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 0 }}
                        renderItem={({ item: column }) => (
                            <View style={styles.column}>
                                {column.map((plan, idx) => (
                                    <TrainingPlanCard
                                        key={idx}
                                        plan={plan}
                                        small
                                        isActive={false}
                                        onPress={() => {
                                            openPlanDetails(plan);
                                        }}
                                        onLongPress={() => {
                                            showSetting(plan);
                                        }} big={undefined} />


                                ))}


                            </View>
                        )}
                    />
                </ScrollView>
                {/* 
                 <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tagRow}
                >
                    {TAGS.map((tag) => {
                        const isActive = selectedTag === tag;

                        return (
                            <Pressable
                                key={tag}
                                onPress={() => setSelectedTag(tag)}
                                style={[
                                    styles.tagPill,
                                    isActive && styles.tagPillActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tagText,
                                        isActive && styles.tagTextActive,
                                    ]}
                                >
                                    {tag}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
                */}

            </View>

            <SettingModal
                visible={settingModalVisible}
                plan={selectedPlan}
                isActive={selectedPlan?._id === activePlan?.trainingPlan?._id}
                onClose={() => setSettingModalVisible(false)}
                onPlanActivated={refreshActivePlan}
            />


            <View style={styles.heroCardSuggeestedForYou}>

                <View style={styles.heroLeft}>
                    <View style={styles.trainingHeaderRow}>
                        <View style={styles.trainingLeft}>
                            <MaterialCommunityIcons
                                name="history"
                                size={16}
                                color="#00ffcc"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.heroEyebrow}>FOR YOU</Text>
                        </View>
                    </View>
                    <Text style={styles.smallLabel}>RECOMMENDED</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.weekContainer}
                >
                    <TrainingPlanCardLong
                        title="PUSH / PULL / LEGS"
                        subtitle="Build strength & size"
                        tag="RECOMMENDED"
                        image={require("../../assets/discover/crossfit.jpg")}
                        onPress={() => {
                        }}
                    />
                    <TrainingPlanCardLong
                        title="UPPER / LOWER"
                        subtitle="Balanced hypertrophy"
                        image={require("../../assets/discover/bodybuilding.jpg")}
                        onPress={() => {
                        }}
                    />
                    <TrainingPlanCardLong
                        title="FULL BODY"
                        subtitle="Efficient & intense"
                        image={require("../../assets/discover/powerlifting.jpg")}
                        onPress={() => {
                        }}
                    />
                </ScrollView>
            </View>


            {/* DISCOVER NEW TRAINING PLANS */}
            <View style={styles.heroCardDiscover}>

                <View style={styles.heroLeft}>
                    <View style={styles.trainingHeaderRow}>
                        <View style={styles.trainingLeft}>
                            <MaterialCommunityIcons
                                name="history"
                                size={16}
                                color="#00ffcc"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.heroEyebrow}>GENRE</Text>
                        </View>
                        <Text style={styles.sectionHint}>See All {'>'}</Text>

                    </View>
                    <Text style={styles.smallLabel}>DISCOVER</Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.weekContainer}
                >
                    <DiscoverGenreCard
                        title="CROSSFIT"
                        subtitle="FUNCTIONAL • CONDITIONING"
                        image={require("../../assets/discover/crossfit.jpg")}
                        onPress={() => {
                        }}
                    />

                    <DiscoverGenreCard
                        title="BODYBUILDING"
                        subtitle="HYPERTROPHY • AESTHETICS"
                        image={require("../../assets/discover/bodybuilding.jpg")}
                        onPress={() => {
                        }}
                    />

                    <DiscoverGenreCard
                        title="POWERLIFTING"
                        subtitle="STRENGTH • BARBELL"
                        image={require("../../assets/discover/powerlifting.jpg")}
                        onPress={() => {
                        }}
                    />
                </ScrollView>
            </View>

            <View style={styles.heroCardSuggeestedForYou}>

                <View style={styles.heroLeft}>
                    <View style={styles.trainingHeaderRow}>
                        <View style={styles.trainingLeft}>
                            <MaterialCommunityIcons
                                name="history"
                                size={16}
                                color="#00ffcc"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.heroEyebrow}>TRENDING</Text>
                        </View>
                    </View>
                    <Text style={styles.smallLabel}>POPULAR TRAINING PLANS</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.weekContainer}
                >
                    <TrainingPlanCardLong
                        title="POWERBUILDING"
                        subtitle="Strength + aesthetics"
                        tag="TRENDING"
                        image={require("../../assets/discover/crossfit.jpg")}
                        onPress={() => {
                        }}
                    />
                    <TrainingPlanCardLong
                        title="ATHLETIC PERFORMANCE"
                        subtitle="Speed & power"
                        image={require("../../assets/discover/bodybuilding.jpg")}
                        onPress={() => {
                        }}
                    />
                    <TrainingPlanCardLong
                        title="HYPERTROPHY FOCUS"
                        subtitle="Muscle growth"
                        image={require("../../assets/discover/powerlifting.jpg")}
                        onPress={() => {
                        }}
                    />
                </ScrollView>
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
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerSidePlaceholder: {
        width: 30,
    },
    trainingHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },

    trainingLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    sectionHeader: {
        marginBottom: 10,
    },

    sectionHint: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#7ACFCF',
        opacity: 0.6,
        letterSpacing: 1,
        marginRight: 18,
    },

    heroHeader: {
        marginBottom: 12,
    },

    heroEyebrow: {
        fontFamily: "monospace",
        fontSize: 11,
        letterSpacing: 3,
        color: "#00ffcc",
        opacity: 0.7,
        marginBottom: 4,
    },

    trainingLabelRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    heroLeft: {
        paddingTop: 8,
        paddingLeft: 8,
    },
    heroLabel: {
        fontFamily: "monospace",
        fontSize: 11,
        color: "#00ffcc",
        letterSpacing: 3,
        textTransform: "uppercase",
        marginBottom: 4,
        opacity: 0.9,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    headerIconContainer: {
        marginLeft: 50,
        flexDirection: "row",
    },

    headerSide: {
        paddingLeft: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    planStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    bigLabel: {
        fontFamily: "monospace",
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        paddingTop: 15,
        letterSpacing: 2,
        marginBottom: 18,
    },
    smallLabel: {
        fontWeight: "bold",
        textAlign: "left",
        fontFamily: "monospace",
        color: "white",
        fontSize: 18,
        letterSpacing: 1.5,
        marginTop: 6,
    },

    headerContainer: {
        marginTop: 18,
        marginBottom: 4,
        alignItems: 'center',
    },

    screenBigTitle: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 22,
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 6,
        textShadowColor: '#00ffcc',
        textShadowRadius: 8,
    },

    screenSubtitle: {
        color: '#7ACFCF',
        fontFamily: 'monospace',
        fontSize: 12,
        opacity: 0.8,
        letterSpacing: 1,
        marginBottom: 10,
        textAlign: 'center',
    },

    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 8,
        gap: 8,
        justifyContent: "center",
    },

    tagPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: "#00ffcc44",
        backgroundColor: "#0A0F1C",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },

    tagPillActive: {
        backgroundColor: "rgba(0,255,204,0.15)",
        borderColor: "#00ffcc",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },

    tagText: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#7ACFCF",
        letterSpacing: 1,
    },

    tagTextActive: {
        color: "#00ffcc",
        fontWeight: "bold",
        textShadowColor: "#00ffcc",
        textShadowRadius: 6,
    },


    heroCard: {
        backgroundColor: "#111622",
        height: 275,
        borderRadius: 18,
        borderLeftWidth: 3,
        borderLeftColor: "#00ffcc",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginTop: 8,
    },
    heroCardYourTrainingPlans: {
        backgroundColor: "#111622",
        borderRadius: 18,
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 8,
        marginTop: 16,

    },
    heroCardDiscover: {
        backgroundColor: "#111622",
        borderRadius: 18,
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 8,
        marginTop: 8,

    },
    heroCardSuggeestedForYou: {
        backgroundColor: "#111622",
        borderRadius: 18,
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 8,
        marginTop: 8,

    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 16,
    },

    dayBox: {
        width: 42,
        height: 42,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#00ffcc44",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111622",
    },

    dayBoxDone: {
        borderColor: "#00ff99",
        backgroundColor: "rgba(0,255,153,0.12)",
        shadowColor: "#00ff99",
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },

    dayBoxToday: {
        borderColor: "#00ffcc",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },

    dayText: {
        fontFamily: "monospace",
        color: "#BFC7D5",
        fontSize: 10,
        marginBottom: 2,
    },

    column: {
        flexDirection: 'column',
        gap: 8,
    },

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
        color: "white",
        fontFamily: "monospace",
        fontSize: 22,
        fontWeight: "bold",
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
        paddingVertical: 12,
        borderRadius: 18,
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
    splitTypeText: {
        color: '#00ffcc',
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 6,
        letterSpacing: 2,
    },
    container: {
        height: 400,
    },
    weekContainer: {
        flexDirection: "row",
        padding: 8,
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
    planCard: {
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
