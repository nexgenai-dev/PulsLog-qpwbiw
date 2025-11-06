import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, getTranslation, Language } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";
import { calculateAverageValues } from "@/utils/errorLogger";
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const theme = useTheme();
  const { userProfile, updateUserProfile, healthEntries, userStats, appSettings, updateAppSettings } = useWidget();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [editHeight, setEditHeight] = useState(userProfile?.height.toString() || '');
  const [editWeight, setEditWeight] = useState(userProfile?.weight.toString() || '');
  const [editAge, setEditAge] = useState(userProfile?.age.toString() || '');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(userProfile?.language || 'en');
  const currentLanguage: Language = userProfile?.language || 'en';

  const handleChangeProfilePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && appSettings) {
      await updateAppSettings({
        ...appSettings,
        profileImageUri: result.assets[0].uri,
      });
    }
  };

  const averageValues = calculateAverageValues(healthEntries);

  const handleResetProfile = () => {
    Alert.alert(
      getTranslation('profile.resetConfirm', currentLanguage),
      getTranslation('profile.resetConfirmMessage', currentLanguage),
      [
        { text: getTranslation('profile.cancel', currentLanguage), onPress: () => console.log('Cancel pressed'), style: 'cancel' },
        {
          text: getTranslation('profile.resetProfile', currentLanguage),
          onPress: () => {
            router.replace('/onboarding');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleChangeLanguage = async () => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        language: selectedLanguage,
      };
      await updateUserProfile(updatedProfile);
      setIsLanguageModalVisible(false);
      Alert.alert(getTranslation('profile.language', currentLanguage), getTranslation('profile.save', currentLanguage));
    }
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
            <Pressable
              style={styles.profileHeader}
              onPress={handleChangeProfilePicture}
            >
              {appSettings?.profileImageUri ? (
                <Image
                  source={{ uri: appSettings.profileImageUri }}
                  style={styles.profileImage}
                />
              ) : (
                <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
              )}
              <Text style={[styles.name, { color: colors.text }]}>{userProfile.name}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>
                {userProfile.age} years old • {userProfile.gender}
              </Text>
              {userStats && (
                <View style={styles.levelBadge}>
                  <IconSymbol name="star.fill" size={16} color={colors.accent} />
                  <Text style={styles.levelBadgeText}>Level {userStats.level}</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={commonStyles.subtitle}>{getTranslation('profile.healthProfile', currentLanguage)}</Text>
                <Pressable onPress={handleOpenEditModal}>
                  <IconSymbol name="pencil" size={20} color={colors.primary} />
                </Pressable>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="ruler" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTranslation('profile.height', currentLanguage)}</Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.height} cm</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="scalemass" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTranslation('profile.weight', currentLanguage)}</Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.weight} kg</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="heart.fill" size={20} color={colors.secondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTranslation('profile.avgPulse', currentLanguage)}</Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.avgPulse} bpm</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>{getTranslation('profile.averagePulseByActivity', currentLanguage)}</Text>
              <View style={commonStyles.card}>
                <View style={styles.activityPulseRow}>
                  <View style={styles.activityPulseItem}>
                    <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>{getTranslation('profile.resting', currentLanguage)}</Text>
                    <Text style={[styles.activityPulseValue, { color: colors.primary }]}>
                      {averageValues.avgPulseResting || '—'} bpm
                    </Text>
                  </View>
                  <View style={styles.activityPulseItem}>
                    <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>{getTranslation('profile.lightActivity', currentLanguage)}</Text>
                    <Text style={[styles.activityPulseValue, { color: colors.secondary }]}>
                      {averageValues.avgPulseLight || '—'} bpm
                    </Text>
                  </View>
                  <View style={styles.activityPulseItem}>
                    <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>{getTranslation('profile.sportsActivity', currentLanguage)}</Text>
                    <Text style={[styles.activityPulseValue, { color: colors.error }]}>
                      {averageValues.avgPulseSports || '—'} bpm
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>{getTranslation('profile.healthBaselines', currentLanguage)}</Text>
              <View style={commonStyles.card}>
                <Text style={commonStyles.textSecondary}>
                  {getTranslation('profile.systolic', currentLanguage)}: {userProfile.avgSystolic} mmHg
                </Text>
                <Text style={commonStyles.textSecondary}>
                  {getTranslation('profile.diastolic', currentLanguage)}: {userProfile.avgDiastolic} mmHg
                </Text>
                <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
                  These values help detect significant deviations in your health metrics.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>{getTranslation('profile.language', currentLanguage)}</Text>
              <Pressable
                style={commonStyles.card}
                onPress={() => {
                  setSelectedLanguage(currentLanguage);
                  setIsLanguageModalVisible(true);
                }}
              >
                <View style={styles.languageRow}>
                  <Text style={commonStyles.text}>
                    {currentLanguage === 'en' ? 'English' : currentLanguage === 'de' ? 'Deutsch' : currentLanguage === 'es' ? 'Español' : 'Français'}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={commonStyles.subtitle}>{getTranslation('profile.about', currentLanguage)}</Text>
              <View style={commonStyles.card}>
                <Text style={commonStyles.textSecondary}>
                  {getTranslation('profile.aboutDescription', currentLanguage)}
                </Text>
                <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
                  {getTranslation('profile.version', currentLanguage)}
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={() => router.push('/achievements')}
              >
                <IconSymbol name="star.fill" size={20} color="#fff" />
                <Text style={[styles.buttonText, { color: '#fff' }]}>Achievements</Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: colors.secondary, flex: 1, marginLeft: 8 }]}
                onPress={() => router.push('/settings')}
              >
                <IconSymbol name="gear" size={20} color="#fff" />
                <Text style={[styles.buttonText, { color: '#fff' }]}>Settings</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={handleResetProfile}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>{getTranslation('profile.resetProfile', currentLanguage)}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{getTranslation('profile.editProfile', currentLanguage)}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('onboarding.height', currentLanguage)}</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('onboarding.height', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={editHeight}
                onChangeText={setEditHeight}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('onboarding.weight', currentLanguage)}</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('onboarding.weight', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('onboarding.age', currentLanguage)}</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('onboarding.age', currentLanguage)}
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
              <Text style={[styles.modalButtonText, { color: colors.text }]}>{getTranslation('profile.cancel', currentLanguage)}</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveProfileChanges}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>{getTranslation('profile.save', currentLanguage)}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsLanguageModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{getTranslation('profile.language', currentLanguage)}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {(['en', 'de', 'es', 'fr'] as const).map((lang) => (
              <Pressable
                key={lang}
                style={[
                  commonStyles.card,
                  styles.languageOption,
                  selectedLanguage === lang && styles.languageOptionActive,
                ]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={[commonStyles.text, selectedLanguage === lang && { color: colors.primary, fontWeight: '600' }]}>
                    {lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : lang === 'es' ? 'Español' : 'Français'}
                  </Text>
                  {selectedLanguage === lang && (
                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setIsLanguageModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>{getTranslation('profile.cancel', currentLanguage)}</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleChangeLanguage}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>{getTranslation('profile.save', currentLanguage)}</Text>
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
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
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
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    justifyContent: 'center',
    marginVertical: 20,
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 20,
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
  languageOption: {
    marginVertical: 8,
  },
  languageOptionActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  languageOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
