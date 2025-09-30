import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';

import LogScreen from './screens/tabs/LogScreen';
import GainScreen from './screens/tabs/GainScreen';
import HomeScreen from './screens/tabs/HomeScreen';
import TrainingPlansScreen from './screens/tabs/TrainingPlansScreen';
import SetupScreen from './screens/tabs/SetupScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'HOME':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'LOG':
                            iconName = focused ? 'barbell' : 'barbell-outline';
                            break;
                        case 'SPLIT':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        case 'GAINS':
                            iconName = focused ? 'trending-up' : 'trending-up-outline';
                            break;
                        case 'PROFILE':
                            iconName = focused ? 'person' : 'person-outline';
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
            <Tab.Screen name="HOME" component={HomeScreen} />
            <Tab.Screen name="LOG" component={LogScreen} />
            <Tab.Screen name="SPLIT" component={TrainingPlansScreen} />
            <Tab.Screen name="GAINS" component={GainScreen} />
            <Tab.Screen name="PROFILE" component={SetupScreen} />
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
