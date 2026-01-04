import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

type TileSize = 'hero' | 'tall' | 'short';

const HEIGHTS = {
    hero: 280,
    tall: 220,
    short: 140,
};

interface Props {
    size: TileSize;
    label: string;
    value: string;
    subtext?: string;
    accent: string;
    onPress?: () => void;
}

export default function GainsTile({
    size,
    label,
    value,
    subtext,
    accent,
    onPress,
}: Props) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.tile,
                {
                    height: HEIGHTS[size],
                    width: size === 'hero' ? '100%' : '48%',
                    borderColor: accent,
                    shadowColor: accent,
                },
            ]}
        >
            <Text style={[styles.label, { color: accent }]}>
                {label}
            </Text>

            <Text style={[styles.value, { color: accent }]}>
                {value}
            </Text>

            {subtext && (
                <Text style={styles.subtext}>
                    {subtext}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        backgroundColor: '#111622',
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        justifyContent: 'space-between',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
    },
    label: {
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 2,
    },
    value: {
        fontFamily: 'monospace',
        fontSize: 34,
        fontWeight: 'bold',
        letterSpacing: 3,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtext: {
        fontFamily: 'monospace',
        fontSize: 12,
        opacity: 0.7,
        letterSpacing: 1.5,
        color: '#BFC7D5',
    },
});
