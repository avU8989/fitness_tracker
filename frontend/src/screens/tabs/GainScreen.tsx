import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Pressable,
    Animated,
    Alert,
    Switch,
    TouchableOpacity,
} from 'react-native';
import StatsCarousel from '../../components/StatsCarousel';
import Ticker from '../../components/Ticker'; // Your ticker component
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Badge from '../../components/Badge';
const { width } = Dimensions.get('window');

const stats = [
    { label: 'TOTAL PLANS', value: '5', detailData: [12, 15, 11, 18] },
    { label: 'COMPLETED WORKOUTS', value: '12', detailData: [3, 5, 2, 2] },
    { label: 'EST. VOLUME', value: '15,000 kg', detailData: [12000, 15000, 13000, 17000] },
    { label: 'NEXT PLAN', value: 'Hypertrophy Week 3', detailData: [] },
];

const badges = [
    { id: '1', label: 'Consistency King', color: '#00ffcc', icon: '✓' },
    { id: '2', label: 'Volume Master', color: '#ff0055', icon: '💪' },
    { id: '3', label: 'PR Breaker', color: '#ffaa00', icon: '🔥' },
];

const recentActivitiesInitial = [
    { id: '1', text: 'MON: Chest PUSH 4x10 @ 80kg' },
    { id: '2', text: 'TUE: Legs 5x8 @ 100kg' },
    { id: '3', text: 'WED: Rest' },
    { id: '4', text: 'THU: Back PULL 4x12 @ 70kg' },
    { id: '5', text: 'FRI: Shoulders PUSH 3x10 @ 30kg' },
];

// VHS Button with press animation
function VHSButton({ title, onPress }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };
    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, marginHorizontal: 5 }}>
            <Pressable
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={styles.vhsButton}
            >
                <Text style={styles.vhsButtonText}>{title.toUpperCase()}</Text>
            </Pressable>
        </Animated.View>
    );
}

export default function DashboardScreen() {
    const [darkMode, setDarkMode] = useState(true);
    const [recentActivities, setRecentActivities] = useState(recentActivitiesInitial);
    const [expandedStats, setExpandedStats] = useState(null);
    const [weeklyProgress, setWeeklyProgress] = useState(0.65); // example progress 65%
    const [nextWorkoutTime, setNextWorkoutTime] = useState(new Date(Date.now() + 3600 * 1000 * 26)); // 26 hours later
    const [timeLeft, setTimeLeft] = useState('');

    // Countdown timer update
    useEffect(() => {
        const interval = setInterval(() => {
            const diff = nextWorkoutTime - new Date();
            if (diff <= 0) {
                setTimeLeft('NOW');
                clearInterval(interval);
                return;
            }
            const h = Math.floor(diff / 1000 / 3600);
            const m = Math.floor((diff / 1000 % 3600) / 60);
            setTimeLeft(`${h}h ${m}m`);
        }, 60000); // update every minute
        return () => clearInterval(interval);
    }, [nextWorkoutTime]);

    // Dark mode styles toggle helper
    const colors = {
        background: darkMode ? '#0A0F1C' : '#f0f0f0',
        primary: darkMode ? '#ff4444' : '#007f66',
        textPrimary: darkMode ? '#00ffcc' : '#004d40',
        textSecondary: darkMode ? '#BFC7D5' : '#555',
        cardBg: darkMode ? '#111622' : '#ffffff',
        cardBorder: darkMode ? 'rgba(0, 255, 204, 0.1)' : '#007f66',
        shadowColor: darkMode ? '#ff4444' : '#007f66',
    };

    // Swipe handlers for recent activities (simple implementation)
    const handleDeleteActivity = (id) => {
        Alert.alert(
            'Delete Activity',
            'Are you sure you want to delete this activity?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setRecentActivities(acts => acts.filter(a => a.id !== id)),
                },
            ]
        );
    };

    // Toggle expand/collapse stat tile
    const toggleExpandStat = (label) => {
        setExpandedStats(expandedStats === label ? null : label);
    };

    return (
        <ScrollView
            style={[styles.root, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* Dark Mode Toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 10, paddingTop: 30 }}>
                <Text style={{ color: colors.primary, fontFamily: 'monospace', marginRight: 10, paddingTop: 14 }}>
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    thumbColor={darkMode ? colors.primary : '#ccc'}
                    trackColor={{ false: '#aaa', true: '#007f66' }}
                />
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.vhsHudTitle}>▓CHANNEL 05 — DASHBOARD▓</Text>

                <Text style={[styles.subtitle, { color: colors.primary, opacity: 0.7 }]}>
                    Stay Strong — Stay Sharp
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, { borderColor: colors.primary }]}>
                <View style={[styles.progressBarFill, { width: `${weeklyProgress * 100}%`, backgroundColor: colors.primary }]} />
                <Text style={[styles.progressText, { color: '#00ffcc' }]}>
                    Weekly Goal: {(weeklyProgress * 100).toFixed(0)}%
                </Text>
            </View>

            {/* Stats Tiles with expandable mini chart */}
            <View style={styles.statsContainer}>
                {stats.map(({ label, value, detailData }) => {
                    const isExpanded = expandedStats === label;
                    return (
                        <Pressable
                            key={label}
                            onPress={() => toggleExpandStat(label)}
                            style={[
                                styles.statTile,
                                {
                                    backgroundColor: colors.cardBg,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.shadowColor,
                                },
                            ]}
                        >
                            <Text style={[styles.statValue, { color: colors.primary, textShadowColor: colors.primary }]}>
                                {value}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.primary }]}>
                                {label}
                            </Text>
                            {isExpanded && detailData.length > 0 && (
                                <BarChart
                                    data={{
                                        labels: detailData.map((_, i) => `W${i + 1}`),
                                        datasets: [{ data: detailData }],
                                    }}
                                    width={width * 0.4}
                                    height={100}
                                    yAxisSuffix={label.includes('VOLUME') ? 'kg' : ''}
                                    chartConfig={{
                                        backgroundGradientFrom: colors.cardBg,
                                        backgroundGradientTo: colors.cardBg,
                                        color: (opacity = 1) => `rgba(0, 255, 204, ${opacity})`,
                                        labelColor: () => colors.primary,
                                    }}
                                    style={{ marginTop: 10, borderRadius: 8 }}
                                />
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* Stats Carousel */}
            <StatsCarousel />

            {/* Motivational Tip */}
            <View style={[styles.tipContainer, { borderColor: colors.primary, backgroundColor: colors.cardBg }]}>
                <View style={styles.badgesContainer}>
                    {badges.map(badge => (
                        <Badge key={badge.id} {...badge} />
                    ))}
                </View>

            </View>

            {/* Upcoming Workout Card */}
            <View style={[styles.upcomingContainer, { borderColor: colors.primary, backgroundColor: colors.cardBg }]}>
                <Text style={[styles.upcomingTitle, { color: colors.primary }]}>NEXT WORKOUT</Text>
                <Text style={[styles.upcomingWorkout, { color: colors.primary }]}>Chest PUSH 4x10 @ 90kg</Text>
                <Text style={[styles.upcomingCountdown, { color: colors.primary }]}>Starts in: {timeLeft}</Text>
            </View>

            {/* Recent Activity with swipe delete */}
            <View style={[styles.activityContainer, { borderColor: colors.primary, backgroundColor: colors.cardBg }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>RECENT ACTIVITY</Text>
                <FlatList
                    data={recentActivities}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onLongPress={() => handleDeleteActivity(item.id)}
                            style={styles.activityItem}
                        >
                            <Text style={[styles.activityText, { color: colors.textSecondary }]}>› {item.text}</Text>
                            <Text style={[styles.activityDeleteHint, { color: colors.primary }]}>
                                (Long press to delete)
                            </Text>
                        </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Notification Ticker */}
            <View style={{ marginTop: 0 }}>
                <Ticker />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    vhsHudTitle: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 18,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 255, 204, 0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#00ffcc',
        borderRadius: 2,
        letterSpacing: 1,
        textTransform: 'uppercase',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
        marginBottom: 12,
        alignSelf: 'center',
        overflow: 'hidden',
    },

    badgesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    badge: {
        borderWidth: 2,
        borderRadius: 30,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        width: 100,
    },
    badgeIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'monospace',
        textShadowColor: 'rgba(0, 255, 204, 0.8)',
        textShadowRadius: 4,
    },
    badgeLabel: {
        fontSize: 10,
        fontFamily: 'monospace',
        letterSpacing: 1,
        textAlign: 'center',
    },

    root: {
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    title: {
        fontFamily: 'monospace',
        fontSize: 24,
        letterSpacing: 6,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    subtitle: {
        fontFamily: 'monospace',
        fontSize: 14,
        letterSpacing: 3,
        marginTop: 6,
        opacity: 0.7,
    },
    progressBarContainer: {
        height: 28,            // taller bar
        borderWidth: 2,        // thicker border
        borderRadius: 16,      // more rounded
        marginHorizontal: 20,
        marginBottom: 30,
        overflow: 'hidden',
        shadowColor: '#00ffcc',  // add subtle glowing shadow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 16,
    },
    progressText: {
        position: 'absolute',
        alignSelf: 'center',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 3,
        fontSize: 14,           // slightly bigger font
        top: 4,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    statTile: {
        width: '48%',
        paddingVertical: 20,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 15,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
    },
    statValue: {
        fontFamily: 'monospace',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 3,
        marginBottom: 8,
        textShadowOffset: { width: 0, height: 0 },
    },
    statLabel: {
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 2,
    },
    tipContainer: {
        marginHorizontal: 20,
        marginVertical: 20,
        padding: 12,
        borderWidth: 1,
        borderRadius: 10,
    },
    tipText: {
        fontFamily: 'monospace',
        fontSize: 14,
        letterSpacing: 2,
        textAlign: 'center',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    upcomingContainer: {
        marginHorizontal: 20,
        marginBottom: 30,
        padding: 15,
        borderWidth: 1,
        borderRadius: 12,
    },
    upcomingTitle: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2,
        marginBottom: 8,
    },
    upcomingWorkout: {
        fontFamily: 'monospace',
        fontSize: 14,
        letterSpacing: 1.5,
    },
    upcomingCountdown: {
        fontFamily: 'monospace',
        fontSize: 12,
        marginTop: 6,
        opacity: 0.8,
        letterSpacing: 2,
    },
    activityContainer: {
        marginHorizontal: 20,
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        marginBottom: 30,
    },
    sectionTitle: {
        fontFamily: 'monospace',
        fontSize: 16,
        letterSpacing: 2,
        fontWeight: 'bold',
        marginBottom: 10,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    activityItem: {
        marginBottom: 12,
    },
    activityText: {
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 1.5,
    },
    activityDeleteHint: {
        fontFamily: 'monospace',
        fontSize: 10,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    vhsButton: {
        borderColor: '#00ffcc',
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: '#0A0F1C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        alignItems: 'center',
    },
    vhsButtonText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 3,
        textAlign: 'center',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
});
