
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Pressable, Alert, TextInput, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles, getTranslation, Language } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function SettingsScreen() {
  const theme = useTheme();
  const { appSettings, updateAppSettings, userProfile } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
  const [isSecurityModalVisible, setIsSecurityModalVisible] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!appSettings) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Text style={commonStyles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    await updateAppSettings({
      ...appSettings,
      theme,
    });
  };

  const handleFontSizeChange = async (fontSize: 'small' | 'medium' | 'large') => {
    await updateAppSettings({
      ...appSettings,
      fontSize,
    });
  };

  const handleSetSecurityCode = async () => {
    if (!isConfirming) {
      if (!securityCode.trim()) {
        Alert.alert('Error', 'Please enter a code');
        return;
      }
      setIsConfirming(true);
      return;
    }

    if (securityCode !== confirmCode) {
      Alert.alert('Error', getTranslation('settings.codeNotMatch', currentLanguage));
      setSecurityCode('');
      setConfirmCode('');
      setIsConfirming(false);
      return;
    }

    await updateAppSettings({
      ...appSettings,
      securityCode,
      securityEnabled: true,
    });

    Alert.alert('Success', getTranslation('settings.codeSaved', currentLanguage));
    setSecurityCode('');
    setConfirmCode('');
    setIsConfirming(false);
    setIsSecurityModalVisible(false);
  };

  const handleChangeProfilePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      await updateAppSettings({
        ...appSettings,
        profileImageUri: result.assets[0].uri,
      });
      Alert.alert('Success', 'Profile picture updated');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={commonStyles.subtitle}>{getTranslation('settings.title', currentLanguage)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('settings.theme', currentLanguage)}</Text>
          <View style={styles.optionsContainer}>
            {(['light', 'dark', 'auto'] as const).map((themeOption) => (
              <Pressable
                key={themeOption}
                style={[
                  commonStyles.card,
                  styles.optionButton,
                  appSettings.theme === themeOption && styles.optionButtonActive,
                ]}
                onPress={() => handleThemeChange(themeOption)}
              >
                <View style={styles.optionContent}>
                  <IconSymbol
                    name={themeOption === 'light' ? 'sun.max.fill' : themeOption === 'dark' ? 'moon.fill' : 'gear'}
                    size={24}
                    color={appSettings.theme === themeOption ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      commonStyles.text,
                      appSettings.theme === themeOption && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {themeOption === 'light'
                      ? getTranslation('settings.light', currentLanguage)
                      : themeOption === 'dark'
                      ? getTranslation('settings.dark', currentLanguage)
                      : getTranslation('settings.auto', currentLanguage)}
                  </Text>
                </View>
                {appSettings.theme === themeOption && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('settings.fontSize', currentLanguage)}</Text>
          <View style={styles.optionsContainer}>
            {(['small', 'medium', 'large'] as const).map((sizeOption) => (
              <Pressable
                key={sizeOption}
                style={[
                  commonStyles.card,
                  styles.optionButton,
                  appSettings.fontSize === sizeOption && styles.optionButtonActive,
                ]}
                onPress={() => handleFontSizeChange(sizeOption)}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      commonStyles.text,
                      {
                        fontSize: sizeOption === 'small' ? 12 : sizeOption === 'medium' ? 16 : 20,
                      },
                      appSettings.fontSize === sizeOption && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {sizeOption === 'small'
                      ? getTranslation('settings.small', currentLanguage)
                      : sizeOption === 'medium'
                      ? getTranslation('settings.medium', currentLanguage)
                      : getTranslation('settings.large', currentLanguage)}
                  </Text>
                </View>
                {appSettings.fontSize === sizeOption && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('settings.security', currentLanguage)}</Text>
          <Pressable
            style={[commonStyles.card, styles.settingRow]}
            onPress={() => setIsSecurityModalVisible(true)}
          >
            <View style={styles.settingContent}>
              <IconSymbol name="lock.fill" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={commonStyles.text}>{getTranslation('settings.setSecurityCode', currentLanguage)}</Text>
                <Text style={commonStyles.textSecondary}>
                  {appSettings.securityEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>{getTranslation('settings.profilePicture', currentLanguage)}</Text>
          <Pressable
            style={[commonStyles.card, styles.settingRow]}
            onPress={handleChangeProfilePicture}
          >
            <View style={styles.settingContent}>
              <IconSymbol name="photo.fill" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={commonStyles.text}>{getTranslation('settings.changeProfilePicture', currentLanguage)}</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={isSecurityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSecurityModalVisible(false);
          setSecurityCode('');
          setConfirmCode('');
          setIsConfirming(false);
        }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                setIsSecurityModalVisible(false);
                setSecurityCode('');
                setConfirmCode('');
                setIsConfirming(false);
              }}
            >
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getTranslation('settings.setSecurityCode', currentLanguage)}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>
                {isConfirming
                  ? getTranslation('settings.confirmCode', currentLanguage)
                  : getTranslation('settings.enterCode', currentLanguage)}
              </Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('settings.enterCode', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={isConfirming ? confirmCode : securityCode}
                onChangeText={isConfirming ? setConfirmCode : setSecurityCode}
                secureTextEntry
                keyboardType="number-pad"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => {
                setIsSecurityModalVisible(false);
                setSecurityCode('');
                setConfirmCode('');
                setIsConfirming(false);
              }}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                {getTranslation('profile.cancel', currentLanguage)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSetSecurityCode}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                {isConfirming ? getTranslation('profile.save', currentLanguage) : 'Next'}
              </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 8,
    marginTop: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
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
