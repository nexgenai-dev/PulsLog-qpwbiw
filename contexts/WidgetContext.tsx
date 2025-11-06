
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

interface WidgetContextType {
  userProfile: UserProfile | null;
  healthEntries: HealthEntry[];
  drinkEntries: DrinkEntry[];
  reminders: Reminder[];
  forumMessages: ForumMessage[];
  samsungHealthData: SamsungHealthData[];
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
