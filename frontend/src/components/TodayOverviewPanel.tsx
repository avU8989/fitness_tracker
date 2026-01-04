import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageSourcePropType } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Animated, Easing } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PlannedExercise } from '../screens/tabs/LogScreen';
import { getPlanStats } from '../utils/planStats';
import { Exercise, TrainingPlanUI, WorkoutDay } from '../types/trainingPlan';
import { LoggedExercise } from '../types/workoutLog';
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { GoalCard } from './GoalCard';
import { ProgressRing } from './WeeklyOverview';

interface PersonalRecord {
    name: string,
    weight: number,
    unit: string,
}

interface TopPlannedSet {
    exerciseName: string;
    reps: number;
    weight: number;
    unit: string;
}

const CARD_WIDTH = Dimensions.get("window").width - 40;
const GAP = 8;
const SNAP_INTERVAL = CARD_WIDTH + GAP;

const weeklyIntensity = {
    shoulders: 0.7,
    chest: 0.9,
    biceps: 0.4,
    abs: 0.2,
    quads: 0.8,
    calves: 0.3,
};

interface TodayOverviewProps {
    personalRecords?: PersonalRecord[] | null;
    lastWorkout?: string | null;
    loggedWorkout?: boolean;
    activePlan?: TrainingPlanUI;
    plannedExercises?: PlannedExercise[] | null;
    loggedExercises?: LoggedExercise[] | null;
    loggedWorkoutSplitType: string;
    todayWorkoutSplitName?: string;
    hasSkippedWorkout?: boolean;
    nextSkippedDay?: WorkoutDay | null;
    hasWorkoutToday?: boolean;
    lastWeekVolume?: number;
    thisWeekVolume?: number;
    weeklyVolumeChange?: string;
    readinessScore?: number;       // 0–100
    steps?: number | null;
    stepsGoal?: number;
    sleepMinutes?: number | null;  // total minutes
    calories?: number | null;
    bpm?: number | null;
    distanceKm?: number | null;
}

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
}

function timeAgo(dateString: string | null | undefined) {
    if (!dateString) return "--";

    // Handle DD/MM/YYYY
    if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        dateString = `${year}-${month}-${day}`; // Convert to ISO
    }

    // Handle DD.MM.YYYY
    if (dateString.includes(".")) {
        const [day, month, year] = dateString.split(".");
        dateString = `${year}-${month}-${day}`;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "--";

    const days = Math.floor((Date.now() - date.getTime()) / 86400000);

    if (days <= 0) return "TODAY";
    if (days === 1) return "1 DAY AGO";
    return `${days} DAYS AGO`;
}


//this needs to be changed
const getPlannedVolume = (plannedExercises?: PlannedExercise[] | null): number => {
    if (!plannedExercises || plannedExercises.length === 0) return 0;

    return plannedExercises.reduce((exerciseAcc, exercise) => {
        const exerciseVolume = exercise.sets.reduce((setAcc, set) => {
            const reps = set.reps || 0;
            const weight = set.weight || 0;
            return setAcc + reps * weight;
        }, 0);

        return exerciseAcc + exerciseVolume;
    }, 0);
};

const getHeaviestSet = (
    exercises?: {
        name?: string;
        sets?: { reps?: number; weight?: number; unit?: string }[];
    }[] | null
): TopPlannedSet | null => {
    if (!exercises || exercises.length === 0) return null;

    let top: TopPlannedSet | null = null;

    for (const ex of exercises) {
        if (!ex.name) {
            continue;
        }
        for (const set of ex.sets ?? []) {
            const weight = set.weight || 0;

            if (!top || weight > top.weight) {
                top = {
                    exerciseName: ex.name,
                    reps: set.reps || 0,
                    weight,
                    unit: set.unit || "kg",
                };
            }
        }
    }

    return top;
};


const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

const VolumeProgressBars = ({
    thisWeek = 0,
    lastWeek = 0,
    goal,
    unit = "KG",
}: {
    thisWeek?: number | null;
    lastWeek?: number | null;
    goal?: number | null; // optional explicit goal
    unit?: string;
}) => {
    const t = thisWeek ?? 0;
    const l = lastWeek ?? 0;

    // If no explicit goal provided, use the larger of the two weeks as the “scale”
    const scale = Math.max(goal ?? 0, t, l, 1);

    const pctThis = clamp(t / scale);
    const pctLast = clamp(l / scale);

    return (
        <View style={{ marginTop: 8 }}>
            <View style={todayOverViewStyle.barRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={todayOverViewStyle.barLabel}>THIS WEEK</Text>
                    <Text style={todayOverViewStyle.barValue}>{t || "--"} {unit}</Text>
                </View>
                <View style={todayOverViewStyle.barTrack}>
                    <View style={[todayOverViewStyle.barFillThis, { width: `${pctThis * 100}%` }]} />
                </View>
            </View>

            <View style={todayOverViewStyle.barRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={todayOverViewStyle.barLabel}>LAST WEEK</Text>
                    <Text style={todayOverViewStyle.barValue}>{l || "--"} {unit}</Text>
                </View>
                <View style={todayOverViewStyle.barTrack}>
                    <View style={[todayOverViewStyle.barFillLast, { width: `${pctLast * 100}%` }]} />
                </View>
            </View>

            <Text style={todayOverViewStyle.barHint}>
                SCALE: {goal ? `GOAL ${goal} ${unit}` : `AUTO (${scale} ${unit})`}
            </Text>
        </View>
    );
};


const TodayOverviewPanel: React.FC<TodayOverviewProps> = ({
    personalRecords = null,
    lastWorkout = null,
    thisWeekVolume = null,
    lastWeekVolume = null,
    hasWorkoutToday = false,
    hasSkippedWorkout = false,
    weeklyVolumeChange = null,
    loggedExercises = null,
    loggedWorkout = false,
    loggedWorkoutSplitType = "",
    activePlan = null,
    nextSkippedDay = null,
    plannedExercises = null,
    todayWorkoutSplitName = "",
    readinessScore = 72,
    steps = null,
    stepsGoal = 10000,
    sleepMinutes = null,
    calories = null,
    bpm = null,
    distanceKm = null,
}) => {

    const sleepHours = sleepMinutes != null ? (sleepMinutes / 60).toFixed(1) : "--";
    const stepsPct = steps != null ? Math.min(100, Math.round((steps / stepsGoal) * 100)) : 0;

    const totalVolumePlanned = getPlannedVolume(plannedExercises);
    const totalVolumeSkipped = getPlannedVolume(nextSkippedDay?.exercises);
    const totalVolumeLogged = getPlannedVolume(loggedExercises);

    const loggedVolumePct = totalVolumePlanned ? Math.min((totalVolumeLogged / totalVolumePlanned) * 100, 100) : 0;

    const heaviestSetPlanned = getHeaviestSet(plannedExercises);
    const heaviestSetSkipped = getHeaviestSet(nextSkippedDay?.exercises);
    const heaviestSetLogged = getHeaviestSet(loggedExercises);

    const scrollRef = useRef<ScrollView | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const TOTAL_CARDS = 2;
    const isInteracting = useRef(false);

    //logWorkout works only in one session --> not persistence
    //i would do a if loggedWorkout is false then check with an API call to backend if a workout truly has been logged 
    //if logWorkout is true then we good 
    /*
        useEffect(() => {
            const interval = setInterval(() => {
                if (isInteracting.current) return;
    
                setCurrentIndex(prev => {
                    const nextIndex = (prev + 1) % TOTAL_CARDS;
    
                    scrollRef.current?.scrollTo({
                        x: nextIndex * SNAP_INTERVAL,
                        animated: true,
                    });
    
                    return nextIndex;
                });
            }, 6000);
    
            return () => clearInterval(interval);
        }, []);
    */

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
        setCurrentIndex(index);
    }


    return (
        <View style={todayOverViewStyle.container}>

            {loggedWorkout ? (
                <View style={todayOverViewStyle.workoutLogCard}>
                    {/* Accent bar (Samsung style) */}

                    <View style={todayOverViewStyle.heroLeft}>
                        <Text style={todayOverViewStyle.workoutLoggedLabel}>WORKOUT LOGGED</Text>
                        <Text style={todayOverViewStyle.workoutLoggedTitle}>{loggedWorkoutSplitType}</Text>

                        {/* Main metric (Samsung shows calories, but we show volume) */}
                        <Text style={todayOverViewStyle.workoutLoggedMainValue}>{heaviestSetLogged?.weight} {heaviestSetLogged?.unit}</Text>
                        <Text style={todayOverViewStyle.workoutLoggedMainSub}>{heaviestSetLogged?.exerciseName}</Text>

                    </View>


                    {/* Submetrics (duration, sets, heart rate, etc) */}
                    <View style={todayOverViewStyle.heroRight}>

                        <View style={todayOverViewStyle.effortRow}>
                            <Text style={todayOverViewStyle.effortLabelLoggedWorkout}>EFFORT</Text>

                            <View style={todayOverViewStyle.dotsRowLoggedWorkout}>
                                <View style={todayOverViewStyle.dotActiveLoggedWorkout} />
                                <View style={todayOverViewStyle.dotActiveLoggedWorkout} />
                                <View style={todayOverViewStyle.dotActiveLoggedWorkout} />
                                <View style={todayOverViewStyle.dotInactiveLoggedWorkout} />
                                <View style={todayOverViewStyle.dotInactiveLoggedWorkout} />
                            </View>
                        </View>

                        <View style={todayOverViewStyle.statusRow}>
                            <View style={todayOverViewStyle.iconCircleLoggedWorkout}>
                                <MaterialCommunityIcons
                                    name="timer-outline"
                                    size={20}
                                    color="rgba(0,0,0,0.45)"
                                />
                            </View>


                            <View style={todayOverViewStyle.statTextBlock}>
                                <Text style={todayOverViewStyle.statValue}>62 min</Text>
                            </View>
                        </View>

                        <View style={todayOverViewStyle.statusRow}>
                            <View style={todayOverViewStyle.iconCircleLoggedWorkout}>
                                <MaterialCommunityIcons
                                    name="dumbbell"
                                    size={20}
                                    color="rgba(0,0,0,0.45)"
                                />
                            </View>
                            <View style={todayOverViewStyle.statTextBlock}>
                                <Text style={todayOverViewStyle.statValue}>8 LIFTS</Text>
                            </View>
                        </View>

                    </View>

                </View>
            ) :
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH}
                    decelerationRate="fast"
                    contentContainerStyle={{
                        paddingHorizontal: 0,
                        gap: 8
                    }}
                >
                    {hasWorkoutToday && (
                        <View style={todayOverViewStyle.todayWorkoutCard}>
                            <View style={todayOverViewStyle.heroLeft}>
                                <Text style={todayOverViewStyle.workoutLabel}>TODAY'S WORKOUT</Text>
                                <Text style={todayOverViewStyle.workoutTitle}>{todayWorkoutSplitName}</Text>

                                {/* Main metric */}
                                <Text style={todayOverViewStyle.workoutMainValue}>{heaviestSetPlanned?.weight} {heaviestSetPlanned?.unit}</Text>
                                <Text style={todayOverViewStyle.workoutMainSub}>{heaviestSetPlanned?.exerciseName.toUpperCase()}</Text>
                            </View>

                            {/* Submetrics */}
                            <View style={todayOverViewStyle.heroRight}>
                                <View style={todayOverViewStyle.effortRow}>
                                    <Text style={todayOverViewStyle.effortLabelWorkout}>EFFORT</Text>

                                    <View style={todayOverViewStyle.dotsRowWorkout}>
                                        <View style={todayOverViewStyle.dotActiveWorkout} />
                                        <View style={todayOverViewStyle.dotActiveWorkout} />
                                        <View style={todayOverViewStyle.dotActiveWorkout} />
                                        <View style={todayOverViewStyle.dotInactiveWorkout} />
                                        <View style={todayOverViewStyle.dotInactiveWorkout} />
                                    </View>
                                </View>

                                <View style={todayOverViewStyle.statusRow}>
                                    <View style={todayOverViewStyle.iconCircleWorkout}>
                                        <MaterialCommunityIcons
                                            name="weight-kilogram"
                                            size={20}
                                            color="rgba(0,0,0,0.45)"
                                        />
                                    </View>

                                    <View style={todayOverViewStyle.statTextBlock}>
                                        <Text style={todayOverViewStyle.statValue}>{totalVolumePlanned} KG</Text>
                                    </View>
                                </View>

                                <View style={todayOverViewStyle.statusRow}>
                                    <View style={todayOverViewStyle.iconCircleWorkout}>
                                        <MaterialCommunityIcons
                                            name="dumbbell"
                                            size={20}
                                            color="rgba(0,0,0,0.45)"
                                        />
                                    </View>

                                    <View style={todayOverViewStyle.statTextBlock}>
                                        <Text style={todayOverViewStyle.statValue}>{plannedExercises?.length} LIFTS</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {hasSkippedWorkout && nextSkippedDay && (
                        <View style={todayOverViewStyle.todayWorkoutCard}>
                            {/* Accent bar (Samsung style) */}

                            <View style={todayOverViewStyle.heroLeft}>
                                <Text style={todayOverViewStyle.workoutLabel}>SKIPPED WORKOUT</Text>
                                <Text style={todayOverViewStyle.workoutTitle}>{nextSkippedDay.splitType}</Text>

                                {/* Main metric */}
                                <Text style={todayOverViewStyle.workoutMainValue}>{heaviestSetSkipped?.weight} {heaviestSetSkipped?.unit}</Text>
                                <Text style={todayOverViewStyle.workoutMainSub}>{heaviestSetSkipped?.exerciseName.toUpperCase()}</Text>
                            </View>

                            {/* Submetrics */}
                            <View style={todayOverViewStyle.heroRight}>
                                <View style={todayOverViewStyle.effortRow}>
                                    <Text style={todayOverViewStyle.effortLabelWorkout}>EFFORT</Text>

                                    <View style={todayOverViewStyle.dotsRowWorkout}>
                                        <View style={todayOverViewStyle.dotActiveWorkout} />
                                        <View style={todayOverViewStyle.dotActiveWorkout} />
                                        <View style={todayOverViewStyle.dotActiveWorkout} />
                                        <View style={todayOverViewStyle.dotInactiveWorkout} />
                                        <View style={todayOverViewStyle.dotInactiveWorkout} />
                                    </View>
                                </View>

                                <View style={todayOverViewStyle.statusRow}>
                                    <View style={todayOverViewStyle.iconCircleWorkout}>
                                        <MaterialCommunityIcons
                                            name="weight-kilogram"
                                            size={20}
                                            color="rgba(0,0,0,0.45)"
                                        />
                                    </View>

                                    <View style={todayOverViewStyle.statTextBlock}>
                                        <Text style={todayOverViewStyle.statValue}>{totalVolumeSkipped} KG</Text>
                                    </View>
                                </View>

                                <View style={todayOverViewStyle.statusRow}>
                                    <View style={todayOverViewStyle.iconCircleWorkout}>
                                        <MaterialCommunityIcons
                                            name="dumbbell"
                                            size={20}
                                            color="rgba(0,0,0,0.45)"
                                        />
                                    </View>

                                    <View style={todayOverViewStyle.statTextBlock}>
                                        <Text style={todayOverViewStyle.statValue}>{nextSkippedDay.exercises.length} LIFTS</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            }

            {/* TRAINING STATUS */}
            <ScrollView
                ref={scrollRef}
                horizontal
                snapToInterval={SNAP_INTERVAL}
                decelerationRate={'normal'}
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={() => (isInteracting.current = true)}
                onMomentumScrollEnd={(e) => {
                    isInteracting.current = false;
                    const index = Math.round(
                        e.nativeEvent.contentOffset.x / SNAP_INTERVAL
                    );
                    setCurrentIndex(index);
                }}
                contentContainerStyle={{
                    gap: 8
                }}
            >
                <View style={{ width: CARD_WIDTH }}>
                    <GoalCard
                        title="GOALS"
                        label="STEPS"
                        current={steps ?? 0}
                        target={stepsGoal}
                        tone="teal"
                        illustration={require("../assets/discover/bodybuilding.jpg")}
                        onPress={() => { }}
                    />
                </View>

                <View style={{ width: CARD_WIDTH }}>

                    <GoalCard
                        title="GOALS"
                        label="WORKOUTS"
                        current={loggedWorkout ? 1 : 0}
                        target={4}
                        tone="blue"
                        illustration={require("../assets/discover/bodybuilding.jpg")}
                        onPress={() => { }}
                    />
                </View>
            </ScrollView >

            <View style={todayOverViewStyle.heroCard}>
                <View style={todayOverViewStyle.heroLeft}>
                    <Text style={todayOverViewStyle.heroLabel}>LAST WORKOUT</Text>
                    <Text style={todayOverViewStyle.heroTitle}>ACTIVITY</Text>

                    <View style={todayOverViewStyle.statusRow}>
                        <View style={todayOverViewStyle.iconCircleLoggedWorkout}>
                            <MaterialCommunityIcons
                                name="calendar-refresh"
                                size={20}
                                color="rgba(0,0,0,0.45)"
                            />
                        </View>
                        <Text style={todayOverViewStyle.statusLabel}>LAST WORKOUT</Text>
                        <Text style={todayOverViewStyle.statusValue}>
                            {lastWorkout ? timeAgo(lastWorkout) : "--"}
                        </Text>
                    </View>

                </View>
            </View>


            {/* GRID CARDS (Fitbit Today style) */}
            < View style={todayOverViewStyle.grid} >
                {/* Card 1 – Steps & Distance */}
                < View style={todayOverViewStyle.card} >
                    <View style={todayOverViewStyle.cardHeaderRow}>
                        <Ionicons name="walk" size={16} color="#00ffcc" />
                        <Text style={todayOverViewStyle.cardTitle}>STEPS</Text>

                    </View>

                    <Text style={todayOverViewStyle.cardValue}>{steps ?? "--"}</Text>
                    <Text style={todayOverViewStyle.cardSub}>
                        {distanceKm != null ? `${distanceKm.toFixed(2)} KM` : "NO DISTANCE FEED"}
                    </Text>
                </View >

                {/* Card 2 – Sleep */}
                < View style={todayOverViewStyle.card} >
                    <View style={todayOverViewStyle.cardHeaderRow}>
                        <Ionicons name="moon-outline" size={16} color="#b38aff" />
                        <Text style={todayOverViewStyle.cardTitle}>SLEEP</Text>
                    </View>
                    <Text style={todayOverViewStyle.cardValue}>{sleepHours} HRS</Text>
                    <Text style={todayOverViewStyle.cardSub}>LAST NIGHT</Text>
                </View >

                {/* Card 3 – Calories */}
                < View style={todayOverViewStyle.card} >
                    <View style={todayOverViewStyle.cardHeaderRow}>
                        <Ionicons name="flame" size={16} color="#ff8800" />
                        <Text style={todayOverViewStyle.cardTitle}>ENERGY</Text>
                    </View>
                    <Text style={todayOverViewStyle.cardValue}>{calories ?? "--"}</Text>
                    <Text style={todayOverViewStyle.cardSub}>KCAL BURNED</Text>
                </View >

                {/* Card 4 – Heart Rate */}
                < View style={todayOverViewStyle.card} >
                    <View style={todayOverViewStyle.cardHeaderRow}>
                        <Ionicons name="heart" size={16} color="#ff3b3b" />
                        <Text style={todayOverViewStyle.cardTitle}>HEART</Text>
                    </View>
                    <Text style={todayOverViewStyle.cardValue}>{bpm ?? "--"} bpm</Text>
                    <Text style={todayOverViewStyle.cardSub}>LIVE FEED</Text>
                </View >
            </View >

            <View style={todayOverViewStyle.prCard}>
                <View style={todayOverViewStyle.cardHeaderRow}>
                    <MaterialCommunityIcons name="kettlebell" size={16} color="#00ccff" />
                    <Text style={todayOverViewStyle.cardTitle}>Personal Records</Text>
                </View>

                {/* Mocked Top 3 Lifts */}

                <View style={todayOverViewStyle.prRow}>

                    {personalRecords?.map((pr) => (
                        <View style={todayOverViewStyle.prItem}>
                            {/*TODO add different icons per exercise*/}
                            <Text style={todayOverViewStyle.heroSub}>{pr.name.toUpperCase()}:{" "}
                                <Text style={todayOverViewStyle.heroSubHighlight}>{pr.weight} {pr.unit} </Text>

                            </Text >
                        </View >

                    ))}
                </View>

            </View>

            {/* Card 6 – Muscle Split 
            <View style={todayOverViewStyle.heroCard}>
                <View style={todayOverViewStyle.cardHeaderRow}>
                    <Ionicons name="body-outline" size={16} color="#66aaff" />
                    <Text style={todayOverViewStyle.cardTitle}>MUSCLE SPLIT</Text>
                </View>

            <Text style={todayOverViewStyle.cardSub}>UPPER • 60%</Text>
            <View style={todayOverViewStyle.muscleBarTrack}>
                <View style={[todayOverViewStyle.muscleBarFill, { width: "60%" }]} />
            </View>

            <Text style={todayOverViewStyle.cardSub}>LOWER • 30%</Text>
            <View style={todayOverViewStyle.muscleBarTrack}>
                <View style={[todayOverViewStyle.muscleBarFill, { width: "30%" }]} />
            </View>

            <Text style={todayOverViewStyle.cardSub}>CORE • 10%</Text>
            <View style={todayOverViewStyle.muscleBarTrack}>
                <View style={[todayOverViewStyle.muscleBarFill, { width: "10%" }]} />
            </View>
            </View>
            */}

        </View >
    );
};

export const todayOverViewStyle = StyleSheet.create({
    smallCircleWrapper: {
        width: "32%",
        alignItems: "center",
    },

    volumeBarTrack: {
        marginTop: 8,
        height: 8,
        backgroundColor: '#1A1F2C',
        borderRadius: 3,
        overflow: 'hidden',
    },
    volumeBarFill: {
        height: '100%',
        backgroundColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 6,
    },
    volumeBarLabel: {
        fontFamily: 'monospace',
        color: '#7ACFCF',
        fontSize: 11,
        marginTop: 6,
        letterSpacing: 1,
    },
    goalImageWrap: {
        width: 96,
        height: 96,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(0,255,204,0.25)",
        backgroundColor: "rgba(0,255,204,0.06)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },

    goalImage: {
        width: "100%",
        height: "100%",
        opacity: 0.9,
    },

    goalImagePlaceholder: {
        flex: 1,
        backgroundColor: "rgba(102,170,255,0.10)",
    },


    barValue: {
        fontFamily: "monospace",
        fontSize: 11,
        color: "#BFC7D5",
        opacity: 0.85,
        letterSpacing: 1.5,
    },

    barHint: {
        fontFamily: "monospace",
        fontSize: 9,
        color: "#BFC7D5",
        opacity: 0.55,
        letterSpacing: 1.5,
        marginTop: 6,
    },

    barFillThis: {
        height: "100%",
        backgroundColor: "rgba(0,255,204,0.55)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },

    barFillLast: {
        height: "100%",
        backgroundColor: "rgba(102,170,255,0.45)",
        shadowColor: "#66AAFF",
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },

    goalCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#111622",
        borderColor: "rgba(0, 255, 204, 0.3)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 16,
    },

    goalLabel: {
        fontFamily: "monospace",
        fontSize: 11,
        color: "#BFC7D5",
        opacity: 0.75,
        letterSpacing: 2,
        marginRight: 10,
    },

    goalValue: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#00ffcc",
        fontWeight: "bold",
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },

    goalSub: {
        marginTop: 8,
        fontFamily: "monospace",
        fontSize: 10,
        color: "#BFC7D5",
        opacity: 0.65,
        letterSpacing: 1.5,
    },

    prRingCard: {
        flexDirection: "column",
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#111622",
        borderColor: "rgba(0, 255, 204, 0.3)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 16,
    },

    ringLabelSmall: {
        paddingTop: 2,
        fontFamily: "monospace",
        fontSize: 8,
        color: "#BFC7D5"
    },

    iconCircleLoggedWorkout: {
        width: 28,
        height: 28,
        borderRadius: 999,
        backgroundColor: "#00FF99",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
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

    statTextBlock: {
        flex: 1,
        paddingLeft: 8,
        alignItems: "flex-start",
    },

    effortRow: { flexDirection: "row", alignItems: "center" },
    effortLabelLoggedWorkout: {
        color: "#7FFFD6",
        fontSize: 11,
        fontFamily: "monospace",
        marginRight: 10,
        letterSpacing: 1.2,
    },
    effortLabelWorkout: {
        color: "#8abfffff",
        fontSize: 11,
        fontFamily: "monospace",
        marginRight: 10,
        letterSpacing: 1.2,
    },
    dotsRowLoggedWorkout: { flexDirection: "row", gap: 6 },
    dotActiveLoggedWorkout: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: "#00FF99",
        shadowColor: "#00FF99",
        shadowOpacity: 0.7,
        shadowRadius: 4,
    },
    dotInactiveLoggedWorkout: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.2)",
    },

    dotsRowWorkout: { flexDirection: "row", gap: 6 },
    dotActiveWorkout: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: "#66AAFF",
        shadowColor: "#66AAFF",
        shadowOpacity: 0.7,
        shadowRadius: 4,
    },
    dotInactiveWorkout: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.2)",
    },


    intensityRow: {
        marginTop: 10,
    },
    intensityLabel: {
        color: "#00FFB0",
        fontFamily: "monospace",
        fontSize: 11,
        marginBottom: 4,
    },
    intensityTrack: {
        height: 8,
        borderRadius: 6,
        backgroundColor: "rgba(0,255,153,0.15)",
        overflow: "hidden",
    },
    intensityFill: {
        height: "100%",
        backgroundColor: "#00FF99",
        shadowColor: "#00FF99",
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },
    intensityPct: {
        color: "#00FFB0",
        fontFamily: "monospace",
        marginTop: 4,
    },

    workoutRightStats: {
        alignItems: "flex-end",
    },

    workoutStatRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },

    workoutStatText: {
        color: "#fff",
        fontSize: 14,
        marginLeft: 6,
    },

    workoutLogCard: {
        flexDirection: "row",
        padding: 18,
        borderRadius: 16,

        // Slight green fill, neon aesthetic
        backgroundColor: "rgba(0,255,153,0.12)",

        // Neon green border
        borderWidth: 2,
        borderColor: "#00FF99",

        // Outer glow
        shadowColor: "#00FF99",
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },

        marginBottom: 20,
    },
    todayWorkoutCard: {
        flexDirection: "row",
        padding: 18,
        borderRadius: 18,
        width: CARD_WIDTH,
        // Slight green fill, neon aesthetic
        backgroundColor: "#171e2eff",
        // Neon green border
        borderWidth: 2,
        borderColor: "#66AAFF",

        // Outer glow
        shadowColor: "#66AAFF",
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },

        marginBottom: 20,
    },
    workoutLabel: {
        color: "#8abfffff",
        fontSize: 11,
        fontFamily: "monospace",
        letterSpacing: 1.2,
        marginBottom: 2,
    },

    workoutTitle: {
        color: "white",
        paddingTop: 8,
        paddingBottom: 6,
        fontSize: 20,
        fontFamily: "monospace",
        fontWeight: "700",
    },

    workoutMainValue: {
        color: "#66AAFF",
        fontSize: 26,
        fontFamily: "monospace",
        fontWeight: "800",
        marginTop: 4,
    },

    workoutMainSub: {
        color: "#66AAFF",
        fontSize: 11,
        marginBottom: 10,
        letterSpacing: 1,
    },

    workoutLoggedLabel: {
        color: "#7FFFD6",
        fontSize: 11,
        fontFamily: "monospace",
        letterSpacing: 1.2,
        marginBottom: 2,
    },

    workoutLoggedTitle: {
        color: "white",
        paddingTop: 8,
        paddingBottom: 6,
        fontSize: 20,
        fontFamily: "monospace",
        fontWeight: "700",
    },

    workoutLoggedMainValue: {
        color: "#00FFB0",
        fontSize: 26,
        fontFamily: "monospace",
        fontWeight: "800",
        marginTop: 4,
    },

    workoutLoggedMainSub: {
        color: "#00FFB0",
        fontSize: 11,
        marginBottom: 10,
        letterSpacing: 1,
    },

    workoutStatsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },

    statItem: {
        alignItems: "center",
        flex: 1,
    },

    statLabel: {
        color: "#FFFFFF",
        fontSize: 11,
        fontFamily: "monospace",
        marginTop: 2,
    },

    statValue: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "monospace",
        marginTop: 1,
    },


    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        paddingVertical: 4,
    },
    prRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: 6,
    },
    prItem: {
        marginRight: 12,
        marginBottom: 6,
    },



    statusLabel: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#BFC7D5",
        marginLeft: 6,
        fontWeight: "bold",
        letterSpacing: 2,
        width: 120,
        opacity: 0.7,
    },

    statusValue: {
        fontFamily: "monospace",
        fontSize: 12.5,
        color: "#BFC7D5",
        fontWeight: "bold",

        marginLeft: 4,
        textShadowColor: "#BFC7D5",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 2,
    },

    trainingIcons: {
        justifyContent: "center",
    },

    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    iconValue: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#00ffcc",
        marginLeft: 4,
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },

    muscleBarTrack: {
        height: 6,
        backgroundColor: "rgba(102,170,255,0.15)",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "rgba(102,170,255,0.25)",
        overflow: "hidden",
        marginBottom: 6,
        marginTop: 2,
    },

    muscleBarFill: {
        height: "100%",
        backgroundColor: "rgba(102,170,255,0.5)",
    },

    /* TRAINING STATUS – Horizontal Bar */

    /* TRAINING CARD (same base style as heroCard) */
    trainingCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 18,
        width: Dimensions.get("window").width - 40,
        borderRadius: 18,
        backgroundColor: "#111622",
        borderColor: "rgba(0, 255, 204, 0.3)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 16,
    },

    trainingLeft: {
        flex: 1,
        paddingRight: 12,
    },

    /* Right side stacked bars */
    trainingBars: {
        width: 90,
        justifyContent: "center",
    },

    barRow: {
        marginBottom: 10,
    },

    barLabel: {
        fontFamily: "monospace",
        fontSize: 10,
        color: "#BFC7D5",
        marginBottom: 4,
        letterSpacing: 2,
    },

    barTrack: {
        height: 10,
        backgroundColor: "rgba(0,255,204,0.15)",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(0,255,204,0.3)",
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        backgroundColor: "rgba(0,255,204,0.5)",
    },


    container: {
        marginBottom: 24,
    },

    /* HERO CARD */
    heroRight: {
        width: 120,                // or flex: 1
        alignItems: "flex-start",
        justifyContent: "flex-start",   // <---- add this
        paddingLeft: 8,
        marginRight: 8,

    },


    heroCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#111622",
        borderColor: "rgba(0, 255, 204, 0.3)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 16,
    },

    prCard: {
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#111622",
        borderColor: "rgba(0, 255, 204, 0.3)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 16,
    },

    heroLeft: {
        flex: 1,
        paddingRight: 8,
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

    heroTitle: {
        fontFamily: "monospace",
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
        letterSpacing: 2,
        marginBottom: 6,
    },

    heroSub: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#BFC7D5",
        opacity: 0.8,
        marginTop: 2,
    },

    heroSubHighlight: {
        color: "#00ffcc",
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },

    ringWrapper: {
        width: 100,
        alignItems: "center",
        justifyContent: "center",
    },

    ringOuter: {
        width: 80,
        height: 80,
        borderRadius: 999,
        borderWidth: 1,
        marginLeft: 30,
        borderColor: "rgba(0,255,204,0.5)",
        overflow: "hidden",
        backgroundColor: "#0A0F1C",
        justifyContent: "flex-end",
    },

    ringFill: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,255,204,0.25)",
    },

    ringInner: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },

    ringValue: {
        fontFamily: "monospace",
        fontSize: 16,
        color: "#00ffcc",
        fontWeight: "bold",
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },

    ringLabel: {
        paddingTop: 10,
        fontFamily: "monospace",
        fontSize: 8,
        marginLeft: 30,
        color: "#BFC7D5",
        letterSpacing: 2,
        textAlign: "center",
    },

    /* GRID CARDS */

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    card: {
        width: "48%",
        backgroundColor: "#111622",
        borderRadius: 18,
        borderColor: "rgba(0, 255, 204, 0.18)",
        padding: 12,
        marginBottom: 12,
        shadowColor: "#00ffcc",
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },

    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },

    cardTitle: {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 16,
        color: "white",
        marginLeft: 6,
        letterSpacing: 2,
        textTransform: "uppercase",
    },

    cardValue: {
        fontFamily: "monospace",
        fontSize: 18,
        color: "#00ffcc",
        fontWeight: "bold",
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 5,
    },

    cardSub: {
        fontFamily: "monospace",
        fontSize: 10,
        color: "#BFC7D5",
        opacity: 0.7,
        marginTop: 2,
        letterSpacing: 1.5,
    },
});

export default TodayOverviewPanel;
