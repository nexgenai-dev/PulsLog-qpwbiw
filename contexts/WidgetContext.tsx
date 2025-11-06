
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  avgPulse: number;
  avgSystolic: number;
  avgDiastolic: number;
}

export interface HealthEntry {
  id: string;
  date: string;
  time: string;
  medication?: string;
  medicationAmount?: string;
  pulseResting?: number;
  pulseSitting?: number;
  pulseStanding?: number;
  systolicResting?: number;
  diastolicResting?: number;
  systolicSitting?: number;
  diastolicSitting?: number;
  systolicStanding?: number;
  diastolicStanding?: number;
  notes?: string;
  activityLevel?: 'resting' | 'light' | 'sports';
  mood?: number;
}

export interface DrinkEntry {
  id: string;
  date: string;
  time: string;
  amount: number;
}

export interface Reminder {
  id: string;
  type: 'pulse' | 'medication';
  time: string;
  enabled: boolean;
  days?: string[];
}

export interface ForumMessage {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface SamsungHealthData {
  id: string;
  date: string;
  heartRateResting?: number;
  heartRateLight?: number;
  heartRateSports?: number;
  stepCount?: number;
  sleepDuration?: number;
  sleepLight?: number;
  sleepDeep?: number;
  sleepREM?: number;
  lastSyncTime?: string;
}

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
  listId: string;
}

export interface TodoList {
  id: string;
  name: string;
  createdAt: string;
  tasks: TodoTask[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  listId: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  items: ShoppingItem[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  date?: string;
  time?: string;
}

interface WidgetContextType {
  userProfile: UserProfile | null;
  healthEntries: HealthEntry[];
  drinkEntries: DrinkEntry[];
  reminders: Reminder[];
  forumMessages: ForumMessage[];
  samsungHealthData: SamsungHealthData[];
  todoLists: TodoList[];
  shoppingLists: ShoppingList[];
  notes: Note[];
  addHealthEntry: (entry: HealthEntry) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  getEntriesByDate: (date: string) => HealthEntry[];
  addDrinkEntry: (entry: DrinkEntry) => Promise<void>;
  getDrinkEntriesByDate: (date: string) => DrinkEntry[];
  updateReminders: (reminders: Reminder[]) => Promise<void>;
  addForumMessage: (message: ForumMessage) => Promise<void>;
  deleteHealthEntry: (id: string) => Promise<void>;
  updateSamsungHealthData: (data: SamsungHealthData[]) => Promise<void>;
  getSamsungHealthDataByDate: (date: string) => SamsungHealthData | undefined;
  addTodoList: (list: TodoList) => Promise<void>;
  updateTodoList: (list: TodoList) => Promise<void>;
  deleteTodoList: (id: string) => Promise<void>;
  addShoppingList: (list: ShoppingList) => Promise<void>;
  updateShoppingList: (list: ShoppingList) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshWidget: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([]);
  const [drinkEntries, setDrinkEntries] = useState<DrinkEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [samsungHealthData, setSamsungHealthData] = useState<SamsungHealthData[]>([]);
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      const entriesData = await AsyncStorage.getItem('healthEntries');
      const drinkData = await AsyncStorage.getItem('drinkEntries');
      const remindersData = await AsyncStorage.getItem('reminders');
      const forumData = await AsyncStorage.getItem('forumMessages');
      const samsungHealthDataStr = await AsyncStorage.getItem('samsungHealthData');
      const todoListsData = await AsyncStorage.getItem('todoLists');
      const shoppingListsData = await AsyncStorage.getItem('shoppingLists');
      const notesData = await AsyncStorage.getItem('notes');

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }

      if (entriesData) {
        setHealthEntries(JSON.parse(entriesData));
      }

      if (drinkData) {
        setDrinkEntries(JSON.parse(drinkData));
      }

      if (remindersData) {
        setReminders(JSON.parse(remindersData));
      }

      if (forumData) {
        setForumMessages(JSON.parse(forumData));
      }

      if (samsungHealthDataStr) {
        setSamsungHealthData(JSON.parse(samsungHealthDataStr));
      }

      if (todoListsData) {
        setTodoLists(JSON.parse(todoListsData));
      }

      if (shoppingListsData) {
        setShoppingLists(JSON.parse(shoppingListsData));
      }

      if (notesData) {
        setNotes(JSON.parse(notesData));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      setUserProfile(profile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  const addHealthEntry = async (entry: HealthEntry) => {
    try {
      const newEntries = [...healthEntries, entry];
      setHealthEntries(newEntries);
      await AsyncStorage.setItem('healthEntries', JSON.stringify(newEntries));
    } catch (error) {
      console.log('Error saving entry:', error);
    }
  };

  const getEntriesByDate = (date: string) => {
    return healthEntries.filter(entry => entry.date === date);
  };

  const addDrinkEntry = async (entry: DrinkEntry) => {
    try {
      const newEntries = [...drinkEntries, entry];
      setDrinkEntries(newEntries);
      await AsyncStorage.setItem('drinkEntries', JSON.stringify(newEntries));
    } catch (error) {
      console.log('Error saving drink entry:', error);
    }
  };

  const getDrinkEntriesByDate = (date: string) => {
    return drinkEntries.filter(entry => entry.date === date);
  };

  const updateReminders = async (newReminders: Reminder[]) => {
    try {
      setReminders(newReminders);
      await AsyncStorage.setItem('reminders', JSON.stringify(newReminders));
    } catch (error) {
      console.log('Error saving reminders:', error);
    }
  };

  const addForumMessage = async (message: ForumMessage) => {
    try {
      const newMessages = [...forumMessages, message];
      setForumMessages(newMessages);
      await AsyncStorage.setItem('forumMessages', JSON.stringify(newMessages));
    } catch (error) {
      console.log('Error saving forum message:', error);
    }
  };

  const deleteHealthEntry = async (id: string) => {
    try {
      const updatedEntries = healthEntries.filter(entry => entry.id !== id);
      setHealthEntries(updatedEntries);
      await AsyncStorage.setItem('healthEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.log('Error deleting health entry:', error);
    }
  };

  const updateSamsungHealthData = async (data: SamsungHealthData[]) => {
    try {
      setSamsungHealthData(data);
      await AsyncStorage.setItem('samsungHealthData', JSON.stringify(data));
    } catch (error) {
      console.log('Error saving Samsung Health data:', error);
    }
  };

  const getSamsungHealthDataByDate = (date: string) => {
    return samsungHealthData.find(data => data.date === date);
  };

  const addTodoList = async (list: TodoList) => {
    try {
      const newLists = [...todoLists, list];
      setTodoLists(newLists);
      await AsyncStorage.setItem('todoLists', JSON.stringify(newLists));
    } catch (error) {
      console.log('Error saving todo list:', error);
    }
  };

  const updateTodoList = async (list: TodoList) => {
    try {
      const newLists = todoLists.map(l => l.id === list.id ? list : l);
      setTodoLists(newLists);
      await AsyncStorage.setItem('todoLists', JSON.stringify(newLists));
    } catch (error) {
      console.log('Error updating todo list:', error);
    }
  };

  const deleteTodoList = async (id: string) => {
    try {
      const newLists = todoLists.filter(l => l.id !== id);
      setTodoLists(newLists);
      await AsyncStorage.setItem('todoLists', JSON.stringify(newLists));
    } catch (error) {
      console.log('Error deleting todo list:', error);
    }
  };

  const addShoppingList = async (list: ShoppingList) => {
    try {
      const newLists = [...shoppingLists, list];
      setShoppingLists(newLists);
      await AsyncStorage.setItem('shoppingLists', JSON.stringify(newLists));
    } catch (error) {
      console.log('Error saving shopping list:', error);
    }
  };

  const updateShoppingList = async (list: ShoppingList) => {
    try {
      const newLists = shoppingLists.map(l => l.id === list.id ? list : l);
      setShoppingLists(newLists);
      await AsyncStorage.setItem('shoppingLists', JSON.stringify(newLists));
    } catch (error) {
      console.log('Error updating shopping list:', error);
    }
  };

  const deleteShoppingList = async (id: string) => {
    try {
      const newLists = shoppingLists.filter(l => l.id !== id);
      setShoppingLists(newLists);
      await AsyncStorage.setItem('shoppingLists', JSON.stringify(newLists));
    } catch (error) {
      console.log('Error deleting shopping list:', error);
    }
  };

  const addNote = async (note: Note) => {
    try {
      const newNotes = [...notes, note];
      setNotes(newNotes);
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
    } catch (error) {
      console.log('Error saving note:', error);
    }
  };

  const updateNote = async (note: Note) => {
    try {
      const newNotes = notes.map(n => n.id === note.id ? note : n);
      setNotes(newNotes);
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
    } catch (error) {
      console.log('Error updating note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const newNotes = notes.filter(n => n.id !== id);
      setNotes(newNotes);
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
    } catch (error) {
      console.log('Error deleting note:', error);
    }
  };

  const refreshWidget = () => {
    loadData();
  };

  return (
    <WidgetContext.Provider value={{
      userProfile,
      healthEntries,
      drinkEntries,
      reminders,
      forumMessages,
      samsungHealthData,
      todoLists,
      shoppingLists,
      notes,
      addHealthEntry,
      updateUserProfile,
      getEntriesByDate,
      addDrinkEntry,
      getDrinkEntriesByDate,
      updateReminders,
      addForumMessage,
      deleteHealthEntry,
      updateSamsungHealthData,
      getSamsungHealthDataByDate,
      addTodoList,
      updateTodoList,
      deleteTodoList,
      addShoppingList,
      updateShoppingList,
      deleteShoppingList,
      addNote,
      updateNote,
      deleteNote,
      isLoading,
      refreshWidget,
    }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
};
