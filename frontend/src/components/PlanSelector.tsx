import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 140;
const ITEM_MARGIN = 8;

type Plan = {
    id: string;
    name: string;
};

type PlanSelectorProps = {
    plans: Plan[];
    selectedPlanId: string;
    onSelect: (id: string) => void;
};

export default function PlanSelector({ plans, selectedPlanId, onSelect }: PlanSelectorProps) {
    return (
        <View style={styles.container}>
            <FlatList
                data={plans}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2 }}
                snapToInterval={ITEM_WIDTH + ITEM_MARGIN * 2}
                decelerationRate="fast"
                renderItem={({ item }) => {
                    const selected = item.id === selectedPlanId;
                    return (
                        <Pressable
                            onPress={() => onSelect(item.id)}
                            style={[styles.item, selected && styles.selectedItem]}
                        >
                            <Text style={[styles.itemText, selected && styles.selectedText]}>{item.name}</Text>
                        </Pressable>
                    );
                }}
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
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0,255,204,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedItem: {
        backgroundColor: '#00ffcc',
    },
    itemText: {
        fontFamily: 'monospace',
        fontSize: 16,
        color: '#00ffcc',
        letterSpacing: 2,
    },
    selectedText: {
        color: '#0A0F1C',
        fontWeight: 'bold',
    },
});
