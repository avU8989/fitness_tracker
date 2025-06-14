import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import VHSHeader from './VHSHeader';

export default function HardloggerUI() {
    const stats = {
        lastWorkoutDays: '01/04/1996',
        exercisesLogged: 6,
        volume: 500,
        liftProgression: '30 %',
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

    const GRAIN_TEXTURE = require('../assets/glitch-effect-black-background.jpg');
    const SCANLINE_TEXTURE = require('../assets/bg.jpg');
    const BG2 = require('../assets/gray-glitch-effect-patterned-background.jpg')

    const recoveryCards = [
        {
            title: 'RECOVERY STATUS',
            lines: [
                `SORE//${stats.recovery.soreness}`,
                `CNS LOAD: ${stats.recovery.cnsLoad}`,
                `MENTAL STATE: ${stats.recovery.mental}`,
            ],
        },
        {
            title: 'MOCK STATS',
            lines: ['HRV // NORMAL', 'SLEEP // 7.5 HRS', 'FATIGUE // LOW'],
        },
        {
            title: 'SUPPLEMENT STACK',
            lines: ['CREATINE // ✓', 'OMEGA-3 // ✓', 'MAGNESIUM // ✓'],
        },
        {
            title: 'NUTRITION',
            lines: ['CALORIES // 2450', 'PROTEIN // 170G', 'CARBS // 230G'],
        },
        {
            title: 'HYDRATION STATUS',
            lines: ['WATER // 3.2L', 'ELECTROLYTES // BALANCED', 'CAFFEINE // 150mg'],
        },
        {
            title: 'STRESS LEVELS',
            lines: ['MOOD // CALM', 'FOCUS // HIGH', 'IRRITABILITY // LOW'],
        },
        {
            title: 'SLEEP QUALITY',
            lines: ['DEEP SLEEP // 2.3H', 'REM SLEEP // 1.8H', 'EFFICIENCY // 91%'],
        },
        {
            title: 'READINESS SCORE',
            lines: ['OVERALL // 82%', 'ENERGY // HIGH', 'MOTIVATION // PEAK'],
        },
        {
            title: 'SESSION LOG',
            lines: [
                `LAST PR // ${stats.lastWorkout}`,
                `LAST ENTRY //  2 days ago`,
                `MENTAL STATE: ${stats.liftProgression}`,
            ],
        },
        {
            title: 'POWER LEVEL',
            render: () =>
                Array.isArray(stats?.pr) && stats.pr.length > 0
                    ? stats.pr.map((p) => (
                        <Text key={p.name} style={[styles.cardText, styles.highlight]}>
                            {p.name}: {p.weight} KG
                        </Text>
                    ))
                    : <Text style={styles.cardText}>No PRs logged</Text>,
        },
        {
            title: 'STATUS REPORT',
            lines: [
                `TOTAL VOL // ${stats.volume}`,
                `WEEKLY VOL //  ${stats.weekVolume}`,
                `VOLUME INCREASMENT // ${stats.liftProgression}`,
            ],
        },
    ];


    return (
        <View style={styles.root}> {/* <- background color here */}
            <ImageBackground source={GRAIN_TEXTURE} style={styles.bg} imageStyle={{ opacity: 0.1 }}>
                <ImageBackground source={BG2} style={styles.bg} imageStyle={{ opacity: 0.1 }}>

                    <ScrollView
                        style={styles.container}
                        contentContainerStyle={[styles.content, { paddingBottom: 100 }]} // ✅ adjusted here
                    >
                        <VHSHeader></VHSHeader>
                        <View style={styles.overviewRow}>
                            <Text style={styles.statText}>● {stats.exercisesLogged} EXERCISES LOGGED </Text>
                            <Text style={styles.statText}>● POWER OUTPUT // {stats.volume} KG</Text>
                            <Text style={styles.statText}>● DURATION // {stats.duration}</Text>
                        </View>

                        <View style={styles.doubleRow}>
                            <View style={styles.halfBox}>
                                <Text style={styles.label}>LAST WORKOUT</Text>
                                <Text style={styles.largeText}>01/04/1996</Text>
                                <Text style={styles.bodyText}>BACK</Text>
                            </View>
                            <View style={styles.halfBox}>
                                <Text style={styles.label}>THIS WEEK VOLUME</Text>
                                <Text style={styles.boldText}>21,560 lb</Text>
                            </View>
                        </View>

                        <View style={styles.doubleRow}>
                            <View style={styles.halfBox}>
                                <Text style={styles.label}>POWER FEED</Text>
                                <Text style={styles.bodyText}>BENCH ▸ 2501LB</Text>
                                <Text style={styles.bodyText}>REP ZONE ▸ CLEAN</Text>
                            </View>
                            <View style={styles.halfBox}>
                                <Text style={styles.label}>SYS RECOVERY</Text>
                                <Text style={styles.bodyText}>SORE ▸ OK</Text>
                                <Text style={styles.bodyText}>CNS ▸ NOMINAL</Text>
                            </View>
                        </View>



                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>WEEK SPLIT LOG</Text>
                        <View style={styles.table}>
                            {[
                                ['MON', 'PUSH // Chst_A1'],
                                ['TUE', 'PULL // Bck_A1'],
                                ['WED', 'LEGS // Leg_A1'],
                                ['THU', 'REST // CNS RECOVER'],
                                ['FRI', 'PUSH // Chst_A2'],
                                ['SAT', 'REST // COOLING'],
                                ['SUN', 'PULL // Bck_A2'],
                            ].map(([day, plan]) => (
                                <View style={styles.tableRow} key={day}>
                                    <Text style={styles.tableDay}>{`>> ${day}`}</Text>
                                    <Text style={styles.tablePlan}>{plan}</Text>
                                </View>
                            ))}
                        </View>



                        <View style={styles.row}>
                            <Pressable style={styles.button}>
                                <Text style={styles.buttonText}>START</Text>
                            </Pressable>
                            <Pressable style={styles.button}>
                                <Text style={styles.buttonText}>ADD SET</Text>
                            </Pressable>
                            <Pressable style={styles.button}>
                                <Text style={styles.buttonText}>VIEW GAINS</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </ImageBackground>

            </ImageBackground >
        </View >
    );
}

const styles = StyleSheet.create({
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1F2C',
        alignItems: 'center',
    },

    tableDay: {
        width: 100, // fixed width
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 255, 153, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },

    tablePlan: {
        flex: 1, // fill remaining space
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 255, 153, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },

    root: {
        flex: 1,
        backgroundColor: '#0A0F1C',
    },
    statText: {
        fontFamily: 'mono',
        fontSize: 15,
        color: '#BFC7D5',
        fontWeight: 'bold',
        marginVertical: 3,
        letterSpacing: 6,
    },
    overviewRow: {
        marginBottom: 20,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        padding: 20,
    },
    header: {
        color: '#BFC7D5',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    subtext: {
        color: '#BFC7D5',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#2A2F3C',
        marginVertical: 20,
    },
    sectionTitle: {
        color: '#BFC7D5',
        fontSize: 18,
        fontWeight: 'bold',
        paddingBottom: 15,
        fontFamily: 'monospace',
    },
    workoutTitle: {
        color: '#BFC7D5',
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    bodyText: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
    },
    label: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    highlight: {
        // green glow
        textShadowColor: 'rgba(0, 247, 255, 0.94)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    largeText: {
        color: '#BFC7D5',
        fontSize: 18,
        fontFamily: 'monospace',
    },
    boldText: {
        color: '#BFC7D5',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    doubleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    halfBox: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
        padding: 10,
        width: '48%',
    },
    box: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
        padding: 10,
        width: '100%',
        marginBottom: 10,
    },
    button: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
        padding: 10,
        width: '30%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#BFC7D5',
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    table: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
    },

    tableCell: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        width: '50%',
    },
    cardText: {
        fontFamily: 'mono',
        fontSize: 20,                   // bump up slightly for legibility
        color: 'rgba(255, 255, 255, 0.94)',
        marginVertical: 4,              // tighter vertical rhythm
        textAlign: 'left',
        letterSpacing: 6,

        // soft white glow
        textShadowColor: 'rgba(4, 235, 73, 0.94)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
    bg: { flex: 1 },

});
