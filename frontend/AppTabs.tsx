import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';

import StatsScreen from './screens/StatsScreen';
import LogScreen from './screens/LogScreen.tsx';
import HomeScreen from './screens/HomeScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'DASH':
                            iconName = focused ? 'speedometer' : 'speedometer-outline';
                            break;
                        case 'LOG':
                            iconName = focused ? 'barbell' : 'barbell-outline';
                            break;
                        case 'GAINS':
                            iconName = focused ? 'trending-up' : 'trending-up-outline';
                            break;
                        case 'SETUP':
                            iconName = focused ? 'settings' : 'settings-outline';
                            break;
                        default:
                            iconName = 'help';
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={focused ? size + 4 : size}
                            color={color}
                            style={focused ? styles.iconGlow : undefined}
                        />
                    );
                },
                tabBarLabel: ({ focused, color }) => (
                    <Text style={[styles.tabLabel, { color }, focused && styles.textGlow]}>
                        {route.name}
                    </Text>
                ),
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#E0E0E0',
                tabBarInactiveTintColor: '#555',
                headerShown: false,
            })}
        >
            <Tab.Screen name="DASH" component={HomeScreen} />
            <Tab.Screen name="LOG" component={StatsScreen} />
            <Tab.Screen name="GAINS" component={LogScreen} />
            <Tab.Screen name="SETUP" component={LogScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#0A0F1C',
        elevation: 0,
        borderTopWidth: 0,
        height: 70,
        paddingBottom: 10,
        paddingTop: 5,
    },
    tabLabel: {
        fontSize: 12,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    textGlow: {
        textShadowColor: '#E0E0E0', // light grey glow
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    iconGlow: {
        textShadowColor: '#E0E0E0', // light grey glow
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
});
