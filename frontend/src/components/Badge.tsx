import { View, Text } from "react-native";
import { StyleSheet } from "react-native";

const badges = [
    { id: '1', label: 'Consistency King', color: '#00ffcc', icon: '✓' },
    { id: '2', label: 'Volume Master', color: '#ff0055', icon: '💪' },
    { id: '3', label: 'PR Breaker', color: '#ffaa00', icon: '🔥' },
];

export default function Badge({ label, color, icon }) {
    return (
        <View style={[styles.badge, { borderColor: color }]}>
            <Text style={[styles.badgeIcon, { color }]}>{icon}</Text>
            <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badgesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    badge: {
        borderWidth: 2,
        borderRadius: 30,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        width: 100,
    },
    badgeIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'monospace',
        textShadowColor: 'rgba(0, 255, 204, 0.8)',
        textShadowRadius: 4,
    },
    badgeLabel: {
        fontSize: 10,
        fontFamily: 'monospace',
        letterSpacing: 1,
        textAlign: 'center',
    },
});
