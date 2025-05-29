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
                        <Text style={styles.statText}>REC 00:00:00</Text>
                    </View>
                    <Text style={styles.statText}>01/01/1996</Text>
                </View>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>PUSH DAY</Text>

            {/* Stats */}
            <View style={styles.overviewRow}>
                <Text style={styles.statText}>● {stats.exercisesLogged} Exercises Logged</Text>
                <Text style={styles.statText}>● Volume: {stats.volume} KG</Text>
                <Text style={styles.statText}>● Duration: {stats.duration}</Text>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',   // <— allow its children to be absolutely positioned
        paddingHorizontal: 8,
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },


    title: {
        fontFamily: 'Anton_400Regular',
        fontSize: 36,
        color: '#FFFFFF',
        letterSpacing: 3,
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
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
        fontFamily: 'Anton_400Regular',
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'right',
    },

    subtitle: {
        fontFamily: 'Anton_400Regular',
        fontSize: 38,
        color: '#FFFFFF',
        letterSpacing: 3,
        textShadowColor: '#B86BFF',
        textShadowOffset: { width: 0, height: 1 },
        marginTop: -10,
        textShadowRadius: 16,
    },

    overviewRow: {
        marginVertical: 0,
    },
    statText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 15,
        color: '#FFFFFF',
    },

    overviewText: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 14,
        color: '#FFF',
        marginVertical: 2,
    },
    vhsText: {
        fontFamily: 'Anton_400Regular',
        fontSize: 36,
        color: '#FFF',
        letterSpacing: 3,
        textShadowColor: '#B86BFF', // purplish VHS glow
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },

});

export default VHSHeader;
