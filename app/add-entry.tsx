
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { checkHealthWarnings } from '@/utils/errorLogger';

export default function AddEntryScreen() {
  const theme = useTheme();
  const { addHealthEntry, userProfile } = useWidget();
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [medication, setMedication] = useState('');
  const [medicationAmount, setMedicationAmount] = useState('');
  const [pulseResting, setPulseResting] = useState('');
  const [pulseSitting, setPulseSitting] = useState('');
  const [pulseStanding, setPulseStanding] = useState('');
  const [systolicResting, setSystolicResting] = useState('');
  const [diastolicResting, setDiastolicResting] = useState('');
  const [systolicSitting, setSystolicSitting] = useState('');
  const [diastolicSitting, setDiastolicSitting] = useState('');
  const [systolicStanding, setSystolicStanding] = useState('');
  const [diastolicStanding, setDiastolicStanding] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!pulseResting && !systolicResting) {
      Alert.alert('Error', 'Please enter at least pulse or blood pressure data');
      return;
    }

    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time,
      medication: medication || undefined,
      medicationAmount: medicationAmount || undefined,
      pulseResting: pulseResting ? parseInt(pulseResting) : undefined,
      pulseSitting: pulseSitting ? parseInt(pulseSitting) : undefined,
      pulseStanding: pulseStanding ? parseInt(pulseStanding) : undefined,
      systolicResting: systolicResting ? parseInt(systolicResting) : undefined,
      diastolicResting: diastolicResting ? parseInt(diastolicResting) : undefined,
      systolicSitting: systolicSitting ? parseInt(systolicSitting) : undefined,
      diastolicSitting: diastolicSitting ? parseInt(diastolicSitting) : undefined,
      systolicStanding: systolicStanding ? parseInt(systolicStanding) : undefined,
      diastolicStanding: diastolicStanding ? parseInt(diastolicStanding) : undefined,
      notes: notes || undefined,
    };

    if (userProfile) {
      const warnings = checkHealthWarnings(entry, userProfile);
      if (warnings.length > 0) {
        Alert.alert('Health Alert', warnings.join('\n'));
      }
    }

    await addHealthEntry(entry);
    Alert.alert('Success', 'Entry saved successfully');
    router.back();
  };

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={commonStyles.title}>Add Health Entry</Text>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Time</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="HH:MM"
            placeholderTextColor={colors.textSecondary}
            value={time}
            onChangeText={setTime}
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Medication</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Medication name"
            placeholderTextColor={colors.textSecondary}
            value={medication}
            onChangeText={setMedication}
          />
          <TextInput
            style={commonStyles.input}
            placeholder="Amount (e.g., 1 tablet, 5ml)"
            placeholderTextColor={colors.textSecondary}
            value={medicationAmount}
            onChangeText={setMedicationAmount}
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Pulse (bpm)</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Resting"
              placeholderTextColor={colors.textSecondary}
              value={pulseResting}
              onChangeText={setPulseResting}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Sitting"
              placeholderTextColor={colors.textSecondary}
              value={pulseSitting}
              onChangeText={setPulseSitting}
              keyboardType="number-pad"
            />
          </View>
          <TextInput
            style={commonStyles.input}
            placeholder="Standing"
            placeholderTextColor={colors.textSecondary}
            value={pulseStanding}
            onChangeText={setPulseStanding}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Blood Pressure (mmHg)</Text>
          <Text style={commonStyles.textSecondary}>Resting</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Systolic"
              placeholderTextColor={colors.textSecondary}
              value={systolicResting}
              onChangeText={setSystolicResting}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Diastolic"
              placeholderTextColor={colors.textSecondary}
              value={diastolicResting}
              onChangeText={setDiastolicResting}
              keyboardType="number-pad"
            />
          </View>

          <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>Sitting</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Systolic"
              placeholderTextColor={colors.textSecondary}
              value={systolicSitting}
              onChangeText={setSystolicSitting}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Diastolic"
              placeholderTextColor={colors.textSecondary}
              value={diastolicSitting}
              onChangeText={setDiastolicSitting}
              keyboardType="number-pad"
            />
          </View>

          <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>Standing</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Systolic"
              placeholderTextColor={colors.textSecondary}
              value={systolicStanding}
              onChangeText={setSystolicStanding}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder="Diastolic"
              placeholderTextColor={colors.textSecondary}
              value={diastolicStanding}
              onChangeText={setDiastolicStanding}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Notes</Text>
          <TextInput
            style={[commonStyles.input, styles.notesInput]}
            placeholder="Any additional notes"
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Save Entry</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  notesInput: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
