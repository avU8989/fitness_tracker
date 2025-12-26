import React, { act, useCallback, useContext, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    ImageBackground, Image
} from 'react-native';
import VHSHeader from '../../components/VHSHeader';
import { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; // at top
import VHSGlowDivider from '../../components/VHSGlowDivider';
import { useHeartRateMonitor } from '../../hooks/useHeartRateMonitor';
import { usePulseOximeterMonitor } from '../../hooks/usePulseOximeterMonitor';
import { getStatsOverview, getStatsProgress } from '../../services/statsService';
import { AuthContext } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSleepMonitor } from '../../hooks/useSleepMonitor';
import { usePhysicalActivityMonitor } from '../../hooks/useStepsMonitor';
import { useDashboard } from '../../context/DashboardContext';
import { createPhysicalActivityLog } from '../../services/physicalActivityService';
import { createHeartRateLog } from '../../services/heartRateService';
import { CreateHeartRateLogRequest } from '../../requests/CreateHeartRateLogRequest';
import { CreatePulseOximeterLogRequest } from '../../requests/CreatePulseOximeterLogRequest';
import { createPulseOximeterLog } from '../../services/pulseOximeterService';
import { CreateSleepLogRequest, SleepStagesDTO } from '../../requests/CreateSleepLogRequest';
import { createSleepLog } from '../../services/sleepService';
import { CreatePhysicalActivityLogRequest } from '../../requests/CreatePhysicalActivityLogRequest';
import { Animated, Easing } from "react-native";
import HealthConnect, { getGrantedPermissions, getSdkStatus, Permission, SdkAvailabilityStatus } from "react-native-health-connect";
import TodayOverviewPanel from '../../components/TodayOverviewPanel';
import WeeklyOverviewCircles from '../../components/WeeklyOverview';
import { isSameDay } from "date-fns";
import {
    initialize,
    requestPermission,
    readRecords,
} from 'react-native-health-connect';
import { useFocusEffect } from '@react-navigation/native';
import { getActivePlan } from '../../services/planAssignmentsService';
import { getTodayName, normalizeExercises, toDateFormatFetchActiveTrainingPlans, toUIPlan } from '../../utils/apiHelpers';
import { PlannedExercise } from './LogScreen';
import { Exercise, ExerciseSet, WorkoutDay } from '../../types/trainingPlan';
import { getNextSkippedDay, getNextUpcomingWorkoutDay } from '../../services/workoutLogService';
import { getPlanStats } from '../../utils/planStats';
import { useTrainingPlan } from '../../context/TrainingPlanContext';
import { LoggedExercise } from '../../types/workoutLog';


export const GRAIN_TEXTURE = require('../../assets/home_bg_2.png');
export const SCANLINE_TEXTURE = require('../../assets/abstract-geometric-background-shapes-texture.jpg');

export default function HardloggerUI() {
    const bpm = useHeartRateMonitor();
    const pulseOximeterData = usePulseOximeterMonitor();
    const { token } = useContext(AuthContext);
    const [workoutsThisWeek, setWorkoutsThisWeek] = useState(null);
    const [lastWorkout, setLastWorkout] = useState("");
    const [workoutStreak, setWorkoutStreak] = useState(null);
    const { remainingDays, setRemainingDays } = useWorkout();
    const { loggedWorkout } = useWorkout();
    const { state, setState } = useDashboard();
    const [progress, setProgress] = useState<ProgressUI>();
    const sleepData = useSleepMonitor();
    const physicalActivityData = usePhysicalActivityMonitor();
    const [skippedSplitType, setSkippedSplitType] = useState(null);
    const lastSentRefHeartRate = useRef<number>(0);
    const lastSentRefSleep = useRef<number>(0);
    const lastSentRefPulseOximeter = useRef<number>(0);
    const lastSentRefPhysicalActivity = useRef<number>(0);

    //-------------WORKOUT CONTEXT-----------------
    const { plannedExercises, setPlannedExercises } = useWorkout();
    const { currentExercises, setCurrentExercises } = useWorkout();
    const { currentPlanId, setCurrentPlanId } = useWorkout();
    const { skippedWorkout, setSkippedWorkout } = useWorkout();
    const { currentWorkoutDayId, setCurrentWorkoutDayId } = useWorkout();
    const { splitNamePlanned, setSplitNamePlanned } = useWorkout();
    const { splitNameSkipped, setSplitNameSkipped } = useWorkout();
    const { loggedExercises, loggedWorkoutSplitType, loggedWorkoutPerformed } = useWorkout();
    const { loadTodayWorkoutStatus } = useWorkout();
    const { nextUpcomingWorkout, setNextUpcomingWorkout } = useWorkout();

    //-------------TRAININGPLAN CONTEXT------------
    const { refreshedTrainingPlanAssignment } = useTrainingPlan();
    const { planDeactivated } = useTrainingPlan();

    //-------------TODAY WORKOUT---------------------
    const [activePlan, setActivePlan] = useState(null);
    const [hasSkippedWorkout, setHasSkippedWorkout] = useState<boolean>(false);
    const [hasWorkoutToday, setHasWorkoutToday] = useState<boolean>(false);

    //-------------HEALTH CONNECT API---------------------
    const [bpmHealthConnect, setBpmHealthConnect] = useState<number>(0);
    const [stepsHealthConnect, setStepsHealthConnect] = useState<number>(0);
    const [totalCaloriesBurnedHealthConnect, setTotalCaloriesBurnedHealthConnect] = useState<string>();
    const [distanceHealthConnect, setDistanceHealthConnect] = useState<number>(0);

    type ProgressUI = {
        topLift: {
            name: string;
            weight: number;
            unit: string;
        };
        weeklyVolumeChange: string;
        thisWeekVolume: number,
        lastWeekVolume: number,
        pr: {
            name: string;
            weight: number;
            unit: string;
        }[];
    }

    useEffect(() => {
        loadWorkoutStats();
        loadWorkoutProgress();

        const grantPermission = async () => {
            //init client
            const isInitialized = await initialize();

            const grantedPermission = await requestPermission([
                { accessType: 'read', recordType: 'HeartRate' },
                { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
                { accessType: 'read', recordType: 'Steps' },
                { accessType: 'read', recordType: 'TotalCaloriesBurned' },
                { accessType: 'read', recordType: 'Distance' },
                { accessType: 'read', recordType: 'ExerciseSession' },
                { accessType: 'read', recordType: 'SleepSession' },
                { accessType: 'read', recordType: 'Distance' },
            ]);

        }

        grantPermission();

    }, []);

    useFocusEffect(
        useCallback(() => {
            console.log("Syncing with Health Connect");

            let intervalId: NodeJS.Timeout | null = null;

            const sync = async () => {
                await initialize();

                const granted = await getGrantedPermissions();

                const needed: Permission[] = [
                    { accessType: 'read', recordType: 'HeartRate' },
                    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
                    { accessType: 'read', recordType: 'Steps' },
                    { accessType: 'read', recordType: 'TotalCaloriesBurned' },
                    { accessType: 'read', recordType: 'Distance' },
                    { accessType: 'read', recordType: 'ExerciseSession' },
                    { accessType: 'read', recordType: 'SleepSession' },
                    { accessType: 'read', recordType: 'Distance' },
                ]

                const missing = needed.filter(p => {
                    return !granted.some(g => g.recordType === p.recordType);
                });

                if (missing.length > 0) {
                    console.log("[Sync] Asking for missing permission");
                    requestPermission(missing);
                }

                // ---- TIME RANGE -----------------------------------
                const start = new Date();
                start.setHours(0, 0, 0, 0);

                const end = new Date();
                end.setHours(23, 59, 59, 999);

                const timeRange = {
                    operator: "between" as const,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                };

                // ---- SAFE FETCH ------------------------------------
                function safeSortByEnd(records) {
                    return records.sort(
                        (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
                    );
                }

                // ---- HEART RATE -------------------------------------
                let hr;
                try { hr = await readRecords("HeartRate", { timeRangeFilter: timeRange }); } catch { }
                if (hr?.records?.length && hr.records[0].samples?.length) {
                    safeSortByEnd(hr.records);
                    const s = hr.records[0].samples;
                    setBpmHealthConnect(s[s.length - 1].beatsPerMinute);
                }

                // ---- STEPS -------------------------------------------
                let steps;
                try { steps = await readRecords("Steps", { timeRangeFilter: timeRange }); } catch { }
                if (steps?.records?.length) {
                    safeSortByEnd(steps.records);
                    setStepsHealthConnect(steps.records[0].count);
                }

                // ---- DISTANCE ----------------------------------------
                let dist;
                try { dist = await readRecords("Distance", { timeRangeFilter: timeRange }); } catch { }
                if (dist?.records?.length) {
                    safeSortByEnd(dist.records);
                    const meters = dist.records[0].distance.inMeters;
                    setDistanceHealthConnect(meters / 1000);
                }

                // ---- TOTAL CALORIES ----------------------------------
                let kcal;
                try { kcal = await readRecords("TotalCaloriesBurned", { timeRangeFilter: timeRange }); } catch { }
                if (kcal?.records?.length) {
                    safeSortByEnd(kcal.records);
                    setTotalCaloriesBurnedHealthConnect(kcal.records[0].energy.inKilocalories.toFixed(2));
                }
            }

            sync();

            //sync to Health Connect every 10 minutes
            intervalId = setInterval(sync, 10 * 60 * 1000);

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }, [])
    );

    async function loadWorkoutProgress() {
        try {
            if (token) {
                const response: ProgressUI = await getStatsProgress(token);
                setProgress(response);
            }
        } catch (err: any) {
            alert(err.message);
        }
    }

    const loadExercises = async (): Promise<boolean> => {
        if (!token) {
            alert('You must be logged in to log your workout');
            return false;
        }

        try {
            const today = toDateFormatFetchActiveTrainingPlans(new Date());
            const assignment = await getActivePlan(token, today);
            const trainingPlan = assignment.trainingPlan;

            if (!trainingPlan) {
                console.log("No active training plan found");
                setPlannedExercises([]);
                setCurrentExercises([]);
                return false;
            }

            setActivePlan(trainingPlan);
            setCurrentPlanId(trainingPlan._id);

            const todayName = getTodayName();

            // find today's workout day
            const todayWorkout = trainingPlan.days.find(
                (day) => day.dayOfWeek === todayName
            );

            if (!todayWorkout) {
                // today is not a workout day
                setPlannedExercises([]);
                setCurrentExercises([]);
                return false;
            }

            // there IS a workout day today
            setCurrentWorkoutDayId(todayWorkout._id);
            setSplitNamePlanned(todayWorkout.splitType);

            const exercises = todayWorkout.exercises ?? [];

            if (exercises.length === 0) {
                // day exists but contains no exercises
                setPlannedExercises([]);
                setCurrentExercises([]);
                return false;
            }

            // success — exercises exist for today
            setPlannedExercises(normalizeExercises(exercises));
            setCurrentExercises(normalizeExercises(exercises));

            return true;

        } catch (err) {
            console.error("Could not load exercises:", err);
            return false;
        }
    };

    const loadSkippedExercises = async () => {
        if (!token) {
            alert('You must be logged in to log your workout');
            return false;
        }

        const today = toDateFormatFetchActiveTrainingPlans(new Date());
        const assignment = await getActivePlan(token, today);
        const trainingPlan = assignment.trainingPlan;

        if (!trainingPlan) {
            console.log("Could not find active trainingplan");
            return false;
        }
        //set the trainingplanid to create workout logs for later
        setCurrentPlanId(trainingPlan._id);

        try {
            const response = await getNextSkippedDay(token);

            if (!response?.nextSkippedDay) {
                return false;
            }
            setSkippedWorkout({
                ...response.nextSkippedDay,
                exercises: normalizeExercises(response.nextSkippedDay.exercises)
            });
            setSplitNameSkipped(response.nextSkippedDay.splitType);
            setCurrentWorkoutDayId(response.nextSkippedDay._id);
            console.log(currentPlanId);

            return true;
        } catch (err: any) {
            alert(err.message);
            return false;
        }
    }

    useEffect(() => {
        const load = async () => {
            if (!token) {
                return;
            }

            setHasWorkoutToday(false); // temporary “loading” state

            if (planDeactivated) {
                // RESET ALL STATE
                setPlannedExercises([]);
                setCurrentExercises([]);
                setCurrentWorkoutDayId("");
                setSplitNamePlanned("");
                setSplitNameSkipped("");
                setSkippedWorkout(null);
                setActivePlan(null);
                setHasSkippedWorkout(false);
                setHasWorkoutToday(false);
                setNextUpcomingWorkout(null);

                return; // <— STOP HERE
            }


            const hasSkipped = await loadSkippedExercises();
            const hasPlanned = await loadExercises(); // MUST return boolean

            const response = await getNextUpcomingWorkoutDay(token);
            console.log(response);

            setNextUpcomingWorkout(response.nextUpcomingWorkout);
            setHasSkippedWorkout(hasSkipped);
            setHasWorkoutToday(hasPlanned);
        };

        load();
    }, [token, refreshedTrainingPlanAssignment, planDeactivated]);

    useEffect(() => {
        if (!token) {
            return;
        }
        loadTodayWorkoutStatus();
    }, [token]);



    //useEffect for sending BLE data to backend
    useEffect(() => {
        if (bpm != null && bpm !== 0 && token) {
            const now = Date.now();
            if (now - lastSentRefHeartRate.current > 60000) { // send every 60s
                lastSentRefHeartRate.current = now;

                const sendData = async () => {
                    try {
                        const request: CreateHeartRateLogRequest = { bpm, source: "BLE" };
                        await createHeartRateLog(token, request);
                    } catch (err) {
                        console.error("Failed to send heart rate log:", err);
                    }
                }

                sendData();
            }
        }
    }, [bpm, token]);

    //useEffect for sending BLE data to backend
    useEffect(() => {
        if (pulseOximeterData != null && pulseOximeterData?.spo2 != null && token) {
            const now = Date.now();
            if (now - lastSentRefPulseOximeter.current > 60000) { // send every 60s
                lastSentRefPulseOximeter.current = now;

                const sendData = async () => {
                    try {
                        const request: CreatePulseOximeterLogRequest = {
                            spo2: pulseOximeterData.spo2!,
                            bpm: pulseOximeterData?.pulseRate ?? undefined,
                            source: "BLE"
                        };

                        await createPulseOximeterLog(token, request);
                    } catch (err) {
                        console.error("Failed to send pulse oximeter log:", err);
                    }
                }

                sendData();
            }
        }
    }, [pulseOximeterData, token]);

    //useEffect for sending BLE data to backend
    useEffect(() => {
        if (sleepData != null && sleepData.heartRate != null && sleepData.duration != null && token) {
            const now = Date.now();
            if (now - lastSentRefSleep.current > 60000) { // send every 60s
                lastSentRefSleep.current = now;

                const sendData = async () => {
                    try {
                        const stages: SleepStagesDTO = {
                            rem: sleepData.remRate ?? 0,
                            light: sleepData.lightSleepRate ?? 0,
                            deep: sleepData.deepSleepRate ?? 0,
                        }
                        const request: CreateSleepLogRequest = {
                            duration: sleepData.duration!,
                            stages,
                            source: "BLE",
                            heartRateDuringSleep: sleepData.heartRate!
                        };

                        console.log("Sending sleep log:", JSON.stringify(request));

                        await createSleepLog(token, request);
                    } catch (err) {
                        console.error("Failed to send sleep log:", err);
                    }
                }

                sendData();
            }
        }
    }, [sleepData, token]);

    const BleStatusBadge = ({ active }: { active: boolean }) => {
        const text = active ? "LIVE" : "NO SIGNAL";
        const color = active ? "#33ff66" : "#ff3b3b";

        // Animated opacity for blink
        const pulseAnim = useRef(new Animated.Value(1)).current;

        // Start blinking only when NOT active
        useEffect(() => {
            if (!active) {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 0.3,
                            duration: 600,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 600,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            } else {
                pulseAnim.setValue(1); // no blink when LIVE
            }
        }, [active]);

        return (
            <Animated.View
                style={{
                    opacity: active ? 1 : pulseAnim,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderWidth: 1,
                    borderColor: color,
                    borderRadius: 3,
                    marginLeft: 12,
                    backgroundColor: "rgba(0,0,0,0.25)",
                    transform: [{ scale: 1.0 }],
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                }}
            >
                <Text
                    style={{
                        color,
                        fontSize: 9,
                        fontFamily: "monospace",
                        letterSpacing: 1.5,
                        textShadowColor: color,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 3,
                    }}
                >
                    {text}
                </Text>
            </Animated.View>
        );
    };

    //useEffect for sending BLE data to backend
    useEffect(() => {
        if (physicalActivityData != null && physicalActivityData.stepCounter != null && physicalActivityData != null && token) {
            const now = Date.now();
            if (now - lastSentRefPhysicalActivity.current > 60000) { // send every 60s
                lastSentRefPhysicalActivity.current = now;

                const sendData = async () => {
                    try {
                        const request: CreatePhysicalActivityLogRequest = {
                            steps: physicalActivityData.stepCounter!,
                            distance: physicalActivityData.distance ?? undefined,
                            energyExpended: physicalActivityData.energyExpended ?? undefined,
                            source: "BLE",
                        };
                        await createPhysicalActivityLog(token, request);
                    } catch (err) {
                        console.error("Failed to send physical activity log:", err);
                    }
                }

                sendData();
            }
        }
    }, [physicalActivityData, token]);

    async function loadWorkoutStats() {
        try {
            if (token) {
                const {
                    workoutsThisWeek,
                    thisWeekVolume,
                    lastWorkout,
                    workoutStreak,
                    lastSplitType,
                    nextGoalMessage,
                    remainingDays,
                    firstUncompletedWorkoutDaySplitType,
                    plannedWorkoutDaysForWeek,
                } = await getStatsOverview(token);

                let formatted;

                if (lastWorkout) {
                    const date = new Date(lastWorkout);
                    formatted = date.toLocaleDateString("DE-de");

                }


                //update Dashboard Context
                setState(prev => ({
                    ...prev,
                    workoutsThisWeek: workoutsThisWeek ?? 0,
                    plannedWorkoutDaysForWeek: plannedWorkoutDaysForWeek ?? 0,
                }));

                setRemainingDays(remainingDays ?? 0);
                setWorkoutsThisWeek(workoutsThisWeek ?? 0);
                setLastWorkout(formatted ?? "[NO FEED]");
                setSkippedSplitType(firstUncompletedWorkoutDaySplitType ?? "");
                setWorkoutStreak(workoutStreak ?? 0);
            }
        } catch (err: any) {
            console.error(err.message);
        }
    }

    function getVolume(exercises: { sets: { reps: number; weight: number }[] }[]) {
        if (!exercises || exercises.length === 0) return 0;

        return exercises.reduce((sum, ex) => {
            return sum + ex.sets.reduce((setSum, s) => {
                const weight = s.weight ?? 0;
                const reps = s.reps ?? 0;
                return setSum + (weight * reps);
            }, 0);
        }, 0);
    }

    return (
        <SafeAreaView style={homeStyles.root}>

            <ScrollView
                style={homeStyles.scroll}
                contentContainerStyle={[homeStyles.scrollContent, { paddingBottom: 60 }]}
            >
                {/* WATERMARKS */}
                <Image
                    source={require('../../assets/bfc0a832-85f1-48f9-a766-9426b2947a94.png')}
                    style={homeStyles.cornerWatermarkLeft}
                />
                <Image
                    source={require('../../assets/bfc0a832-85f1-48f9-a766-9426b2947a94.png')}
                    style={homeStyles.cornerWatermarkRight}
                />

                <VHSHeader />



                <WeeklyOverviewCircles
                    weeklyWorkouts={workoutsThisWeek ?? 0}
                    remainingDays={remainingDays ?? 0}
                    streak={workoutStreak ?? 0}
                    totalLiftedToday={(loggedWorkoutPerformed && isSameDay(loggedWorkoutPerformed, new Date())) ? getVolume(loggedExercises) : 0}
                    plannedVolumeToday={plannedExercises && plannedExercises.length !== 0 ? getVolume(plannedExercises) : 0}
                    nextSplit={nextUpcomingWorkout ? nextUpcomingWorkout?.splitType : ""}
                />

                <TodayOverviewPanel
                    personalRecords={progress?.pr ?? null}
                    lastWorkout={lastWorkout}
                    loggedWorkout={loggedWorkout}
                    plannedExercises={plannedExercises}
                    loggedWorkoutSplitType={loggedWorkoutSplitType}
                    todayWorkoutSplitName={splitNamePlanned}
                    hasSkippedWorkout={hasSkippedWorkout}
                    loggedExercises={loggedExercises}
                    nextSkippedDay={skippedWorkout}
                    hasWorkoutToday={hasWorkoutToday}
                    activePlan={activePlan ? toUIPlan(activePlan) : undefined}
                    thisWeekVolume={progress?.thisWeekVolume}
                    lastWeekVolume={progress?.lastWeekVolume}
                    weeklyVolumeChange={progress?.weeklyVolumeChange}
                    readinessScore={72}
                    steps={physicalActivityData.stepCounter ?? stepsHealthConnect}
                    stepsGoal={10000}
                    sleepMinutes={sleepData?.duration ?? null}
                    calories={physicalActivityData.energyExpended ?? totalCaloriesBurnedHealthConnect}
                    bpm={bpm ?? bpmHealthConnect}
                    distanceKm={
                        physicalActivityData.distance
                            ? physicalActivityData.distance / 1000
                            : distanceHealthConnect
                    }
                />
            </ScrollView>
        </SafeAreaView>
    );
}

export const homeStyles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: 'transparent',   // IMPORTANT!
    },

    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    bgImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        opacity: 0.10,
    },

    cornerWatermarkLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 80,
        height: 80,
        opacity: 0.08,
    },

    cornerWatermarkRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 80,
        height: 80,
        opacity: 0.08,
        transform: [{ rotate: '180deg' }],
    },
    cardContent: {
        marginTop: 10,
    },

    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 2,
    },

    cardLabel: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#BFC7D5",
        opacity: 0.7,
        letterSpacing: 2,
    },

    cardValue: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#00ffcc",
        fontWeight: "bold",
        letterSpacing: 2,
        marginBottom: 10,
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },

    hudRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 2,
    },

    hudLabel: {
        fontFamily: "monospace",
        color: "#BFC7D5",
        fontSize: 13,
        letterSpacing: 3,
    },

    hudValue: {
        fontFamily: "monospace",
        color: "#00ffcc",
        fontSize: 12,             // slightly bigger than labels
        fontWeight: "bold",       // makes numbers pop
        letterSpacing: 2,         // more "digital"
        marginRight: 5,
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,      // softer glow than diagnosticNote
        textAlign: "right",       // values line up like HUD readouts
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
    barTickRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
        paddingHorizontal: 4,
    },
    tickLabel: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00ffcc',
        opacity: 0.7,
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

    crtRow: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 14,
        letterSpacing: 2,
        marginVertical: 2,
        textShadowColor: '#00ffcc',
        textShadowRadius: 3,
    },

    vhsGlitchTitle: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00ffcc',
        opacity: 0.5,
        marginBottom: 4,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    vhsHudTitle: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 18,
        width: '100%',
        alignContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 255, 204, 0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#00ffcc',
        borderRadius: 2,
        letterSpacing: 5,
        textTransform: 'uppercase',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
        marginBottom: 12,
        alignSelf: 'center',
        overflow: 'hidden',
    },


    vhsHudPanel: {
        backgroundColor: '#0A0F1C',
        borderColor: '#rgba(0, 255, 204, 0.1)',
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        marginBottom: 16,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },

    vhsHudLine: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 13,
        marginVertical: 4,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 255, 204, 0.2)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 2,
    },

    overviewLabel: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 12,
        marginBottom: 6,
        letterSpacing: 2,
        backgroundColor: '#0A0F1C',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        borderColor: '#00ffcc',
        borderWidth: 1,
    },

    overviewPanel: {
        backgroundColor: '#111622',
        borderColor: '#00ffcc',
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },

    overviewItem: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#BFC7D5',
        marginVertical: 4,
        letterSpacing: 2,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },

    vhsScanBar: {
        height: 2,
        backgroundColor: '#00ffcc',
        marginVertical: 6,
        opacity: 0.2,
    },

    transitionLabel: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 12,
        marginBottom: 10,
        opacity: 0.5,
        letterSpacing: 2,
        textAlign: 'center',
    },

    asciiDivider: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        textAlign: 'center',
        fontSize: 12,
        letterSpacing: 0,
        marginVertical: 16,
        opacity: 0.6,
    },

    iconButton: {
        borderWidth: 1,
        borderColor: '#00ffcc',
        backgroundColor: '#0a0f1c',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: '30%',
        alignItems: 'center',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        flexDirection: 'column',
    },

    icon: {
        marginBottom: 4,
    },

    root: {
        flex: 1,
        backgroundColor: '#0A0F1C',
    },
    bg: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        padding: 20,
        paddingBottom: 35,
    },
    overviewRow: {
        marginBottom: 0,
    },
    boxHeader: {
        backgroundColor: '#00ffcc',
        color: '#0A0F1C',
        fontFamily: 'monospace',
        fontSize: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderRadius: 4,
        overflow: 'hidden',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },

    statText: {
        fontFamily: 'monospace',
        fontSize: 15,
        color: '#BFC7D5',
        fontWeight: 'bold',
        marginVertical: 3,
        letterSpacing: 6,
    },
    doubleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    halfBox: {
        backgroundColor: '#111622',
        borderColor: '#rgba(0, 255, 204, 0.1)',
        borderWidth: 1.5,
        borderRadius: 10,
        padding: 14,
        width: '48%',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 10,

    },

    label: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    largeText: {
        color: '#BFC7D5',
        fontSize: 18,
        fontFamily: 'monospace',
    },
    boldText: {
        color: '#BFC7D5',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    bodyText: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
    },
    sectionTitle: {
        color: '#BFC7D5',
        fontSize: 18,
        fontWeight: 'bold',
        paddingBottom: 15,
        fontFamily: 'monospace',
    },
    divider: {
        height: 1,
        backgroundColor: '#00ffcc',
        marginVertical: 30,
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        opacity: 0.3,
    },

    table: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1F2C',
        alignItems: 'center',
    },
    tableDay: {
        width: 100,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(224, 224, 224, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    tablePlan: {
        flex: 1,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(224, 224, 224, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    button: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
        backgroundColor: '#1A1F2C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '30%',
        alignItems: 'center',
        borderRadius: 6,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    buttonText: {
        color: '#BFC7D5',
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    glow: {
        textShadowColor: '#E0E0E0',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    recoveryCard: {
        backgroundColor: '#111622',
        borderColor: '#00ffcc',
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 16,
        marginRight: 16,
        width: 260,
        height: 180,
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
        transform: [{ perspective: 100 }, { rotateX: '0.5deg' }],
    },


    cardTitle: {
        backgroundColor: '#00ffcc',
        color: '#0A0F1C',
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginBottom: 12,
        alignSelf: 'flex-start',
        borderRadius: 4,
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    cardText: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.94)',
        marginVertical: 4,
        textAlign: 'left',
        letterSpacing: 3,
    },
});
