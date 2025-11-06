
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, getTranslation, Language } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";
import { Note } from "@/contexts/WidgetContext";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NotesScreen() {
  const theme = useTheme();
  const { notes, addNote, updateNote, deleteNote, userProfile } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editTime, setEditTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleCreateNote = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      Alert.alert('Error', getTranslation('notes.error', currentLanguage));
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: editTitle,
      content: editContent,
      createdAt: new Date().toISOString(),
      date: editDate ? editDate.toISOString().split('T')[0] : undefined,
      time: editTime ? editTime.toTimeString().slice(0, 5) : undefined,
    };

    await addNote(newNote);
    resetForm();
    setIsCreateModalVisible(false);
  };

  const handleUpdateNote = async () => {
    if (!editTitle.trim() || !editContent.trim() || !isEditingNote) {
      Alert.alert('Error', getTranslation('notes.error', currentLanguage));
      return;
    }

    const updatedNote: Note = {
      ...isEditingNote,
      title: editTitle,
      content: editContent,
      date: editDate ? editDate.toISOString().split('T')[0] : undefined,
      time: editTime ? editTime.toTimeString().slice(0, 5) : undefined,
    };

    await updateNote(updatedNote);
    resetForm();
    setIsCreateModalVisible(false);
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert(
      getTranslation('notes.deleteNote', currentLanguage),
      getTranslation('notes.deleteConfirm', currentLanguage),
      [
        { text: getTranslation('profile.cancel', currentLanguage), style: 'cancel' },
        {
          text: getTranslation('notes.deleteNote', currentLanguage),
          onPress: async () => {
            await deleteNote(id);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditNote = (note: Note) => {
    setIsEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditDate(note.date ? new Date(note.date) : null);
    setEditTime(note.time ? new Date(`2000-01-01T${note.time}`) : null);
    setIsCreateModalVisible(true);
  };

  const resetForm = () => {
    setEditTitle('');
    setEditContent('');
    setEditDate(null);
    setEditTime(null);
    setIsEditingNote(null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEditTime(selectedTime);
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={commonStyles.subtitle}>{getTranslation('notes.title', currentLanguage)}</Text>
        <Pressable
          onPress={() => {
            resetForm();
            setIsCreateModalVisible(true);
          }}
        >
          <IconSymbol name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sortedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="note.text" size={64} color={colors.lightGray} />
            <Text style={commonStyles.subtitle}>{getTranslation('notes.noNotes', currentLanguage)}</Text>
            <Text style={commonStyles.textSecondary}>{getTranslation('notes.createFirst', currentLanguage)}</Text>
          </View>
        ) : (
          <View style={styles.notesContainer}>
            {sortedNotes.map((note) => (
              <Pressable
                key={note.id}
                onPress={() => handleEditNote(note)}
                style={({ pressed }) => [
                  commonStyles.card,
                  styles.noteCard,
                  pressed && styles.noteCardPressed,
                ]}
              >
                <View style={styles.noteHeader}>
                  <View style={styles.noteTitle}>
                    <Text style={commonStyles.subtitle} numberOfLines={2}>
                      {note.title}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteNote(note.id)}
                    style={({ pressed }) => pressed && { opacity: 0.6 }}
                  >
                    <IconSymbol name="trash" size={20} color={colors.error} />
                  </Pressable>
                </View>

                <Text
                  style={[commonStyles.textSecondary, styles.noteContent]}
                  numberOfLines={3}
                >
                  {note.content}
                </Text>

                <View style={styles.noteFooter}>
                  {(note.date || note.time) && (
                    <Text style={commonStyles.textSecondary}>
                      {note.date && new Date(note.date).toLocaleDateString()}
                      {note.date && note.time && ' '}
                      {note.time}
                    </Text>
                  )}
                  <Text style={commonStyles.textSecondary}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsCreateModalVisible(false);
          resetForm();
        }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                setIsCreateModalVisible(false);
                resetForm();
              }}
            >
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isEditingNote ? getTranslation('notes.editNote', currentLanguage) : getTranslation('notes.newNote', currentLanguage)}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('notes.noteTitle', currentLanguage)}</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('notes.enterTitle', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={editTitle}
                onChangeText={setEditTitle}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('notes.content', currentLanguage)}</Text>
              <TextInput
                style={[
                  commonStyles.input,
                  styles.contentInput,
                  { color: colors.text }
                ]}
                placeholder={getTranslation('notes.enterContent', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('notes.date', currentLanguage)}</Text>
              <Pressable
                style={[commonStyles.input, { justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: editDate ? colors.text : colors.textSecondary }}>
                  {editDate ? editDate.toLocaleDateString() : getTranslation('notes.selectDate', currentLanguage)}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={editDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('notes.time', currentLanguage)}</Text>
              <Pressable
                style={[commonStyles.input, { justifyContent: 'center' }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: editTime ? colors.text : colors.textSecondary }}>
                  {editTime ? editTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : getTranslation('notes.selectTime', currentLanguage)}
                </Text>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={editTime || new Date()}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => {
                setIsCreateModalVisible(false);
                resetForm();
              }}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>{getTranslation('profile.cancel', currentLanguage)}</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={isEditingNote ? handleUpdateNote : handleCreateNote}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                {isEditingNote ? getTranslation('notes.update', currentLanguage) : getTranslation('notes.newNote', currentLanguage)}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  notesContainer: {
    gap: 8,
  },
  noteCard: {
    marginVertical: 4,
  },
  noteCardPressed: {
    opacity: 0.7,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  noteTitle: {
    flex: 1,
  },
  noteContent: {
    marginBottom: 8,
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
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
  contentInput: {
    minHeight: 120,
    paddingTop: 12,
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
