import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import Header from "./components/Header";
import TopNav from "./components/TopNav";
import { useIsFocused } from "@react-navigation/native"; // ✅ pour rafraîchir auto

interface ConsumptionEntry {
  electricity: number;
  water: number;
  date: string; // ISO string
}

// 💰 Tarifs (unifiés partout)
const PRICE_PER_KWH = 125; // FCFA/kWh
const PRICE_PER_L = 1; // FCFA/L

export default function HistoryScreen() {
  const [history, setHistory] = useState<ConsumptionEntry[]>([]);
  const [totals, setTotals] = useState({
    elec: 0,
    water: 0,
    cost: 0,
    avgDailyElec: 0,
    avgDailyWater: 0,
    projectedBill: 0,
  });

  const isFocused = useIsFocused(); // ✅ vrai si on revient sur l’écran

  useEffect(() => {
    if (isFocused) {
      loadHistory(); // ✅ recharge à chaque retour
    }
  }, [isFocused]);

  const loadHistory = async () => {
    const saved = await AsyncStorage.getItem("consumptionData");
    if (saved) {
      const data: ConsumptionEntry[] = JSON.parse(saved);

      // ⚡ Tri croissant par date
      const sorted = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setHistory(sorted);

      // Stats
      const totalElec = sorted.reduce((sum, e) => sum + e.electricity, 0);
      const totalWater = sorted.reduce((sum, e) => sum + e.water, 0);
      const cost = totalElec * PRICE_PER_KWH + totalWater * PRICE_PER_L;

      const days = new Set(sorted.map((e) => new Date(e.date).toDateString())).size;
      const avgDailyElec = days > 0 ? totalElec / days : 0;
      const avgDailyWater = days > 0 ? totalWater / days : 0;

      const projectedBill =
        (avgDailyElec * PRICE_PER_KWH + avgDailyWater * PRICE_PER_L) * 30;

      setTotals({
        elec: totalElec,
        water: totalWater,
        cost,
        avgDailyElec,
        avgDailyWater,
        projectedBill,
      });
    } else {
      setHistory([]);
    }
  };

  // Supprimer une seule entrée
  const deleteEntry = async (index: number) => {
    const updated = [...history];
    updated.splice(index, 1);
    setHistory(updated);
    await AsyncStorage.setItem("consumptionData", JSON.stringify(updated));
    loadHistory();
  };

  // Supprimer tout l’historique
  const clearAll = async () => {
    Alert.alert("Confirmation", "Voulez-vous vraiment tout supprimer ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("consumptionData");
          setHistory([]);
          setTotals({
            elec: 0,
            water: 0,
            cost: 0,
            avgDailyElec: 0,
            avgDailyWater: 0,
            projectedBill: 0,
          });
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <TopNav />
      <Header title="📊 Historique & Dépenses" showBack={true} />

      <ScrollView style={styles.container}>
        {/* Bloc résumé */}
        <View style={styles.summaryCard}>
          <Text style={styles.bigNumber}>
            ⚡ {totals.avgDailyElec.toFixed(1)} kWh/jour
          </Text>
          <Text style={styles.bigNumber}>
            💧 {totals.avgDailyWater.toFixed(1)} L/jour
          </Text>
          <Text style={styles.textMuted}>
            Moyennes quotidiennes calculées automatiquement
          </Text>
        </View>

        {/* Statistiques */}
        <Text style={styles.sectionTitle}>📌 Statistiques globales</Text>
        <View style={styles.card}>
          <Text>⚡ Total Électricité : {totals.elec.toFixed(1)} kWh</Text>
          <Text>💧 Total Eau : {totals.water.toFixed(1)} L</Text>
          <Text>💰 Dépenses actuelles : {totals.cost.toFixed(0)} FCFA</Text>
          <Text>
            🧾 Facture estimée fin du mois : {totals.projectedBill.toFixed(0)} FCFA
          </Text>
        </View>

        {/* Graphiques */}
        <Text style={styles.sectionTitle}>⚡ Historique Électricité</Text>
        {history.length > 0 ? (
          <LineChart
            data={{
              labels: history.map((h) =>
                new Date(h.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                })
              ),
              datasets: [{ data: history.map((h) => h.electricity), color: () => "#FF8C00" }],
            }}
            width={Dimensions.get("window").width - 32}
            height={220}
            yAxisSuffix=" kWh"
            chartConfig={chartConfig}
          />
        ) : (
          <Text style={styles.noData}>Pas encore de données électriques.</Text>
        )}

        <Text style={styles.sectionTitle}>💧 Historique Eau</Text>
        {history.length > 0 ? (
          <LineChart
            data={{
              labels: history.map((h) =>
                new Date(h.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                })
              ),
              datasets: [{ data: history.map((h) => h.water), color: () => "#1E90FF" }],
            }}
            width={Dimensions.get("window").width - 32}
            height={220}
            yAxisSuffix=" L"
            chartConfig={chartConfig}
          />
        ) : (
          <Text style={styles.noData}>Pas encore de données d’eau.</Text>
        )}

        {/* Historique brut */}
        <Text style={styles.sectionTitle}>📅 Historique complet</Text>
        {history.length > 0 ? (
          history.map((entry, index) => (
            <View key={index} style={styles.row}>
              <Text>
                {new Date(entry.date).toLocaleDateString("fr-FR")} – ⚡{" "}
                {entry.electricity} kWh | 💧 {entry.water} L
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteEntry(index)}
              >
                <Text style={{ color: "#fff" }}>Effacer</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Aucune donnée enregistrée.</Text>
        )}

        {/* Supprimer tout */}
        {history.length > 0 && (
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: "red", marginTop: 12 }]}
            onPress={clearAll}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Tout effacer</Text>
          </TouchableOpacity>
        )}

        {/* Conseils fixes */}
        <Text style={styles.sectionTitle}>💡 Conseils personnalisés</Text>
        <View style={styles.card}>
          <Text>⚠️ Réduisez vos appareils énergivores, la conso est élevée.</Text>
          <Text>🚿 Attention, vous utilisez beaucoup d’eau.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  bigNumber: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  textMuted: { fontSize: 14, color: "#e0e0e0", marginTop: 6 },
  noData: { fontSize: 14, fontStyle: "italic", marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#FF9500",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};