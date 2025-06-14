import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';


const Ticker = () => {
    const screenWidth = Dimensions.get('window').width;
    const animation = useRef(new Animated.Value(-screenWidth)).current;

    useEffect(() => {
        const loopAnimation = () => {
            animation.setValue(screenWidth);
            Animated.timing(animation, {
                toValue: -screenWidth,
                duration: 8888,
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
}

const styles = StyleSheet.create({
    tickerContainer: {
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center',
        backgroundColor: 'transparent', // or styled background
    },
    tickerText: {
        fontFamily: 'PressStart2P_400Regular',
        fontSize: 12,
        color: '#FFF',
        letterSpacing: 1.5,
        textAlign: 'left',
        width: Dimensions.get('window').width * 2, // 200% of screen
    },

});

export default Ticker;

