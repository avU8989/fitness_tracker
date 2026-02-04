import { Image, View, Text, Pressable, StyleSheet, ViewStyle, ImageBackground, ViewBase } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TrainingPlanUI } from '../types/trainingPlan';
import { getPlanStats } from '../utils/planStats';

type TrainingPlanCardProps = {
    plan: TrainingPlanUI;
    onPress?: (plan: TrainingPlanUI) => void;
    onLongPress?: (plan: TrainingPlanUI) => void;
    isActive?: boolean;
};

export default function TrainingPlanCard({
    plan,
    onPress,
    onLongPress,
    isActive = false,

}: TrainingPlanCardProps) {
    const { totalExercises, totalVolume } = getPlanStats(plan);

    const trainingDays = plan.days.filter(d => d.exercises.length > 0).length;

    //currently for debugging purpose, TODO request thumbnail url through get training plan request
    const hasImage = false;

    return (
        <Pressable
            onPress={() => onPress?.(plan)}
            onLongPress={() => onLongPress?.(plan)}
            style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.85 },
            ]}
        >

            {/*LEFT THUMBNAIL */}
            <View style={styles.thumbWrapper}>
                {hasImage ? (
                    <Image source={require("../assets/discover/bodybuilding.jpg")}
                        style={styles.thumbImage}
                        resizeMode='cover'>

                    </Image>
                ) : (
                    <View style={styles.thumbFallback}>
                        <Ionicons name="barbell-outline" size={36} color={'#B3B3B3'}>

                        </Ionicons>
                    </View>
                )}
            </View>

            {/*TEXT*/}
            <View style={styles.textCol}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {plan.name}
                    </Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{totalExercises} exercises</Text>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={styles.metaText}>{totalVolume} volume</Text>
                </View>


            </View>

            {/* ACTIVE BADGE */}
            {isActive && (
                <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
            )}
            <Ionicons name="ellipsis-vertical" size={20} color="#B3B3B3" />

        </Pressable>
    );
}

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',   // for title + pin
        alignItems: 'center',
    },

    textCol: {
        flex: 1,
        minWidth: 0,
        marginLeft: 12,
    },
    thumbFallback: {
        flex: 1,
        backgroundColor: '#111622',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    thumbWrapper: {
        width: 69,
        height: 69,
    },
    card: {
        backgroundColor: '#0A0F1C',
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
        flexDirection: 'row',
        marginRight: 8,
    },

    title: {
        color: 'white',
        fontFamily: 'monospace',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
    },

    metaText: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 11,
        marginLeft: 2,
        fontWeight: '600',
    },

    activeBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,255,204,0.15)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#00ffcc',
    },

    activeBadgeText: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 9,
        letterSpacing: 1,
    },
});
