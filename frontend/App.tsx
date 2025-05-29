// App.tsx
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './screens/HomeScreen';
import Font from 'expo-font'
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

  if (!fontsReady) return null; // or your custom loading screen

  return <HomeScreen />;
}
