import { View, Text, ImageBackground, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import { TrainingPlanUI } from '../types/trainingPlan';
import { getPlanStats } from '../utils/planStats';

type TrainingPlanCardProps = {
    plan: TrainingPlanUI;
    onPress?: (plan: TrainingPlanUI) => void;
    onLongPress?: (plan: TrainingPlanUI) => void;
    isActive?: boolean;
    big?: boolean;
    small?: boolean;
};


export default function TrainingPlanCard({ plan,
    onPress,
    onLongPress,
    isActive = false,
    big = false,
    small = false, }: TrainingPlanCardProps) {

    const { totalExercises, totalVolume } = getPlanStats(plan);

    // ----- TAGS -----
    const splitTypes = plan.days.map(d => d.splitType?.toUpperCase());
    const trainingDays = plan.days.filter(d => d.exercises.length > 0).length;

    const tags: string[] = [];
    tags.push(`${trainingDays} Days`);

    if (splitTypes.includes("PUSH") && splitTypes.includes("PULL") && splitTypes.includes("LEGS"))
        tags.push("PPL");
    if (splitTypes.includes("UPPER") && splitTypes.includes("LOWER"))
        tags.push("UPPER/LOWER");
    if (splitTypes.includes("FULL BODY"))
        tags.push("FULL BODY");


    // ----- DYNAMIC CARD SIZE -----
    const cardSize: ViewStyle = small
        ? { width: 160, height: 160 }
        : big
            ? { width: '100%', height: 240 }
            : { width: 180, height: 240 };

    return (
        <Pressable
            onPress={() => onPress?.(plan)}
            onLongPress={() => onLongPress?.(plan)}
            style={({ pressed }) => [
                isActive ? styles.isActiveCard : styles.isNotActiveCard,
                cardSize,
                pressed ? { opacity: 0.8 } : null,
                isActive && styles.activeGlow
            ]}
        >

            <ImageBackground
                source={require('../assets/discover/crossfit.jpg')}
                style={styles.imageBackground}
                resizeMode="cover"
                imageStyle={{
                    opacity: isActive ? 0.98 : 0.68
                }}

            >
                {/* DARK OVERLAY */}
                <View style={styles.gradientOverlay} />

                {isActive && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                )}

                {/* TITLE AT TOP */}
                <View style={styles.centeredTitleContainer}>
                    <Text style={[
                        styles.title,
                        small && { fontSize: 16 },
                        big && { fontSize: 26 },
                    ]}>
                        {plan.name.toUpperCase()}
                    </Text>
                </View>



                {/* BOTTOM CONTENT */}
                <View style={styles.content}>
                    {/* TAGS */}
                    <View style={styles.tagRow}>
                        {tags.map((tag, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.tag,
                                    small && { paddingHorizontal: 3, paddingVertical: 2 },
                                ]}
                            >
                                <Text style={[styles.tagText, small && { fontSize: 8 }]}>
                                    {tag}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* STATS */}
                    <View style={styles.statsRow}>
                        <Ionicons name="barbell-outline" size={small ? 10 : 14} color="#00ffcc" />
                        <Text style={[styles.statText, small && { fontSize: 9 }]}>
                            {totalExercises} Exercises
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <Ionicons name="pulse-outline" size={small ? 10 : 14} color="#00ffcc" />
                        <Text style={[styles.statText, small && { fontSize: 9 }]}>
                            Volume: {totalVolume.toLocaleString("de-DE")} kg
                        </Text>
                    </View>
                    {isActive && (
                        <View style={styles.statsRow}>

                            <Text style={styles.currentPlanMeta}>
                                Day 2 of 5 • {plan.type.toUpperCase()}
                            </Text>
                        </View>
                    )}

                </View>
            </ImageBackground>

        </Pressable>
    );

}

const styles = StyleSheet.create({
    currentPlanMeta: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 11,
        color: '#00ffcc',
        textShadowColor: 'rgba(51, 255, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
        letterSpacing: 1,
        marginTop: 4,
    },

    centeredTitleContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },

    isActiveCard: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        overflow: 'hidden',
        marginRight: 6,
        backgroundColor: '#0A0F1C',
    },
    isNotActiveCard: {
        borderRadius: 18,
        overflow: 'hidden',
        marginRight: 6,
        backgroundColor: '#0A0F1C',
    },

    activeGlow: {
        borderColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowOpacity: 0.9,
        shadowRadius: 18,
    },

    activeBadge: {
        position: 'absolute',
        top: 18,
        left: 18,
        backgroundColor: 'rgba(51, 255, 0, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'limegreen',
        zIndex: 3,
    },

    activeBadgeText: {
        color: 'limegreen',
        fontFamily: 'monospace',
        fontSize: 10,
        letterSpacing: 1,
    },

    imageBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },

    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },

    content: {
        padding: 10,
        alignItems: 'center',
    },

    title: {
        color: 'white',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 50,
        paddingHorizontal: 10,
    },

    tagRow: {
        marginTop: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 6,
    },

    tag: {
        backgroundColor: 'rgba(0,255,204,0.12)',
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#00ffcc',
        margin: 3,
    },

    tagText: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 10,
    },

    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },

    statText: {
        marginLeft: 6,
        color: '#BFC7D5',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: 11,
    },
});
