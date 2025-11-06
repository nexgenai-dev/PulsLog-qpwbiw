
import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Platform, Alert, TextInput, Modal } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles, getTranslation, Language } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  const theme = useTheme();
  const { healthEntries, getEntriesByDate, deleteHealthEntry, userProfile, appointments, getAppointmentsByDate, addAppointment, deleteAppointment } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false);
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      getTranslation('calendar.deleteEntry', currentLanguage),
      getTranslation('calendar.deleteConfirm', currentLanguage),
      [
        { text: getTranslation('profile.cancel', currentLanguage), onPress: () => console.log('Delete cancelled') },
        {
          text: getTranslation('calendar.deleteEntry', currentLanguage),
          onPress: async () => {
            await deleteHealthEntry(entryId);
            Alert.alert('Success', 'Entry deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

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
  const selectedAppointments = getAppointmentsByDate(dateString);

  const handleAddAppointment = async () => {
    if (!appointmentTitle.trim()) {
      Alert.alert('Error', 'Please enter an appointment title');
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      date: dateString,
      time: appointmentTime.toTimeString().slice(0, 5),
      title: appointmentTitle,
      notes: appointmentNotes,
    };

    await addAppointment(newAppointment);
    setAppointmentTitle('');
    setAppointmentNotes('');
    setAppointmentTime(new Date());
    setIsAppointmentModalVisible(false);
    Alert.alert('Success', 'Appointment added successfully');
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    Alert.alert(
      getTranslation('appointments.deleteAppointment', currentLanguage),
      getTranslation('appointments.deleteConfirm', currentLanguage),
      [
        { text: getTranslation('profile.cancel', currentLanguage), onPress: () => console.log('Delete cancelled') },
        {
          text: getTranslation('appointments.deleteAppointment', currentLanguage),
          onPress: async () => {
            await deleteAppointment(appointmentId);
            Alert.alert('Success', 'Appointment deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setAppointmentTime(selectedTime);
    }
  };

  const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={commonStyles.title}>{getTranslation('calendar.title', currentLanguage)}</Text>

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

        {(selectedEntries.length > 0 || selectedAppointments.length > 0) && (
          <View style={styles.entriesContainer}>
            {selectedEntries.length > 0 && (
              <>
                <Text style={commonStyles.subtitle}>Health Entries</Text>
                {selectedEntries.map((entry) => (
                  <View key={entry.id} style={[commonStyles.card, styles.entryCard]}>
                    <View style={styles.entryHeader}>
                      <Text style={commonStyles.text}>{entry.time}</Text>
                      <Pressable
                        onPress={() => handleDeleteEntry(entry.id)}
                        style={styles.deleteEntryButton}
                      >
                        <IconSymbol name="trash.fill" color={colors.error} size={18} />
                      </Pressable>
                    </View>
                    {entry.pulseResting && (
                      <Text style={commonStyles.textSecondary}>
                        {getTranslation('calendar.pulse', currentLanguage)}: {entry.pulseResting} bpm
                      </Text>
                    )}
                    {entry.systolicResting && (
                      <Text style={commonStyles.textSecondary}>
                        {getTranslation('calendar.bp', currentLanguage)}: {entry.systolicResting}/{entry.diastolicResting} mmHg
                      </Text>
                    )}
                    {entry.medication && (
                      <Text style={commonStyles.textSecondary}>
                        {getTranslation('calendar.medication', currentLanguage)}: {entry.medication} {entry.medicationAmount}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {selectedAppointments.length > 0 && (
              <>
                <Text style={[commonStyles.subtitle, { marginTop: selectedEntries.length > 0 ? 16 : 0 }]}>
                  {getTranslation('appointments.title', currentLanguage)}
                </Text>
                {selectedAppointments.map((appointment) => (
                  <View key={appointment.id} style={[commonStyles.card, styles.entryCard]}>
                    <View style={styles.entryHeader}>
                      <View>
                        <Text style={commonStyles.text}>{appointment.title}</Text>
                        <Text style={commonStyles.textSecondary}>{appointment.time}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteAppointment(appointment.id)}
                        style={styles.deleteEntryButton}
                      >
                        <IconSymbol name="trash.fill" color={colors.error} size={18} />
                      </Pressable>
                    </View>
                    {appointment.notes && (
                      <Text style={commonStyles.textSecondary}>{appointment.notes}</Text>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {selectedEntries.length === 0 && selectedAppointments.length === 0 && (
          <View style={styles.noEntriesContainer}>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('calendar.noEntries', currentLanguage)} {dateString}
            </Text>
          </View>
        )}

        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsAppointmentModalVisible(true)}
        >
          <IconSymbol name="plus" size={24} color="#fff" />
          <Text style={styles.addButtonText}>{getTranslation('appointments.newAppointment', currentLanguage)}</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={isAppointmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAppointmentModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsAppointmentModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getTranslation('appointments.newAppointment', currentLanguage)}
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
                {getTranslation('appointments.appointmentTitle', currentLanguage)}
              </Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('appointments.enterTitle', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={appointmentTitle}
                onChangeText={setAppointmentTitle}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>
                {getTranslation('appointments.time', currentLanguage)}
              </Text>
              <Pressable
                style={[commonStyles.input, { justifyContent: 'center' }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: colors.text }}>
                  {appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={appointmentTime}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>
                {getTranslation('appointments.notes', currentLanguage)}
              </Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text, minHeight: 100, textAlignVertical: 'top' }]}
                placeholder={getTranslation('appointments.enterNotes', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={appointmentNotes}
                onChangeText={setAppointmentNotes}
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setIsAppointmentModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                {getTranslation('profile.cancel', currentLanguage)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddAppointment}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                {getTranslation('profile.save', currentLanguage)}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
  entryCard: {
    paddingTop: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteEntryButton: {
    padding: 8,
    marginRight: -8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
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
