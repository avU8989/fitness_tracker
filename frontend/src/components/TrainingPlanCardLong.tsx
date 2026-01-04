import React from "react";
import { Pressable, View, Text, StyleSheet, ImageBackground } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type PlanCardLongProps = {
    title: string;
    subtitle: string;
    image: any;
    tag?: string;
    onPress: () => void;
}

export default function TrainingPlanCardLong({ title, subtitle, tag, image, onPress }: PlanCardLongProps) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.wrapper}>
            <ImageBackground
                source={image}
                resizeMode="cover"
                style={styles.card}
                imageStyle={styles.image}
            >

                <View style={styles.overlay} />

                {tag && (
                    <>
                        <View style={styles.badge}>
                            {tag === "TRENDING" && (
                                <Ionicons name="flame" size={12} color="#ff3b3b" />

                            )}
                            <Text style={styles.badgeText}>{tag}</Text>
                        </View>
                    </>
                )}

                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    <View style={styles.metaRow}>
                        <Text style={styles.meta}>4–5 DAYS</Text>
                        <Text style={styles.meta}>•</Text>
                        <Text style={styles.meta}>STRENGTH</Text>
                    </View>
                </View>

            </ImageBackground>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginRight: 16,
    },
    card: {
        width: 280,
        height: 160,
        borderRadius: 16,
        overflow: "hidden",
        justifyContent: "flex-end",
        backgroundColor: "#111622",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(10, 15, 28, 0.68)",
    },

    badge: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,255,204,0.15)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    image: {
        borderRadius: 16,
    },

    badgeText: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00ffcc',
        letterSpacing: 1,
    },

    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 18,
        paddingVertical: 20,
    },

    title: {
        fontFamily: 'monospace',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },

    subtitle: {
        fontFamily: 'monospace',
        fontWeight: 'semibold',
        fontSize: 12,
        color: '#a0e7c4ff',
        marginBottom: 8,
        opacity: 0.8,
        textShadowColor: 'rgba(0,255,204,0.25)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,

    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    meta: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: 'white',
        letterSpacing: 1,
        textShadowColor: 'rgba(255, 255, 255, 0.36)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },
});