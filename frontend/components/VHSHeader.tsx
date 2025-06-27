import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VHSGlowDivider from './VHSGlowDivider';
const VHSHeader = () => {
    const [recTime, setRecTime] = useState('00:00:00');
    const [pulseAnim] = useState(new Animated.Value(1));
    const [blinkAnim] = useState(new Animated.Value(1));
    const [glitchAnim] = useState(new Animated.Value(0));
    const [scanFlicker] = useState(new Animated.Value(0.95));

    const glitchTranslate = glitchAnim.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: [0, -1, 1.5, -1, 1, 0],
    });

    const glitchScale = glitchAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.02, 1],
    });

    useEffect(() => {


        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(blinkAnim, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(blinkAnim, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(scanFlicker, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scanFlicker, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
            const seconds = String(elapsed % 60).padStart(2, '0');
            setRecTime(`${hours}:${minutes}:${seconds}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>HARDLOGGER</Text>

            <View style={styles.headerRow}>
                <Text style={styles.title}>TODAY’S GRIND</Text>
            </View>

            <View style={styles.subtitleRow}>
                <Text style={styles.subtitle}>PUSH DAY</Text>
                <View style={styles.recModule}>
                    <View style={styles.recRow}>
                        <Animated.View style={{ opacity: pulseAnim }}>
                            <Ionicons
                                name="radio-button-on"
                                size={12}
                                color="#ff3b3b"
                                style={styles.recIcon}
                            />
                        </Animated.View>
                        <Text style={styles.recText}>REC {recTime}</Text>
                    </View>
                    <Text style={styles.recDate}>01/01/1996</Text>
                </View>
            </View>

            {/* TAPE TIME REMAINING 
            <Animated.Text style={[styles.tapeRemaining, { opacity: blinkAnim }]}>
                ▓ TAPE TIME REMAINING
            </Animated.Text>
*/}
            <VHSGlowDivider></VHSGlowDivider>


        </View>
    );
};

const styles = StyleSheet.create({
    asciiDivider: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        textAlign: 'center',
        fontSize: 12,
        letterSpacing: 0,
        marginVertical: 16,
        opacity: 0.6,
    },
    container: {
        position: 'relative',
        paddingTop: 30,
        backgroundColor: 'transparent',
    },

    header: {
        color: '#BFC7D5',
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 6,
        fontFamily: 'monospace',
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },

    title: {
        color: '#BFC7D5',
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 3,
    },

    subtitle: {
        color: '#BFC7D5',
        fontSize: 22,
        fontWeight: '600',
        fontFamily: 'monospace',
        letterSpacing: 6,
    },

    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#2A2F3C',
        marginVertical: 20,
    },

    recModule: {
        backgroundColor: '#1A1F2C',
        borderColor: '#ff3b3b',
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        shadowColor: '#ff3b3b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: 12,
    },

    recRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },

    recIcon: {
        marginRight: 6,
        shadowColor: '#ff3b3b',
        shadowOpacity: 1,
        shadowRadius: 4,
    },

    recText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#FF4C4C',
        letterSpacing: 1,
        textShadowColor: '#FF4C4C',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },

    recDate: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#888888',
        opacity: 0.6,
        letterSpacing: 1,
    },

    tapeRemaining: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#AAAAAA',
        letterSpacing: 1,
        marginTop: 6,
        marginLeft: 2,
    },
});

export default VHSHeader;
