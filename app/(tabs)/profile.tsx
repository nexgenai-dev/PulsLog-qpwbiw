import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";

export default function ProfileScreen() {
  const theme = useTheme();
  const { userProfile } = useWidget();

  const handleResetProfile = () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile? This will take you back to the onboarding screen.',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel pressed'), style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            router.replace('/onboarding');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {userProfile && (
          <>
            <View style={styles.profileHeader}>
              <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
              <Text style={[styles.name, { color: colors.text }]}>{userProfile.name}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>
                {userProfile.age} years old • {userProfile.gender}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>Health Profile</Text>
              <View style={styles.infoRow}>
                <IconSymbol name="ruler" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Height</Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.height} cm</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="scalemass" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Weight</Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.weight} kg</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="heart.fill" size={20} color={colors.secondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Avg. Pulse</Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.avgPulse} bpm</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>Health Baselines</Text>
              <View style={commonStyles.card}>
                <Text style={commonStyles.textSecondary}>
                  Systolic: {userProfile.avgSystolic} mmHg
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Diastolic: {userProfile.avgDiastolic} mmHg
                </Text>
                <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
                  These values help detect significant deviations in your health metrics.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>About PulsLog</Text>
              <View style={commonStyles.card}>
                <Text style={commonStyles.textSecondary}>
                  PulsLog helps you track your pulse, blood pressure, and medication data. It's designed for people with POTS and other circulatory disorders.
                </Text>
                <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
                  Version 1.0.0
                </Text>
              </View>
            </View>

            <Pressable
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={handleResetProfile}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Reset Profile</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
    backgroundColor: colors.card,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
