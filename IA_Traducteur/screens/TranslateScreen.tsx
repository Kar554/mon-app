import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import LanguageSelector from '../components/LanguageSelector';
import { translateText } from '../services/translationService';

export default function TranslateScreen() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [fromLang, setFromLang] = useState('auto'); // auto detect
  const [toLang, setToLang] = useState('fr');

  const handleTranslate = async () => {
    const translated = await translateText(text, fromLang, toLang);
    setResult(translated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IA Traducteur</Text>
      <LanguageSelector fromLang={fromLang} setFromLang={setFromLang} toLang={toLang} setToLang={setToLang} />
      <TextInput
        style={styles.input}
        placeholder="Entrez le texte à traduire"
        value={text}
        onChangeText={setText}
      />
      <Button title="Traduire" onPress={handleTranslate} />
      <Text style={styles.result}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  result: { marginTop: 20, fontSize: 18, fontWeight: 'bold' },
});
