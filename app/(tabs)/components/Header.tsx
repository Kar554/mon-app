import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useRouter, useSegments } from "expo-router";

// Historique simple des écrans visités
let navigationHistory: string[] = [];

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = true }: HeaderProps) {
  const router = useRouter();
  const segments = useSegments();
  const [pressAnim] = useState(new Animated.Value(1));
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const currentScreen = segments.join("/");
    if (navigationHistory[navigationHistory.length - 1] !== currentScreen) {
      navigationHistory.push(currentScreen);
    }
    setCanGoBack(navigationHistory.length > 1);
  }, [segments]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();
    if (navigationHistory.length > 1) {
      navigationHistory.pop();
      const previousScreen = navigationHistory[navigationHistory.length - 1];
      router.replace("/" + previousScreen);
    }
  };

  if (!showBack || !canGoBack) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity
          style={styles.backButton}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          {/* ✅ Texte clair visible partout */}
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 60,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 16,
    backgroundColor: "#007BFF", // bouton bleu fort
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  backText: {
    fontSize: 14,
    color: "#fff", // texte blanc lisible
    fontWeight: "700",
  },
  title: {
    color: "#333",
    fontSize: 20,
    fontWeight: "bold",
    flexShrink: 1, // responsive si titre trop long
  },
});