import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    FlatList,
} from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = width / 9; // to fit 7 days + padding nicely
//which week range the user picked
const [viewRange, setViewRange] = useState<{ start: Date; end: Date } | null>(null);

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getStartDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function isSameDay(d1: Date, d2: Date) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

function isDateInRange(date: Date, start: Date, end: Date) {
    return date >= start && date <= end;
}

type CustomDatePickerModalProps = {
    visible: boolean;
    onClose: () => void;
    date: Date;
    onChange: (startDate: Date, endDate: Date) => void;
};

export default function CustomDatePickerModal({
    visible,
    onClose,
    date,
    onChange,
}: CustomDatePickerModalProps) {
    const [selectedYear, setSelectedYear] = useState(date.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
    const [selectedStartDate, setSelectedStartDate] = useState(date);

    // Calculate days info for calendar
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const startDayOfWeek = getStartDayOfWeek(selectedYear, selectedMonth);

    // The fixed 7-day window (end date)
    const selectedEndDate = addDays(selectedStartDate, 6);

    // Build array representing calendar cells (some empty at start)
    const calendarCells = [];

    for (let i = 0; i < startDayOfWeek; i++) {
        calendarCells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        calendarCells.push(new Date(selectedYear, selectedMonth, day));
    }

    // Handle confirm button
    const confirmDate = () => {
        onChange(selectedStartDate, selectedEndDate);
        onClose();
    };

    // Display range string like "01-Apr — 07-Apr 2025"
    const formatRangeDisplay = () => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const monthName = (date: Date) =>
            date.toLocaleDateString('en-US', { month: 'short' });
        return `${pad(selectedStartDate.getDate())}-${monthName(selectedStartDate)} — ${pad(
            selectedEndDate.getDate()
        )}-${monthName(selectedEndDate)} ${selectedStartDate.getFullYear()}`;
    };

    // Years range
    const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>▓ SELECT WEEK RANGE ▓</Text>

                    <Text style={styles.rangeText}>{formatRangeDisplay()}</Text>

                    {/* Month & Year selectors */}
                    {/* Months selector row */}
                    <View style={styles.monthsRow}>
                        <FlatList
                            data={months}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item}
                            contentContainerStyle={{ paddingHorizontal: 10 }}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    onPress={() => setSelectedMonth(index)}
                                    style={[
                                        styles.monthItem,
                                        selectedMonth === index && styles.selectedItem,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.monthText,
                                            selectedMonth === index && styles.selectedText,
                                        ]}
                                    >
                                        {item.substring(0, 3).toUpperCase()}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </View>

                    {/* Years selector row */}
                    <View style={styles.yearsRow}>
                        <FlatList
                            data={years}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.toString()}
                            contentContainerStyle={{ paddingHorizontal: 10 }}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => setSelectedYear(item)}
                                    style={[
                                        styles.yearItem,
                                        selectedYear === item && styles.selectedItem,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.yearText,
                                            selectedYear === item && styles.selectedText,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </View>

                    {/* Days of week header */}
                    <View style={styles.daysOfWeekRow}>
                        {daysOfWeek.map(day => (
                            <Text key={day} style={styles.dayOfWeekText}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    {/* Calendar grid */}
                    <View style={styles.calendarGrid}>
                        {calendarCells.map((dateObj, idx) => {
                            if (!dateObj) {
                                return <View key={idx} style={[styles.dateCell, styles.emptyCell]} />;
                            }
                            const isSelectedStart = isSameDay(dateObj, selectedStartDate);
                            const isInRange = isDateInRange(dateObj, selectedStartDate, selectedEndDate);

                            return (
                                <Pressable
                                    key={idx}
                                    onPress={() => setSelectedStartDate(dateObj)}
                                    style={[
                                        styles.dateCell,
                                        isInRange && styles.inRangeCell,
                                        isSelectedStart && styles.selectedCell,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dateText,
                                            isSelectedStart && styles.selectedText,
                                            isInRange && !isSelectedStart && styles.inRangeText,
                                        ]}
                                    >
                                        {dateObj.getDate()}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <View style={styles.buttonRow}>
                        <Pressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>CANCEL</Text>
                        </Pressable>
                        <Pressable style={styles.confirmButton} onPress={confirmDate}>
                            <Text style={styles.buttonText}>CONFIRM</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const styles = StyleSheet.create({
    monthsRow: {
        marginBottom: 12,
    },

    yearsRow: {
        marginBottom: 20,
    },

    overlay: {
        flex: 1,
        backgroundColor: '#0A0F1CCC',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    modalContent: {
        backgroundColor: '#111622',
        borderRadius: 12,
        padding: 20,
        width: width - 40,
    },
    title: {
        fontFamily: 'monospace',
        fontSize: 18,
        color: '#00ffcc',
        marginBottom: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'center',
        textShadowColor: '#00ffcc',
        textShadowRadius: 6,
    },
    rangeText: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#00ffcc',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 1.5,
        textShadowColor: '#00ffcc',
        textShadowRadius: 4,
    },
    monthYearRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    monthItem: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginHorizontal: 3,
        borderRadius: 6,
        backgroundColor: '#1A1F2C',
    },
    yearItem: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginHorizontal: 3,
        borderRadius: 6,
        backgroundColor: '#1A1F2C',
    },
    selectedItem: {
        backgroundColor: '#00ffcc',
    },
    monthText: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 14,
        letterSpacing: 1,
    },
    yearText: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 14,
        letterSpacing: 1,
    },
    selectedText: {
        color: '#0A0F1C',
        fontWeight: 'bold',
    },
    daysOfWeekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingHorizontal: 2,
    },
    dayOfWeekText: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        width: CELL_SIZE,
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 15,
    },
    dateCell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        margin: 2,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1F2C',
    },
    emptyCell: {
        backgroundColor: 'transparent',
    },
    selectedCell: {
        backgroundColor: '#00ffcc',
    },
    inRangeCell: {
        backgroundColor: 'rgba(0,255,204,0.3)',
    },
    dateText: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#BFC7D5',
    },
    inRangeText: {
        color: '#0A0F1C',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 6,
        paddingVertical: 12,
        marginRight: 10,
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#00ffcc',
        borderRadius: 6,
        paddingVertical: 12,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        color: '#0A0F1C',
    },
});
