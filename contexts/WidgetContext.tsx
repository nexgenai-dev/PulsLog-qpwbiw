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

interface WidgetContextType {
  userProfile: UserProfile | null;
  healthEntries: HealthEntry[];
  drinkEntries: DrinkEntry[];
  reminders: Reminder[];
  forumMessages: ForumMessage[];
  addHealthEntry: (entry: HealthEntry) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  getEntriesByDate: (date: string) => HealthEntry[];
  addDrinkEntry: (entry: DrinkEntry) => Promise<void>;
  getDrinkEntriesByDate: (date: string) => DrinkEntry[];
  updateReminders: (reminders: Reminder[]) => Promise<void>;
  addForumMessage: (message: ForumMessage) => Promise<void>;
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
      addHealthEntry,
      updateUserProfile,
      getEntriesByDate,
      addDrinkEntry,
      getDrinkEntriesByDate,
      updateReminders,
      addForumMessage,
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
