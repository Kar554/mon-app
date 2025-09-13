import React, { useEffect } from "react";
import { initDB } from "./services/database";
import { Slot } from "expo-router"; // si tu utilises expo-router

export default function App() {
  useEffect(() => {
    // Création automatique de la DB et de la table au démarrage
    initDB();
  }, []);

  return <Slot />; // ou ton NavigationContainer si tu utilises react-navigation
}
