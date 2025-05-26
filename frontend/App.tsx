// App.tsx
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './screens/HomeScreen';

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

SplashScreen.preventAutoHideAsync(); // Keeps splash screen up while fonts load

export default function App() {
  const [antonLoaded] = useAnton({ Anton_400Regular });
  const [pressLoaded] = usePressStart2P({ PressStart2P_400Regular });
  const [monoLoaded] = useIBMPlexMono({ IBMPlexMono_400Regular });

  const fontsReady = antonLoaded && pressLoaded && monoLoaded;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) return null; // or your custom loading screen

  return <HomeScreen />;
}
