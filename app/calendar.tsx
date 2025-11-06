
import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function CalendarScreen() {
  const theme = useTheme();
  const { healthEntries, getEntriesByDate } = useWidget();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
  };

  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDay = getFirstDayOfMonth(selectedDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const dateString = selectedDate.toISOString().split('T')[0];
  const selectedEntries = getEntriesByDate(dateString);

  const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={commonStyles.title}>Calendar</Text>

        <View style={styles.monthHeader}>
          <Pressable onPress={handlePrevMonth} style={styles.monthButton}>
            <IconSymbol name="chevron.left" color={colors.primary} size={24} />
          </Pressable>
          <Text style={styles.monthText}>{monthName}</Text>
          <Pressable onPress={handleNextMonth} style={styles.monthButton}>
            <IconSymbol name="chevron.right" color={colors.primary} size={24} />
          </Pressable>
        </View>

        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            const dateStr = day
              ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                  .toISOString()
                  .split('T')[0]
              : null;
            const hasEntries = dateStr ? getEntriesByDate(dateStr).length > 0 : false;
            const isSelected = day === selectedDate.getDate();

            return (
              <Pressable
                key={index}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonSelected,
                  isSelected && { backgroundColor: colors.primary },
                  hasEntries && !isSelected && styles.dayButtonWithEntries,
                ]}
                onPress={() => day && handleDateSelect(day)}
                disabled={!day}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day && styles.dayTextEmpty,
                    isSelected && { color: '#fff' },
                    hasEntries && !isSelected && { color: colors.primary },
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedEntries.length > 0 && (
          <View style={styles.entriesContainer}>
            <Text style={commonStyles.subtitle}>Entries for {dateString}</Text>
            {selectedEntries.map((entry) => (
              <View key={entry.id} style={commonStyles.card}>
                <Text style={commonStyles.text}>{entry.time}</Text>
                {entry.pulseResting && (
                  <Text style={commonStyles.textSecondary}>
                    Pulse: {entry.pulseResting} bpm
                  </Text>
                )}
                {entry.systolicResting && (
                  <Text style={commonStyles.textSecondary}>
                    BP: {entry.systolicResting}/{entry.diastolicResting} mmHg
                  </Text>
                )}
                {entry.medication && (
                  <Text style={commonStyles.textSecondary}>
                    Medication: {entry.medication} {entry.medicationAmount}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {selectedEntries.length === 0 && (
          <View style={styles.noEntriesContainer}>
            <Text style={commonStyles.textSecondary}>
              No entries for {dateString}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 100 : 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  dayButtonSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayButtonWithEntries: {
    backgroundColor: colors.highlight + '40',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dayTextEmpty: {
    color: colors.lightGray,
  },
  entriesContainer: {
    marginTop: 24,
  },
  noEntriesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});
