import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
} from 'react-native';
import TrainingPlanModal from '../components/TrainingPlanModal';
import Ticker from '../components/Ticker';
import VHSGlowDivider from '../components/VHSGlowDivider';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomDatePickerModal from '../components/CustomDatePickerModal'; // import custom picker
import VHSButton from '../components/VHSButton';
const splitsInitial = [
    {
        name: 'Hypertrophy Focus',
        date: new Date('2025-04-01'),
        split: [
            {
                day: 'MON',
                type: 'PUSH',
                status: 'Chest_A1',
                exercises: [{ sets: 4, repetitions: 10, weight: 80 }],
            },
            {
                day: 'TUE',
                type: 'PULL',
                status: 'Back_A1',
                exercises: [{ sets: 3, repetitions: 8, weight: 70 }],
            },
            {
                day: 'WED',
                type: 'LEGS',
                status: 'Legs_A1',
                exercises: [{ sets: 4, repetitions: 12, weight: 90 }],
            },
            { day: 'THU', type: 'REST', status: '', exercises: [] },
            {
                day: 'FRI',
                type: 'PUSH',
                status: 'Chest_A2',
                exercises: [{ sets: 3, repetitions: 10, weight: 85 }],
            },
            { day: 'SAT', type: 'REST', status: '', exercises: [] },
            {
                day: 'SUN',
                type: 'PULL',
                status: 'Back_A2',
                exercises: [{ sets: 4, repetitions: 8, weight: 75 }],
            },
        ],
    },
    {
        name: 'Strength Cycle',
        date: new Date('2025-04-08'),
        split: [
            {
                day: 'MON',
                type: 'PUSH',
                status: 'Chest_B1',
                exercises: [{ sets: 5, repetitions: 5, weight: 100 }],
            },
            {
                day: 'TUE',
                type: 'PULL',
                status: 'Back_B1',
                exercises: [{ sets: 4, repetitions: 6, weight: 90 }],
            },
            {
                day: 'WED',
                type: 'LEGS',
                status: 'Legs_B1',
                exercises: [{ sets: 5, repetitions: 5, weight: 110 }],
            },
            { day: 'THU', type: 'REST', status: '', exercises: [] },
            {
                day: 'FRI',
                type: 'PUSH',
                status: 'Chest_B2',
                exercises: [{ sets: 4, repetitions: 6, weight: 105 }],
            },
            { day: 'SAT', type: 'REST', status: '', exercises: [] },
            {
                day: 'SUN',
                type: 'PULL',
                status: 'Back_B2',
                exercises: [{ sets: 5, repetitions: 5, weight: 95 }],
            },
        ],
    },
];

export default function TrainingPlansScreen() {
    const [splits, setSplits] = useState(splitsInitial);
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentSplit = splits[currentIndex];
    const [modalVisible, setModalVisible] = useState(false);
    const [completedDays, setCompletedDays] = useState([]);
    const [plans, setPlans] = useState(splitsInitial);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const goPrev = () => {
        setCurrentIndex(i => (i === 0 ? splits.length - 1 : i - 1));
        setCompletedDays([]); // reset on switch if desired
    };

    const goNext = () => {
        setCurrentIndex(i => (i === splits.length - 1 ? 0 : i + 1));
        setCompletedDays([]);
    };

    // Toggle completion of days
    const toggleDayComplete = day => {
        setCompletedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    // Handle date change from modal
    const onDateChange = (newDate: Date) => {
        const updatedPlans = [...plans];
        updatedPlans[currentIndex].date = newDate;
        setPlans(updatedPlans);
    };


    // Summary calculations
    const totalExercises = currentSplit.split.reduce(
        (acc, day) => acc + (day.exercises ? day.exercises.length : 0),
        0
    );

    const formatSplitDateRange = (startDate: Date) => {
        const optionsMonth = { month: 'long' } as const;

        const dayStart = startDate.getDate();
        const monthStart = startDate.toLocaleDateString('en-US', optionsMonth);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        const dayEnd = endDate.getDate();
        const monthEnd = endDate.toLocaleDateString('en-US', optionsMonth);

        const year = startDate.getFullYear();

        return {
            rangeLine: `${dayStart.toString().padStart(2, '0')}-${monthStart} — ${dayEnd.toString().padStart(2, '0')}-${monthEnd}`,
            yearLine: year.toString(),
        };
    };

    const { rangeLine, yearLine } = formatSplitDateRange(currentSplit.date);

    const estimatedVolume = currentSplit.split.reduce((acc, day) => {
        if (!day.exercises) return acc;
        return (
            acc +
            day.exercises.reduce(
                (sum, ex) => sum + (ex.sets || 0) * (ex.repetitions || 0) * (ex.weight || 0),
                0
            )
        );
    }, 0);

    const daysCompleted = completedDays.length;

    const handleSavePlan = newPlan => {
        setSplits([...splits, newPlan]);
        setModalVisible(false);
        setCurrentIndex(splits.length); // show new plan
        setCompletedDays([]);
    };

    return (
        <View style={styles.root}>
            <View style={styles.headerContainer}>
                <Text style={styles.vhsHudTitle}>▓CHANNEL 05 — TRAINING FEED▓</Text>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.splitName}>{currentSplit.name}</Text>

                <View style={styles.dateContainer}>
                    <Pressable onPress={() => setDatePickerVisible(true)}>
                        <Text style={styles.dateRangeText}>{rangeLine}</Text>
                        <Text style={styles.dateYearText}>{yearLine}</Text>

                    </Pressable>
                </View>
            </View>

            {/* Date Picker Modal */}
            <CustomDatePickerModal
                visible={datePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                date={currentSplit.date}
                onChange={onDateChange}
            />

            <View style={styles.carouselContainer}>
                <Pressable onPress={goPrev} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>‹</Text>
                </Pressable>

                <ScrollView style={styles.tableContainer}>
                    {currentSplit.split.map(({ day, type, status }, idx) => {
                        const isCompleted = completedDays.includes(day);
                        return (
                            <Pressable
                                key={idx}
                                onPress={() => toggleDayComplete(day)}
                                style={[styles.tableRow, isCompleted && styles.completedDayRow]}
                            >
                                <Text style={styles.tableDay}>{day}</Text>
                                <Text style={styles.tableType}>{type}</Text>
                                <Text style={styles.tableStatus}>{status || 'REST'}</Text>
                                <Text style={[styles.completionToggle, isCompleted && styles.completedToggle]}>
                                    ▐
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <Pressable onPress={goNext} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>›</Text>
                </Pressable>
            </View>

            <VHSGlowDivider />

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Total Exercises Planned: {totalExercises}</Text>
                <Text style={styles.summaryText}>
                    Estimated Volume: {estimatedVolume.toLocaleString()} kg
                </Text>
                <Text style={styles.summaryText}>
                    Days Completed: {daysCompleted} / {currentSplit.split.length}
                </Text>
            </View>

            <View style={styles.newPlanContainer}>
                <Pressable onPress={() => setModalVisible(true)}>
                    <VHSButton title="+ Create New Plan" onPress={() => setModalVisible(true)} />
                </Pressable>

                <TrainingPlanModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSavePlan}
                />
            </View>

            <Ticker />
        </View>
    );
}

const styles = StyleSheet.create({
    dateContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },

    dateRangeText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 20,
        letterSpacing: 3,
        textShadowColor: '#00ffcc',
        textShadowRadius: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },

    dateYearText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 14,
        letterSpacing: 5,
        textShadowColor: '#00ffcc',
        textShadowRadius: 6,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },

    root: {
        flex: 1,
        backgroundColor: '#0A0F1C',
        paddingTop: 30,
        justifyContent: 'flex-start',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 30,
    },
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
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    splitName: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2,
        marginBottom: 4,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        textTransform: 'uppercase',
    },
    screenTitle: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 20,
        letterSpacing: 2,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    carouselContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowButton: {
        paddingHorizontal: 10,
        paddingVertical: 30,
    },
    arrowText: {
        color: '#00ffcc',
        fontSize: 40,
        fontWeight: 'bold',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    tableContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#00ffcc',
        borderRadius: 12,
        opacity: 1,
        overflow: 'hidden',
        maxHeight: 300,
        backgroundColor: 'transparent',
    },
    scrollArea: {
        backgroundColor: 'transparent',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    completedDayRow: {
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
    },
    tableDay: {
        flex: 1,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 14,
        textShadowColor: 'rgba(0, 255, 204, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    tableType: {
        flex: 1,
        color: '#7ACFCF',
        fontFamily: 'monospace',
        fontSize: 14,
        textAlign: 'center',
        letterSpacing: 2,
        opacity: 0.8,
    },
    tableStatus: {
        flex: 2,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 14,
        textAlign: 'right',
        letterSpacing: 2,
    },
    completionToggle: {
        color: '#555',
        fontSize: 20,
        marginLeft: 10,
        opacity: 0.4,
    },
    completedToggle: {
        color: '#00ffcc',
        opacity: 1,
    },
    summaryContainer: {
        padding: 12,
        marginHorizontal: 30,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#00ffcc',
        borderRadius: 10,
        opacity: 0.85,
    },
    summaryText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 2,
    },
    newPlanContainer: {
        alignItems: 'center',
    },
});
