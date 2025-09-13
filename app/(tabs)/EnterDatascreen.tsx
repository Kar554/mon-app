import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import Header from "./components/Header";
import TopNav from "./components/TopNav";

interface ConsumptionEntry {
  electricity: number;
  water: number;
  date: string;
}

export default function EnterDataScreen() {
  const navigation = useNavigation();
  const [history, setHistory] = useState<ConsumptionEntry[]>([]);
  const [electricityInput, setElectricityInput] = useState("");
  const [waterInput, setWaterInput] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem("consumptionData");
      if (saved) setHistory(JSON.parse(saved));
    } catch (err) {
      console.error("Erreur chargement historique :", err);
    }
  };

  const saveEntry = async () => {
    if (!electricityInput.trim() || !waterInput.trim()) {
      Alert.alert("Erreur", "Veuillez remplir les deux champs.");
      return;
    }

    const electricity = parseFloat(electricityInput);
    const water = parseFloat(waterInput);

    if (isNaN(electricity) || isNaN(water)) {
      Alert.alert("Erreur", "Les valeurs doivent être des nombres valides.");
      return;
    }

    const newEntry: ConsumptionEntry = {
      electricity,
      water,
      date: new Date().toISOString(),
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    await AsyncStorage.setItem("consumptionData", JSON.stringify(updatedHistory));

    setElectricityInput("");
    setWaterInput("");

    navigation.navigate("HistoryScreen" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />
      <Header title="➕ Ajouter une consommation" showBack={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>⚡ Consommation Électrique (kWh)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={electricityInput}
          onChangeText={setElectricityInput}
          placeholder="Ex: 12.5"
        />

        <Text style={styles.label}>💧 Consommation d’eau (L)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={waterInput}
          onChangeText={setWaterInput}
          placeholder="Ex: 8.5"
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
          <Text style={styles.saveButtonText}>💾 Enregistrer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 16 },
  label: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#00A1FF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
