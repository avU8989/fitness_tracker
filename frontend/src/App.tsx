import AppTabs from './AppTabs';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/auth/LoginScreen';
import { useContext } from 'react';
import SignUpCredentialsScreen from './screens/auth/SignUpCredentialsScreen';
import SignUpProfileScreen from './screens/auth/SignUpProfileScreen';
import { RootStackParameterList } from './navigation/navtypes';
import { BleProvider } from './context/BleContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { DashboardProvider } from './context/DashboardContext';
const Stack = createNativeStackNavigator<RootStackParameterList>();

function RootNavigator() {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0F1C' }}>
        <ActivityIndicator size="large" color="#00FFCC" />
        <Text style={{ color: '#00FFCC', marginTop: 10 }}>Checking session...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUpCredentials" component={SignUpCredentialsScreen} />
          <Stack.Screen name="SignUpProfile" component={SignUpProfileScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Main"
          children={() => (
            <BleProvider>
              <WorkoutProvider>
                <DashboardProvider>
                  <AppTabs />
                </DashboardProvider>
              </WorkoutProvider>
            </BleProvider>
          )}
        />
      )}
    </Stack.Navigator >
  )

}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <View style={styles.appWrapper}>
          <RootNavigator />
        </View>
      </NavigationContainer>
    </AuthProvider>
  );
}


const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: '#0A0F1C',

  },
});

