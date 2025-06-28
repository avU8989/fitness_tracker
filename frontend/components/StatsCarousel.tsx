import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const chartConfig = {
    backgroundGradientFrom: '#0A0F1C',
    backgroundGradientTo: '#0A0F1C',
    color: (opacity = 1) => `rgba(0, 255, 204, ${opacity})`,
    labelColor: () => '#00ffcc',
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
};

const statsData = [
    {
        id: '1',
        title: 'Volume Tracker',
        description: 'Total volume lifted per week',
        chart: (
            <BarChart
                data={{
                    labels: ['W1', 'W2', 'W3', 'W4'],
                    datasets: [{ data: [12000, 15000, 13000, 17000] }],
                }}
                width={width * 0.8}
                height={180}
                yAxisSuffix="kg"
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
            />
        ),
    },
    {
        id: '2',
        title: 'Strength Progress',
        description: 'Bench press max over months',
        chart: (
            <LineChart
                data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{ data: [100, 110, 115, 120, 125] }],
                }}
                width={width * 0.8}
                height={180}
                yAxisSuffix="kg"
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 12 }}
            />
        ),
    },
    {
        id: '3',
        title: 'Workout Consistency',
        description: 'Weekly workout completion %',
        chart: (
            <ProgressChart
                data={{
                    labels: ['Week 1', 'Week 2', 'Week 3'],
                    data: [0.8, 0.7, 0.9],
                }}
                width={width * 0.8}
                height={180}
                strokeWidth={16}
                radius={32}
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
            />
        ),
    },
];

export default function StatsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const onViewRef = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
    const CARD_WIDTH = width * 0.9;
    const CARD_MARGIN_RIGHT = 15;
    const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN_RIGHT;

    return (
        <View style={styles.container}>
            <FlatList
                data={statsData}
                horizontal
                pagingEnabled={false} // disable default paging to avoid conflicts with snapToInterval
                snapToInterval={SNAP_INTERVAL} // this enables snapping aligned to card+margin width
                decelerationRate="fast" // smoother snap
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewConfigRef.current}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item, index }) => (
                    <View
                        style={[
                            styles.card,
                            { width: CARD_WIDTH },
                            index !== statsData.length - 1 && { marginRight: CARD_MARGIN_RIGHT },
                        ]}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        {item.chart}
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )}
            />

            <View style={styles.pagination}>
                {statsData.map((_, idx) => (
                    <View key={idx} style={[styles.dot, idx === currentIndex && styles.activeDot]} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 280,
        backgroundColor: '#0A0F1C',
        alignItems: 'center', // center horizontally
    },
    flatListContent: {
        paddingHorizontal: width * 0.05, // equal padding on sides to center cards
    },
    card: {
        backgroundColor: '#111622',
        borderRadius: 12,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#00ffcc',
        fontSize: 18,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 2,
    },
    description: {
        color: '#7ACFCF',
        fontFamily: 'monospace',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    dot: {
        height: 8,
        width: 8,
        backgroundColor: '#555',
        borderRadius: 4,
        marginHorizontal: 6,
    },
    activeDot: {
        backgroundColor: '#00ffcc',
    },
});
