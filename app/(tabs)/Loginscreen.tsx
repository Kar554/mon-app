import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!userId) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro SONEB/SBEE.");
      return;
    }
    router.push(`/DashboardScreen?userId=${userId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrez votre numéro SONEB/SBEE</Text>
      <TextInput
        style={styles.input}
        placeholder="Numéro abonné"
        keyboardType="numeric"
        value={userId}
        onChangeText={setUserId}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Voir mes données</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 6, marginBottom: 16 },
  button: { backgroundColor: "#007AFF", padding: 12, borderRadius: 6 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
