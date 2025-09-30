import React, { useContext, useRef } from 'react';
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

export default function HardloggerUI() {
    const bpm = useHeartRateMonitor();
    const pulseOximeterData = usePulseOximeterMonitor();
    const { token } = useContext(AuthContext);
    const [workoutsThisWeek, setWorkoutsThisWeek] = useState(null);
    const [thisWeekVolume, setThisWeekVolume] = useState(null);
    const [lastWorkout, setLastWorkout] = useState("");
    const [lastSplitType, setLastSplitType] = useState("");
    const [workoutStreak, setWorkoutStreak] = useState(null);
    const [nextGoalMessage, setNextGoalMessage] = useState("");
    const { setRemainingDays } = useWorkout();
    const { state, setState } = useDashboard();
    const [progress, setProgress] = useState<ProgressUI>();
    const sleepData = useSleepMonitor();
    const physicalActivityData = usePhysicalActivityMonitor();
    const [skippedSplitType, setSkippedSplitType] = useState(null);
    const lastSentRefHeartRate = useRef<number>(0);
    const lastSentRefSleep = useRef<number>(0);
    const lastSentRefPulseOximeter = useRef<number>(0);
    const lastSentRefPhysicalActivity = useRef<number>(0);

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

    const GRAIN_TEXTURE = require('../../assets/home_bg_2.png');
    const SCANLINE_TEXTURE = require('../../assets/abstract-geometric-background-shapes-texture.jpg');

    const PulseBarGraph = ({ bpm }: { bpm: number | null }) => {
        // set a baseline height from bpm
        const baseHeight = bpm ? Math.min(bpm / 2, 100) : 20;
        // bpm/2 means: 120 bpm ≈ 60px tall bars (cap at 100px)

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    height: 53, // max graph height
                }}
            >
                {[...Array(36)].map((_, i) => {
                    // add random variation around base height
                    const height = baseHeight + Math.random() * 20 - 10;
                    return (
                        <View
                            key={i}
                            style={{
                                width: 4,
                                height: Math.max(5, height), // min 5px
                                backgroundColor: '#00ffcc',
                                marginHorizontal: 1,
                            }}
                        />
                    );
                })}
            </View>
        );
    };

    useEffect(() => {
        loadWorkoutStats();
        loadWorkoutProgress();
    }, []);

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
                    skippedSplitType,
                    plannedWorkoutDaysForWeek,
                } = await getStatsOverview(token);

                const date = new Date(lastWorkout);
                const formatted = date.toLocaleDateString("en-GB");

                //update Dashboard Context
                setState(prev => ({
                    ...prev,
                    workoutsThisWeek: workoutsThisWeek ?? 0,
                    plannedWorkoutDaysForWeek: plannedWorkoutDaysForWeek ?? 0,
                }));

                setRemainingDays(remainingDays ?? 0);
                setWorkoutsThisWeek(workoutsThisWeek ?? 0);
                setNextGoalMessage(nextGoalMessage ?? "");
                setLastSplitType(lastSplitType ?? "");
                setThisWeekVolume(thisWeekVolume ?? 0);
                setLastWorkout(formatted ?? "");
                setSkippedSplitType(skippedSplitType ?? "");
                setWorkoutStreak(workoutStreak ?? 0);
            }
        } catch (err: any) {
            console.error(err.message);
        }
    }

    const recoveryCards = [
        {
            title: 'PULSE FEED',
            render: () => (
                <View>
                    <View style={homeStyles.cardContent}>
                        <View style={homeStyles.cardRow}>
                            <Text style={homeStyles.cardLabel}>HEART RATE</Text>
                            <Text style={homeStyles.cardValue}>{bpm ?? "--"} bpm</Text>
                        </View>
                        <View style={homeStyles.cardRow}>
                            <Text style={homeStyles.cardLabel}>SPO₂</Text>
                            <Text style={homeStyles.cardValue}>{pulseOximeterData?.spo2 ?? "--"} %</Text>
                        </View>
                    </View>
                    <PulseBarGraph bpm={bpm} />

                </View>
            ),
        },
        {
            title: 'REST FEED',
            render: () => {
                const sleepHours =
                    sleepData.duration != null ? sleepData.duration / 60 : null;

                let fatigue = "--";
                let fatigueColor = "#BFC7D5"; // default grey

                if (sleepHours != null) {
                    if (sleepHours < 7) {
                        fatigue = "HIGH";
                        fatigueColor = "#ff3b3b"; // red
                    } else if (sleepHours < 9) {
                        fatigue = "NORMAL";
                        fatigueColor = "#ffaa00"; // yellow/orange
                    } else {
                        fatigue = "LOW";
                        fatigueColor = "#33FF66"; // green
                    }
                }

                return (
                    <View style={homeStyles.cardContent}>
                        <View style={homeStyles.cardRow}>
                            <Text style={homeStyles.cardLabel}>HEART RATE SLEEP</Text>
                            <Text style={homeStyles.cardValue}>{sleepData.heartRate ?? "--"} bpm</Text>
                        </View>
                        <View style={homeStyles.cardRow}>
                            <Text style={homeStyles.cardLabel}>SLEEP</Text>
                            <Text style={homeStyles.cardValue}>
                                {sleepHours != null ? sleepHours.toFixed(1) + " HRS" : "--"}
                            </Text>
                        </View>
                        <View style={homeStyles.cardRow}>
                            <Text style={homeStyles.cardLabel}>FATIGUE</Text>
                            <Text style={[homeStyles.cardValue, { color: fatigueColor, textShadowColor: fatigueColor }]}>
                                {fatigue}
                            </Text>
                        </View>
                    </View>
                );
            },
        },
        {
            title: 'RECOVERY STATUS',
            lines: [
                `SORE // ${workoutsThisWeek && workoutsThisWeek > 4 ? "HIGH" : workoutsThisWeek && workoutsThisWeek > 2 ? "MEDIUM" : "LOW"}`,
                `CNS LOAD // ${(sleepData.duration != null && (sleepData.duration / 60) < 6) ? "HIGH" : "NORMAL"}`,
                `MENTAL STATE // ${workoutStreak && workoutStreak > 5 ? "FOCUSED" : workoutStreak && workoutStreak > 0 ? "RECOVERING" : "UNMOTIVATED"}`
            ]
        },
        {
            title: 'STEP MONITOR',
            render: () => (
                <View style={homeStyles.cardContent}>
                    <View style={homeStyles.cardRow}>
                        <Text style={homeStyles.cardLabel}>STEPS: </Text>
                        <Text style={homeStyles.cardValue}>{physicalActivityData.stepCounter ?? "N/A"}</Text>
                    </View>
                    <View style={homeStyles.cardRow}>
                        <Text style={homeStyles.cardLabel}>DISTANCE: </Text>
                        <Text style={homeStyles.cardValue}>{(physicalActivityData.distance && physicalActivityData.distance / 1000) ?? "N/A"} km</Text>
                    </View>
                    <View style={homeStyles.cardRow}>
                        <Text style={homeStyles.cardLabel}>ENERGY EXPENDED: </Text>
                        <Text style={homeStyles.cardValue}>{physicalActivityData.energyExpended ?? "N/A"} kJ</Text>
                    </View>
                </View>
            ),
        },
        {
            title: 'SLEEP STATUS',
            render: () => (
                <View style={homeStyles.cardContent}>
                    <View style={homeStyles.cardRow}>
                        <Text style={homeStyles.cardLabel}>REM %</Text>
                        <Text style={homeStyles.cardValue}>{sleepData.remRate ?? "--"} %</Text>
                    </View>
                    <View style={homeStyles.cardRow}>
                        <Text style={homeStyles.cardLabel}>LIGHT %</Text>
                        <Text style={homeStyles.cardValue}>{sleepData.lightSleepRate ?? "--"} %</Text>
                    </View>
                    <View style={homeStyles.cardRow}>
                        <Text style={homeStyles.cardLabel}>DEEP %</Text>
                        <Text style={homeStyles.cardValue}>{sleepData.deepSleepRate ?? "--"} %</Text>
                    </View>
                </View>
            ),
        },
        {
            title: 'STATUS REPORT',
            lines: [
                `LAST WEEK VOL // ${progress?.lastWeekVolume}`,
                `THIS WEEK VOL //  ${progress?.thisWeekVolume} kg`,
                `VOLUME INCREASMENT // ${progress?.weeklyVolumeChange}`,
            ],
        },
        {
            title: 'POWER LEVEL',
            render: () =>
                progress?.pr.map((p) => (
                    <View key={p.name} style={homeStyles.cardRow}>
                        <Text style={homeStyles.cardLabel}>{p.name.toUpperCase()}</Text>
                        <Text style={homeStyles.cardValue}>
                            {p.weight} {p.unit}
                        </Text>
                    </View>
                )),
        },
        {
            title: 'SESSION LOG',
            lines: [
                `LAST PR // `,
                `LAST ENTRY //  2 days ago`,

            ],
        },
    ];

    const trainingLoad = (() => {
        if (!progress?.lastWeekVolume || !progress?.thisWeekVolume) return "N/A";

        const ratio = progress.thisWeekVolume / progress.lastWeekVolume;

        if (ratio < 0.8) return "LIGHT";
        if (ratio < 1.2) return "MODERATE";
        return "HEAVY";
    })();


    return (
        <SafeAreaView style={homeStyles.root}>
            <ImageBackground source={GRAIN_TEXTURE} style={homeStyles.bg} imageStyle={{ opacity: 0.1 }}>
                <ImageBackground source={SCANLINE_TEXTURE} style={homeStyles.bg} imageStyle={{ opacity: 0.1 }}>

                    <ScrollView style={homeStyles.container} contentContainerStyle={homeStyles.content}>
                        <Image
                            source={require('../../assets/bfc0a832-85f1-48f9-a766-9426b2947a94.png')}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 80,
                                height: 80,
                                opacity: 0.1,
                            }}
                            resizeMode="contain"
                        />
                        <Image
                            source={require('../../assets/bfc0a832-85f1-48f9-a766-9426b2947a94.png')}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 80,
                                height: 80,
                                opacity: 0.1,
                                transform: [{ rotate: '180deg' }],
                            }}
                            resizeMode="contain"
                        />
                        <VHSHeader />


                        <View style={homeStyles.overviewRow}>
                            <Text style={homeStyles.vhsHudTitle}>▓CHANNEL 01 — WORKOUT FEED▓</Text>
                            <View style={homeStyles.vhsHudPanel}>
                                <View style={homeStyles.hudRow}>
                                    <Text style={homeStyles.hudLabel}>WORKOUTS THIS WEEK:</Text>
                                    <Text style={[homeStyles.hudValue, { color: "#00ffcc", fontWeight: "bold" }]}> {workoutsThisWeek} finished</Text>
                                </View>

                                <View style={homeStyles.hudRow}>
                                    <Text style={homeStyles.hudLabel}>WORKOUT STREAK:</Text>

                                    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                                        <Text style={[homeStyles.hudValue, { fontWeight: "bold" }]}>
                                            {workoutStreak} Days
                                        </Text>
                                        {workoutStreak && workoutStreak > 0 && ( // add fire when workoutStreak
                                            <Icon
                                                name="flame"
                                                size={18}
                                                color="#ff3b3b"
                                                style={{
                                                    marginLeft: 4,
                                                    marginBottom: -2,
                                                    textShadowColor: "#e91109ff", // outer glow orange
                                                    textShadowRadius: 12,            // how soft the glow looks
                                                    textShadowOffset: { width: 0, height: 0 }, // centered glow
                                                }}
                                            />
                                        )
                                        }
                                    </View>



                                </View>

                                <View style={homeStyles.hudRow}>
                                    <Text style={homeStyles.hudLabel}>NEXT GOAL:</Text>

                                    <Text style={[homeStyles.hudValue, { fontWeight: "bold" }]}>{skippedSplitType}</Text>
                                </View>

                                <Text style={homeStyles.diagnosticNote}>
                                    {`>> ${nextGoalMessage} <<`}
                                </Text>
                            </View>


                        </View>
                        <View style={homeStyles.doubleRow}>
                            <View style={homeStyles.halfBox}>
                                <Text style={homeStyles.boxHeader}>LAST WORKOUT</Text>
                                <View style={{ flex: 1, justifyContent: "center" }}>
                                    <Text style={[homeStyles.cardValue, {
                                        fontSize: 18, fontWeight: 'bold', color: "#BFC7D5",
                                        textShadowColor: "#BFC7D5",
                                        textShadowOffset: { width: 0, height: 0 },
                                        textShadowRadius: 3,
                                    }]}>{lastWorkout}</Text>
                                    <Text style={[homeStyles.cardValue, { fontSize: 16, fontWeight: 'bold' }]}>{lastSplitType}</Text>
                                </View>
                            </View>

                            <View style={homeStyles.halfBox}>
                                <Text style={homeStyles.boxHeader}>THIS WEEK VOLUME</Text>
                                <View style={{ flex: 1, justifyContent: "center" }}>
                                    <Text style={[homeStyles.cardValue, {
                                        fontSize: 26, fontWeight: 'bold', color: "#BFC7D5",
                                        textShadowColor: "#BFC7D5",
                                        textShadowOffset: { width: 0, height: 0 },
                                        textShadowRadius: 3,
                                    }]}>{thisWeekVolume} kg</Text>
                                </View>
                            </View>
                        </View>


                        <View style={homeStyles.doubleRow}>
                            <View style={homeStyles.halfBox}>
                                <Text style={homeStyles.boxHeader}>POWER FEED</Text>
                                <Text style={homeStyles.bodyText}>
                                    TOP LIFT:
                                </Text>
                                <Text style={[homeStyles.cardValue, { fontSize: 14 }]}>{progress?.topLift.name.toUpperCase()} {progress?.topLift.weight}{progress?.topLift.unit}</Text>
                            </View>

                            <View style={homeStyles.halfBox}>
                                <Text style={homeStyles.boxHeader}>TRAINING STATUS</Text>
                                <Text style={homeStyles.bodyText}>TRAINING LOAD: </Text>
                                <Text style={[homeStyles.cardValue, { fontSize: 14 }]}>{trainingLoad}</Text>
                            </View>
                        </View>
                        <VHSGlowDivider></VHSGlowDivider>

                        <Text style={homeStyles.vhsHudTitle}>▓CHANNEL 02 — VITAL FEED▓</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            {recoveryCards.map((card, index) => (
                                <View key={index} style={homeStyles.recoveryCard}>
                                    <Text style={homeStyles.cardTitle}>{card.title}</Text>
                                    {card.lines?.map((line, i) => {
                                        if (!line) return null;
                                        const [label, value] = line.split("//"); // split at //
                                        return (
                                            <View key={i} style={homeStyles.cardRow}>
                                                <Text style={homeStyles.cardLabel}>{label?.trim()}</Text>
                                                <Text style={homeStyles.cardValue}>{value?.trim()}</Text>
                                            </View>
                                        );
                                    })}

                                    {card.render?.()}
                                </View>
                            ))}
                        </ScrollView>
                        <Text style={homeStyles.transitionLabel}>▶ ANALYZING SYSTEM FEED...</Text>

                        <View style={homeStyles.powerBarContainer}>
                            <Text style={homeStyles.powerBarLabel}>▞ GAIN SIGNAL STRENGTH ▚</Text>
                            <Text style={homeStyles.powerBarSubLabel}>↳ Detected Weekly Volume Progression: {progress?.weeklyVolumeChange}</Text>

                            <View style={homeStyles.powerBarTrack}>
                                <View style={[homeStyles.powerBarFill, {
                                    width: `${Math.min(
                                        Number(progress?.weeklyVolumeChange.replace('%', '')) || 0,
                                        100
                                    )
                                        }%`

                                }]} />
                            </View>

                            <View style={homeStyles.barTickRow}>
                                <Text style={homeStyles.tickLabel}>LOW</Text>
                                <Text style={homeStyles.tickLabel}>MED</Text>
                                <Text style={homeStyles.tickLabel}>HIGH</Text>
                            </View>

                            <Text style={homeStyles.diagnosticNote}>
                                &gt;&gt;STRENGTH SIGNAL LOCKED — HOLD THE LINE&lt;&lt;
                            </Text>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </ImageBackground>
        </SafeAreaView >
    );
}

export const homeStyles = StyleSheet.create({
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
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 255, 204, 0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#00ffcc',
        borderRadius: 2,
        letterSpacing: 0.5,
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
        borderColor: '#00ffcc',
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
