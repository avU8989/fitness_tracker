import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
import StatsScreen from './screens/StatsScreen'
import ProfileScreen from './screens/ProfileScreen'
import HomeScreen from './screens/HomeScreen2';
import { StyleSheet } from 'react-native';

export default function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'DASH':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'LOG':
                            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                            break;
                        case 'GAINS':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        case 'SETUP':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarLabelStyle: styles.bodyText, // ✅ apply font style to all tabs
                tabBarStyle: {
                    backgroundColor: '#0A0F1C',

                    elevation: 0,                    // Android: remove shadow
                    marginTop: 10,
                    borderTopWidth: 0,              // iOS: remove top border
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                },
                tabBarActiveTintColor: '#00ffff',
                tabBarInactiveTintColor: '#555',
                headerShown: false,
            })}
        >
            <Tab.Screen name="DASH" component={HomeScreen} />
            <Tab.Screen name="LOG" component={StatsScreen} />
            <Tab.Screen name="GAINS" component={ProfileScreen} />
            <Tab.Screen name="SETUP" component={ProfileScreen} />

        </Tab.Navigator >
    );
}

const styles = StyleSheet.create({
    bodyText: {
        fontSize: 18,
        color: '#BFC7D5',
        fontFamily: 'monospace',
    },
});
