import React from 'react'
import { Image, StyleSheet } from 'react-native'

const VHSGlowDivider = () => {
    return (
        <Image
            source={require('../assets/ChatGPT Image fdsf16_37_14.png')}
            style={stylse.divider}
        />
    );
};

const stylse = StyleSheet.create({
    divider: {
        width: '120%',
        height: 50,
        resizeMode: 'contain',
        alignSelf: 'center',
        opacity: 0.1,
    }
})

export default VHSGlowDivider;