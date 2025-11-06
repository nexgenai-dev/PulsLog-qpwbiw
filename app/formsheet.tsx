import { StyleSheet, Text, View, Pressable, ScrollView, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { useState, useEffect } from 'react';
import { Reminder } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 100 : 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reminderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reminderTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.highlight + '30',
    borderLeftColor: colors.accent,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 12,
    marginVertical: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
});

export default function RemindersScreen() {
  const theme = useTheme();
  const { reminders, updateReminders } = useWidget();
  const [localReminders, setLocalReminders] = useState<Reminder[]>(reminders);

  useEffect(() => {
    setLocalReminders(reminders);
  }, [reminders]);

  const handleToggleReminder = (id: string) => {
    const updated = localReminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setLocalReminders(updated);
    updateReminders(updated);
  };

  const handleAddReminder = (type: 'pulse' | 'medication') => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      type,
      time: '09:00',
      enabled: true,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    };
    const updated = [...localReminders, newReminder];
    setLocalReminders(updated);
    updateReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = localReminders.filter(r => r.id !== id);
    setLocalReminders(updated);
    updateReminders(updated);
  };

  const pulseReminders = localReminders.filter(r => r.type === 'pulse');
  const medReminders = localReminders.filter(r => r.type === 'medication');

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={commonStyles.title}>Reminders</Text>
        <Text style={commonStyles.textSecondary}>
          Set reminders for your measurements and medications
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="heart.fill" color={colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Pulse Measurements</Text>
          </View>
          {pulseReminders.map(reminder => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => handleToggleReminder(reminder.id)}
                  trackColor={{ false: colors.lightGray, true: colors.primary + '80' }}
                  thumbColor={reminder.enabled ? colors.primary : colors.textSecondary}
                />
              </View>
              <Pressable
                onPress={() => handleDeleteReminder(reminder.id)}
                style={styles.deleteButton}
              >
                <IconSymbol name="trash.fill" color={colors.error} size={18} />
              </Pressable>
            </View>
          ))}
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => handleAddReminder('pulse')}
          >
            <IconSymbol name="plus" color={colors.primary} size={20} />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Pulse Reminder</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="pills.fill" color={colors.secondary} size={20} />
            <Text style={styles.sectionTitle}>Medication</Text>
          </View>
          {medReminders.map(reminder => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => handleToggleReminder(reminder.id)}
                  trackColor={{ false: colors.lightGray, true: colors.secondary + '80' }}
                  thumbColor={reminder.enabled ? colors.secondary : colors.textSecondary}
                />
              </View>
              <Pressable
                onPress={() => handleDeleteReminder(reminder.id)}
                style={styles.deleteButton}
              >
                <IconSymbol name="trash.fill" color={colors.error} size={18} />
              </Pressable>
            </View>
          ))}
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.secondary + '20' }]}
            onPress={() => handleAddReminder('medication')}
          >
            <IconSymbol name="plus" color={colors.secondary} size={20} />
            <Text style={[styles.addButtonText, { color: colors.secondary }]}>Add Medication Reminder</Text>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Note</Text>
          <Text style={commonStyles.textSecondary}>
            Reminders are stored locally on your device. Enable notifications in your device settings to receive alerts.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
