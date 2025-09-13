import React from 'react';
import { View, Text, Picker, StyleSheet } from 'react-native';

export default function LanguageSelector({ fromLang, setFromLang, toLang, setToLang }: any) {
  return (
    <View style={styles.container}>
      <Text>De :</Text>
      <Picker selectedValue={fromLang} onValueChange={setFromLang} style={{ height: 50, width: 150 }}>
        <Picker.Item label="Auto" value="auto" />
        <Picker.Item label="Français" value="fr" />
        <Picker.Item label="Anglais" value="en" />
        <Picker.Item label="Fon" value="fon" />
        <Picker.Item label="Yoruba" value="yo" />
        <Picker.Item label="Lingala" value="ln" />
      </Picker>

      <Text>Vers :</Text>
      <Picker selectedValue={toLang} onValueChange={setToLang} style={{ height: 50, width: 150 }}>
        <Picker.Item label="Français" value="fr" />
        <Picker.Item label="Anglais" value="en" />
        <Picker.Item label="Fon" value="fon" />
        <Picker.Item label="Yoruba" value="yo" />
        <Picker.Item label="Lingala" value="ln" />
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' },
});
