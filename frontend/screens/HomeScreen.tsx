// src/screens/HomeScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
} from 'react-native';
import FlickerText from '../FlickerText';
import ImageText from '../ImageText';
import GlitchAnimation from '../GltichAnimation';
import VHSHeader from './VHSHeader';
const GRAIN_TEXTURE = require('../assets/glitch-effect-black-background.jpg');
const SCANLINE_TEXTURE = require('../assets/bg.jpg');
const TEXTURE = require('../assets/abstract-geometric-background-shapes-texture.jpg');

const BG2 = require('../assets/gray-glitch-effect-patterned-background.jpg')
const cardBackground1 = require('../assets/test2.jpg');
export default function HomeScreen() {
    const stats = {
        lastWorkoutDays: '2 days ago',
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



    return (
        <ImageBackground source={SCANLINE_TEXTURE} style={styles.bg}>
            <ImageBackground source={GRAIN_TEXTURE} style={styles.bg} imageStyle={{ opacity: 0.15 }}>
                <ImageBackground source={BG2} style={styles.bg} imageStyle={{ opacity: 0.15 }}>

                    <View style={styles.tintOverlay} />

                    {/* Header */}
                    <VHSHeader></VHSHeader>


                    {/* Cards */}

                    <View style={styles.cardsRow}>
                        <ImageBackground source={cardBackground1} style={styles.cardBackground} imageStyle={styles.cardImage}>
                            <ImageText>SESSION LOG</ImageText>
                            <Text style={styles.cardText}>LAST PR {stats.lastWorkout.date}</Text>
                            <Text style={styles.cardText}>LAST ENTRY // {stats.lastWorkoutDays}</Text>
                            <Text style={styles.cardText}>LIFT PROGRESSION // {stats.liftProgression}</Text>
                        </ImageBackground>
                        <ImageBackground source={cardBackground1} style={styles.cardBackground} imageStyle={styles.cardImage}>

                            <ImageText>STATUS REPORT</ImageText>
                            <Text style={styles.cardText}>TOTAL VOL: {stats.volume}</Text>
                            <Text style={styles.cardText}>WEEKLY VOL: {stats.weekVolume}</Text>
                            <Text style={styles.cardText}></Text>

                        </ImageBackground>

                    </View>
                    <View style={styles.cardsRow}>
                        <ImageBackground source={cardBackground1} style={styles.cardBackground} imageStyle={styles.cardImage}>

                            <ImageText>POWER LEVEL</ImageText>
                            {stats.pr.map((p) => (
                                <Text key={p.name} style={styles.cardText}>
                                    {p.name}: {p.weight} KG
                                </Text>
                            ))}
                        </ImageBackground>

                        <ImageBackground source={cardBackground1} style={styles.cardBackground} imageStyle={styles.cardImage}>

                            <ImageText>RECOVERY STATUS</ImageText>
                            <Text style={styles.cardText}>SORE//{stats.recovery.soreness}</Text>
                            <Text style={[styles.cardText, styles.highlight]}>CNS LOAD: {stats.recovery.cnsLoad}</Text>
                            <Text style={[styles.cardText, styles.highlight]}>
                                MENTAL STATE: {stats.recovery.mental}
                            </Text>
                        </ImageBackground>
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
                </ImageBackground>

            </ImageBackground>
        </ImageBackground >
    );
}

const styles = StyleSheet.create({

    cardWrapper: {
        flex: 1,
        marginHorizontal: 4,
        aspectRatio: 1, // adjust based on your card layout
    },

    cardBackground: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',

    },

    cardImage: {
        resizeMode: 'stretch', // or 'cover', depending on your design
        borderRadius: 6,
        transform: [{ scale: 1.04 }], // Increase glow box size
        opacity: 0.35, // Optional for blending
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
    cardTitle: {
        fontFamily: 'Anton_400Regular',
        fontSize: 22,
        color: '#FFF',
        marginBottom: 4,
        textShadowColor: '#0ff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    containerWrapper: {
        flexGrow: 1,
    },

    cardText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 11,
        marginTop: -5,
        color: '#FFF',
        marginVertical: 6,
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
