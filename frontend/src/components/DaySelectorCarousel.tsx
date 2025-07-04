import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    Dimensions,
    ListRenderItemInfo,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 100;
const ITEM_MARGIN = 8;

export type SplitDay = {
    day: string;
    type: string;
};

type DaySelectorCarouselProps = {
    splitDays: SplitDay[];
    onDaySelect: (day: SplitDay) => void;
};

export default function DaySelectorCarousel({
    splitDays,
    onDaySelect,
}: DaySelectorCarouselProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const flatListRef = useRef<FlatList<SplitDay>>(null);

    useEffect(() => {
        // Initially center first item & notify parent
        flatListRef.current?.scrollToIndex({
            index: selectedIndex,
            animated: false,
            viewPosition: 0.5,
        });
        onDaySelect(splitDays[selectedIndex]);
    }, []);

    const handlePress = (index: number) => {
        setSelectedIndex(index);
        onDaySelect(splitDays[index]);
        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
        });
    };

    const renderItem = ({ item, index }: ListRenderItemInfo<SplitDay>) => {
        const selected = index === selectedIndex;
        return (
            <Pressable
                onPress={() => handlePress(index)}
                style={[styles.item, selected ? styles.selectedItem : styles.unselectedItem]}
            >
                <Text style={[styles.dayText, selected && styles.selectedText]}>{item.day}</Text>
                <Text style={[styles.typeText, selected && styles.selectedText]}>{item.type}</Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                horizontal
                data={splitDays}
                keyExtractor={(item) => item.day}
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH + ITEM_MARGIN * 2}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: (width - ITEM_WIDTH) / 2,
                }}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    item: {
        width: ITEM_WIDTH,
        marginHorizontal: ITEM_MARGIN,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0,255,204,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedItem: {
        backgroundColor: '#00ffcc',
    },
    unselectedItem: {
        backgroundColor: 'transparent',
    },
    dayText: {
        fontFamily: 'monospace',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00ffcc',
        letterSpacing: 2,
    },
    typeText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#00ffcc',
        opacity: 0.7,
        letterSpacing: 2,
        marginTop: 4,
    },
    selectedText: {
        color: '#0A0F1C',
    },
});
