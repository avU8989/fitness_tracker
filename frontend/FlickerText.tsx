import React, { useEffect } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface Props {
    children: React.ReactNode;
    style?: TextStyle;
}

const FlickerText: React.FC<Props> = ({ children, style }) => {
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(withTiming(0.75, { duration: 60 }), -1, true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.Text
            style={[
                {
                    textShadowColor: '#0ff',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 6,
                },
                style,
                animatedStyle,
            ]}
        >
            {children}
        </Animated.Text>
    );
};

export default FlickerText;
