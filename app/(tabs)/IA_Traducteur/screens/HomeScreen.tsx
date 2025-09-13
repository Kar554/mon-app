// app/(tabs)/IA_Traducteur/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Écran principal</Text>
      <Text>Compteur: {count}</Text>
      <TouchableOpacity
        onPress={() => setCount((c) => c + 1)}
        style={{ marginTop: 10, padding: 10, backgroundColor: '#22c55e', borderRadius: 6 }}
      >
        <Text style={{ color: '#fff' }}>+1</Text>
      </TouchableOpacity>
    </View>
  );
}
