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
            {/* Glow Text Behind */}
            <Text style={[styles.glowText, textStyle]}>{children}</Text>

            {/* Image-filled masked text */}
            <MaskedView
                style={styles.maskedView}
                maskElement={
                    <View style={styles.maskWrapper}>
                        <Text style={[styles.maskedText, textStyle]}>{children}</Text>
                    </View>
                }
            >
                {/* 1. Solid color */}
                <View style={{ flex: 1, backgroundColor: '#f5f5f5' }} />

                {/* 2. Texture overlay */}
                <Image
                    source={require('./assets/black-glitch-effect-texture-background.jpg')}
                    style={[StyleSheet.absoluteFillObject, { opacity: 1 }]}
                />

                {/* 3. Optional tint */}
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
    },
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    maskedView: {
        ...StyleSheet.absoluteFillObject,
    },
    maskWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    maskedText: {
        fontSize: 36,
        fontFamily: 'Anton_400Regular',
        letterSpacing: 3,
        color: 'black',
    },
    glowText: {
        position: 'absolute',
        fontSize: 36,
        paddingTop: 14,
        letterSpacing: 3,
        fontFamily: 'Anton_400Regular',
        color: 'rgba(255, 255, 255, 0.45)', // faint base color
        textAlign: 'center',
        textShadowColor: 'rgb(66, 156, 239)', // soft glow color
        textShadowOffset: { width: 0, height: 0 }, // centered glow
        textShadowRadius: 20, // higher = blurrier
        zIndex: 1,
    },

});
