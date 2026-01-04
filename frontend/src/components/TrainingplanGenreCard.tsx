import React from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable } from "react-native";

type Props = {
    title: string;
    subtitle: string;
    image: any;
    onPress: () => void;
};

export default function DiscoverGenreCard({
    title,
    subtitle,
    image,
    onPress,
}: Props) {
    return (
        <Pressable onPress={onPress} style={styles.wrapper}>
            <ImageBackground
                source={image}
                resizeMode="cover"
                style={styles.card}
                imageStyle={styles.image}
            >
                <View style={styles.overlay} />

                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </ImageBackground>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginRight: 16,
    },
    card: {
        width: 280,
        height: 160,
        borderRadius: 16,
        overflow: "hidden",
        justifyContent: "flex-end",
        backgroundColor: "#111622",
        shadowColor: "#00ffcc",
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    image: {
        borderRadius: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(10,15,28,0.55)",
    },
    content: {
        paddingHorizontal: 18,
        paddingVertical: 20,
    },
    title: {
        fontFamily: "monospace",
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        letterSpacing: 2,
        textShadowColor: "white",
        textShadowRadius: 3,
    },
    subtitle: {
        fontFamily: "monospace",
        fontSize: 11,
        color: "#BFC7D5",
        letterSpacing: 1,
        marginTop: 4,
        opacity: 0.85,
    },
    cta: {
        marginTop: 10,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: "#00ffcc",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: "rgba(0,255,204,0.1)",
    },
    ctaText: {
        fontFamily: "monospace",
        fontSize: 11,
        color: "#00ffcc",
        letterSpacing: 2,
    },
});
