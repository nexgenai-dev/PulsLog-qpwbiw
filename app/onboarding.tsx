
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { calculateAverageValues } from '@/utils/errorLogger';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { updateUserProfile } = useWidget();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleNext = async () => {
    if (step === 0 && name.trim()) {
      setStep(1);
    } else if (step === 1 && age.trim()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3 && height.trim() && weight.trim()) {
      const profile = {
        name,
        age: parseInt(age),
        gender,
        height: parseInt(height),
        weight: parseInt(weight),
        avgPulse: 70,
        avgSystolic: 120,
        avgDiastolic: 80,
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
            <Text style={commonStyles.title}>Welcome to PulsLog</Text>
            <Text style={commonStyles.textSecondary}>
              Track your health metrics and stay informed about your circulatory health.
            </Text>
            <Text style={[commonStyles.subtitle, { marginTop: 24 }]}>What's your name?</Text>
            <TextInput
              style={[commonStyles.input, { marginTop: 12 }]}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              editable={true}
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>Your Age</Text>
            <Text style={commonStyles.textSecondary}>
              This helps us calculate your baseline health metrics.
            </Text>
            <TextInput
              style={[commonStyles.input, { marginTop: 24 }]}
              placeholder="Enter your age"
              placeholderTextColor={colors.textSecondary}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              editable={true}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>Your Gender</Text>
            <Text style={commonStyles.textSecondary}>
              This helps us provide personalized health insights.
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
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={commonStyles.title}>Your Measurements</Text>
            <Text style={commonStyles.textSecondary}>
              Height (cm) and Weight (kg) help us calculate your health baseline.
            </Text>
            <TextInput
              style={[commonStyles.input, { marginTop: 24 }]}
              placeholder="Height (cm)"
              placeholderTextColor={colors.textSecondary}
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
              editable={true}
            />
            <TextInput
              style={[commonStyles.input, { marginTop: 12 }]}
              placeholder="Weight (kg)"
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
            <Text style={[styles.buttonText, { color: colors.primary }]}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            {step === 3 ? 'Get Started' : 'Next'}
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
