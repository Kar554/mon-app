import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Picker } from "react-native";
import { translateText } from "../../services/translationService";

export default function TranslateScreen() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [from, setFrom] = useState("fr");
  const [to, setTo] = useState("en");

  const handleTranslate = async () => {
    const result = await translateText(text, from, to);
    setTranslated(result);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Traducteur IA</Text>

      <TextInput
        style={styles.input}
        placeholder="Texte à traduire"
        value={text}
        onChangeText={setText}
      />

      <View style={styles.row}>
        <Picker selectedValue={from} style={styles.picker} onValueChange={setFrom}>
          <Picker.Item label="Français" value="fr" />
          <Picker.Item label="Anglais" value="en" />
          <Picker.Item label="Espagnol" value="es" />
        </Picker>
        <Picker selectedValue={to} style={styles.picker} onValueChange={setTo}>
          <Picker.Item label="Anglais" value="en" />
          <Picker.Item label="Français" value="fr" />
          <Picker.Item label="Espagnol" value="es" />
        </Picker>
      </View>

      <Button title="Traduire" onPress={handleTranslate} />

      {translated !== "" && (
        <Text style={styles.result}>Traduction : {translated}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  picker: { height: 50, width: 150 },
  result: { marginTop: 20, fontSize: 18, fontWeight: "500", color: "#333" }
});
