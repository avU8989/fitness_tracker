import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function Stopwatch() {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [isCountdown, setCountdown] = useState(false);
    const [initialTime, setInitialTime] = useState(0);

    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    let progress = 0;
    if (isCountdown) {
        progress = initialTime === 0 ? 0 : time / initialTime;
    } else {
        progress = (time % 60) / 60;
    }

    const formatted = new Date(time * 1000).toISOString().substring(14, 19);

    /** WHEEL CONFIG */
    const ITEM_HEIGHT = 50;
    const TOP_PAD = ITEM_HEIGHT;
    const HIGHLIGHT_TOP = 50;
    const HIGHLIGHT_HEIGHT = 50;
    const HIGHLIGHT_CENTER = HIGHLIGHT_TOP + HIGHLIGHT_HEIGHT / 2;

    const wheelItems = [...Array(60).keys()];

    const minuteRef = useRef<ScrollView | null>(null);
    const secondRef = useRef<ScrollView | null>(null);

    /** Helper: convert scroll position → index */
    const getIndexFromScroll = (scrollY: number) => {
        const centerOffset = scrollY + HIGHLIGHT_CENTER;
        const index = Math.round((centerOffset - TOP_PAD) / ITEM_HEIGHT);
        return Math.max(0, Math.min(59, index));
    };

    /** Helper: scroll to index programmatically */
    const scrollToIndex = (ref: React.RefObject<ScrollView | null>, index: number) => {
        ref.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
        });
    };

    /** When modal opens — reset wheels to stored minutes/seconds */
    useEffect(() => {
        if (showPicker) {
            requestAnimationFrame(() => {
                scrollToIndex(minuteRef, minutes);
                scrollToIndex(secondRef, seconds);
            });
        }
    }, [showPicker]);

    /** TIMER LOGIC */
    const start = () => {
        if (running) return;
        setRunning(true);
        intervalRef.current = setInterval(() => {
            setTime((t) => {
                if (isCountdown) {
                    if (t <= 1) {
                        clearInterval(intervalRef.current as NodeJS.Timeout);
                        setRunning(false);
                        return 0;
                    }
                    return t - 1;
                }
                return t + 1;
            });
        }, 1000);
    };

    const stop = () => {
        setRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const reset = () => {
        stop();
        setCountdown(false);
        setTime(0);
        setMinutes(0);
        setSeconds(0);
    };

    const applyPicker = () => {
        const newT = minutes * 60 + seconds;

        setInitialTime(newT);
        setCountdown(true);
        setShowPicker(false);

        requestAnimationFrame(() => {
            setTime(newT);
        });
    };

    return (
        <View style={styles.wrapper}>
            {/* RING DISPLAY */}
            <Pressable onPress={() => setShowPicker(true)} style={styles.pressArea}>
                <Svg width="180" height="180">
                    <Circle cx="90" cy="90" r={radius} stroke="#1c2a37" strokeWidth="8" fill="none" />
                    <Circle
                        cx="90"
                        cy="90"
                        r={radius}
                        stroke="#00ffcc"
                        strokeWidth="8"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={circumference - circumference * progress}
                        strokeLinecap="round"
                        fill="none"
                        rotation="-90"
                        origin="90,90"
                    />
                </Svg>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formatted}</Text>
                </View>
            </Pressable>

            {/* CONTROLS */}
            {/* CONTROLS */}
            <View style={styles.btnRow}>
                {!running ? (
                    <Pressable style={styles.btn} onPress={start}>
                        <Text style={styles.btnText}>▶ START</Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.btn} onPress={stop}>
                        <Text style={styles.btnText}>▌▌ STOP</Text>
                    </Pressable>
                )}

                <Pressable style={[styles.btn, styles.resetBtn]} onPress={reset}>
                    <Text style={styles.resetText}>■ RESET</Text>
                </Pressable>
            </View>


            {/* PICKER MODAL */}
            <Modal transparent visible={showPicker} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>MIN</Text>
                            <Text style={styles.labelText}>SEC</Text>
                        </View>

                        <View style={styles.wheelCard}>
                            {/* MINUTES */}
                            <View style={styles.wheelColumn}>
                                <ScrollView
                                    ref={minuteRef}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    showsVerticalScrollIndicator={false}
                                    onMomentumScrollEnd={(e) =>
                                        setMinutes(getIndexFromScroll(e.nativeEvent.contentOffset.y))
                                    }
                                >
                                    <View style={{ height: TOP_PAD }} />
                                    {wheelItems.map((num) => (
                                        <View key={num} style={styles.wheelItem}>
                                            <Text style={styles.wheelText}>
                                                {String(num).padStart(2, "0")}
                                            </Text>
                                        </View>
                                    ))}
                                    <View style={{ height: TOP_PAD }} />
                                </ScrollView>
                            </View>

                            {/* COLON */}
                            <View style={styles.colonContainer}>
                                <Text style={styles.colonText}>:</Text>
                            </View>

                            {/* SECONDS */}
                            <View style={styles.wheelColumn}>
                                <ScrollView
                                    ref={secondRef}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    showsVerticalScrollIndicator={false}
                                    onMomentumScrollEnd={(e) =>
                                        setSeconds(getIndexFromScroll(e.nativeEvent.contentOffset.y))
                                    }
                                >
                                    <View style={{ height: TOP_PAD }} />
                                    {wheelItems.map((num) => (
                                        <View key={num} style={styles.wheelItem}>
                                            <Text style={styles.wheelText}>
                                                {String(num).padStart(2, "0")}
                                            </Text>
                                        </View>
                                    ))}
                                    <View style={{ height: TOP_PAD }} />
                                </ScrollView>
                            </View>

                            {/* HIGHLIGHT BAR */}
                            <View pointerEvents="none" style={styles.highlightAcross} />
                        </View>

                        <View style={styles.btnRow}>
                            <Pressable style={styles.setBtn} onPress={applyPicker}>
                                <Text style={styles.setBtnText}>■ SET TIMER</Text>
                            </Pressable>

                            <Pressable style={styles.cancelBtn} onPress={() => setShowPicker(false)}>
                                <Text style={styles.cancelText}>■ CANCEL</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wheelsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },

    labelRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 70,
        marginBottom: 5,
    },

    labelText: {
        color: "#7ACFCF",
        fontFamily: "monospace",
        fontSize: 14,
        letterSpacing: 2,
        textAlign: "center",
        opacity: 0.8,
    },

    colonContainer: {
        width: 20,
        justifyContent: "center",
        alignItems: "center",
    },

    colonText: {
        color: "#00ffcc",
        fontSize: 28,
        fontFamily: "monospace",
    },

    highlightAcross: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 50,
        top: 50,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#00ffcc",
        opacity: 0.8,
    },

    wheelCard: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 150,
        borderWidth: 1,
        borderColor: "#00ffcc55",
        borderRadius: 10,
        backgroundColor: "#0A0F1C",
        position: "relative",
        marginBottom: 20,
    },


    wheelColumn: {
        width: 70,
        alignItems: "center",
    },

    wheelItem: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },

    wheelText: {
        color: "#00ffcc",
        fontSize: 24,
        fontFamily: "monospace",
    },

    wrapper: {
        alignItems: "center",
    },

    pressArea: { alignItems: "center" },

    timeContainer: {
        position: "absolute",
        top: 75,
    },

    timeText: {
        fontFamily: "monospace",
        fontSize: 30,
        fontWeight: "bold",
        color: "white",
    },

    btnRow: {
        flexDirection: "row",
        marginTop: 6,
        gap: 12,
    },

    btn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#00ffcc55",
        borderRadius: 6,
        backgroundColor: "rgba(0,255,204,0.08)",
    },

    btnText: {
        color: "#00ffcc",
        fontFamily: "monospace",
        letterSpacing: 2,
    },

    resetBtn: {
        borderColor: "#ff4444aa",
    },

    resetText: {
        color: "#ff4444",
        fontFamily: "monospace",
        letterSpacing: 2,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "#000000aa",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContent: {
        width: "80%",
        backgroundColor: "#111622",
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#00ffcc55",
    },

    modalTitle: {
        fontSize: 16,
        color: "#00ffcc",
        fontFamily: "monospace",
        textAlign: "center",
        marginBottom: 10,
        letterSpacing: 2,
    },

    setBtn: {
        backgroundColor: '#00ffcc',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#00ffcc',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        flex: 1,
    },

    cancelBtn: {
        backgroundColor: "rgba(0,255,204,0.08)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#00ffcc33",
        flex: 1,
    },

    setBtnText: {
        color: '#0A0F1C',
        fontFamily: 'monospace',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 1,
    },

    cancelText: {
        color: "#7ACFCF",
        fontFamily: "monospace",
        fontSize: 13,
        letterSpacing: 1,
        opacity: 0.9,
    },

});
