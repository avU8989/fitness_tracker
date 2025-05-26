// src/components/VHSHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VHSHeader = () => {
    const stats = {
        exercisesLogged: 6,
        volume: 500,
        duration: '01:15:43',
    };

    return (
        <View style={styles.container}>
            {/* Top Row: Title + REC */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>TODAY’S GRIND</Text>
                <View style={styles.recBox}>
                    <View style={styles.recRow}>
                        <View style={styles.recDot} />
                        <Text style={styles.recText}>REC 00:00:00</Text>
                    </View>
                    <Text style={styles.recText}>01/01/1996</Text>
                </View>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>PUSH DAY</Text>

            {/* Stats */}
            <View style={styles.overviewRow}>
                <Text style={styles.overviewText}>● {stats.exercisesLogged} Exercises Logged</Text>
                <Text style={styles.overviewText}>● Volume: {stats.volume} KG</Text>
                <Text style={styles.overviewText}>● Duration: {stats.duration}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',   // <— allow its children to be absolutely positioned
        paddingTop: 50,
        paddingHorizontal: 8,
        backgroundColor: 'transparent',
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    title: {
        fontFamily: 'Anton_400Regular',
        fontSize: 33,
        color: '#FFFFFF',
        letterSpacing: 3,
        textShadowColor: '#B86BFF',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },

    recBox: {
        position: 'absolute',    // <— remove from normal flow
        top: 15,                 // tweak this until it sits just beneath your title
        right: 0,
        alignItems: 'flex-end',
    },

    recRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    recDot: {
        width: 8,
        height: 8,
        backgroundColor: 'red',
        borderRadius: 4,
        marginRight: 6,
        shadowColor: 'red',
        shadowOpacity: 0.9,
        shadowRadius: 4,
    },

    recText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 12,
        color: '#FFF',
        textAlign: 'right',
    },

    subtitle: {
        fontFamily: 'Anton_400Regular',
        fontSize: 38,
        color: '#FFFFFF',
        letterSpacing: 3,
        textShadowColor: '#B86BFF',
        textShadowOffset: { width: 1, height: 1 },
        marginTop: -10,
        textShadowRadius: 6,
    },

    overviewRow: {
        marginVertical: 0,
    },

    overviewText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 14,
        color: '#FFF',
        marginVertical: 2,
    },
});

export default VHSHeader;
