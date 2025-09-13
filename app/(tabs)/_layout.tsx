import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: "none" }, // <-- cache la barre d'onglets en bas
      }}
    >
      <Tabs.Screen
        name="Energie/DashboardScreen"
        options={{
          title: "Énergie",
        }}
      />
      <Tabs.Screen
        name="AdviceScreen"
        options={{
          title: "Conseils",
        }}
      />
      <Tabs.Screen
        name="HintScreen"
        options={{
          title: "Indices",
        }}
      />
    </Tabs>
  );
}
