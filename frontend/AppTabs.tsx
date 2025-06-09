import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen'
import ProfileScreen from './screens/ProfileScreen'

export default function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Stats':
                            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopColor: '#0ff',
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: '#00ffff',
                tabBarInactiveTintColor: '#555',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
