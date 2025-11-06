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
}

interface WidgetContextType {
  userProfile: UserProfile | null;
  healthEntries: HealthEntry[];
  addHealthEntry: (entry: HealthEntry) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  getEntriesByDate: (date: string) => HealthEntry[];
  isLoading: boolean;
  refreshWidget: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      const entriesData = await AsyncStorage.getItem('healthEntries');

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }

      if (entriesData) {
        setHealthEntries(JSON.parse(entriesData));
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

  const refreshWidget = () => {
    loadData();
  };

  return (
    <WidgetContext.Provider value={{
      userProfile,
      healthEntries,
      addHealthEntry,
      updateUserProfile,
      getEntriesByDate,
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
