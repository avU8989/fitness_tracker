// src/screens/HomeScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    ScrollView,
} from 'react-native';
import FlickerText from '../FlickerText';
import VHSHeader from './VHSHeader';
const GRAIN_TEXTURE = require('../assets/home_bg_1.png');
const SCANLINE_TEXTURE = require('../assets/home_bg_1.png');

export default function HomeScreen() {
    const stats = {
        exercisesLogged: 6,
        volume: 500,
        duration: '01:15:43',
        lastWorkout: { date: '01/04/1996', split: 'BACK' },
        weekVolume: 1200,
        pr: [
            { name: 'Deadlift', weight: 170 },
            { name: 'Bench Press', weight: 100 },
            { name: 'Squat', weight: 140 },
        ],
        recovery: {
            soreness: 'OK',
            cnsLoad: 'MEDIUM',
            mental: 'FOCUSED',
        },
        split: [
            { day: 'MON', type: 'PUSH', status: '▶ PLAY // Chst_A1' },
            { day: 'TUE', type: 'PULL', status: 'RECORDED // Bck_A1' },
            { day: 'WED', type: 'LEGS', status: 'RECORDED // Leg_A1' },
            { day: 'THU', type: 'REST', status: '' },
            { day: 'FRI', type: 'PUSH', status: 'IN QUEUE // Chst_A2' },
            { day: 'SAT', type: 'REST', status: '' },
            { day: 'SUN', type: 'PULL', status: '' },
        ],
    };

    return (
        <ImageBackground source={GRAIN_TEXTURE} style={styles.bg}>
            <ImageBackground source={SCANLINE_TEXTURE} style={styles.bg} imageStyle={{ opacity: 0.15 }}>
                <View style={styles.tintOverlay} />

                <ScrollView contentContainerStyle={styles.container}>
                    {/* Header */}
                    <VHSHeader></VHSHeader>


                    {/* Cards */}
                    <View style={styles.cardsRow}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>LAST WORKOUT</Text>
                            <Text style={styles.cardText}>{stats.lastWorkout.date}</Text>
                            <Text style={styles.cardText}>◉ {stats.lastWorkout.split}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>WEEK VOLUME</Text>
                            <Text style={styles.cardText}>{stats.weekVolume} KG</Text>
                        </View>
                    </View>
                    <View style={styles.cardsRow}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>PR ALERT</Text>
                            {stats.pr.map((p) => (
                                <Text key={p.name} style={styles.cardText}>
                                    {p.name}: {p.weight} KG
                                </Text>
                            ))}
                        </View>
                        <View style={[styles.card, { flex: 1 }]}>
                            <Text style={styles.cardTitle}>RECOVERY STATUS</Text>
                            <Text style={styles.cardText}>SORE // {stats.recovery.soreness}</Text>
                            <Text style={[styles.cardText, styles.highlight]}>CNS LOAD: {stats.recovery.cnsLoad}</Text>
                            <Text style={[styles.cardText, styles.highlight]}>
                                MENTAL STATE: {stats.recovery.mental}
                            </Text>
                        </View>
                    </View>

                    {/* Split table */}
                    <View style={styles.splitContainer}>
                        <Text style={styles.splitHeader}>› CURRENT SPLIT (PPL)</Text>
                        {stats.split.map((s) => (
                            <View key={s.day} style={styles.splitRow}>
                                <Text style={styles.splitDay}>{s.day}</Text>
                                <Text style={styles.splitType}>{s.type}</Text>
                                <Text style={styles.splitStatus}>{s.status}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Footer Ticker */}
                    <View style={styles.ticker}>
                        <Text style={styles.tickerText}>›› NO PAIN // NO REWIND // STAY STRONG // ‹‹</Text>
                    </View>
                </ScrollView>
            </ImageBackground>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, resizeMode: 'cover' },
    container: { padding: 16, paddingBottom: 32 },
    header: { marginBottom: 12 },
    title: {
        fontFamily: 'Anton_400Regular',
        fontSize: 24,
        color: '#FFF',
        textShadowColor: '#00F',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    subTitle: {
        fontSize: 32,
        marginTop: 4,
    },
    timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    timestamp: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 12,
        color: '#FFF',
        marginRight: 12,
    },
    recDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F00',
        marginLeft: 4,
        shadowColor: '#F00',
        shadowRadius: 4,
        shadowOpacity: 0.8,
    },
    tintOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(89, 9, 123, 0.1)', // VHS purple (low opacity)
        zIndex: 1,
    },
    overviewRow: { marginVertical: 12 },
    overviewText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 14,
        color: '#FFF',
        marginVertical: 2,
    },

    cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
    card: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#AAA',
        padding: 8,
        marginHorizontal: 4,
    },
    cardTitle: {
        fontFamily: 'Anton_400Regular',
        fontSize: 14,
        color: '#FFF',
        marginBottom: 4,
    },
    cardText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 12,
        color: '#FFF',
        marginVertical: 1,
    },
    highlight: { color: '#0F0' },

    splitContainer: { marginTop: 16, borderTopWidth: 1, borderColor: '#666', paddingTop: 8 },
    splitHeader: {
        fontFamily: 'Anton_400Regular',
        fontSize: 16,
        color: '#FFF',
        marginBottom: 6,
    },
    splitRow: { flexDirection: 'row', marginVertical: 2 },
    splitDay: { width: 40, fontFamily: 'IBMPlexMono_400Regular', color: '#888' },
    splitType: { width: 80, fontFamily: 'IBMPlexMono_400Regular', color: '#0CF' },
    splitStatus: { flex: 1, fontFamily: 'IBMPlexMono_400Regular', color: '#FFF' },

    ticker: { marginTop: 24, alignItems: 'center' },
    tickerText: {
        fontFamily: 'PressStart2P_400Regular',
        fontSize: 10,
        color: '#FFF',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
});
