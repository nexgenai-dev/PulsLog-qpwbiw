
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function SamsungHealthScreen() {
  const theme = useTheme();
  const { samsungHealthData, getSamsungHealthDataByDate, updateSamsungHealthData } = useWidget();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const todayData = getSamsungHealthDataByDate(selectedDate);

  const handleSimulateData = async () => {
    setIsSimulating(true);
    
    const simulatedData = {
      id: Date.now().toString(),
      date: selectedDate,
      heartRateResting: Math.floor(Math.random() * 20) + 60,
      heartRateLight: Math.floor(Math.random() * 30) + 80,
      heartRateSports: Math.floor(Math.random() * 50) + 130,
      stepCount: Math.floor(Math.random() * 10000) + 5000,
      sleepDuration: Math.floor(Math.random() * 3) + 6,
      sleepLight: Math.floor(Math.random() * 2) + 2,
      sleepDeep: Math.floor(Math.random() * 2) + 1,
      sleepREM: Math.floor(Math.random() * 1.5) + 0.5,
      lastSyncTime: new Date().toISOString(),
    };

    const existingIndex = samsungHealthData.findIndex(d => d.date === selectedDate);
    let updatedData;
    
    if (existingIndex >= 0) {
      updatedData = [...samsungHealthData];
      updatedData[existingIndex] = simulatedData;
    } else {
      updatedData = [...samsungHealthData, simulatedData];
    }

    await updateSamsungHealthData(updatedData);
    setIsSimulating(false);
    Alert.alert('Success', 'Samsung Health data simulated and saved');
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all Samsung Health data?',
      [
        { text: 'Cancel', onPress: () => console.log('Clear cancelled') },
        {
          text: 'Clear',
          onPress: async () => {
            await updateSamsungHealthData([]);
            Alert.alert('Success', 'All Samsung Health data cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={commonStyles.title}>Samsung Health Integration</Text>
        <Text style={commonStyles.textSecondary}>
          View and manage your Samsung Galaxy Watch 7 health data
        </Text>

        <View style={styles.infoBox}>
          <IconSymbol name="info.circle.fill" color={colors.accent} size={20} />
          <Text style={styles.infoText}>
            This feature allows you to sync health data from your Samsung Galaxy Watch 7. Currently showing simulated data for demonstration purposes.
          </Text>
        </View>

        {todayData ? (
          <>
            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>Heart Rate Data</Text>
              <View style={styles.dataGrid}>
                <View style={[styles.dataCard, { borderLeftColor: colors.primary }]}>
                  <Text style={styles.dataLabel}>Resting</Text>
                  <Text style={styles.dataValue}>{todayData.heartRateResting || '—'}</Text>
                  <Text style={styles.dataUnit}>bpm</Text>
                </View>
                <View style={[styles.dataCard, { borderLeftColor: colors.secondary }]}>
                  <Text style={styles.dataLabel}>Light Activity</Text>
                  <Text style={styles.dataValue}>{todayData.heartRateLight || '—'}</Text>
                  <Text style={styles.dataUnit}>bpm</Text>
                </View>
                <View style={[styles.dataCard, { borderLeftColor: colors.accent }]}>
                  <Text style={styles.dataLabel}>Sports</Text>
                  <Text style={styles.dataValue}>{todayData.heartRateSports || '—'}</Text>
                  <Text style={styles.dataUnit}>bpm</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>Activity Data</Text>
              <View style={commonStyles.card}>
                <View style={styles.dataRow}>
                  <View style={styles.dataRowLeft}>
                    <IconSymbol name="figure.walk" color={colors.primary} size={24} />
                    <Text style={styles.dataRowLabel}>Steps Today</Text>
                  </View>
                  <Text style={styles.dataRowValue}>{todayData.stepCount || '—'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>Sleep Data</Text>
              <View style={commonStyles.card}>
                <View style={styles.dataRow}>
                  <View style={styles.dataRowLeft}>
                    <IconSymbol name="moon.zzz.fill" color={colors.secondary} size={24} />
                    <Text style={styles.dataRowLabel}>Total Sleep Duration</Text>
                  </View>
                  <Text style={styles.dataRowValue}>{todayData.sleepDuration || '—'} h</Text>
                </View>
              </View>

              <View style={styles.sleepPhasesContainer}>
                <Text style={[commonStyles.subtitle, { marginTop: 12, marginBottom: 12 }]}>Sleep Phases</Text>
                <View style={styles.sleepPhaseRow}>
                  <View style={[styles.sleepPhaseCard, { backgroundColor: colors.primary + '30' }]}>
                    <Text style={styles.sleepPhaseLabel}>Light Sleep</Text>
                    <Text style={styles.sleepPhaseValue}>{todayData.sleepLight || '—'} h</Text>
                  </View>
                  <View style={[styles.sleepPhaseCard, { backgroundColor: colors.secondary + '30' }]}>
                    <Text style={styles.sleepPhaseLabel}>Deep Sleep</Text>
                    <Text style={styles.sleepPhaseValue}>{todayData.sleepDeep || '—'} h</Text>
                  </View>
                  <View style={[styles.sleepPhaseCard, { backgroundColor: colors.accent + '30' }]}>
                    <Text style={styles.sleepPhaseLabel}>REM Sleep</Text>
                    <Text style={styles.sleepPhaseValue}>{todayData.sleepREM || '—'} h</Text>
                  </View>
                </View>
              </View>

              {todayData.lastSyncTime && (
                <Text style={[commonStyles.textSecondary, { marginTop: 12, textAlign: 'center' }]}>
                  Last synced: {new Date(todayData.lastSyncTime).toLocaleString()}
                </Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <IconSymbol name="exclamationmark.circle.fill" color={colors.textSecondary} size={48} />
            <Text style={[commonStyles.subtitle, { marginTop: 16 }]}>No Data Available</Text>
            <Text style={commonStyles.textSecondary}>
              No Samsung Health data found for {selectedDate}. Tap the button below to simulate data.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Data Management</Text>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleSimulateData}
            disabled={isSimulating}
          >
            <IconSymbol name="arrow.clockwise" color={colors.primary} size={20} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              {isSimulating ? 'Syncing...' : 'Simulate Samsung Health Data'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleClearData}
          >
            <IconSymbol name="trash.fill" color={colors.error} size={20} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Clear All Data</Text>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <IconSymbol name="info.circle.fill" color={colors.accent} size={20} />
          <Text style={styles.infoText}>
            To enable real Samsung Health integration, you need to:
            1. Install Samsung Health app on your device
            2. Grant necessary permissions in app settings
            3. Enable data sync in Samsung Health settings
          </Text>
        </View>
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
  section: {
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.highlight + '30',
    borderLeftColor: colors.accent,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 12,
    marginVertical: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dataCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dataValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  dataUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dataRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dataRowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  sleepPhasesContainer: {
    marginTop: 16,
  },
  sleepPhaseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sleepPhaseCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepPhaseLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sleepPhaseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
