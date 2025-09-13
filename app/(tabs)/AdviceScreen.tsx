import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./components/Header";
import TopNav from "./components/TopNav";

interface ConsumptionEntry {
  electricity: number;
  water: number;
  date: string;
}

interface Advice {
  type: "electricity" | "water";
  text: string;
}

// ✅ Conseils adaptés par tranches
const advices = {
  A: {
    electricity: [
      "Utiliser uniquement des ampoules LED ≤ 5W",
      "Éteindre systématiquement après usage",
      "Éviter les appareils en veille",
      "Charger les téléphones en journée",
      "Utiliser un petit ventilateur au lieu d’un climatiseur",
      "Regrouper les tâches informatiques en une session",
      "Utiliser un mini-frigo ou glacière passive",
      "Préférer les repas crus ou à cuisson rapide",
      "Utiliser des lampes solaires rechargeables",
      "Débrancher les multiprises la nuit",
      "Utiliser un chargeur solaire pour petits appareils",
      "Limiter les écrans à 1h/jour",
      "Utiliser des interrupteurs à minuterie",
      "Éviter les appareils chauffants (fer, bouilloire)",
      "Utiliser un PC portable basse consommation",
      "Éviter les rallonges longues",
      "Optimiser la lumière naturelle",
      "Utiliser un convertisseur 12V efficace",
      "Réduire la fréquence de lavage du linge",
      "Utiliser un onduleur avec arrêt automatique",
    ],
    water: [
      "Se laver avec un seau plutôt qu’une douche",
      "Réutiliser l’eau de lavage pour les sols",
      "Utiliser des lingettes réutilisables",
      "Nettoyer la vaisselle avec peu d’eau",
      "Récupérer l’eau de pluie pour les plantes",
      "Utiliser un vaporisateur pour le nettoyage",
      "Réduire la fréquence des lavages corporels",
      "Préférer les toilettes sèches si possible",
      "Nettoyer les légumes dans une bassine",
      "Réutiliser l’eau de cuisson refroidie",
      "Utiliser des savons solides",
      "Fermer le robinet pendant le brossage",
      "Laver les vêtements à la main",
      "Réduire les rinçages",
      "Nettoyer les vitres avec microfibres",
      "Utiliser des produits sans rinçage",
      "Préférer les balais aux serpillières",
      "Réparer les fuites rapidement",
      "Installer des mousseurs sur les robinets",
      "Sensibiliser les membres du foyer",
    ],
  },
  B: {
    electricity: [
      "Utiliser des multiprises avec interrupteur",
      "Installer des détecteurs de mouvement pour l’éclairage",
      "Utiliser un four à gaz plutôt qu’électrique",
      "Réduire la luminosité des écrans",
      "Utiliser des programmes courts sur les machines",
      "Dégivrer le frigo régulièrement",
      "Éviter les appareils énergivores (plasma, sèche-linge)",
      "Utiliser des prises programmables",
      "Regrouper les lessives",
      "Préférer les ventilateurs à la clim",
      "Nettoyer les filtres des appareils",
      "Utiliser des appareils multifonctions",
      "Réduire les cycles de repassage",
      "Utiliser un wattmètre pour identifier les appareils gourmands",
      "Éteindre les box et routeurs la nuit",
      "Utiliser des rideaux thermiques",
      "Préférer les laptops aux PC fixes",
      "Réduire les heures d’écran",
      "Utiliser des convertisseurs basse perte",
      "Réaliser un audit énergétique simple",
    ],
    water: [
      "Installer un pommeau de douche économique",
      "Prendre des douches ≤ 5 min",
      "Réutiliser l’eau de rinçage pour les plantes",
      "Utiliser un lave-linge éco si disponible",
      "Nettoyer les légumes dans une bassine",
      "Préférer les aliments peu salissants",
      "Réduire les prélavages",
      "Utiliser des bassines pour la vaisselle",
      "Réutiliser l’eau de lavage pour les sols",
      "Arrosage tôt le matin ou tard le soir",
      "Installer des goutte-à-goutte",
      "Paille le sol pour conserver l’humidité",
      "Nettoyer les extérieurs avec balai",
      "Réduire les lavages de voiture",
      "Préférer les nettoyants concentrés",
      "Nettoyer avec microfibres",
      "Réparer les joints de robinet",
      "Surveiller la pression de l’eau",
      "Installer un compteur individuel",
      "Réduire les nettoyages intensifs",
    ],
  },
  C: {
    electricity: [
      "Utiliser des appareils A++ ou mieux",
      "Regrouper les cuissons pour optimiser l’énergie",
      "Utiliser le micro-ondes pour les petites portions",
      "Nettoyer les grilles du frigo",
      "Laisser refroidir les plats avant frigo",
      "Utiliser des balles de lavage",
      "Préférer les lampes de bureau ciblées",
      "Réduire les cycles de climatisation",
      "Installer des panneaux solaires si possible",
      "Utiliser des batteries rechargeables",
      "Réduire les cycles de repassage",
      "Utiliser des convertisseurs efficaces",
      "Optimiser l’agencement pour limiter la chaleur",
      "Réduire les cycles de cuisson",
      "Utiliser des rideaux isolants",
      "Réduire les cycles de lavage du linge",
      "Utiliser des SSD au lieu de HDD",
      "Fermer les logiciels inutiles",
      "Réduire les cycles de nettoyage",
      "Préférer les appareils connectés basse consommation",
      "Réduire les heures de TV",
      "Utiliser des multiprises intelligentes",
      "Réduire les cycles de chauffage",
      "Préférer les appareils à induction",
      "Réduire les cycles de cuisson au four",
      "Réduire les cycles de séchage",
      "Réduire les cycles de ventilation",
      "Réduire les cycles de réfrigération",
    ],
    water: [
      "Installer des réducteurs de débit",
      "Réutiliser l’eau de douche pour les WC",
      "Réduire les cycles de lavage du linge",
      "Réduire les cycles de vaisselle",
      "Réduire les cycles de nettoyage",
      "Réduire les cycles d’arrosage",
      "Réduire les cycles de rinçage",
      "Réduire les cycles de lavage corporel",
      "Réduire les cycles de lavage des sols",
      "Réduire les cycles de lavage des vitres",
      "Réduire les cycles de lavage des véhicules",
      "Réduire les cycles de lavage des vêtements",
      "Réduire les cycles de lavage des ustensiles",
      "Réduire les cycles de lavage des fruits",
      "Réduire les cycles de lavage des légumes",
      "Réduire les cycles de lavage des mains",
      "Réduire les cycles de lavage des pieds",
      "Réduire les cycles de lavage des cheveux",
      "Réduire les cycles de lavage des animaux",
      "Réduire les cycles de lavage des murs",
      "Réduire les cycles de lavage des fenêtres",
      "Réduire les cycles de lavage des portes",
      "Réduire les cycles de lavage des meubles",
      "Réduire les cycles de lavage des tapis",
      "Réduire les cycles de lavage des rideaux",
      "Réduire les cycles de lavage des coussins",
      "Réduire les cycles de lavage des draps",
      "Réduire les cycles de lavage des couvertures",
      "Réduire les cycles de lavage des oreillers",
      "Réduire les cycles de lavage des matelas",
    ],
  },
  D: {
    electricity: [
      "Choisir des appareils avec mode Eco ou Smart",
      "Mettre à jour les firmwares pour efficacité énergétique",
      "Utiliser des prises connectées pour programmer les arrêts",
      "Éviter les appareils en veille avec transformateurs internes",
      "Utiliser des convertisseurs de tension à haut rendement",
      "Préférer les appareils à induction pour la cuisine",
      "Réduire la température du chauffe-eau si électrique",
      "Utiliser des thermostats intelligents",
      "Regrouper les cuissons pour éviter les redémarrages",
      "Éviter les cycles de préchauffage inutiles",
    ],
    water: [
      "Installer un mitigeur thermostatique",
      "Utiliser des douches à débit réduit (≤6L/min)",
      "Réutiliser l’eau de douche pour WC",
      "Installer un système de récupération d’eau grise",
      "Réduire la fréquence des bains",
      "Utiliser des savons peu moussants",
      "Préférer les serviettes microfibres",
      "Réduire la température de l’eau chaude",
      "Nettoyer les pommeaux de douche",
      "Installer des robinets à fermeture automatique",
      "Utiliser des lave-vaisselle avec capteur de saleté",
      "Réduire les cycles de rinçage",
      "Réutiliser l’eau de cuisson pour les plantes",
      "Nettoyer les ustensiles immédiatement",
      "Préférer les aliments peu salissants",
      "Utiliser des bassines pour lavage à la main",
      "Réduire les cycles de nettoyage des surfaces",
      "Préférer les torchons lavables",
      "Installer un réservoir d’eau de pluie",
      "Utiliser des tuyaux poreux pour l’arrosage",
    ],
  },
};


export default function AdviceScreen() {
  const [todayEntry, setTodayEntry] = useState<ConsumptionEntry | null>(null);
  const [showAllElec, setShowAllElec] = useState(false);
  const [showAllWater, setShowAllWater] = useState(false);
  const [adviceElec, setAdviceElec] = useState<Advice[]>([]);
  const [adviceWater, setAdviceWater] = useState<Advice[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem("consumptionData");
      const parsed: ConsumptionEntry[] = saved ? JSON.parse(saved) : [];

      if (!parsed.length) {
        setTodayEntry(null);
        setAdviceElec([]);
        setAdviceWater([]);
        return;
      }

      // ✅ Récupère la dernière consommation enregistrée
      const latest = parsed.reduce((prev, current) =>
        new Date(prev.date) > new Date(current.date) ? prev : current
      );

      setTodayEntry(latest);

      const tranche = getTranche(latest.electricity, latest.water);
      setAdviceElec(
        (advices[tranche]?.electricity || []).map((text) => ({ type: "electricity", text }))
      );
      setAdviceWater(
        (advices[tranche]?.water || []).map((text) => ({ type: "water", text }))
      );
    } catch (err) {
      console.error("Erreur récupération données :", err);
      setTodayEntry(null);
      setAdviceElec([]);
      setAdviceWater([]);
    }
  };

  const getTranche = (elec: number, water: number) => {
    if (elec <= 17 && water <= 12) return "A";
    if (elec <= 50 && water <= 30) return "B";
    if (elec <= 100 && water <= 80) return "C";
    return "D";
  };

  const renderAdvices = (
    advices: Advice[],
    showAll: boolean,
    setShowAll: any,
    color: string
  ) => {
    const toShow = showAll ? advices : advices.slice(0, 5);
    return (
      <View style={{ marginVertical: 10 }}>
        {toShow.map((a, i) => (
          <View key={i} style={[styles.card, { borderLeftColor: color }]}>
            <Text style={styles.cardText}>{a.text}</Text>
          </View>
        ))}
        {advices.length > 5 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)}>
            <Text style={[styles.showMoreText, { color }]}>
              {showAll ? "Masquer" : "Afficher plus"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!todayEntry) {
    return (
      <View style={styles.emptyContainer}>
        <TopNav />
        <Header title="💡 Conseils personnalisés" showBack={true} />
        <View style={styles.emptyInner}>
          <Text style={styles.emptyText}>Aucune donnée disponible</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNav />
      <Header title="💡 Conseils personnalisés" showBack={true} />
      <ScrollView style={styles.scrollContent}>
        {/* ✅ Affichage des consommations actuelles */}
        <View style={styles.statsBox}>
          <Text style={styles.statsToday}>
            📌 Aujourd’hui{"\n"}
            ⚡ Électricité : {todayEntry.electricity} kWh{"\n"}
            💧 Eau : {todayEntry.water} L
          </Text>
        </View>

        {/* ✅ Conseils électricité */}
        <Text style={styles.title}>⚡ Électricité – Conseils</Text>
        {renderAdvices(adviceElec, showAllElec, setShowAllElec, "#FFD700")}

        {/* ✅ Conseils eau */}
        <Text style={[styles.title, { marginTop: 20 }]}>💧 Eau – Conseils</Text>
        {renderAdvices(adviceWater, showAllWater, setShowAllWater, "#1E90FF")}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  emptyContainer: { flex: 1, backgroundColor: "#fff" },
  emptyInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#777" },
  scrollContent: { padding: 16, paddingBottom: 120 },

  statsBox: {
    backgroundColor: "#f4f6f8",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e1e4e8",
  },
  statsToday: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    lineHeight: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1E3A8A", // bleu foncé pour contraste
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2, // Android
  },
  cardText: { color: "#333", fontSize: 15, lineHeight: 20 },
  showMoreText: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "right",
  },
});