import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { Circle } from "react-native-svg";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
    weeklyWorkouts: number;
    remainingDays: number;
    streak: number;
    nextSplit: string | null;
    totalLiftedToday: number;
    plannedVolumeToday: number;
}

/* GENERIC CIRCLE RING COMPONENT */
export function ProgressRing({
    size,
    strokeWidth,
    progress,
    color,
    backgroundColor,
    children,
}: {
    size: number;
    strokeWidth: number;
    progress: number; // 0–100
    color: string;
    backgroundColor: string;
    children?: React.ReactNode;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dash = circumference * (progress / 100);

    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size} height={size}>

                {/* BACKGROUND RING */}
                <Circle
                    stroke={backgroundColor}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* PROGRESS RING */}
                <Circle
                    stroke={color}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash}, ${circumference}`}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                    fill="none"
                />
            </Svg>

            {/* CENTER CONTENT */}
            <View style={styles.centerContent}>{children}</View>
        </View>
    );
}

export default function WeeklyOverviewCircles({
    weeklyWorkouts,
    remainingDays,
    streak,
    nextSplit,
    totalLiftedToday,
    plannedVolumeToday
}: Props) {
    const maxStreak = 30; //currently set to monthly streak
    const weeklyGoal = remainingDays + weeklyWorkouts;
    const pct = Math.min(100, Math.round((weeklyWorkouts / weeklyGoal) * 100));

    const streakPct = Math.min(100, Math.round((streak / maxStreak) * 100));

    const todayPct = plannedVolumeToday > 0
        ? Math.min(100, Math.round((totalLiftedToday / plannedVolumeToday) * 100))
        : 0;


    return (
        <View style={styles.container}>

            {/* BIG CIRCLE */}
            <View style={styles.bigCircleCard}>
                <Text style={styles.bigLabel}>WEEKLY WORKOUTS</Text>


                <ProgressRing
                    size={150}
                    strokeWidth={10}
                    progress={pct}
                    color="#00ffcc"
                    backgroundColor="rgba(0,255,204,0.15)"
                >
                    <View style={{ alignItems: "center" }}>
                        <MaterialCommunityIcons name="weight-lifter" size={32} color="#00ffcc" />
                        <Text style={styles.bigCircleValue}>{weeklyWorkouts}/{weeklyGoal}</Text>
                    </View>

                </ProgressRing>

            </View>

            {/* TWO SMALL CIRCLES */}
            {/* THREE SMALL FLOATING CIRCLES */}
            <View style={styles.bottomRow}>

                {/* STREAK CIRCLE */}
                <View style={styles.smallCircleWrapper}>
                    <Text style={styles.smallLabel}>STREAK</Text>
                    <ProgressRing
                        size={90}
                        strokeWidth={7}
                        progress={streakPct}
                        color="#ff3b3b"
                        backgroundColor="rgba(255,80,80,0.15)"
                    >
                        <Ionicons name="flame" size={22} color="#ff3b3b" />
                    </ProgressRing>
                    <Text style={[styles.smallValue, { color: "#ff3b3b" }]}>{streak} DAYS</Text>
                </View>

                {/* NEXT SPLIT CIRCLE */}
                <View style={styles.smallCircleWrapper}>
                    <Text style={styles.smallLabel}>UPCOMING</Text>

                    <ProgressRing
                        size={90}
                        strokeWidth={7}
                        progress={100}
                        color="#fbff0aff"
                        backgroundColor="rgba(0,255,204,0.15)"
                    >
                        <Ionicons name="barbell" size={22} color="#fbff0aff" />
                    </ProgressRing>

                    <Text style={[styles.smallValue, { color: "#fbff0aff" }]}>
                        {nextSplit ?? "--"}
                    </Text>

                </View>

                {/* WEIGHT CIRCLE */}
                <View style={styles.smallCircleWrapper}>
                    <Text style={styles.smallLabel}>TODAY</Text>

                    <ProgressRing
                        size={90}
                        strokeWidth={7}
                        progress={todayPct}
                        color="#66aaff"
                        backgroundColor="rgba(102,170,255,0.15)"
                    >
                        <MaterialCommunityIcons name="weight-kilogram" size={26} color="#66aaff" />
                    </ProgressRing>


                    <Text style={[styles.smallValue, { color: "#66aaff" }]}>
                        {totalLiftedToday} / {plannedVolumeToday} KG
                    </Text>
                </View>

            </View>


        </View >
    );
}

/* --- STYLES --- */
const styles = StyleSheet.create({
    nextSplitCircle: {
        width: 90,
        height: 90,
        borderRadius: 999,
        backgroundColor: "#0A0F1C",
        borderWidth: 2,
        borderColor: "rgba(0,255,204,0.25)",
        justifyContent: "center",
        alignItems: "center",

        // VHS glow
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    smallCircleWrapper: {
        width: "32%",
        alignItems: "center",
    },



    container: { marginBottom: 20 },

    centerContent: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },

    /* BIG CIRCLE */
    bigCircleCard: { alignItems: "center", marginBottom: 16 },

    bigLabel: {
        fontFamily: "monospace",
        color: "white",
        fontSize: 26,
        fontWeight: "bold",
        paddingTop: 15,
        letterSpacing: 2,
        marginBottom: 18,
    },

    bigCircleValue: {
        fontFamily: "monospace",
        fontSize: 22,
        fontWeight: "bold",
        color: "#00ffcc",
        textShadowColor: "#00ffcc",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },

    /* SMALL CIRCLES */
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        marginTop: 6,
    },


    smallCard: {
        width: "48%",
        alignItems: "center",
        backgroundColor: "#111622",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0,255,204,0.15)",
        paddingVertical: 12,
    },

    smallLabel: {
        fontWeight: "bold",
        fontFamily: "monospace",
        color: "white",
        fontSize: 18,
        letterSpacing: 1.5,
        marginTop: 6,
        marginBottom: 18,
    },

    smallValue: {
        fontFamily: "monospace",
        fontSize: 12,
        alignItems: "center",
        color: "#00ffcc",
        fontWeight: "bold",
        marginTop: 8,
    },
});
