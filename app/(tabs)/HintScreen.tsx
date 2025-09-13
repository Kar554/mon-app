import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { useIsFocused } from "@react-navigation/native";
import Header from "./components/Header";
import TopNav from "./components/TopNav";

interface ConsumptionEntry {
  electricity: number;
  water: number;
  date: string;
}

export default function HintScreen() {
  const isFocused = useIsFocused();
  const [history, setHistory] = useState<ConsumptionEntry[]>([]);
  const [risk, setRisk] = useState("Aucun");
  const [objective, setObjective] = useState(0);

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem("consumptionData");
    if (!saved) {
      setHistory([]);
      setRisk("Aucun");
      setObjective(0);
      return;
    }
    const data: ConsumptionEntry[] = JSON.parse(saved);
    setHistory(data);

    const last = data[data.length - 1];
    if (last) {
      if (last.electricity >= 30) setRisk("ÉLEVÉ - Risque de coupure imminent ⚠️");
      else if (last.electricity >= 15) setRisk("MODÉRÉ - Surveillez votre consommation ⚠️");
      else setRisk("FAIBLE - Pas de risque immédiat ✅");
    }

    const avg = data.reduce((sum, entry) => sum + entry.electricity, 0) / data.length;
    setObjective(parseFloat((avg * 0.9).toFixed(1)));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopNav />
      <Header title="📊 Indices et prévisions" showBack={true} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Bloc Risque */}
        <View style={styles.card}>
          <Text style={styles.label}>🔌 Prévision de coupures :</Text>
          <Text
            style={[
              styles.value,
              risk.includes("ÉLEVÉ")
                ? { color: "red" }
                : risk.includes("MODÉRÉ")
                ? { color: "orange" }
                : { color: "green" },
            ]}
          >
            {risk}
          </Text>
        </View>

        {/* Objectif du mois */}
        <View style={styles.card}>
          <Text style={styles.label}>📈 Objectif du mois :</Text>
          <Text style={styles.value}>{objective} kWh</Text>
        </View>

        {/* Graphique historique électrique */}
        {history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>⚡ Historique Électricité</Text>
            <LineChart
              data={{
                labels: history.map(h =>
                  new Date(h.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                ),
                datasets: [{ data: history.map(h => h.electricity) }],
              }}
              width={Dimensions.get("window").width - 32}
              height={180}
              yAxisSuffix=" kWh"
              chartConfig={chartConfig}
              bezier
              style={{ marginVertical: 8, borderRadius: 12 }}
            />
          </View>
        )}

        {/* Graphique historique eau */}
        {history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>💧 Historique Eau</Text>
            <LineChart
              data={{
                labels: history.map(h =>
                  new Date(h.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                ),
                datasets: [{ data: history.map(h => h.water) }],
              }}
              width={Dimensions.get("window").width - 32}
              height={180}
              yAxisSuffix=" L"
              chartConfig={chartConfig}
              bezier
              style={{ marginVertical: 8, borderRadius: 12 }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  value: { fontSize: 16, fontWeight: "500" },
});

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};
