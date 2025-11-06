
import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles, getTranslation, Language } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { checkHealthWarnings } from '@/utils/errorLogger';
import { IconSymbol } from '@/components/IconSymbol';

export default function AddEntryScreen() {
  const theme = useTheme();
  const { addHealthEntry, userProfile, addPoints } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
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
  const [mood, setMood] = useState(5);
  const [activityLevel, setActivityLevel] = useState<'resting' | 'light' | 'sports'>('resting');

  const currentEntry = useMemo(() => ({
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
    mood,
    activityLevel,
  }), [time, medication, medicationAmount, pulseResting, pulseSitting, pulseStanding, systolicResting, diastolicResting, systolicSitting, diastolicSitting, systolicStanding, diastolicStanding, notes, mood, activityLevel]);

  const warnings = useMemo(() => {
    if (userProfile) {
      return checkHealthWarnings(currentEntry, userProfile);
    }
    return [];
  }, [currentEntry, userProfile]);

  const handleSave = async () => {
    if (!pulseResting && !systolicResting) {
      Alert.alert('Error', getTranslation('addEntry.error', currentLanguage));
      return;
    }

    await addHealthEntry(currentEntry);
    await addPoints(20);
    Alert.alert('Success', getTranslation('addEntry.success', currentLanguage));
    router.back();
  };

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={commonStyles.title}>{getTranslation('addEntry.title', currentLanguage)}</Text>

        {warnings.length > 0 && (
          <View style={[styles.warningContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: colors.warning }]}>Health Alert</Text>
              {warnings.map((warning, index) => (
                <Text key={index} style={[commonStyles.textSecondary, { color: colors.warning }]}>
                  • {warning}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('addEntry.time', currentLanguage)}</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="HH:MM"
            placeholderTextColor={colors.textSecondary}
            value={time}
            onChangeText={setTime}
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('addEntry.activityLevel', currentLanguage)}</Text>
          <View style={styles.activityButtonsContainer}>
            {(['resting', 'light', 'sports'] as const).map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.activityButton,
                  activityLevel === level && styles.activityButtonActive,
                  { backgroundColor: activityLevel === level ? colors.primary : colors.lightGray }
                ]}
                onPress={() => setActivityLevel(level)}
              >
                <Text style={[
                  styles.activityButtonText,
                  { color: activityLevel === level ? '#fff' : colors.text }
                ]}>
                  {level === 'resting' ? getTranslation('addEntry.resting', currentLanguage) : level === 'light' ? getTranslation('addEntry.light', currentLanguage) : getTranslation('addEntry.sports', currentLanguage)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('addEntry.medication', currentLanguage)}</Text>
          <TextInput
            style={commonStyles.input}
            placeholder={getTranslation('addEntry.medicationName', currentLanguage)}
            placeholderTextColor={colors.textSecondary}
            value={medication}
            onChangeText={setMedication}
          />
          <TextInput
            style={commonStyles.input}
            placeholder={getTranslation('addEntry.medicationAmount', currentLanguage)}
            placeholderTextColor={colors.textSecondary}
            value={medicationAmount}
            onChangeText={setMedicationAmount}
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('addEntry.pulse', currentLanguage)}</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.pulseResting', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={pulseResting}
              onChangeText={setPulseResting}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.pulseSitting', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={pulseSitting}
              onChangeText={setPulseSitting}
              keyboardType="number-pad"
            />
          </View>
          <TextInput
            style={commonStyles.input}
            placeholder={getTranslation('addEntry.pulseStanding', currentLanguage)}
            placeholderTextColor={colors.textSecondary}
            value={pulseStanding}
            onChangeText={setPulseStanding}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('addEntry.bloodPressure', currentLanguage)}</Text>
          <Text style={commonStyles.textSecondary}>{getTranslation('addEntry.pulseResting', currentLanguage)}</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.systolic', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={systolicResting}
              onChangeText={setSystolicResting}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.diastolic', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={diastolicResting}
              onChangeText={setDiastolicResting}
              keyboardType="number-pad"
            />
          </View>

          <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>{getTranslation('addEntry.pulseSitting', currentLanguage)}</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.systolic', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={systolicSitting}
              onChangeText={setSystolicSitting}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.diastolic', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={diastolicSitting}
              onChangeText={setDiastolicSitting}
              keyboardType="number-pad"
            />
          </View>

          <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>{getTranslation('addEntry.pulseStanding', currentLanguage)}</Text>
          <View style={styles.row}>
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.systolic', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={systolicStanding}
              onChangeText={setSystolicStanding}
              keyboardType="number-pad"
            />
            <TextInput
              style={[commonStyles.input, styles.halfInput]}
              placeholder={getTranslation('addEntry.diastolic', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={diastolicStanding}
              onChangeText={setDiastolicStanding}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('addEntry.mood', currentLanguage)}</Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 12 }]}>{getTranslation('addEntry.mood', currentLanguage)}: {mood} / 10</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <Pressable
                key={value}
                onPress={() => setMood(value)}
                style={[
                  {
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: mood === value ? colors.primary : colors.lightGray,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Text style={{ color: mood === value ? '#FFFFFF' : colors.text, fontWeight: '600', fontSize: 12 }}>
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('addEntry.notes', currentLanguage)}</Text>
          <TextInput
            style={[commonStyles.input, styles.notesInput]}
            placeholder={getTranslation('addEntry.additionalNotes', currentLanguage)}
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
          <Text style={[styles.buttonText, { color: colors.primary }]}>{getTranslation('addEntry.cancel', currentLanguage)}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>{getTranslation('addEntry.save', currentLanguage)}</Text>
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
  activityButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  activityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityButtonActive: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  activityButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
  warningContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningContent: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
});
