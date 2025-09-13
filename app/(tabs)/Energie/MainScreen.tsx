import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function MainScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Button title="⚡ Énergie" onPress={() => router.push("/DashboardScreen")} />
      <Button title="💡 Conseils" onPress={() => router.push("/AdviceScreen")} />
      <Button title="📊 Indices" onPress={() => router.push("/HintScreen")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    backgroundColor: "#f5f5f5",
  },
});
