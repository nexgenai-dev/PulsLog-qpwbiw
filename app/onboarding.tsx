
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles, getTranslation, Language } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { calculateAverageValues } from '@/utils/errorLogger';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { updateUserProfile } = useWidget();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && age.trim()) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4 && height.trim() && weight.trim()) {
      const profile = {
        name,
        age: parseInt(age),
        gender,
        height: parseInt(height),
        weight: parseInt(weight),
        avgPulse: 70,
        avgSystolic: 120,
        avgDiastolic: 80,
        language,
      };

      await updateUserProfile(profile);
      router.replace('/(tabs)/(home)/');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>{getTranslation('onboarding.language', language)}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('onboarding.language.description', language)}
            </Text>
            <View style={styles.languageContainer}>
              {(['en', 'de', 'es', 'fr'] as const).map((lang) => (
                <Pressable
                  key={lang}
                  style={[
                    styles.languageButton,
                    language === lang && styles.languageButtonActive,
                    language === lang && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      language === lang && { color: '#fff' },
                    ]}
                  >
                    {lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : lang === 'es' ? 'Español' : 'Français'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>{getTranslation('onboarding.welcome', language)}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('onboarding.welcome.description', language)}
            </Text>
            <Text style={[commonStyles.subtitle, { marginTop: 24 }]}>{getTranslation('onboarding.name', language)}</Text>
            <TextInput
              style={[commonStyles.input, { marginTop: 12 }]}
              placeholder={getTranslation('onboarding.enterName', language)}
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              editable={true}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>{getTranslation('onboarding.age', language)}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('onboarding.age.description', language)}
            </Text>
            <TextInput
              style={[commonStyles.input, { marginTop: 24 }]}
              placeholder={getTranslation('onboarding.enterAge', language)}
              placeholderTextColor={colors.textSecondary}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              editable={true}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>{getTranslation('onboarding.gender', language)}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('onboarding.gender.description', language)}
            </Text>
            <View style={styles.genderContainer}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <Pressable
                  key={g}
                  style={[
                    styles.genderButton,
                    gender === g && styles.genderButtonActive,
                    gender === g && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === g && { color: '#fff' },
                    ]}
                  >
                    {getTranslation(`onboarding.${g}`, language)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>{getTranslation('onboarding.measurements', language)}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('onboarding.measurements.description', language)}
            </Text>
            <TextInput
              style={[commonStyles.input, { marginTop: 24 }]}
              placeholder={getTranslation('onboarding.height', language)}
              placeholderTextColor={colors.textSecondary}
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
              editable={true}
            />
            <TextInput
              style={[commonStyles.input, { marginTop: 12 }]}
              placeholder={getTranslation('onboarding.weight', language)}
              placeholderTextColor={colors.textSecondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="number-pad"
              editable={true}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <Pressable
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>{getTranslation('onboarding.back', language)}</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            {step === 4 ? getTranslation('onboarding.getStarted', language) : getTranslation('onboarding.next', language)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  stepContainer: {
    alignItems: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    gap: 12,
    flexWrap: 'wrap',
  },
  languageButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    marginVertical: 6,
  },
  languageButtonActive: {
    borderColor: colors.primary,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: colors.lightGray,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
