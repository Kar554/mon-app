import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Dashboard", route: "/DashboardScreen" },
    { name: "Conseils", route: "/AdviceScreen" },
    { name: "Indices", route: "/HintScreen" },
    { name: "Ajouter mes données", route: "/EnterDatascreen" },
    { name: "Historique", route: "/HistoryScreen" },
  ];

  const handleAddData = () => {
    router.push("/EnterDatascreen");
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.tabButton,
            pathname === tab.route && styles.activeTab,
          ]}
          onPress={() => router.push(tab.route)}
        >
          <Text
            style={[
              styles.tabText,
              pathname === tab.route && styles.activeText,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}

     
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 60,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  tabButton: {
    flex: 1, // ✅ Chaque onglet prend le même espace
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
    paddingHorizontal: 4,
  },
  tabText: {
    color: "#444",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  activeTab: {
    backgroundColor: "#E6F4FF", // bleu clair doux
  },
  activeText: {
    color: "#007BFF", // bleu vif
    fontWeight: "700",
  }
});