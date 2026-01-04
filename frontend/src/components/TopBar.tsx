import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type PlanStatus = "ACTIVE" | "COMPLETED" | "UPCOMING";

type TrainingTopBarProps = {
    title: string;
    status?: PlanStatus;
    blinkVisible?: boolean;
    onLeftPress: () => void;
    onRightPress: () => void;
};

export default function TrainingTopBar({
    title,
    status = "UPCOMING",
    blinkVisible = true,
    onLeftPress,
    onRightPress,
}: TrainingTopBarProps) {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
                {/* CENTER */}
                <Text style={styles.planStatusText}>{title}</Text>

                <View style={styles.headerSidePlaceholder} />

                {/* RIGHT ICONS */}
                <View style={styles.headerIconContainer}>
                    <Pressable onPress={onLeftPress} style={styles.headerSide}>
                        <Ionicons name="add-outline" size={33} color="white" />
                    </Pressable>

                    <Pressable onPress={onRightPress} style={styles.headerSide}>
                        <Ionicons name="search-outline" size={26} color="white" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        marginTop: 18,
        marginBottom: 4,
        alignItems: "center",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
        width: "100%",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    headerSidePlaceholder: {
        width: 30,
    },


    headerIconContainer: {
        flexDirection: "row",
    },
    headerSide: {
        paddingLeft: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    planStatusContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    planStatusText: {
        color: "white",
        fontFamily: "monospace",
        fontSize: 22,
        fontWeight: "bold",
    },
    recIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
    },
});
