import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import VHSGlowDividerSmall from "./VHSGlowDividerSmall";

interface Props {
    weeklyWorkouts: number;
    remainingDays: number;
    streak: number;
    nextSplit: string | null;
    totalLiftedToday: number;
    plannedVolumeToday: number;
}

function Divider() {
    return (
        <View style={styles.innerDivider} />
    );
}


const RING_PRIMARY = "#7CFFE5";
const RING_BG = "rgba(124,255,229,0.15)";

const gradientStops: Record<string, [string, string]> = {
    "#7CFFE5": ["#9FFFEF", "#7CFFE5"], // mint
    "#ff3b3b": ["#FF8A8A", "#ff3b3b"], // red
    "#66aaff": ["#9FC4FF", "#66aaff"], // blue
    "#fbff0a": ["#FFFF8A", "#fbff0a"], // yellow
};


/* GENERIC CIRCLE RING COMPONENT */
export function ProgressRing({
    size,
    strokeWidth,
    progress,
    color,
    backgroundColor,
    gradientId,
    children,
}: {
    size: number;
    strokeWidth: number;
    progress: number;
    color: string;
    backgroundColor: string;
    gradientId: string;
    children?: React.ReactNode;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dash = circumference * (progress / 100);

    const [startColor, endColor] = gradientStops[color] ?? [color, color];


    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient
                        id={gradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform={`rotate(90 ${size / 2} ${size / 2})`}
                    >
                        <Stop offset="0%" stopColor={startColor} />
                        <Stop offset="100%" stopColor={endColor} />
                    </LinearGradient>
                </Defs>

                {/* BACKGROUND */}
                <Circle
                    stroke={backgroundColor}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* PROGRESS */}
                <Circle
                    stroke={`url(#${gradientId})`}
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
        </View >
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

                <ProgressRing
                    size={180}
                    strokeWidth={12}
                    progress={pct}
                    color={RING_PRIMARY}
                    gradientId="weeklyGradient"
                    backgroundColor={RING_BG}
                >
                    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                        <Text style={styles.bigPrimaryValue}>{weeklyWorkouts}</Text>
                        <Text style={styles.bigSecondaryValue}>/{weeklyGoal}</Text>
                    </View>

                    <VHSGlowDividerSmall></VHSGlowDividerSmall>

                    <Text style={styles.bigSubLabel}>WORKOUT LOGGED</Text>



                </ProgressRing>
            </View>

            {/* TWO SMALL CIRCLES */}
            {/* THREE SMALL FLOATING CIRCLES */}
            <View style={styles.bottomRow}>

                {/* STREAK CIRCLE */}
                <View style={styles.smallCircleWrapper}>
                    <ProgressRing
                        size={108}
                        strokeWidth={8}
                        gradientId="streakGradient"
                        progress={streakPct}
                        color="#ff3b3b"
                        backgroundColor="rgba(255,80,80,0.15)"
                    >
                        <Ionicons name="flame" size={22} color="#ff3b3b" />
                        <VHSGlowDividerSmall></VHSGlowDividerSmall>
                        <Text style={styles.bigSubLabel}>STREAK</Text>

                    </ProgressRing>
                    <Text style={[styles.smallValue, { color: "#ff3b3b" }]}>{streak} DAYS</Text>
                </View>

                {/* NEXT SPLIT CIRCLE */}
                <View style={styles.smallCircleWrapper}>
                    {/*TODO ADD COMPLETED */}
                    <ProgressRing
                        size={108}
                        gradientId="upcomingGradient"
                        strokeWidth={8}
                        progress={100}
                        color="#fbff0aff"
                        backgroundColor="rgba(0,255,204,0.15)"
                    >
                        <Ionicons name="barbell" size={22} color="#fbff0aff" />
                        <VHSGlowDividerSmall></VHSGlowDividerSmall>
                        <Text style={styles.bigSubLabel}>UPCOMING</Text>

                    </ProgressRing>

                    <Text style={[styles.smallValue, { color: "#fbff0aff" }]}>
                        {nextSplit ?? "--"}
                    </Text>

                </View>

                {/* WEIGHT CIRCLE */}
                <View style={styles.smallCircleWrapper}>

                    <ProgressRing
                        size={108}
                        gradientId="todayGradient"
                        strokeWidth={8}
                        progress={todayPct}
                        color="#66aaff"
                        backgroundColor="rgba(102,170,255,0.15)"
                    >
                        <MaterialCommunityIcons name="weight-kilogram" size={26} color="#66aaff" />
                        <VHSGlowDividerSmall></VHSGlowDividerSmall>
                        <Text style={styles.bigSubLabel}>TODAY</Text>

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

    innerDivider: {
        width: 60,                 // short
        height: 1,
        backgroundColor: "rgba(124,255,229,0.35)",
        opacity: 0.2,
        marginVertical: 6,
        borderRadius: 1,
    },

    bigSubLabel: {
        fontFamily: "monospace",
        fontSize: 12,
        fontWeight: "semibold",
        color: "rgba(255,255,255,0.6)",
        marginTop: 2,
        letterSpacing: 1,
    },

    bigPrimaryValue: {
        fontFamily: "monospace",
        fontSize: 39,
        transform: [{ scaleX: 1.08 }],
        fontWeight: "400",
        color: "#7CFFE5", // main mint
        lineHeight: 38,
    },

    bigSecondaryValue: {
        fontFamily: "monospace",
        fontSize: 18,
        fontWeight: "400",
        color: "#9FFFEF", // softer mint
        marginLeft: 2,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
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

    container: { marginBottom: 30 },

    centerContent: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },

    /* BIG CIRCLE */
    bigCircleCard: { alignItems: "center", marginBottom: 16, marginTop: 20 },

    bigLabel: {
        fontFamily: "monospace",
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        paddingTop: 15,
        letterSpacing: 3,
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
        marginTop: 36,
        marginBottom: 20,
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
        textAlign: "center",
        alignItems: "center",
        color: "#00ffcc",
        fontWeight: "bold",
        marginTop: 8,
    },
});
