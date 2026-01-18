import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import LogScreen from './screens/tabs/LogScreen';
import GainScreen from './screens/tabs/GainScreen';
import HomeScreen from './screens/tabs/HomeScreen';
import TrainingPlansStack from './navigation/TrainingPlansStack';
import SetupScreen from './screens/tabs/SetupScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'HOME': iconName = focused ? 'home' : 'home-outline'; break;
                        case 'LOG': iconName = focused ? 'barbell' : 'barbell-outline'; break;
                        case 'SPLIT': iconName = focused ? 'calendar' : 'calendar-outline'; break;
                        case 'GAINS': iconName = focused ? 'trending-up' : 'trending-up-outline'; break;
                        case 'PROFILE': iconName = focused ? 'person' : 'person-outline'; break;
                        default: iconName = 'help'; break;
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

                /** 100% IMPORTANT FIXES */
                sceneContainerStyle: { backgroundColor: 'transparent' },

                tabBarBackground: () => (
                    <View style={{ flex: 1, backgroundColor: '#0A0F1C' }} />
                ),

                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 70,
                    paddingBottom: insets.bottom,
                    backgroundColor: '#0A0F1C',
                    borderRadius: 8,
                    borderTopWidth: 0,
                    elevation: 0,
                    overflow: 'hidden',
                },
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#777',
                headerShown: false,
            })}
        >
            <Tab.Screen name="HOME" component={HomeScreen} />
            <Tab.Screen name="SPLIT" component={TrainingPlansStack} />
            <Tab.Screen name="LOG" component={LogScreen} />
            <Tab.Screen name="GAINS" component={GainScreen} />
            <Tab.Screen name="PROFILE" component={SetupScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({

    tabLabel: {
        fontSize: 12,
        fontFamily: 'monospace',
        letterSpacing: 2,
    },

    textGlow: {
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },

    iconGlow: {
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
});
