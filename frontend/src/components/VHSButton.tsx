import React, { useState } from 'react';
import { Pressable, StyleSheet, Animated, Easing } from 'react-native';

export default function VHSButton({ onPress, title }) {
    const [pressed, setPressed] = useState(false);
    const glowAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, [glowAnim]);

    const glowInterpolate = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#00ffcc', '#33ffdd'],
    });

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[
                styles.button,
                pressed && styles.buttonPressed, // Apply pressed style when pressed
            ]}
        >
            <Animated.Text
                style={[
                    styles.text,
                    { textShadowColor: glowInterpolate, textShadowRadius: 12 },
                ]}
            >
                {title.toUpperCase()}
            </Animated.Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderColor: '#00ffcc',
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 28,
        backgroundColor: '#0A0F1C',
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        marginHorizontal: 30,
    },
    buttonPressed: {
        backgroundColor: '#00ffcc', // Brighter background when pressed
    },
    text: {
        fontFamily: 'monospace',
        color: '#00ffcc',
        fontSize: 16,
        letterSpacing: 3,
        fontWeight: 'bold',
        textShadowOffset: { width: 0, height: 0 },
    },
});
