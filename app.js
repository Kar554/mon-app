import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Vibration,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';

/** ============ Helpers ============ **/
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const toMinSec = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

const POMODORO_FOCUS = 25 * 60; // 25 min
const POMODORO_BREAK = 5 * 60;  // 5 min

/** ============ App ============ **/
export default function App() {
  // THEME
  const [dark, setDark] = useState(true);
  const bgAnim = useRef(new Animated.Value(0)).current; // 0 = light, 1 = dark

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: dark ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [dark]);

  const interpolatedBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f5f7fb', '#0b0f17'],
  });
  const interpolatedCard = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#121a26'],
  });
  const interpolatedText = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0b1220', '#e6eefc'],
  });
  const subtleText = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#5a6b8a', '#94a3b8'],
  });

  // POMODORO
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(POMODORO_FOCUS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // fin de cycle
          Vibration.vibrate(400);
          const nextIsBreak = !isBreak;
          setIsBreak(nextIsBreak);
          return nextIsBreak ? POMODORO_BREAK : POMODORO_FOCUS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, isBreak]);

  const toggleRun = () => setRunning((r) => !r);
  const resetTimer = () => {
    setRunning(false);
    setIsBreak(false);
    setSeconds(POMODORO_FOCUS);
  };

  // NOTES (en mémoire – simple et efficace)
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const addNote = () => {
    const content = note.trim();
    if (!content) return;
    setNotes((prev) => [{ id: Date.now().toString(), content }, ...prev]);
    setNote('');
  };
  const delNote = (id) => setNotes((prev) => prev.filter((n) => n.id !== id));

  // CHECKLIST
  const [tasks, setTasks] = useState([
    { id: '1', label: 'Lecture 20 min', done: false },
    { id: '2', label: 'Exercice 10 min', done: false },
    { id: '3', label: 'Coder 30 min', done: false },
  ]);
  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  const progress = useMemo(() => {
    const total = tasks.length || 1;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / total) * 100);
  }, [tasks]);

  // ACTIONS RAPIDES
  const handleShare = () => {
    Alert.alert('Partage', 'Intégration Share/Clipboard possible plus tard.');
  };
  const handleReload = () => {
    Alert.alert('Reload', 'Utilise la touche R dans le terminal Expo 😉');
  };

  /** ============ UI ============ **/
  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBg }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.title, { color: interpolatedText }]}>
          NutriVerse · Starter
        </Animated.Text>

        <TouchableOpacity
          style={styles.themeBtn}
          onPress={() => setDark((d) => !d)}
          activeOpacity={0.8}
        >
          <Animated.Text style={[styles.themeText, { color: interpolatedText }]}>
            {dark ? '☀️  Light' : '🌙  Dark'}
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* KPI Row */}
      <View style={styles.kpiRow}>
        <Animated.View style={[styles.kpiCard, { backgroundColor: interpolatedCard }]}>
          <Animated.Text style={[styles.kpiValue, { color: interpolatedText }]}>
            {toMinSec(seconds)}
          </Animated.Text>
          <Animated.Text style={[styles.kpiLabel, { color: subtleText }]}>
            {isBreak ? 'Break' : 'Focus'}
          </Animated.Text>
        </Animated.View>

        <Animated.View style={[styles.kpiCard, { backgroundColor: interpolatedCard }]}>
          <Animated.Text style={[styles.kpiValue, { color: interpolatedText }]}>
            {progress}%
          </Animated.Text>
          <Animated.Text style={[styles.kpiLabel, { color: subtleText }]}>
            Progression
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Pomodoro Card */}
      <Animated.View style={[styles.card, { backgroundColor: interpolatedCard }]}>
        <Animated.Text style={[styles.cardTitle, { color: interpolatedText }]}>
          Pomodoro Pro
        </Animated.Text>
        <Animated.Text style={[styles.cardSubtitle, { color: subtleText }]}>
          {isBreak ? 'Pause active 5:00' : 'Session focus 25:00'}
        </Animated.Text>

        <View style={styles.row}>
          <ActionButton label={running ? 'Pause' : 'Start'} onPress={toggleRun} />
          <ActionButton label="Reset" onPress={resetTimer} dim />
          <ActionButton
            label={isBreak ? 'Focus' : 'Break'}
            onPress={() => {
              setRunning(false);
              setIsBreak((b) => !b);
              setSeconds((b) => (isBreak ? POMODORO_FOCUS : POMODORO_BREAK));
            }}
          />
        </View>
      </Animated.View>

      {/* Notes */}
      <Animated.View style={[styles.card, { backgroundColor: interpolatedCard }]}>
        <Animated.Text style={[styles.cardTitle, { color: interpolatedText }]}>
          Notes rapides
        </Animated.Text>
        <View style={styles.noteRow}>
          <TextInput
            placeholder="Écris une idée…"
            placeholderTextColor={dark ? '#7b8aa3' : '#8aa0c2'}
            value={note}
            onChangeText={setNote}
            style={[
              styles.input,
              { color: dark ? '#e6eefc' : '#0b1220', borderColor: dark ? '#223146' : '#dbe2ee' },
            ]}
            returnKeyType="done"
            onSubmitEditing={addNote}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addNote} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {notes.length === 0 ? (
          <Animated.Text style={[styles.empty, { color: subtleText }]}>
            Aucune note pour l’instant.
          </Animated.Text>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            style={{ marginTop: 10 }}
            renderItem={({ item }) => (
              <View style={styles.noteItem}>
                <Animated.Text style={[styles.noteText, { color: interpolatedText }]}>
                  {item.content}
                </Animated.Text>
                <TouchableOpacity onPress={() => delNote(item.id)}>
                  <Text style={styles.delete}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </Animated.View>

      {/* Checklist & Quick Actions */}
      <View style={styles.rowCol}>
        <Animated.View style={[styles.cardHalf, { backgroundColor: interpolatedCard }]}>
          <Animated.Text style={[styles.cardTitle, { color: interpolatedText }]}>
            Checklist
          </Animated.Text>
          {tasks.map((t) => (
            <TouchableOpacity key={t.id} style={styles.taskRow} onPress={() => toggleTask(t.id)}>
              <View style={[styles.checkbox, t.done && styles.checkboxOn]} />
              <Animated.Text
                style={[
                  styles.taskText,
                  { color: interpolatedText, textDecorationLine: t.done ? 'line-through' : 'none' },
                ]}
              >
                {t.label}
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View style={[styles.cardHalf, { backgroundColor: interpolatedCard }]}>
          <Animated.Text style={[styles.cardTitle, { color: interpolatedText }]}>
            Actions rapides
          </Animated.Text>
          <View style={styles.quickRow}>
            <QuickBtn label="Partager" onPress={handleShare} />
            <QuickBtn label="Vibrer" onPress={() => Vibration.vibrate(80)} />
            <QuickBtn label="Reload" onPress={handleReload} />
          </View>
          <Animated.Text style={[styles.helper, { color: subtleText }]}>
            Astuce: sur le terminal Expo, tape <Text style={styles.code}>r</Text> pour recharger.
          </Animated.Text>
        </Animated.View>
      </View>

      <View style={{ height: 32 }} />
    </Animated.View>
  );
}

/** ============ UI atoms ============ **/
const ActionButton = ({ label, onPress, dim }) => (
  <TouchableOpacity
    style={[styles.actionBtn, dim && { opacity: 0.7 }]}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const QuickBtn = ({ label, onPress }) => (
  <TouchableOpacity style={styles.quickBtn} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.quickText}>{label}</Text>
  </TouchableOpacity>
);

/** ============ Styles ============ **/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.select({ ios: 52, android: 36 }),
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  themeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(120,140,170,0.35)',
  },
  themeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(120,140,170,0.25)',
  },
  kpiValue: { fontSize: 24, fontWeight: '800' },
  kpiLabel: { marginTop: 6, fontSize: 13 },

  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(120,140,170,0.25)',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, marginBottom: 10 },

  row: { flexDirection: 'row', gap: 10, marginTop: 6 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },

  noteRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '800' },

  empty: { marginTop: 8, fontSize: 13 },
  noteItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,140,170,0.2)',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteText: { fontSize: 15, flex: 1, paddingRight: 12 },
  delete: { color: '#ef4444', fontWeight: '700' },

  rowCol: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cardHalf: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(120,140,170,0.25)',
  },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  checkboxOn: { backgroundColor: '#3b82f6' },
  taskText: { fontSize: 15, fontWeight: '600' },

  quickRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120,140,170,0.25)',
  },
  quickText: { fontWeight: '800' },
  helper: { marginTop: 8, fontSize: 12 },
});
