import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./components/Header";
import TopNav from "./components/TopNav";
import { useIsFocused, useNavigation } from "@react-navigation/native";

interface ConsumptionEntry {
  electricity: number;
  water: number;
  date: string;
}

// ⚡ Tarif actuel
const ELECTRICITY_PRICE = 125; // FCFA par kWh

export default function DashboardScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [history, setHistory] = useState<ConsumptionEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<ConsumptionEntry | null>(null);

  // ⚡ Convertisseur kWh → FCFA
  const [kwInput, setKwInput] = useState("");
  const [converted, setConverted] = useState<number | null>(null);

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem("consumptionData");
    const parsed: ConsumptionEntry[] = saved ? JSON.parse(saved) : [];
    setHistory(parsed);

    const todayISO = new Date().toISOString().split("T")[0];
    const todayData = parsed.find(e => e.date.split("T")[0] === todayISO) || null;
    setTodayEntry(todayData);
  };

  const clearAll = async () => {
    Alert.alert("Confirmation", "Voulez-vous vraiment tout supprimer ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          setHistory([]);
          setTodayEntry(null);
          await AsyncStorage.removeItem("consumptionData");
        },
      },
    ]);
  };

  // ⚡ Conversion manuelle d'un input utilisateur
  const convertKwToFcfa = () => {
    const kw = parseFloat(kwInput);
    if (!isNaN(kw) && kw >= 0) {
      setConverted(kw * ELECTRICITY_PRICE);
    } else {
      setConverted(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopNav />
      <Header title="📊 Dashboard intelligent" showBack={true} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* 📌 Consommation du jour */}
        {todayEntry && (
          <View style={styles.todayCard}>
            <Text style={styles.todayTitle}>📌 Aujourd’hui</Text>
            <Text>
              ⚡ Électricité : {todayEntry.electricity} kWh{" "}
              {todayEntry.electricity > 30 ? "⚠️" : ""}
            </Text>
            <Text style={styles.costText}>
              💵 Coût : {todayEntry.electricity * ELECTRICITY_PRICE} FCFA
            </Text>
            <Text>
              💧 Eau : {todayEntry.water} L{" "}
              {todayEntry.water > 100 ? "⚠️" : ""}
            </Text>
          </View>
        )}

        {/* 🔢 Convertisseur kWh → FCFA */}
        <View style={styles.convertBox}>
          <Text style={styles.sectionTitle}>🔢 Convertisseur kWh → FCFA</Text>
          <TextInput
            style={styles.input}
            placeholder="Entre une valeur en kWh..."
            keyboardType="numeric"
            value={kwInput}
            onChangeText={setKwInput}
          />
          <TouchableOpacity style={styles.convertButton} onPress={convertKwToFcfa}>
            <Text style={styles.convertButtonText}>Convertir</Text>
          </TouchableOpacity>
          {converted !== null && (
            <Text style={styles.resultText}>Résultat : {converted} FCFA</Text>
          )}
        </View>

        {/* 📈 Historique avec courbes personnalisées */}
        <Text style={styles.title}>📈 Historique</Text>
        {history.length > 0 ? (
          <LineChart
            data={{
              labels: history.map(e =>
                new Date(e.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                })
              ),
              datasets: [
                { data: history.map(e => e.electricity), color: () => "#FF8C00" }, // Orange
                { data: history.map(e => e.water), color: () => "#1E90FF" },       // Bleu
              ],
            }}
            width={Dimensions.get("window").width - 32}
            height={240}
            yAxisSuffix=""
            chartConfig={chartConfig}
            bezier
          />
        ) : (
          <Text style={styles.noData}>Pas encore de données.</Text>
        )}

        {/* ➕ / 🗑 Boutons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("EnterDatascreen")}
          >
            <Text style={styles.addButtonText}>➕ Ajouter consommation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#FF3B30" }]}
            onPress={clearAll}
          >
            <Text style={styles.addButtonText}>🗑 Tout effacer</Text>
          </TouchableOpacity>
        </View>

        {/* 💡 Conseils fixes */}

        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>💡 Conseils Électricité</Text>
          <View style={[styles.card, { borderLeftColor: "#FFD700" }]}>
            <Text>Réglez le thermostat à 20°C</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#FFD700" }]}>
            <Text>Éteignez les appareils en veille</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#FFD700" }]}>
            <Text>Débranchez le chargeur quand il n’est pas utilisé</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#FFD700" }]}>
            <Text>Préférez le mode éco sur vos appareils</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#FFD700" }]}>
            <Text>Utilisez des ampoules LED</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>💡 Conseils Eau</Text>
          <View style={[styles.card, { borderLeftColor: "#1E90FF" }]}>
            <Text>Fermez le robinet pendant le brossage des dents</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#1E90FF" }]}>
            <Text>Réparez immédiatement toute fuite</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#1E90FF" }]}>
            <Text>Utilisez un seau pour laver la voiture</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#1E90FF" }]}>
            <Text>Privilégiez le lave-linge plein</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: "#1E90FF" }]}>
            <Text>Prenez des douches plutôt que des bains</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 12, color: "#333" },
  noData: { fontSize: 14, fontStyle: "italic", marginBottom: 16 },
  todayCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#32CD32",
  },
  todayTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  costText: { fontSize: 14, fontWeight: "600", color: "#007AFF", marginBottom: 8 },

  convertBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  convertButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  convertButtonText: { color: "#fff", fontWeight: "700" },
  resultText: { marginTop: 12, fontSize: 16, fontWeight: "600", color: "#333" },

  buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 16 },
  addButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  addButtonText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
});

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};