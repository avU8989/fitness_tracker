import React from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    ImageBackground, Image
} from 'react-native';
import VHSHeader from '../components/VHSHeader';
import { useState, useEffect } from 'react';
import WeeklySplitLog from '../components/WeeklySplitLog';
import Icon from 'react-native-vector-icons/Ionicons'; // at top
import VHSGlowDivider from '../components/VHSGlowDivider';

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

    const GRAIN_TEXTURE = require('../assets/home_bg_2.png');
    const SCANLINE_TEXTURE = require('../assets/abstract-geometric-background-shapes-texture.jpg');
    const useTapeLoader = () => {
        const [tapeAnim, setTapeAnim] = useState('▓▓░░░░░░');
        useEffect(() => {
            const frames = ['▓░░░░░░░', '▓▓░░░░░░', '▓▓▓░░░░░', '▓▓▓▓░░░░', '▓▓▓▓▓░░░'];
            const interval = setInterval(() => {
                setTapeAnim(frames[Math.floor(Math.random() * frames.length)]);
            }, 300);
            return () => clearInterval(interval);
        }, []);
        return tapeAnim;
    };

    const PulseBarGraph = () => (
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {[...Array(20)].map((_, i) => (
                <View
                    key={i}
                    style={{
                        width: 4,
                        height: Math.random() * 30 + 10,
                        backgroundColor: '#00ffcc',
                        marginHorizontal: 1,
                    }}
                />
            ))}
        </View>
    );
    const recoveryCards = [
        {
            title: 'MOTIVATION MODULE',
            lines: [
                '“NO PAIN >> NO PROGRESS”',
                '“YOU ARE NOT TIRED — YOU ARE UNDERLOADED”',
                '“REWIND IS DISABLED // PUSH FORWARD”',
            ],
        },
        {
            title: 'SYSTEM WARNINGS',
            lines: [
                '☠ CNS VOLTAGE SPIKE DETECTED',
                '⚠ SLEEP SYNC OUT OF PHASE',
                '!! OVERLOAD SIGNAL RECEIVED',
            ],
        },
        {
            title: 'TAPE LOADER',
            render: () => (
                <Text style={styles.cardText}>TAPE LOAD >> {useTapeLoader()}</Text>
            ),
        },
        {
            title: 'PULSE FEED',
            render: () => (
                <View>
                    <View style={{ paddingVertical: 10 }}>
                        <PulseBarGraph />
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.vhsHudLine}>▌HEART RATE // 132 BPM</Text>
                            <Text style={styles.vhsHudLine}>▌INTENSITY LEVEL // 74%</Text>
                        </View>
                    </View>
                </View>
            ),
        },
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
            title: 'SESSION LOG',
            lines: [
                `LAST PR // ${stats.lastWorkout.split} on ${stats.lastWorkout.date}`,
                `LAST ENTRY //  2 days ago`,
                `MENTAL STATE: ${stats.liftProgression}`,
            ],
        },
        {
            title: 'POWER LEVEL',
            render: () =>
                stats.pr.map((p) => (
                    <Text key={p.name} style={[styles.cardText, styles.glow]}>
                        {p.name}: {p.weight} KG
                    </Text>
                )),
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
        <View style={styles.root}>
            <ImageBackground source={GRAIN_TEXTURE} style={styles.bg} imageStyle={{ opacity: 0.1 }}>
                <ImageBackground source={SCANLINE_TEXTURE} style={styles.bg} imageStyle={{ opacity: 0.1 }}>

                    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                        <Image
                            source={require('../assets/bfc0a832-85f1-48f9-a766-9426b2947a94.png')}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 80,
                                height: 80,
                                opacity: 0.1,
                            }}
                            resizeMode="contain"
                        />
                        <Image
                            source={require('../assets/bfc0a832-85f1-48f9-a766-9426b2947a94.png')}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 80,
                                height: 80,
                                opacity: 0.1,
                                transform: [{ rotate: '180deg' }],
                            }}
                            resizeMode="contain"
                        />
                        <VHSHeader />


                        <View style={styles.overviewRow}>
                            <Text style={styles.vhsHudTitle}>▓CHANNEL 01 — SYSTEM LOG▓</Text>
                            <View style={styles.vhsHudPanel}>
                                <Text style={styles.vhsHudLine}>
                                    ▌LOG SUMMARY // {stats.exercisesLogged} Exercises Logged
                                </Text>
                                <Text style={styles.vhsHudLine}>
                                    ▌VOLUME FEED // {stats.volume} KG Power Output
                                </Text>
                                <Text style={styles.vhsHudLine}>
                                    ▌TRACK TIME  // {stats.duration}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.doubleRow}>
                            <View style={styles.halfBox}>
                                <Text style={styles.boxHeader}>LAST WORKOUT</Text>
                                <Text style={styles.largeText}>{stats.lastWorkout.date}</Text>
                                <Text style={styles.bodyText}>{stats.lastWorkout.split}</Text>
                            </View>

                            <View style={styles.halfBox}>
                                <Text style={styles.boxHeader}>THIS WEEK VOLUME</Text>
                                <Text style={styles.boldText}>{stats.weekVolume.toLocaleString()} lb</Text>
                            </View>
                        </View>

                        <View style={styles.doubleRow}>
                            <View style={styles.halfBox}>
                                <Text style={styles.boxHeader}>POWER FEED</Text>
                                <Text style={styles.bodyText}>BENCH ▸ 2501LB</Text>
                                <Text style={styles.bodyText}>REP ZONE ▸ CLEAN</Text>
                            </View>
                            <View style={styles.halfBox}>
                                <Text style={styles.boxHeader}>SYS RECOVERY</Text>
                                <Text style={styles.bodyText}>SORE ▸ OK</Text>
                                <Text style={styles.bodyText}>CNS ▸ NOMINAL</Text>
                            </View>
                        </View>
                        <VHSGlowDivider></VHSGlowDivider>

                        <Text style={styles.vhsHudTitle}>▓CHANNEL 02 — VITAL FEED▓</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            {recoveryCards.map((card, index) => (
                                <View key={index} style={styles.recoveryCard}>
                                    <Text style={styles.cardTitle}>{card.title}</Text>
                                    {card.lines?.map((line, i) => (
                                        <Text key={i} style={styles.cardText}>{line}</Text>
                                    ))}
                                    {card.render?.()}
                                </View>
                            ))}
                        </ScrollView>
                        <Text style={styles.transitionLabel}>▶ ANALYZING SYSTEM FEED...</Text>

                        <View style={styles.powerBarContainer}>
                            <Text style={styles.powerBarLabel}>▞ GAIN SIGNAL STRENGTH ▚</Text>
                            <Text style={styles.powerBarSubLabel}>↳ Detected Lift Progression: {stats.liftProgression}</Text>

                            <View style={styles.powerBarTrack}>
                                <View style={[styles.powerBarFill, {
                                    width: `${Math.min(stats.liftProgression.replace('%', ''), 100)}%`
                                }]} />
                            </View>

                            <View style={styles.barTickRow}>
                                <Text style={styles.tickLabel}>LOW</Text>
                                <Text style={styles.tickLabel}>MED</Text>
                                <Text style={styles.tickLabel}>HIGH</Text>
                            </View>

                            <Text style={styles.diagnosticNote}>
                                &gt;&gt;STRENGTH SIGNAL LOCKED — HOLD THE LINE&lt;&lt;
                            </Text>
                        </View>

                        <WeeklySplitLog></WeeklySplitLog>


                        <View style={styles.row}>
                            <Pressable style={styles.iconButton}>
                                <Icon name="flash-outline" size={20} color="#00ffcc" style={styles.icon} />
                                <Text style={[styles.buttonText, styles.glow]}>START</Text>
                            </Pressable>
                            <Pressable style={styles.iconButton}>
                                <Icon name="add-circle-outline" size={20} color="#00ffcc" style={styles.icon} />
                                <Text style={[styles.buttonText, styles.glow]}>ADD SET</Text>
                            </Pressable>
                            <Pressable style={styles.iconButton}>
                                <Icon name="barbell-outline" size={20} color="#00ffcc" style={styles.icon} />
                                <Text style={[styles.buttonText, styles.glow]}>VIEW GAINS</Text>
                            </Pressable>
                        </View>

                    </ScrollView>
                </ImageBackground>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    powerBarContainer: {
        padding: 12,
        backgroundColor: '#0A0F1C',
        borderColor: '#00ffcc',
        borderWidth: 1.2,
        borderRadius: 6,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    powerBarLabel: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#00ffcc',
        letterSpacing: 2,
        marginBottom: 4,
    },
    powerBarSubLabel: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#BFC7D5',
        marginBottom: 8,
        opacity: 0.8,
    },
    powerBarTrack: {
        height: 10,
        backgroundColor: '#1A1F2C',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    powerBarFill: {
        height: '100%',
        backgroundColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    barTickRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
        paddingHorizontal: 4,
    },
    tickLabel: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00ffcc',
        opacity: 0.7,
    },
    diagnosticNote: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 11,
        letterSpacing: 0.88,
        opacity: 0.9,
        textAlign: 'center',
        marginTop: 6,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
        textTransform: 'uppercase',
    },

    crtRow: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 14,
        letterSpacing: 2,
        marginVertical: 2,
        textShadowColor: '#00ffcc',
        textShadowRadius: 3,
    },

    vhsGlitchTitle: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00ffcc',
        opacity: 0.5,
        marginBottom: 4,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    vhsHudTitle: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 255, 204, 0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#00ffcc',
        borderRadius: 2,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
        marginBottom: 12,
        alignSelf: 'flex-start',
        overflow: 'hidden',
    },


    vhsHudPanel: {
        backgroundColor: '#0A0F1C',
        borderColor: '#00ffcc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        marginBottom: 16,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },

    vhsHudLine: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 13,
        marginVertical: 4,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 255, 204, 0.2)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 2,
    },

    overviewLabel: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 12,
        marginBottom: 6,
        letterSpacing: 2,
        backgroundColor: '#0A0F1C',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        borderColor: '#00ffcc',
        borderWidth: 1,
    },

    overviewPanel: {
        backgroundColor: '#111622',
        borderColor: '#00ffcc',
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },

    overviewItem: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#BFC7D5',
        marginVertical: 4,
        letterSpacing: 2,
        textShadowColor: '#00ffcc',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },

    vhsScanBar: {
        height: 2,
        backgroundColor: '#00ffcc',
        marginVertical: 6,
        opacity: 0.2,
    },

    transitionLabel: {
        fontFamily: 'monospace',
        color: '#BFC7D5',
        fontSize: 12,
        marginBottom: 10,
        opacity: 0.5,
        letterSpacing: 2,
        textAlign: 'center',
    },

    asciiDivider: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        textAlign: 'center',
        fontSize: 12,
        letterSpacing: 0,
        marginVertical: 16,
        opacity: 0.6,
    },

    iconButton: {
        borderWidth: 1,
        borderColor: '#00ffcc',
        backgroundColor: '#0a0f1c',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: '30%',
        alignItems: 'center',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        flexDirection: 'column',
    },

    icon: {
        marginBottom: 4,
    },

    root: {
        flex: 1,
        backgroundColor: '#0A0F1C',
    },
    bg: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    overviewRow: {
        marginBottom: 0,
    },
    boxHeader: {
        backgroundColor: '#00ffcc',
        color: '#0A0F1C',
        fontFamily: 'monospace',
        fontSize: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderRadius: 4,
        overflow: 'hidden',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },

    statText: {
        fontFamily: 'monospace',
        fontSize: 15,
        color: '#BFC7D5',
        fontWeight: 'bold',
        marginVertical: 3,
        letterSpacing: 6,
    },
    doubleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    halfBox: {
        backgroundColor: '#111622',
        borderColor: '#00ffcc',
        borderWidth: 1.5,
        borderRadius: 10,
        padding: 14,
        width: '48%',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 10,
    },

    label: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontWeight: 'bold',
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
    bodyText: {
        color: '#BFC7D5',
        fontFamily: 'monospace',
    },
    sectionTitle: {
        color: '#BFC7D5',
        fontSize: 18,
        fontWeight: 'bold',
        paddingBottom: 15,
        fontFamily: 'monospace',
    },
    divider: {
        height: 1,
        backgroundColor: '#00ffcc',
        marginVertical: 30,
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        opacity: 0.3,
    },
    powerBarContainer: {
        marginVertical: 6,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#0A0F1C',
        borderColor: '#00ffcc',
        borderWidth: 1.2,
        borderRadius: 6,
        shadowColor: '#00ffcc',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },

    powerBarLabel: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#00ffcc',
        marginBottom: 6,
        letterSpacing: 2,
    },

    powerBarTrack: {
        height: 10,
        backgroundColor: '#1A1F2C',
        borderRadius: 4,
        overflow: 'hidden',
    },

    powerBarFill: {
        height: '100%',
        backgroundColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },


    table: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1F2C',
        alignItems: 'center',
    },
    tableDay: {
        width: 100,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(224, 224, 224, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    tablePlan: {
        flex: 1,
        color: '#BFC7D5',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(224, 224, 224, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    button: {
        borderWidth: 1,
        borderColor: '#BFC7D5',
        backgroundColor: '#1A1F2C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '30%',
        alignItems: 'center',
        borderRadius: 6,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    buttonText: {
        color: '#BFC7D5',
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    glow: {
        textShadowColor: '#E0E0E0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    recoveryCard: {
        backgroundColor: '#111622',
        borderColor: '#00ffcc',
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 16,
        marginRight: 16,
        width: 260,
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
        transform: [{ perspective: 100 }, { rotateX: '0.5deg' }],
    },


    cardTitle: {
        backgroundColor: '#00ffcc',
        color: '#0A0F1C',
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginBottom: 12,
        alignSelf: 'flex-start',
        borderRadius: 4,
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    cardText: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.94)',
        marginVertical: 4,
        textAlign: 'left',
        letterSpacing: 3,
    },
});
