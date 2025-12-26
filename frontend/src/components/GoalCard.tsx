import React, { useEffect, useMemo, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    Animated,
    ImageSourcePropType,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

const fmtInt = (n: number) => {
    // RN supports toLocaleString in most setups; fallback just in case
    try {
        return n.toLocaleString();
    } catch {
        return String(n);
    }
};

type GoalTone = "teal" | "blue" | "purple" | "orange" | "green";

const TONES: Record<GoalTone, { accent: string; border: string; track: string; glow: string }> = {
    teal: { accent: "#00ffcc", border: "rgba(0,255,204,0.32)", track: "rgba(0,255,204,0.14)", glow: "#00ffcc" },
    blue: { accent: "#66AAFF", border: "rgba(102,170,255,0.30)", track: "rgba(102,170,255,0.14)", glow: "#66AAFF" },
    purple: { accent: "#b38aff", border: "rgba(179,138,255,0.28)", track: "rgba(179,138,255,0.12)", glow: "#b38aff" },
    orange: { accent: "#ff8800", border: "rgba(255,136,0,0.28)", track: "rgba(255,136,0,0.12)", glow: "#ff8800" },
    green: { accent: "#00FF99", border: "rgba(0,255,153,0.28)", track: "rgba(0,255,153,0.12)", glow: "#00FF99" },
};

export const GoalCard = ({
    title,
    label,
    current,
    target,
    unit,
    subtitle,
    illustration,
    tone = "teal",
    onPress,
}: {
    title: string;
    label: string;
    current: number;
    target: number;
    unit?: string;
    subtitle?: string;
    illustration?: ImageSourcePropType;
    tone?: GoalTone;
    onPress?: () => void;
}) => {
    const pct = clamp(target > 0 ? current / target : 0);
    const done = target > 0 && current >= target;
    const remaining = Math.max(0, target - current);

    const colors = TONES[tone];

    // Animate bar
    const anim = useRef(new Animated.Value(pct)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: pct,
            duration: 450,
            useNativeDriver: false, // width interpolation
        }).start();
    }, [pct]);

    const barWidth = useMemo(
        () =>
            anim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
            }),
        [anim]
    );

    const helper =
        subtitle ??
        (done
            ? "GOAL HIT ✅"
            : remaining === 0
                ? `ALMOST THERE`
                : `${fmtInt(remaining)} ${unit ?? ""} TO GO`.trim());

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={onPress ? "button" : "summary"}
            style={({ pressed }) => [
                styles.goalCard,
                {
                    borderColor: colors.border,
                    shadowColor: colors.glow,
                    opacity: pressed ? 0.92 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                },
            ]}
        >
            <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={styles.topRow}>
                    <Text style={styles.heroTitle}>{title}</Text>

                    {done && (
                        <View style={[styles.badge, { borderColor: colors.border }]}>
                            <Ionicons name="checkmark" size={12} color={colors.accent} />
                            <Text style={[styles.badgeText, { color: colors.accent }]}>DONE</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.goalLabel}>{label}</Text>

                <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6, gap: 8 }}>
                    <Text style={[styles.currentBig, { color: colors.accent }]}>{fmtInt(current)}</Text>
                    <Text style={styles.targetSmall}>
                        of {fmtInt(target)} {unit ?? ""}
                    </Text>
                </View>

                <View style={styles.volumeBarTrack}>
                    <View
                        style={[
                            styles.volumeBarFill,
                            { width: `${pct}%` },
                        ]}
                    />
                </View>


                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, justifyContent: "space-between" }}>
                    <Text style={styles.goalSub}>{helper}</Text>
                </View>
            </View>

            <View style={[styles.goalImageWrap, { borderColor: colors.border, backgroundColor: colors.track, shadowColor: colors.glow }]}>
                {illustration ? (
                    <Image source={illustration} style={styles.goalImage} resizeMode="cover" />
                ) : (
                    <View style={styles.goalImagePlaceholder}>
                        <Ionicons name="fitness-outline" size={26} color="rgba(191,199,213,0.55)" />
                    </View>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
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
    goalCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#111622",
        borderRadius: 18,
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        marginBottom: 16,
    },

    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

    heroTitle: {
        fontFamily: "monospace",
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
        letterSpacing: 2,
    },

    goalLabel: {
        marginTop: 6,
        fontFamily: "monospace",
        fontSize: 11,
        color: "#BFC7D5",
        opacity: 0.75,
        letterSpacing: 2,
    },

    currentBig: {
        fontFamily: "monospace",
        fontSize: 28,
        fontWeight: "900",
    },

    targetSmall: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#BFC7D5",
        opacity: 0.8,
    },

    barTrack: {
        height: 10,
        borderRadius: 6,
        borderWidth: 1,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },

    goalSub: {
        fontFamily: "monospace",
        fontSize: 10,
        color: "#BFC7D5",
        opacity: 0.7,
        letterSpacing: 1.5,
    },

    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.2)",
    },

    badgeText: {
        fontFamily: "monospace",
        fontSize: 10,
        letterSpacing: 1.5,
        fontWeight: "800",
    },

    goalImageWrap: {
        width: 96,
        height: 96,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },

    goalImage: { width: "100%", height: "100%", opacity: 0.92 },

    goalImagePlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
