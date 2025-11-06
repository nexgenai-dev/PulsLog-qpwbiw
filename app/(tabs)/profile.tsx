import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";
import { calculateAverageValues } from "@/utils/errorLogger";

export default function ProfileScreen() {
  const theme = useTheme();
  const { userProfile, updateUserProfile, healthEntries } = useWidget();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editHeight, setEditHeight] = useState(userProfile?.height.toString() || '');
  const [editWeight, setEditWeight] = useState(userProfile?.weight.toString() || '');
  const [editAge, setEditAge] = useState(userProfile?.age.toString() || '');

  const averageValues = calculateAverageValues(healthEntries);

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

  const handleSaveProfileChanges = async () => {
    if (!editHeight || !editWeight || !editAge) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        height: parseInt(editHeight),
        weight: parseInt(editWeight),
        age: parseInt(editAge),
      };
      await updateUserProfile(updatedProfile);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    }
  };

  const handleOpenEditModal = () => {
    if (userProfile) {
      setEditHeight(userProfile.height.toString());
      setEditWeight(userProfile.weight.toString());
      setEditAge(userProfile.age.toString());
      setIsEditModalVisible(true);
    }
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
              <View style={styles.sectionHeader}>
                <Text style={commonStyles.subtitle}>Health Profile</Text>
                <Pressable onPress={handleOpenEditModal}>
                  <IconSymbol name="pencil" size={20} color={colors.primary} />
                </Pressable>
              </View>
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
              <Text style={commonStyles.subtitle}>Average Pulse by Activity Level</Text>
              <View style={commonStyles.card}>
                <View style={styles.activityPulseRow}>
                  <View style={styles.activityPulseItem}>
                    <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>Ruhe</Text>
                    <Text style={[styles.activityPulseValue, { color: colors.primary }]}>
                      {averageValues.avgPulseResting || '—'} bpm
                    </Text>
                  </View>
                  <View style={styles.activityPulseItem}>
                    <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>Leichte Aktivität</Text>
                    <Text style={[styles.activityPulseValue, { color: colors.secondary }]}>
                      {averageValues.avgPulseLight || '—'} bpm
                    </Text>
                  </View>
                  <View style={styles.activityPulseItem}>
                    <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>Sportliche Aktivität</Text>
                    <Text style={[styles.activityPulseValue, { color: colors.error }]}>
                      {averageValues.avgPulseSports || '—'} bpm
                    </Text>
                  </View>
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

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsEditModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>Height (cm)</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder="Height in cm"
                placeholderTextColor={colors.textSecondary}
                value={editHeight}
                onChangeText={setEditHeight}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>Weight (kg)</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder="Weight in kg"
                placeholderTextColor={colors.textSecondary}
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>Age (years)</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder="Age in years"
                placeholderTextColor={colors.textSecondary}
                value={editAge}
                onChangeText={setEditAge}
                keyboardType="number-pad"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveProfileChanges}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  activityPulseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  activityPulseItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  activityPulseValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
