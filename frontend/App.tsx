import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './screens/HomeScreen';
import * as Font from 'expo-font';
import AppTabs from './AppTabs';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';


// Google Fonts
import {
  useFonts as useAnton,
  Anton_400Regular,
} from '@expo-google-fonts/anton';
import {
  useFonts as usePressStart2P,
  PressStart2P_400Regular,
} from '@expo-google-fonts/press-start-2p';
import {
  useFonts as useIBMPlexMono,
  IBMPlexMono_400Regular,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  useFonts as useVT323,
  VT323_400Regular,
} from '@expo-google-fonts/vt323';

SplashScreen.preventAutoHideAsync(); // Keeps splash screen up while fonts load

const fetchFonts = () => {
  return Font.loadAsync({
    'KindlyRewind-BOon': require('./assets/KindlyRewind-BOon.ttf'),
    'RealVhsFontRegular-WyV0z': require('./assets/RealVhsFontRegular-WyV0z.ttf'),
  });
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    Font.loadAsync({
      'ShareTechMono': require('./assets/fonts/ShareTechMono-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  const [antonLoaded] = useAnton({ Anton_400Regular });
  const [pressLoaded] = usePressStart2P({ PressStart2P_400Regular });
  const [monoLoaded] = useIBMPlexMono({ IBMPlexMono_400Regular });
  const [vtLoaded] = useVT323({ VT323_400Regular });

  const fontsReady = antonLoaded && pressLoaded && monoLoaded && vtLoaded;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <NavigationContainer>
      <View style={styles.appWrapper}> {/* ✅ Add wrapper with background */}

        <AppTabs />
      </View>
    </NavigationContainer>
  );

}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: '#0A0F1C',

  },
});

