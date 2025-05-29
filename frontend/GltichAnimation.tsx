// src/components/GlitchAnimation.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withRepeat,
} from 'react-native-reanimated';

interface GlitchTextProps {
    children: string;
    textStyle?: TextStyle | TextStyle[];
}

export const GlitchText: React.FC<GlitchTextProps> = ({ children, textStyle }) => {
    const offset = useSharedValue(0);

    useEffect(() => {
        // Animate offset between -5 and +5
        offset.value = withRepeat(
            withSequence(
                withTiming(5, { duration: 50 }),
                withTiming(-5, { duration: 50 }),
                withTiming(0, { duration: 100 })
            ),
            -1,
            true
        );
    }, []);

    const animatedBlue = useAnimatedStyle(() => ({
        transform: [{ translateX: offset.value }],
    }));

    const animatedRed = useAnimatedStyle(() => ({
        transform: [{ translateX: -offset.value }],
    }));

    return (
        <View style={styles.glitchContainer}>
            {/* Blue channel */}
            <Animated.Text style={[textStyle, styles.layer, styles.blue, animatedBlue]}>
                {children}
            </Animated.Text>

            {/* Red channel */}
            <Animated.Text style={[textStyle, styles.layer, styles.red, animatedRed]}>
                {children}
            </Animated.Text>

            {/* Main white layer */}
            <Text style={[textStyle, styles.layer, styles.main]}>{children}</Text>
        </View>
    );
};

const GlitchAnimation: React.FC = () => {
    return (
        <View style={styles.screen}>
            <GlitchText textStyle={styles.title}>WORKOUT STATS</GlitchText>
        </View>
    );
};

export default GlitchAnimation;

interface Styles {
    screen: ViewStyle;
    glitchContainer: ViewStyle;
    title: TextStyle;
    subtitle: TextStyle;
    layer: TextStyle;
    blue: TextStyle;
    red: TextStyle;
    main: TextStyle;
}

const styles = StyleSheet.create<Styles>({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    glitchContainer: {
        position: 'relative',
    },
    title: {
        fontSize: 20,
        fontFamily: 'Anton_400Regular',
        textShadowColor: '#0ff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'IBMPlexMono_400Regular',
        color: '#aaa',
    },
    layer: {
        position: 'absolute',
    },
    blue: {
        color: '#0ff',
        opacity: 0.7,
    },
    red: {
        color: '#f0f',
        opacity: 0.7,
    },
    main: {
        color: '#fff',
    },
});
