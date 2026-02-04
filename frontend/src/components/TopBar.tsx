import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ExerciseChip from "./ExerciseChip";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParameterList } from "../navigation/navtypes";
import { SearchMode } from "../screens/tabs/SearchScreen";

type TrainingTopBarProps = {
    title: string;
    iconImage?: any;
    iconName?: string;
    activeChip?: SearchMode;
    onChipChange?: (mode: SearchMode) => void;
    onLeftPress: () => void;
    onRightPress: () => void;
};

export const TOP_BAR_TITLES = {
    HomeScreen: "Weekly Overview",
    LogScreen: "Today's Workout",
    TrainingPlansScreen: "Training Split",
    SearchScreen: "Search",
} as const;



export default function TrainingTopBar({
    title,
    iconImage,
    iconName = "barbell-outline",
    onChipChange,
    activeChip,
    onLeftPress,
    onRightPress,
}: TrainingTopBarProps) {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParameterList>>();


    function navigateToProfileScreen() {
        navigation.navigate("ProfileScreen");
    }

    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>

                <View style={styles.titleRow} >
                    <Pressable style={styles.iconCircle} onPress={navigateToProfileScreen}>
                        {iconImage ? (
                            <Image source={iconImage} style={styles.iconImage} />
                        ) : (
                            <Ionicons name={iconName} size={18} color="#0A0F1C" />
                        )}
                    </Pressable>
                    {title === TOP_BAR_TITLES.SearchScreen ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tagRow}
                        >
                            <ExerciseChip label="All"
                                active={(activeChip === "all")}
                                onPress={() => onChipChange?.("all")}
                            />
                            <ExerciseChip label="Style"
                                active={(activeChip === "style")}
                                onPress={() => onChipChange?.("style")}
                            />
                            <ExerciseChip label="Muscles"
                                active={(activeChip === "muscles")}
                                onPress={() => onChipChange?.("muscles")}
                            />
                            <ExerciseChip label="Goals"
                                active={(activeChip === "goals")}
                                onPress={() => onChipChange?.("goals")}
                            />
                            <ExerciseChip label="Recovery"
                                active={(activeChip === "recovery")}
                                onPress={() => onChipChange?.("recovery")}
                            />
                            <ExerciseChip label="Challenge"
                                active={(activeChip === "challenges")}
                                onPress={() => onChipChange?.("challenges")}
                            />
                        </ScrollView>
                    ) : (
                        <Text style={styles.planStatusText}>{title}</Text>
                    )}

                </View>

                {/* CENTER */}

                {/* RIGHT ICONS */}
                {title === TOP_BAR_TITLES.TrainingPlansScreen && (
                    <View style={styles.headerIconContainer}>
                        <Pressable onPress={onLeftPress} style={styles.headerSide}>
                            <Ionicons name="add-outline" size={33} color="white" />
                        </Pressable>

                        <Pressable onPress={onRightPress} style={styles.headerSide}>
                            <Ionicons name="search-outline" size={26} color="white" />
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingVertical: 10,
        paddingLeft: 6,
        gap: 8,
        justifyContent: "center",
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#00ffcc",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,

        // subtle glow
        shadowColor: "#00ffcc",
        shadowOpacity: 0.6,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
    },

    iconImage: {
        width: 26,
        height: 26,
        borderRadius: 13,
    },

    headerContainer: {
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

    headerIconContainer: {
        flexDirection: "row",
    },
    headerSide: {
        paddingLeft: 8,
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
