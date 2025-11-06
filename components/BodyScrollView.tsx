import { forwardRef } from "react";
import { ScrollView, ScrollViewProps, Pressable } from "react-native";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useWidget } from "@/contexts/WidgetContext";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "./IconSymbol";

export const BodyScrollView = forwardRef<any, ScrollViewProps>((props, ref) => {
  return (
    <ScrollView
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{ bottom: 0 }}
      scrollIndicatorInsets={{ bottom: 0 }}
      {...props}
      ref={ref}
    />
  );
});

export function DailyOverview() {
  const { healthEntries, getEntriesByDate } = useWidget();
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = getEntriesByDate(today);

  const calculateAveragePulse = () => {
    if (todayEntries.length === 0) return 0;
    const pulses = todayEntries
      .filter(e => e.pulseResting)
      .map(e => e.pulseResting || 0);
    if (pulses.length === 0) return 0;
    return Math.round(pulses.reduce((a, b) => a + b, 0) / pulses.length);
  };

  const getMedicationCount = () => {
    return todayEntries.filter(e => e.medication).length;
  };

  const getAverageMood = () => {
    const moods = todayEntries.filter(e => e.mood).map(e => e.mood || 0);
    if (moods.length === 0) return 0;
    return Math.round(moods.reduce((a, b) => a + b, 0) / moods.length);
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😞';
    if (mood <= 4) return '😐';
    if (mood <= 6) return '🙂';
    if (mood <= 8) return '😊';
    return '😄';
  };

  const avgPulse = calculateAveragePulse();
  const medCount = getMedicationCount();
  const avgMood = getAverageMood();

  return (
    <View style={styles.container}>
      <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Today's Overview</Text>
      <View style={styles.overviewGrid}>
        <View style={[styles.overviewCard, { borderLeftColor: colors.primary }]}>
          <View style={styles.cardHeader}>
            <IconSymbol name="heart.fill" color={colors.primary} size={20} />
            <Text style={styles.cardLabel}>Avg Pulse</Text>
          </View>
          <Text style={styles.cardValue}>{avgPulse || '—'}</Text>
          <Text style={styles.cardUnit}>bpm</Text>
        </View>

        <View style={[styles.overviewCard, { borderLeftColor: colors.secondary }]}>
          <View style={styles.cardHeader}>
            <IconSymbol name="pills.fill" color={colors.secondary} size={20} />
            <Text style={styles.cardLabel}>Medications</Text>
          </View>
          <Text style={styles.cardValue}>{medCount}</Text>
          <Text style={styles.cardUnit}>taken today</Text>
        </View>

        <View style={[styles.overviewCard, { borderLeftColor: colors.accent }]}>
          <View style={styles.cardHeader}>
            <Text style={{ fontSize: 16 }}>{getMoodEmoji(avgMood)}</Text>
            <Text style={styles.cardLabel}>Mood</Text>
          </View>
          <Text style={styles.cardValue}>{avgMood || '—'}</Text>
          <Text style={styles.cardUnit}>/ 10</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  cardUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textSecondary,
  },
});

export function DrinkTracker() {
  const { drinkEntries, getDrinkEntriesByDate, addDrinkEntry } = useWidget();
  const today = new Date().toISOString().split('T')[0];
  const todayDrinks = getDrinkEntriesByDate(today);

  const totalDrinkToday = todayDrinks.reduce((sum, entry) => sum + entry.amount, 0);
  const dailyGoal = 2500;
  const progressPercent = Math.min((totalDrinkToday / dailyGoal) * 100, 100);

  const handleAddDrink = (amount: number) => {
    const newEntry = {
      id: Date.now().toString(),
      date: today,
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      amount,
    };
    addDrinkEntry(newEntry);
  };

  return (
    <View style={drinkStyles.container}>
      <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Water Intake</Text>
      
      <View style={drinkStyles.progressContainer}>
        <View style={drinkStyles.progressBar}>
          <View
            style={[
              drinkStyles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <Text style={drinkStyles.progressText}>
          {Math.round(totalDrinkToday)} / {dailyGoal} ml
        </Text>
      </View>

      <View style={drinkStyles.buttonRow}>
        <Pressable
          style={[drinkStyles.addButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleAddDrink(250)}
        >
          <IconSymbol name="drop.fill" color={colors.primary} size={20} />
          <Text style={[drinkStyles.buttonText, { color: colors.primary }]}>250ml</Text>
        </Pressable>
        <Pressable
          style={[drinkStyles.addButton, { backgroundColor: colors.secondary + '20' }]}
          onPress={() => handleAddDrink(500)}
        >
          <IconSymbol name="drop.fill" color={colors.secondary} size={20} />
          <Text style={[drinkStyles.buttonText, { color: colors.secondary }]}>500ml</Text>
        </Pressable>
        <Pressable
          style={[drinkStyles.addButton, { backgroundColor: colors.accent + '20' }]}
          onPress={() => handleAddDrink(750)}
        >
          <IconSymbol name="drop.fill" color={colors.accent} size={20} />
          <Text style={[drinkStyles.buttonText, { color: colors.accent }]}>750ml</Text>
        </Pressable>
      </View>
    </View>
  );
}

const drinkStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BodyScrollView;
