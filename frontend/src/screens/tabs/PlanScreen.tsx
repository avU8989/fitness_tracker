import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { RouteProp } from "@react-navigation/native";
import { View, Text, ScrollView, StyleSheet, Pressable, ImageBackground } from "react-native";
import { TrainingPlansStackParamList } from "../../navigation/navtypes";
import { getPlanStats } from "../../utils/planStats";
import HeroCard from "../../components/HeroCard";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { getTodayName } from "../../utils/apiHelpers";
import ActivityScreen, { activityStyles } from "../../components/ActivityScreen";

type TrainingPlanScreenRouteProp = RouteProp<
    TrainingPlansStackParamList,
    "TrainingPlanScreen"
>;

type Nav = StackNavigationProp<
    TrainingPlansStackParamList,
    "TrainingPlansScreen"
>;


export default function DummyTrainingPlanScreen() {
    const { params } = useRoute<TrainingPlanScreenRouteProp>();
    const { plan } = params;
    const navigation = useNavigation<Nav>();
    const [completedDays, setCompletedDays] = React.useState<Record<number, boolean>>({});

    const DAY_ICONS: Record<string, any> = {
        MON: require("../../assets/MON.png"),
        TUE: require("../../assets/TUE.png"),
        WED: require("../../assets/WED.png"),
        THU: require("../../assets/THU.png"),
        FRI: require("../../assets/FRI.png"),
        SAT: require("../../assets/SAT.png"),
        SUN: require("../../assets/SUN.png"),
    }

    const { totalExercises, totalVolume } = getPlanStats(plan);

    function onBack() {
        navigation.navigate("TrainingPlansScreen");

    }

    function toggleDayCompleted(idx: number) {
        setCompletedDays(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    }


    return (
        <>
            <ScrollView style={styles.root}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* TOP HERO SECTION */}
                <HeroCard
                    name={plan.name}
                    type={plan.type}
                    days={plan.days.length}
                    onBack={onBack}
                />

                {/* WEEK SUMMARY CARD */}
                <View style={styles.container}>

                    {plan.days.map((day, idx) => (

                        <Pressable key={idx} style={styles.trackRow}
                            onLongPress={() => toggleDayCompleted(idx)}
                        >
                            {/* LEFT SIDE ICON */}
                            {day.dayOfWeek !== null && DAY_ICONS[day.dayOfWeek.toUpperCase()] && (
                                <View style={styles.iconWrapper}>
                                    <ImageBackground
                                        source={DAY_ICONS[day.dayOfWeek.toUpperCase()]}
                                        style={styles.imageBackground}
                                        imageStyle={{ opacity: 0.98 }}
                                    />
                                </View>

                            )}


                            {/* RIGHT SIDE INFO */}
                            <View style={styles.trackInfo}>
                                {/* Split Type */}
                                <Text style={styles.trackTitle}>{day.splitType}</Text>

                                {/* Exercise Preview */}
                                {day.exercises.length === 0 ? (
                                    <Text style={styles.restText}>REST DAY</Text>
                                ) : (
                                    <>
                                        {day.exercises.slice(0, 2).map((ex, i) => (
                                            <Text key={i} style={styles.trackSubtitle}>
                                                {ex.name} • {ex.sets.length} sets
                                            </Text>
                                        ))}

                                        {day.exercises.length > 2 && (
                                            <Text style={styles.moreText}>
                                                +{day.exercises.length - 2} more
                                            </Text>
                                        )}
                                    </>
                                )}
                            </View>

                            {/* RIGHT-SIDE ICONS */}
                            <View style={styles.rightIcons}>
                                {/* REST DAY ICON */}
                                {day.exercises.length === 0 && (
                                    <Ionicons
                                        name="moon"
                                        size={20}
                                        color="#7ACFCF"
                                        style={{ marginRight: 8 }}
                                    />
                                )}

                                {/* GREEN CHECKMARK (mocked) */}
                                {completedDays[idx] && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={26}
                                        color="#00ff99"
                                        style={{ marginRight: 8 }}
                                    />
                                )}

                                {/* NAVIGATION CHEVRON */}
                                <Ionicons name="chevron-forward" size={20} color="#7ACFCF" />
                            </View>


                        </Pressable>
                    ))}
                </View>

            </ScrollView>
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 8
    },

    powerBarContainer: {
        paddingVertical: 12,
        borderRadius: 18,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    heroLabel: {
        fontFamily: "monospace",
        fontSize: 20,
        paddingBottom: 20,
        color: "#00ffcc",
        letterSpacing: 3,
        textTransform: "uppercase",
        marginBottom: 4,
        opacity: 0.9,
    },

    rightIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 26,
    },

    imageBackground: {
        width: "100%",
        height: "100%",
        position: "absolute",
        borderRadius: 12,
        overflow: "hidden",
    },

    listContainer: {
        marginTop: 10,
        paddingHorizontal: 20,
    },

    trackRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 18,
        backgroundColor: "#111622",
        borderColor: "rgba(0, 255, 204, 0.3)",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
    },

    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: "rgba(0,255,204,0.08)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        position: "relative",
    },

    dayAbbrev: {
        position: "absolute",
        bottom: 4,
        right: 4,
        fontFamily: "monospace",
        fontSize: 10,
        letterSpacing: 1,
        color: "#00ffcc",
        opacity: 0.9,
    },

    trackInfo: {
        flex: 1,
        justifyContent: "center",
    },

    trackTitle: {
        paddingTop: 26,
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "monospace",
        marginBottom: 6,
        textShadowColor: "#7ACFCF",
        textShadowRadius: 6,
    },

    trackSubtitle: {
        color: "#BFC7D5",
        fontSize: 12,
        fontFamily: "monospace",
        marginBottom: 2,
    },

    moreText: {
        color: "#7ACFCF",
        fontFamily: "monospace",
        fontSize: 12,
        marginTop: 4,
    },

    restText: {
        color: "#888",
        fontFamily: "monospace",
        fontSize: 12,
        fontStyle: "italic",
    },

    statsScrollWrapper: {
        marginTop: 10,
        marginBottom: 20,
    },

    statsScroll: {
        paddingRight: 20,
        gap: 12,
    },

    statChip: {
        width: 120,
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(0,255,204,0.3)",
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#00ffcc",
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },

    chipValue: {
        color: "#00ffcc",
        fontSize: 18,
        fontFamily: "monospace",
        marginTop: 8,
        textShadowColor: "#00ffcc",
        textShadowRadius: 10,
    },

    chipLabel: {
        color: "#7ACFCF",
        fontSize: 12,
        marginTop: 3,
        fontFamily: "monospace",
        opacity: 0.9,
        letterSpacing: 1,
    },

    root: {
        flex: 1,
        backgroundColor: "#0A0F1C",
    },

    content: {
        backgroundColor: "#0A0F1C",
        flexGrow: 1,
        paddingBottom: 100

    },

    /* HERO SECTION */
    hero: {
        alignItems: "center",
        paddingVertical: 30,
        marginBottom: 15,
        position: "relative",
    },

    heroGlow: {
        position: "absolute",
        top: 0,
        width: 200,
        height: 200,
        borderRadius: 999,
        backgroundColor: "#00ffcc22",
    },

    heroTitle: {
        color: "#00ffcc",
        fontSize: 28,
        fontFamily: "monospace",
        letterSpacing: 3,
        textShadowColor: "#00ffcc",
        textShadowRadius: 18,
        marginBottom: 6,
        textAlign: "center",
    },

    heroSub: {
        color: "#7ACFCF",
        fontSize: 13,
        fontFamily: "monospace",
        opacity: 0.9,
        letterSpacing: 2,
    },

    /* STATS GRID */
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },

    statBox: {
        flex: 1,
        paddingVertical: 20,
        marginHorizontal: 6,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(0,255,204,0.3)",
        alignItems: "center",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },

    statValue: {
        color: "#00ffcc",
        fontSize: 22,
        fontFamily: "monospace",
        textShadowColor: "#00ffcc",
        textShadowRadius: 12,
        marginBottom: 4,
    },

    statLabel: {
        color: "#7ACFCF",
        fontSize: 11,
        fontFamily: "monospace",
        letterSpacing: 1,
    },

    /* SECTION TITLE */
    sectionTitle: {
        color: "#7ACFCF",
        fontSize: 15,
        fontWeight: "bold",
        fontFamily: "monospace",
        letterSpacing: 2,
        marginBottom: 12,
    },

    /* DAY CARD */
    dayCard: {
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderColor: "rgba(0,255,204,0.25)",
        borderWidth: 1,
        shadowColor: "#00ffcc",
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },

    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    dayTitle: {
        color: "#00ffcc",
        fontSize: 17,
        fontFamily: "monospace",
        letterSpacing: 1,
    },

    dayTag: {
        color: "#7ACFCF",
        fontSize: 12,
        fontFamily: "monospace",
        opacity: 0.8,
    },

    exerciseLine: {
        color: "#BFC7D5",
        fontSize: 13,
        fontFamily: "monospace",
        marginBottom: 2,
    },
});
