import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Animated,
    ScrollView,
    FlatList,
    Alert,
    Switch,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

function GlitchTitle({ text }: { text: string }) {
    const glitchAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(glitchAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
                Animated.timing(glitchAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
                Animated.delay(1200),
                Animated.timing(glitchAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
                Animated.timing(glitchAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
                Animated.delay(1600),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <View style={styles.glitchContainer}>
            <Text style={[styles.title, { color: '#00ffcc' }]}>{text}</Text>

            <Animated.Text
                style={[
                    styles.title,
                    styles.glitchText,
                    {
                        color: '#00FFD1',
                        position: 'absolute',
                        transform: [
                            { translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                            { translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                        ],
                        opacity: glitchAnim,
                    },
                ]}
            >
                {text}
            </Animated.Text>

            <Animated.Text
                style={[
                    styles.title,
                    styles.glitchText,
                    {
                        color: '#00ffff',
                        position: 'absolute',
                        transform: [
                            { translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }) },
                            { translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
                        ],
                        opacity: glitchAnim,
                    },
                ]}
            >
                {text}
            </Animated.Text>
        </View>
    );
}

function StatBar({ label, pct }: { label: string; pct: number }) {
    const widthAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: pct,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [pct]);

    const widthInterpolate = widthAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={{ marginBottom: 10 }}>
            <Text style={styles.barLabel}>{label}</Text>
            <View style={styles.barOuter}>
                <Animated.View style={[styles.barFill, { width: widthInterpolate }]} />
                <View pointerEvents="none" style={styles.barScanlines} />
            </View>
        </View>
    );
}

function ScanlineOverlay() {
    // lightweight fake scanlines/static
    const rows = new Array(40).fill(0);
    const flicker = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(flicker, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(flicker, { toValue: 0, duration: 600, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);
    return (
        <Animated.View
            pointerEvents="none"
            style={[
                StyleSheet.absoluteFillObject,
                { opacity: flicker.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.16] }) },
            ]}
        >
            {rows.map((_, i) => (
                <View key={i} style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 6 }} />
            ))}
        </Animated.View>
    );
}

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {right}
        </View>
    );
}

export default function ProfileScreen({ navigation }) {
    const { logout } = useContext(AuthContext);
    const [darkMode, setDarkMode] = useState(true);
    const [blinkVisible, setBlinkVisible] = useState(true);

    // Mock user + avatar stats (wire to backend later)
    const [user] = useState({ username: 'IRONFIST', age: 25, weight: 85 });
    const [avatarStats] = useState({
        strength: 0.78, // 78%
        endurance: 0.62,
        willpower: 0.86,
    });

    // Mock active rival + shelf
    const [activeRival, setActiveRival] = useState({
        id: 'rx1',
        name: 'IRON MONK',
        trait: 'SQUAT MASTER',
        prGap: { squat: '+10kg' },
        streak: 14,
        conquered: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setBlinkVisible(v => !v);
        }, 600);
        return () => clearInterval(interval);
    }, []);

    const [rivals, setRivals] = useState([
        { id: '1', name: 'Iron Monk', conquered: true },
        { id: '2', name: 'Steel Widow', conquered: false },
        { id: '3', name: 'Blood Claw', conquered: true },
        { id: '4', name: 'Chain Breaker', conquered: false },
        { id: '5', name: 'Warlock Fang', conquered: true },
    ]);

    // Tower progress
    const [tower, setTower] = useState({ floor: 27, bossEvery: 10 });
    const towerPct = (tower.floor % tower.bossEvery) / tower.bossEvery;

    const handleOpenTape = () => {
        Alert.alert('📼 OPEN TAPE', 'Static bursts… New rival tape discovered!', [
            { text: 'OK' },
        ]);
        // TODO: call your /pullTape endpoint, setActiveRival(response), add to shelf
    };

    const handleConquer = () => {
        Alert.alert('FIGHT RESULT', 'You logged a stronger session. Rival CONQUERED!');
        setActiveRival((r) => ({ ...r, conquered: true }));
        setRivals((prev) =>
            prev.map((rv) => (rv.name.toUpperCase() === r.name.toUpperCase() ? { ...rv, conquered: true } : rv))
        );
    };

    // ProfileScreen component
    const getStatus = () => {
        if (!activeRival.conquered) {
            return { text: "REC • BATTLE", color: "#ff0055" }; // red pulsing during fight
        }
        if (tower.floor > 0) {
            return { text: "REC • CLIMBING", color: "#00ffcc" }; // teal when climbing tower
        }
        return { text: "REC • IDLE", color: "#888888" }; // gray if nothing happening
    };

    const status = getStatus();


    const handleLogout = () => {
        logout();
        navigation.replace('Login');
    };

    const colors = {
        background: darkMode ? '#0A0F1C' : '#f0f0f0',
        primary: darkMode ? '#ff4444' : '#007f66',
        textPrimary: darkMode ? '#00ffcc' : '#004d40',
        textSecondary: darkMode ? '#BFC7D5' : '#555',
        cardBg: darkMode ? '#111622' : '#ffffff',
        cardBorder: darkMode ? 'rgba(0, 255, 204, 0.1)' : '#007f66',
        shadowColor: darkMode ? '#ff4444' : '#007f66',
    };


    return (
        <View style={{ flex: 1, backgroundColor: '#0A0F1C' }}>
            {/* Floating Dark Mode Toggle */}
            <View style={styles.darkModeToggle}>
                <Text style={[styles.darkModeText, { color: colors.primary }]}>
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    thumbColor={darkMode ? colors.primary : '#ccc'}
                    trackColor={{ false: '#aaa', true: '#007f66' }}
                />
            </View>

            <ScrollView style={styles.root} contentContainerStyle={styles.content}>
                <ScanlineOverlay />
                {/* Dark Mode Toggle */}
                <View style={styles.recContainer}>
                    <View
                        style={[
                            styles.recDot,
                            {
                                backgroundColor: blinkVisible ? status.color : "#222",
                            },
                        ]}
                    />
                    <Text style={[styles.recText, { color: status.color }]}>{status.text}</Text>
                </View>


                {/* Header / Club banner */}
                <Text style={styles.vhsHudTitle}>▓CHANNEL 05 — YOUR JOURNEY</Text>
                <Text style={styles.vhsSubHeader}>↳ MY PROFILE ↲</Text>

                {/* Avatar + Anime stat bars */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarEmoji}>🥷</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.userMeta}>Age {user.age} • {user.weight} kg</Text>

                        <View style={{ marginTop: 8 }}>
                            <StatBar label="STRENGTH" pct={avatarStats.strength} />
                            <StatBar label="CARDIO" pct={avatarStats.endurance} />
                            <StatBar label="CONSISTENCY" pct={avatarStats.willpower} />
                        </View>
                    </View>
                </View>

                {/* Active Rival (Baki fight card) */}
                <SectionHeader
                    title="ACTIVE RIVAL"
                    right={
                        <Pressable style={styles.ghostBtn} onPress={handleOpenTape}>
                            <Text style={styles.ghostBtnText}>OPEN TAPE</Text>
                        </Pressable>
                    }
                />
                <View style={styles.rivalFightCard}>
                    <View style={styles.rivalSilhouette}>
                        <Text style={styles.rivalEmoji}>👤</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rivalNameBig}>{activeRival.name}</Text>
                        <Text style={styles.rivalTrait}>{activeRival.trait}</Text>
                        <Text style={styles.rivalMeta}>Streak: {activeRival.streak} days</Text>
                        <Text style={styles.rivalMeta}>Goal: Squat {activeRival.prGap.squat} over you</Text>

                        <View style={styles.vsBar}>
                            <Text style={styles.vsText}>YOU</Text>
                            <View style={styles.vsMeter}>
                                <View style={[styles.vsYou, { width: '55%' }]} />
                                <View style={[styles.vsRival, { width: '65%' }]} />
                            </View>
                            <Text style={styles.vsText}>RIVAL</Text>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            <Pressable
                                style={[styles.actionBtn, { backgroundColor: activeRival.conquered ? '#1f3a2e' : '#0E1F2A' }]}
                                onPress={activeRival.conquered ? undefined : handleConquer}
                            >
                                <Text style={styles.actionBtnText}>
                                    {activeRival.conquered ? 'CONQUERED' : 'MARK AS CONQUERED'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Tower Progress */}
                <SectionHeader title="TOWER PROGRESS" />
                <View style={styles.towerCard}>
                    <Text style={styles.towerText}>Floor {tower.floor} / 100</Text>
                    <Text style={styles.towerSub}>Next Boss at Floor {Math.ceil((tower.floor + (tower.bossEvery - (tower.floor % tower.bossEvery))) || tower.bossEvery)}</Text>
                    <View style={styles.progressOuter}>
                        <View style={[styles.progressInner, { width: `${towerPct * 100}%` }]} />
                    </View>
                </View>

                {/* Tape Collection (VHS shelf grid) */}
                <SectionHeader title="TAPE COLLECTION" />
                <FlatList
                    data={rivals}
                    numColumns={3}
                    keyExtractor={(item) => item.id}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ paddingTop: 6 }}
                    renderItem={({ item }) => (
                        <View style={[styles.tapeCard, !item.conquered && { opacity: 0.5 }]}>
                            <Text style={styles.tapeTitle}>{item.name.toUpperCase()}</Text>
                            <Text style={styles.tapeTag}>{item.conquered ? 'CONQUERED' : 'UNCONQUERED'}</Text>
                            <View style={styles.tapeBorderTop} />
                            <View style={styles.tapeBorderBottom} />
                        </View>
                    )}
                    scrollEnabled={false} // <-- important for now its a mockup anyways gacha system comes later
                />

                {/* Bottom actions */}
                <View style={{ marginTop: 18 }}>
                    <Pressable style={styles.primaryBtn} onPress={handleOpenTape}>
                        <Text style={styles.primaryBtnText}>📼 OPEN TAPE</Text>
                    </Pressable>

                    <Pressable style={[styles.primaryBtn, { backgroundColor: '#ff4444' }]} onPress={handleLogout}>
                        <Text style={styles.primaryBtnText}>LOG OUT</Text>
                    </Pressable>

                    <Pressable style={[styles.ghostBtn, { alignSelf: 'center', marginTop: 10 }]} onPress={() => navigation.navigate('Setup')}>
                        <Text style={styles.ghostBtnText}>EDIT SETUP</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({

    darkModeToggle: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100,
    },
    darkModeText: {
        fontFamily: 'monospace',
        fontSize: 12,
        marginRight: 8,
    },

    vhsSubHeader: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 20,
        marginTop: 10,
        marginBottom: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.6,
        alignSelf: 'center',

    },
    recContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        alignSelf: 'center',
    },
    recDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff0055',
        marginRight: 10,
        shadowColor: '#ff0055',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
    },
    recText: {
        color: '#ff0055',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: '#ff0055',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },

    root: { flex: 1, backgroundColor: '#0A0F1C' },
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

    content: {
        padding: 20,
    },


    subtitle: {
        fontFamily: 'monospace',
        fontSize: 14,
        letterSpacing: 3,
        marginTop: 6,
        opacity: 0.7,
    },

    container: { paddingHorizontal: 18, paddingTop: 10 },

    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },

    hudRow: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hudLeft: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        letterSpacing: 2,
        fontSize: 12,
        backgroundColor: 'rgba(0,255,204,0.08)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#00ffcc',
    },
    glitchContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginBottom: 18,
    },
    title: {
        fontSize: 38,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 6,
        textAlign: 'center',
    },
    glitchText: {
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },

    avatarCard: {
        flexDirection: 'row',
        backgroundColor: '#0E1422',
        borderWidth: 1,
        borderColor: 'rgba(0,255,204,0.2)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    avatarCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 3,
        borderColor: '#00ffcc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        backgroundColor: 'rgba(0,255,204,0.05)',
    },
    avatarEmoji: { fontSize: 40 },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        color: '#00ffcc',
        letterSpacing: 3,
    },
    userMeta: { color: '#BFC7D5', fontFamily: 'monospace', marginTop: 2 },

    barLabel: {
        color: '#8de7da',
        fontFamily: 'monospace',
        letterSpacing: 2,
        fontSize: 12,
        marginBottom: 4,
    },
    barOuter: {
        height: 16,
        backgroundColor: '#0A111F',
        borderColor: '#00ffcc',
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#00ffcc',
        shadowColor: '#00ffcc',
        shadowRadius: 8,
        shadowOpacity: 0.8,
    },
    barScanlines: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    sectionHeader: {
        marginTop: 12,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#00ffcc',
        letterSpacing: 2,
    },

    ghostBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#00ffcc',
        borderRadius: 8,
        backgroundColor: 'rgba(0,255,204,0.06)',
    },
    ghostBtnText: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        letterSpacing: 2,
        fontSize: 12,
    },

    rivalFightCard: {
        flexDirection: 'row',
        backgroundColor: '#0E1422',
        borderWidth: 1,
        borderColor: 'rgba(255,68,68,0.25)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#ff4444',
        shadowRadius: 8,
        shadowOpacity: 0.5,
    },
    rivalSilhouette: {
        width: 84, height: 84, borderRadius: 10,
        backgroundColor: 'rgba(255,68,68,0.08)',
        borderWidth: 1, borderColor: 'rgba(255,68,68,0.4)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    rivalEmoji: { fontSize: 34, color: '#ff6666' },
    rivalNameBig: {
        color: '#ff6666',
        fontFamily: 'monospace',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    rivalTrait: { color: '#BFC7D5', fontFamily: 'monospace', marginTop: 2 },
    rivalMeta: { color: '#8da3b5', fontFamily: 'monospace', marginTop: 2 },

    vsBar: { marginTop: 10 },
    vsText: { color: '#BFC7D5', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 },
    vsMeter: {
        height: 14,
        marginVertical: 6,
        backgroundColor: '#0A111F',
        borderWidth: 1,
        borderColor: 'rgba(255,68,68,0.35)',
        borderRadius: 10,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    vsYou: { backgroundColor: '#00ffcc', height: '100%' },
    vsRival: { backgroundColor: 'rgba(255,68,68,0.6)', height: '100%', marginLeft: 'auto' },

    towerCard: {
        backgroundColor: '#0E1422',
        borderWidth: 1,
        borderColor: 'rgba(0,255,204,0.2)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    towerText: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    towerSub: { color: '#BFC7D5', fontFamily: 'monospace', marginTop: 4 },
    progressOuter: {
        height: 12,
        backgroundColor: '#0A111F',
        borderColor: '#00ffcc',
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 8,
    },
    progressInner: {
        height: '100%',
        backgroundColor: '#00ffcc',
    },

    tapeCard: {
        width: '31%',
        aspectRatio: 1.1,
        backgroundColor: '#111622',
        borderWidth: 1,
        borderColor: 'rgba(0,255,204,0.18)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    tapeTitle: {
        color: '#cdece7',
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: 1,
    },
    tapeTag: {
        color: '#ff6666',
        fontFamily: 'monospace',
        fontSize: 10,
        alignSelf: 'flex-end',
    },
    tapeBorderTop: {
        position: 'absolute',
        left: 0, right: 0, top: 0, height: 3, backgroundColor: 'rgba(0,255,204,0.18)',
    },
    tapeBorderBottom: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0, height: 3, backgroundColor: 'rgba(255,68,68,0.18)',
    },

    primaryBtn: {
        backgroundColor: '#00ffff',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    primaryBtnText: {
        color: '#0a0f1c',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    actionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    actionBtnText: {
        color: '#cdece7',
        fontFamily: 'monospace',
        letterSpacing: 2,
        fontSize: 12,
    },
});
