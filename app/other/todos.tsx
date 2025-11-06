
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";
import { TodoList, TodoTask } from "@/contexts/WidgetContext";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TodosScreen() {
  const theme = useTheme();
  const { todoLists, addTodoList, updateTodoList, deleteTodoList } = useWidget();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null);
  const [newTaskDueTime, setNewTaskDueTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const selectedList = todoLists.find(l => l.id === selectedListId);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    const newList: TodoList = {
      id: Date.now().toString(),
      name: newListName,
      createdAt: new Date().toISOString(),
      tasks: [],
    };

    await addTodoList(newList);
    setNewListName('');
    setIsCreateModalVisible(false);
  };

  const handleDeleteList = (id: string) => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteTodoList(id);
            if (selectedListId === id) {
              setSelectedListId(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedList) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: TodoTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      listId: selectedList.id,
      dueDate: newTaskDueDate ? newTaskDueDate.toISOString().split('T')[0] : undefined,
      dueTime: newTaskDueTime ? newTaskDueTime.toTimeString().slice(0, 5) : undefined,
    };

    const updatedList = {
      ...selectedList,
      tasks: [...selectedList.tasks, newTask],
    };

    await updateTodoList(updatedList);
    setNewTaskTitle('');
    setNewTaskDueDate(null);
    setNewTaskDueTime(null);
    setIsTaskModalVisible(false);
  };

  const handleToggleTask = async (taskId: string) => {
    if (!selectedList) return;

    const updatedTasks = selectedList.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    await updateTodoList({
      ...selectedList,
      tasks: updatedTasks,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedList) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const updatedTasks = selectedList.tasks.filter(t => t.id !== taskId);
            await updateTodoList({
              ...selectedList,
              tasks: updatedTasks,
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewTaskDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNewTaskDueTime(selectedTime);
    }
  };

  const sortedTasks = selectedList
    ? [...selectedList.tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return 0;
      })
    : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={commonStyles.subtitle}>To-Do Lists</Text>
        <Pressable onPress={() => setIsCreateModalVisible(true)}>
          <IconSymbol name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {!selectedList ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {todoLists.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" size={64} color={colors.lightGray} />
              <Text style={commonStyles.subtitle}>No To-Do Lists Yet</Text>
              <Text style={commonStyles.textSecondary}>Create your first list to get started</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {todoLists.map((list) => (
                <Pressable
                  key={list.id}
                  onPress={() => setSelectedListId(list.id)}
                  style={({ pressed }) => [
                    commonStyles.card,
                    styles.listItem,
                    pressed && styles.listItemPressed,
                  ]}
                >
                  <View style={styles.listItemContent}>
                    <View>
                      <Text style={commonStyles.subtitle}>{list.name}</Text>
                      <Text style={commonStyles.textSecondary}>
                        {list.tasks.length} task{list.tasks.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteList(list.id)}
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                    >
                      <IconSymbol name="trash" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listHeader}>
            <Pressable onPress={() => setSelectedListId(null)}>
              <IconSymbol name="chevron.left" size={20} color={colors.primary} />
            </Pressable>
            <Text style={commonStyles.subtitle}>{selectedList.name}</Text>
            <Pressable onPress={() => setIsTaskModalVisible(true)}>
              <IconSymbol name="plus" size={20} color={colors.primary} />
            </Pressable>
          </View>

          {sortedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" size={64} color={colors.lightGray} />
              <Text style={commonStyles.subtitle}>No Tasks Yet</Text>
              <Text style={commonStyles.textSecondary}>Add a task to get started</Text>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {sortedTasks.map((task) => (
                <View key={task.id} style={commonStyles.card}>
                  <View style={styles.taskItem}>
                    <Pressable
                      onPress={() => handleToggleTask(task.id)}
                      style={styles.taskCheckbox}
                    >
                      <IconSymbol
                        name={task.completed ? "checkmark.circle.fill" : "circle"}
                        size={24}
                        color={task.completed ? colors.secondary : colors.lightGray}
                      />
                    </Pressable>
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          commonStyles.text,
                          task.completed && styles.completedTask,
                        ]}
                      >
                        {task.title}
                      </Text>
                      {(task.dueDate || task.dueTime) && (
                        <Text style={commonStyles.textSecondary}>
                          {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                          {task.dueDate && task.dueTime && ' '}
                          {task.dueTime}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => handleDeleteTask(task.id)}
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                    >
                      <IconSymbol name="trash" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsCreateModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New List</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>List Name</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder="Enter list name"
                placeholderTextColor={colors.textSecondary}
                value={newListName}
                onChangeText={setNewListName}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setIsCreateModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateList}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Create</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={isTaskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTaskModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsTaskModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Task</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>Task Title</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder="Enter task title"
                placeholderTextColor={colors.textSecondary}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>Due Date (Optional)</Text>
              <Pressable
                style={[commonStyles.input, { justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: newTaskDueDate ? colors.text : colors.textSecondary }}>
                  {newTaskDueDate ? newTaskDueDate.toLocaleDateString() : 'Select date'}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={newTaskDueDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>Due Time (Optional)</Text>
              <Pressable
                style={[commonStyles.input, { justifyContent: 'center' }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: newTaskDueTime ? colors.text : colors.textSecondary }}>
                  {newTaskDueTime ? newTaskDueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select time'}
                </Text>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={newTaskDueTime || new Date()}
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
              onPress={() => setIsTaskModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddTask}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add Task</Text>
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
  listContainer: {
    gap: 8,
  },
  listItem: {
    marginVertical: 4,
  },
  listItemPressed: {
    opacity: 0.7,
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksContainer: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCheckbox: {
    padding: 4,
  },
  taskContent: {
    flex: 1,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
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
