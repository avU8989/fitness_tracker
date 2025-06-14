// src/screens/HomeScreen.tsx
import React from 'react';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
} from 'react-native';
import FlickerText from '../FlickerText';
import ImageText from '../ImageText';
import VHSHeader from './VHSHeader';
import Carousel from 'react-native-reanimated-carousel';
import Ticker from './Ticker';

const GRAIN_TEXTURE = require('../assets/glitch-effect-black-background.jpg');
const SCANLINE_TEXTURE = require('../assets/bg.jpg');
const TEXTURE = require('../assets/abstract-geometric-background-shapes-texture.jpg');

const BG2 = require('../assets/gray-glitch-effect-patterned-background.jpg')
const cardBackground1 = require('../assets/test2.jpg');
export default function HomeScreen() {
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
        <View style={{ flex: 1 }}>
            <ImageBackground source={SCANLINE_TEXTURE} style={styles.bg}>
                <ImageBackground source={GRAIN_TEXTURE} style={styles.bg} imageStyle={{ opacity: 0.15 }}>
                    <ImageBackground source={BG2} style={styles.bg} imageStyle={{ opacity: 0.15 }}>

                        <View style={styles.tintOverlay} />

                        {/* Header */}
                        <View style={styles.container1}></View>

                        <View style={styles.content}>
                            <ScrollView contentContainerStyle={styles.scrollContainer}>
                                <VHSHeader></VHSHeader>

                                {/* Cards */}

                                <View style={styles.overviewRow}>
                                    <Text style={styles.statText}>● {stats.exercisesLogged} Exercises Logged</Text>
                                    <Text style={styles.statText}>● Volume: {stats.volume} KG</Text>
                                    <Text style={styles.statText}>● Duration: {stats.duration}</Text>
                                </View>

                                <View style={{ marginVertical: 20 }}>
                                    <Carousel
                                        width={Dimensions.get('window').width * 1.2}
                                        height={260}
                                        mode="parallax"
                                        modeConfig={{ parallaxScrollingOffset: 60 }}
                                        autoPlay={false}
                                        data={recoveryCards}
                                        style={{ left: -(Dimensions.get('window').width * 0.1) }} // shift left by 5%
                                        scrollAnimationDuration={800}
                                        renderItem={({ item }) => (
                                            <ImageBackground
                                                source={cardBackground1}
                                                style={styles.cardBackground}
                                                imageStyle={styles.cardImage}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    {/* Title Area: pinned to top */}
                                                    <View style={{ height: 40, justifyContent: 'flex-start' }}>
                                                        <ImageText textStyle={{ paddingBottom: 0 }}>{item.title}</ImageText>
                                                    </View>

                                                    {/* Content Area: fixed space to avoid shifting */}
                                                    <View style={{ flex: 1, justifyContent: 'space-evenly', paddingTop: 20 }}>
                                                        {Array.isArray(item.lines) &&
                                                            item.lines.map((line, idx) => (
                                                                <Text
                                                                    key={idx}
                                                                    numberOfLines={1}
                                                                    adjustsFontSizeToFit
                                                                    style={[styles.cardText, styles.highlight]}
                                                                >
                                                                    {line}
                                                                </Text>
                                                            ))}

                                                        {typeof item.render === 'function' && item.render()}
                                                    </View>
                                                </View>
                                            </ImageBackground>
                                        )}



                                    />
                                </View>

                                <Ticker></Ticker>


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
                        </View>
                    </ImageBackground>

                </ImageBackground>
            </ImageBackground >
        </View >
    );
}

const styles = StyleSheet.create({
    overviewRow: {
        marginBottom: -30,
    },
    statText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 15,
        textShadowColor: 'rgb(0, 215, 253)',
        textShadowOffset: { width: 0, height: 0 },
        color: 'rgba(219, 224, 225, 0.94)',
        marginVertical: 3,
        letterSpacing: 3,
        textShadowRadius: 16,
    },
    cardWrapper: {
        flex: 1,
        marginHorizontal: 4,
        aspectRatio: 1, // adjust based on your card layout
    },

    cardBackground: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',

    },
    scrollContainer: {

        paddingBottom: 100, // enough bottom padding to scroll past nav
        flexGrow: 1,
    },


    cardImage: {
        resizeMode: 'stretch', // or 'cover', depending on your design
        borderRadius: 6,
        transform: [{ scale: 1.04 }], // Increase glow box size
        opacity: 0.35, // Optional for blending
    },
    scrollView: {
        flex: 1,                // ← fill the remaining space under the header
    },

    bg: { flex: 1, resizeMode: 'repeat' },
    container: { padding: 16, paddingBottom: 32 },
    header: { marginBottom: 12 },
    title: {
        fontFamily: 'Anton_400Regular',
        fontSize: 24,
        paddingTop: 30,
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
    content: {
        flex: 1,        // take up the whole screen on top of the bg
        zIndex: 1,      // sit above the backgrounds
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
    overviewText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 14,
        color: '#FFF',
        marginVertical: 2,
    },

    cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
    card: {
        flex: 1,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Optional, for deeper contrast
        borderColor: '#AAA',
        padding: 8,
        borderRadius: 6,

        marginHorizontal: 4,
    },
    container1: {
        width: 10,
        height: 25,
    },
    cardTitle: {
        fontFamily: 'Anton_400Regular',
        fontSize: 20,
        color: '#FFF',
        marginBottom: 4,
        textShadowColor: '#0ff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        letterSpacing: 6,

    },
    containerWrapper: {
        flexGrow: 1,
    },

    cardText: {
        fontFamily: 'IBMPlexMono_400Regular',
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


    highlight: {
        // green glow
        textShadowColor: 'rgba(0, 247, 255, 0.94)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },

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
    ticker2: { marginTop: -20, alignItems: 'center' },
    ticker: { marginTop: 24, alignItems: 'center' },
    tickerText: {
        fontFamily: 'PressStart2P_400Regular',
        fontSize: 10,
        color: '#FFF',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    scanlineOverlay: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'repeat',
        opacity: 0.07,
        zIndex: 10,
    },


    noiseOverlay: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'repeat',
        opacity: 0.08,
        zIndex: 11,
    },

});
