import React from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface HeroCardProps {
    name: string;
    type: string;
    days: number;
    imageUri?: string; // optional custom image
    onBack?: () => void;
    onMenu?: () => void;
}

export default function HeroCard({ name, type, days, imageUri, onBack, onMenu }: HeroCardProps) {

    const fallbackImage =
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1880&auto=format&fit=crop";

    return (
        <View style={styles.cardWrapper}>

            <ImageBackground
                source={{ uri: imageUri || fallbackImage }}
                style={styles.image}
                imageStyle={styles.imageStyle}
            >

                {/* Gradient overlay for readability */}
                <View style={styles.overlay} />

                <View style={styles.topBar}>
                    <Pressable onPress={onBack} >
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </Pressable>

                    <Pressable onPress={onMenu} >
                        <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>{name.toUpperCase()}</Text>
                        <Text style={styles.subtitle}>{type}</Text>
                    </View>

                    <View style={styles.statsScrollWrapper}>

                        <View style={styles.statChip}>
                            <Ionicons name="barbell" size={22} color="#00ffcc" />
                            <Text style={styles.chipValue}>30</Text>
                            <Text style={styles.chipLabel}>Exercises</Text>
                        </View>

                        {/* WEEKLY VOLUME */}
                        <View style={styles.statChip}>
                            <Ionicons name="fitness" size={22} color="#00ffcc" />
                            <Text style={styles.chipValue}>1200 KG</Text>
                            <Text style={styles.chipLabel}>KG / Week</Text>
                        </View>

                        <View style={styles.statChip}>
                            <Ionicons name="calendar" size={22} color="#00ffcc" />
                            <Text style={styles.chipValue}>{days}</Text>
                            <Text style={styles.chipLabel}>Days</Text>
                        </View>
                    </View>
                </View>

            </ImageBackground>

        </View>
    );
}

const styles = StyleSheet.create({
    statsScrollWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 8,
    },
    statChip: {
        paddingVertical: 16,
        paddingHorizontal: 14,
        alignItems: "center",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },
    headerContainer: {
        paddingVertical: 0,
        paddingHorizontal: 14,
        shadowColor: "#00ffcc",
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },

    chipValue: {
        color: "#00ffcc",
        fontSize: 18,
        fontFamily: "monospace",
        marginTop: 6,
        textShadowColor: "#FFFFFF",
        textShadowRadius: 6,
    },

    chipLabel: {
        color: "#7ACFCF",
        fontSize: 12,
        marginTop: 3,
        fontFamily: "monospace",
        opacity: 0.9,
        letterSpacing: 1,
    },
    topBar: {
        position: "absolute",     // 👈 REQUIRED
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingTop: 40,           // 👈 safe for status bar
        zIndex: 3,
    },

    cardWrapper: {
        marginTop: 0,
        marginBottom: 20,
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
    },

    image: {
        width: "100%",
        height: 280,
        justifyContent: "flex-end",
    },

    imageStyle: {
        resizeMode: "cover",
        opacity: 0.68
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",

    },

    content: {
        paddingHorizontal: 0,
        position: "relative",
        zIndex: 2,
    },

    title: {
        color: "#FFFFFF",
        fontSize: 26,
        fontFamily: "monospace",
        letterSpacing: 3,
        textShadowColor: "#FFFFFF",
        textShadowRadius: 3,
        marginBottom: 4,
    },

    subtitle: {
        color: "#7ACFCF",
        fontSize: 13,
        fontFamily: "monospace",
        opacity: 0.9,
        letterSpacing: 2,
        textTransform: "uppercase",
    },

    infoRow: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    infoLabel: {
        color: "#7ACFCF",
        fontSize: 12,
        fontFamily: "monospace",
        opacity: 0.8,
        letterSpacing: 1,
    },

    infoValue: {
        color: "#00ffcc",
        fontSize: 20,
        fontFamily: "monospace",
        textShadowColor: "#00ffcc",
        textShadowRadius: 14,
    },
});
