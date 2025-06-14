// src/components/VHSHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ImageTitleText from '../ImageTitleText';
const VHSHeader = () => {
    const stats = {
        exercisesLogged: 6,
        volume: 500,
        duration: '01:15:43',
    };

    return (
        <View style={styles.container}>
            {/* Top Row: Title + REC */}
            <Text style={styles.header}>HARDLOGGER</Text>

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
            <View style={styles.divider} />


        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',   // <— allow its children to be absolutely positioned
        paddingTop: 40,
        backgroundColor: 'transparent',
    },

    headerRow: {
        paddingLeft: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#2A2F3C',
        marginVertical: 20,
    },


    title: {
        color: '#BFC7D5',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 3,
    },

    header: {
        color: '#BFC7D5',
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 6,

        fontFamily: 'monospace',
    },

    recBox: {
        position: 'absolute',    // <— remove from normal flow
        top: 10,                 // tweak this until it sits just beneath your title
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
        shadowOpacity: 1,
        shadowRadius: 4,
        textShadowColor: '#F5F5F5',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 30,
    },

    recText: {
        fontFamily: 'mono',
        fontSize: 12,
        color: '#BFC7D5',
        textAlign: 'right',
    },

    subtitle: {
        color: '#BFC7D5',
        fontSize: 26,
        fontWeight: 'semibold',
        fontFamily: 'monospace',
        letterSpacing: 3,
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
