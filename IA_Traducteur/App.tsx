import * as tf from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as tfReactNative from '@tensorflow/tfjs-react-native';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await tfReactNative.ready(); // initialisation TensorFlow pour React Native
      setReady(true);
    }
    prepare();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {ready ? <Text>TensorFlow prêt ✅</Text> : <Text>Chargement TensorFlow...</Text>}
    </View>
  );
}
