import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';

const Ticker = () => {
    const screenWidth = Dimensions.get('window').width;
    const animation = useRef(new Animated.Value(screenWidth)).current;

    useEffect(() => {
        const loopAnimation = () => {
            animation.setValue(screenWidth);
            Animated.timing(animation, {
                toValue: -screenWidth,
                duration: 9000,
                useNativeDriver: true,
            }).start(() => loopAnimation());
        };

        loopAnimation();
    }, [animation]);

    return (
        <View style={styles.tickerContainer}>
            <Animated.Text
                style={[
                    styles.tickerText,
                    { transform: [{ translateX: animation }] },
                ]}
            >
                ›› NO PAIN // NO REWIND // STAY STRONG // ‹‹
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tickerContainer: {
        overflow: 'hidden',
        height: 40,
        justifyContent: 'center',
        backgroundColor: 'rgba(10, 15, 28, 0.85)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#00ffcc',  // keep aqua border
        marginVertical: 12,
    },
    tickerText: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#ff0033',  // bright red neon text
        letterSpacing: 3,
        textShadowColor: '#ff0033CC',  // red glow
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        width: Dimensions.get('window').width * 2,
    },
});

export default Ticker;
