import React, { useEffect, useMemo, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Pressable,
    Animated,
    ImageSourcePropType,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

type GoalTone = "teal" | "blue" | "purple" | "orange" | "green";

const ACCENTS: Record<GoalTone, string> = {
    teal: "#00ffcc",
    blue: "#66AAFF",
    purple: "#b38aff",
    orange: "#ff8800",
    green: "#00FF99",
};

export const GoalCardImage = ({
    title,
    label,
    current,
    target,
    unit,
    image,
    tone = "teal",
    onPress,
}: {
    title: string;
    label: string;
    current: number;
    target: number;
    unit?: string;
    image: ImageSourcePropType;
    tone?: GoalTone;
    onPress?: () => void;
}) => {
    const pct = clamp(target > 0 ? current / target : 0);
    const done = current >= target;
    const accent = ACCENTS[tone];

    const anim = useRef(new Animated.Value(pct)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: pct,
            duration: 400,
            useNativeDriver: false,
        }).start();
    }, [pct]);

    const barWidth = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <Pressable onPress={onPress} style={({ pressed }) => [
            styles.card,
            { transform: [{ scale: pressed ? 0.985 : 1 }] },
        ]}>
            <ImageBackground
                source={image}
                resizeMode="cover"
                style={styles.image}
            >
                {/* subtle readability scrim */}
                <View style={styles.scrim} />

                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <Text style={styles.label}>{label}</Text>
                        {done && (
                            <View style={styles.badge}>
                                <Ionicons name="checkmark" size={12} color={accent} />
                                <Text style={[styles.badgeText, { color: accent }]}>
                                    DONE
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.statsRow}>
                        <Text style={[styles.current, { color: accent }]}>
                            {current}
                        </Text>
                        <Text style={styles.target}>
                            / {target} {unit ?? ""}
                        </Text>
                    </View>

                    <View style={styles.barTrack}>
                        <Animated.View
                            style={[
                                styles.barFill,
                                {
                                    width: barWidth,
                                    backgroundColor: accent,
                                    shadowColor: accent,
                                },
                            ]}
                        />
                    </View>
                </View>
            </ImageBackground>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        height: 220,
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: "#000",
    },

    image: {
        flex: 1,
        justifyContent: "flex-end",
    },

    scrim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)", // keep text readable
    },

    content: {
        padding: 16,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    label: {
        fontFamily: "monospace",
        fontSize: 11,
        letterSpacing: 2,
        color: "#E5E7EB",
        opacity: 0.85,
    },

    title: {
        fontFamily: "monospace",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 2,
        color: "white",
        marginTop: 6,
    },

    statsRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
        marginTop: 10,
    },

    current: {
        fontFamily: "monospace",
        fontSize: 28,
        fontWeight: "900",
    },

    target: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#E5E7EB",
        opacity: 0.8,
    },

    barTrack: {
        marginTop: 10,
        height: 8,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 4,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },

    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.5)",
    },

    badgeText: {
        fontFamily: "monospace",
        fontSize: 10,
        letterSpacing: 1.5,
        fontWeight: "800",
    },
});
