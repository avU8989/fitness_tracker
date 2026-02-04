import React from 'react'
import { Image, StyleSheet } from 'react-native'

const VHSGlowDividerSmall = () => {
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
        height: 18,
        resizeMode: 'contain',
        alignSelf: 'center',
        opacity: 0.2,
    }
})

export default VHSGlowDividerSmall;