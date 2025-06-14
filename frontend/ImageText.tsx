import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';

type ImageTextProps = {
    children: string;
    textStyle?: object;
};

export default function ImageText({ children, textStyle }: ImageTextProps) {
    return (
        <View style={styles.wrapper}>
            {/* Glow text AND mask text use same layout and styles */}
            <View style={styles.textWrapper}>
                <Text style={[styles.glowText, textStyle]}>{children}</Text>
            </View>

            <MaskedView
                style={styles.maskedView}
                maskElement={
                    <View style={styles.textWrapper}>
                        <Text style={[styles.maskedText, textStyle]}>{children}</Text>
                    </View>
                }
            >
                <View style={{ flex: 1, backgroundColor: '#f5f5f5' }} />

                <Image
                    source={require('./assets/test6.jpg')}
                    style={[StyleSheet.absoluteFillObject, { opacity: 1 }]}
                />

                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        { backgroundColor: '#00ffcc', opacity: 0.1 },
                    ]}
                />
            </MaskedView>
        </View>
    );
}


const styles = StyleSheet.create({
    wrapper: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align to the left
        position: 'relative',
    },
    textWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start', // Left-align text in wrapper
    },
    maskedView: {
        ...StyleSheet.absoluteFillObject,
    },
    maskedText: {
        fontSize: 36,
        fontFamily: 'Anton_400Regular',
        textAlign: 'left', // Left-align text content
        color: 'white',
        letterSpacing: 8, // 👈 Add this
    },
    glowText: {
        fontSize: 36,
        fontFamily: 'Anton_400Regular',
        color: 'rgba(254, 252, 237, 0.6)',
        textAlign: 'left',
        textShadowColor: 'rgb(12, 198, 255)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        letterSpacing: 8, // 👈 Add this too
    },
});

