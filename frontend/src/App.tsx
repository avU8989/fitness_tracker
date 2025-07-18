import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import AppTabs from './AppTabs';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/auth/LoginScreen';
import { useContext } from 'react';
import SignUpCredentialsScreen from './screens/auth/SignUpCredentialsScreen';
import SignUpProfileScreen from './screens/auth/SignUpProfileScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isLoggedIn } = useContext(AuthContext);

  console.log(isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUpCredentials" component={SignUpCredentialsScreen} />
          <Stack.Screen name="SignUpProfile" component={SignUpProfileScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={AppTabs} />
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

