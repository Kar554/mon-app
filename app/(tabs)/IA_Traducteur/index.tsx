// app/(tabs)/IA_Traducteur/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import TranslateScreen from './screens/TranslateScreen';

export default function IA_Traducteur() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      if (Platform.OS !== 'web') {
        try {
          await import('@tensorflow/tfjs-react-native');
          
        } catch (e) {
          console.warn('Erreur TensorFlow mobile :', e);
        }
      }
      setReady(true);
    }
    prepare();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement IA Traducteur...</Text>
      </View>
    );
  }

  return <TranslateScreen />;
}
