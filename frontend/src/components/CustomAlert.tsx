import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';

export default function CustomAlert({ visible, message, onClose }) {
    const glitchAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glitchAnim, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.linear }),
                    Animated.timing(glitchAnim, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.linear }),
                    Animated.timing(glitchAnim, { toValue: 1, duration: 150, useNativeDriver: true, easing: Easing.linear }),
                    Animated.timing(glitchAnim, { toValue: 0, duration: 150, useNativeDriver: true, easing: Easing.linear }),
                    Animated.delay(2000),
                ])
            ).start();
        } else {
            glitchAnim.stopAnimation();
            glitchAnim.setValue(0);
        }
    }, [visible]);

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <View style={styles.glitchContainer}>
                        <Text style={[styles.message, { color: '#00ffcc' }]}>NOTICE</Text>

                        <Animated.Text
                            style={[
                                styles.message,
                                styles.glitchText,
                                {
                                    color: '#00FFD1',
                                    position: 'absolute',
                                    transform: [
                                        { translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                                        { translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                                    ],
                                    opacity: glitchAnim,
                                },
                            ]}
                        >
                            NOTICE
                        </Animated.Text>

                        <Animated.Text
                            style={[
                                styles.message,
                                styles.glitchText,
                                {
                                    color: '#00ffff',
                                    position: 'absolute',
                                    transform: [
                                        { translateX: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }) },
                                        { translateY: glitchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
                                    ],
                                    opacity: glitchAnim,
                                },
                            ]}
                        >
                            NOTICE
                        </Animated.Text>
                    </View>

                    <Text style={styles.content}>{message}</Text>

                    <Pressable style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>ACKNOWLEDGE</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(10,15,28,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        backgroundColor: '#0A0F1C',
        borderColor: '#00ffcc',
        borderWidth: 2,
        borderRadius: 12,
        padding: 24,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#00ffcc',
        shadowOpacity: 0.9,
        shadowRadius: 10,
    },
    glitchContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    message: {
        fontFamily: 'monospace',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 6,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    glitchText: {
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    content: {
        fontFamily: 'monospace',
        fontSize: 16,
        color: '#BFC7D5',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#00ffff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    buttonText: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 16,
        color: '#0A0F1C',
    },
});
