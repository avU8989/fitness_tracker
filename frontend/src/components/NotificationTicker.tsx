import React from 'react'
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';



const notifications = [
    '🔥 New PR on Bench Press!',
    '🏆 You unlocked "Consistency King" badge!',
    '💪 5 new plans added this month!',
];

export default function NotificationTicker() {
    const scrollX = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const loop = () => {
            scrollX.setValue(screenWidth);
            Animated.timing(scrollX, {
                toValue: -screenWidth,
                duration: 8000,
                useNativeDriver: true,
            }).start(() => loop());
        };
        loop();
    }, [scrollX, screenWidth]);


    return (
        <View style={styles.notificationContainer}>
            <Animated.Text
                style={[
                    styles.notificationText,
                    { transform: [{ translateX: scrollX }] },
                ]}
            >
                {notifications.join('  •  ')}
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    notificationContainer: {
        height: 30,
        overflow: 'hidden',
        marginTop: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#00ffcc',
        backgroundColor: '#0A0F1C',
        justifyContent: 'center',
    },

    notificationText: {
        fontFamily: 'monospace',
        color: '#ff4444', // bright red for attention
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 12,
        textShadowColor: '#ff4444',
        textShadowRadius: 10,
    },

});

export default NotificationTicker;
