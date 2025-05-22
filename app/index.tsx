// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import AppIntro from './components/AppIntro';


export default function Index() {
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIfFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setShowIntro(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setShowIntro(false);
      }
    };
    checkIfFirstLaunch();
  }, []);

  if (showIntro === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showIntro) {
    return <AppIntro onDone={() => setShowIntro(false)} />;
  }

  return <Redirect href="/mapa" />;
}
