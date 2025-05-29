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
                    source={require('./assets/test6.jpg')}
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
        fontSize: 23,
        fontFamily: 'Anton_400Regular',
        color: 'black',
    },
    glowText: {
        position: 'absolute',
        fontSize: 23,
        fontFamily: 'Anton_400Regular',
        color: 'rgba(254, 252, 237, 0.6)', // faint base color
        textAlign: 'center',
        textShadowColor: 'rgba(12, 202, 255, 0.5)', // soft glow color
        textShadowOffset: { width: 0, height: 0 }, // centered glow
        textShadowRadius: 8, // higher = blurrier
        zIndex: 1,
    },

});
