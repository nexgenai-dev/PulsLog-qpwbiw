
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function HealthInfoScreen() {
  const theme = useTheme();

  const sections = [
    {
      title: 'What is POTS?',
      content: 'Postural Orthostatic Tachycardia Syndrome (POTS) is a condition affecting blood flow. When you stand up, your heart rate increases abnormally, and blood pools in your legs. This can cause dizziness, fatigue, and fainting.',
    },
    {
      title: 'POTS Symptoms',
      content: 'Common symptoms include: rapid heartbeat when standing, dizziness or lightheadedness, fatigue, brain fog, shortness of breath, chest pain, and fainting. Symptoms often worsen with heat, exercise, or prolonged standing.',
    },
    {
      title: 'Managing POTS',
      content: 'Management strategies include: increasing salt and fluid intake, wearing compression stockings, avoiding prolonged standing, regular exercise (especially lying down), and medications prescribed by your doctor. Always consult with a healthcare provider.',
    },
    {
      title: 'Other Circulatory Disorders',
      content: 'Other conditions affecting circulation include: Dysautonomia, Ehlers-Danlos Syndrome (EDS), Mast Cell Activation Syndrome (MCAS), and various forms of hypotension. Each requires individualized management.',
    },
    {
      title: 'When to Seek Help',
      content: 'Seek immediate medical attention if you experience: severe chest pain, difficulty breathing, loss of consciousness, or severe symptoms that don\'t improve with your usual management strategies.',
    },
    {
      title: 'Using PulsLog',
      content: 'PulsLog helps you track your health metrics over time. Record your pulse and blood pressure in different positions (resting, sitting, standing) to identify patterns. Share this data with your healthcare provider for better management.',
    },
  ];

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={commonStyles.title}>Health Information</Text>
        <Text style={commonStyles.textSecondary}>
          Learn about circulatory disorders and how to manage them
        </Text>

        {sections.map((section, index) => (
          <View key={index} style={commonStyles.card}>
            <Text style={commonStyles.subtitle}>{section.title}</Text>
            <Text style={commonStyles.textSecondary}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
          <Text style={commonStyles.textSecondary}>
            This app is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider before making any changes to your health management plan.
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
  disclaimerCard: {
    backgroundColor: colors.highlight + '30',
    borderLeftColor: colors.accent,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
  },
});
