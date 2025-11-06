
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
  language?: 'en' | 'de' | 'es' | 'fr';
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

export interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  notes: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageUri?: string;
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  type: 'consecutive_days' | 'todos_completed' | 'recipes_created' | 'shopping_items';
  tier: number;
  unlockedAt?: string;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  levelProgress: number;
  consecutiveDays: number;
  lastEntryDate?: string;
  todosCompleted: number;
  recipesCreated: number;
  shoppingItemsAdded: number;
  achievements: Achievement[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  securityCode?: string;
  securityEnabled: boolean;
  profileImageUri?: string;
}

export interface GameItem {
  id: string;
  name: string;
  quantity: number;
  xpBonus: number;
}

export interface Flower {
  id: string;
  name: string;
  level: number;
  xp: number;
  lastWateredDate: string;
  wateredToday: boolean;
  rescuesUsed: number;
  createdAt: string;
}

export interface GameChallenge {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  completedAt?: string;
  progress: number;
  target: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'xp_boost' | 'free_items' | 'special';
  xpMultiplier?: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface GameState {
  coins: number;
  flowers: Flower[];
  inventory: GameItem[];
  challenges: GameChallenge[];
  events: GameEvent[];
  totalXp: number;
  lastDailyRewardDate?: string;
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
  appointments: Appointment[];
  recipes: Recipe[];
  userStats: UserStats | null;
  appSettings: AppSettings | null;
  gameState: GameState | null;
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
  addAppointment: (appointment: Appointment) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getAppointmentsByDate: (date: string) => Appointment[];
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  updateUserStats: (stats: UserStats) => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  updateAppSettings: (settings: AppSettings) => Promise<void>;
  updateGameState: (state: GameState) => Promise<void>;
  waterFlower: (flowerId: string) => Promise<void>;
  addGameCoins: (amount: number) => Promise<void>;
  useGameItem: (itemId: string, flowerId: string) => Promise<void>;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
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
      const appointmentsData = await AsyncStorage.getItem('appointments');
      const recipesData = await AsyncStorage.getItem('recipes');
      const userStatsData = await AsyncStorage.getItem('userStats');
      const appSettingsData = await AsyncStorage.getItem('appSettings');
      const gameStateData = await AsyncStorage.getItem('gameState');

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

      if (appointmentsData) {
        setAppointments(JSON.parse(appointmentsData));
      }

      if (recipesData) {
        setRecipes(JSON.parse(recipesData));
      }

      if (userStatsData) {
        setUserStats(JSON.parse(userStatsData));
      } else {
        const defaultStats: UserStats = {
          totalPoints: 0,
          level: 1,
          levelProgress: 0,
          consecutiveDays: 0,
          todosCompleted: 0,
          recipesCreated: 0,
          shoppingItemsAdded: 0,
          achievements: [],
        };
        setUserStats(defaultStats);
        await AsyncStorage.setItem('userStats', JSON.stringify(defaultStats));
      }

      if (appSettingsData) {
        setAppSettings(JSON.parse(appSettingsData));
      } else {
        const defaultSettings: AppSettings = {
          theme: 'auto',
          fontSize: 'medium',
          securityEnabled: false,
        };
        setAppSettings(defaultSettings);
        await AsyncStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      }

      if (gameStateData) {
        setGameState(JSON.parse(gameStateData));
      } else {
        const defaultGameState: GameState = {
          coins: 0,
          flowers: [
            {
              id: '1',
              name: 'Blüte',
              level: 1,
              xp: 0,
              lastWateredDate: new Date().toISOString().split('T')[0],
              wateredToday: false,
              rescuesUsed: 0,
              createdAt: new Date().toISOString(),
            },
          ],
          inventory: [],
          challenges: [
            {
              id: 'daily-1',
              type: 'daily',
              title: 'Gieße alle Blumen heute',
              description: 'Gieße alle deine Blumen heute',
              reward: 10,
              completed: false,
              progress: 0,
              target: 1,
            },
            {
              id: 'weekly-1',
              type: 'weekly',
              title: 'Pflege jede Blume 7 Tage hintereinander',
              description: 'Gieße deine Blumen 7 Tage hintereinander',
              reward: 50,
              completed: false,
              progress: 0,
              target: 7,
            },
            {
              id: 'special-1',
              type: 'special',
              title: 'Level 3 bei allen Blumen erreichen',
              description: 'Bringe alle deine Blumen auf Level 3',
              reward: 100,
              completed: false,
              progress: 0,
              target: 1,
            },
          ],
          events: [],
          totalXp: 0,
        };
        setGameState(defaultGameState);
        await AsyncStorage.setItem('gameState', JSON.stringify(defaultGameState));
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

  const addAppointment = async (appointment: Appointment) => {
    try {
      const newAppointments = [...appointments, appointment];
      setAppointments(newAppointments);
      await AsyncStorage.setItem('appointments', JSON.stringify(newAppointments));
    } catch (error) {
      console.log('Error saving appointment:', error);
    }
  };

  const updateAppointment = async (appointment: Appointment) => {
    try {
      const newAppointments = appointments.map(a => a.id === appointment.id ? appointment : a);
      setAppointments(newAppointments);
      await AsyncStorage.setItem('appointments', JSON.stringify(newAppointments));
    } catch (error) {
      console.log('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const newAppointments = appointments.filter(a => a.id !== id);
      setAppointments(newAppointments);
      await AsyncStorage.setItem('appointments', JSON.stringify(newAppointments));
    } catch (error) {
      console.log('Error deleting appointment:', error);
    }
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(a => a.date === date);
  };

  const addRecipe = async (recipe: Recipe) => {
    try {
      const newRecipes = [...recipes, recipe];
      setRecipes(newRecipes);
      await AsyncStorage.setItem('recipes', JSON.stringify(newRecipes));
      await addPoints(50);
    } catch (error) {
      console.log('Error saving recipe:', error);
    }
  };

  const updateRecipe = async (recipe: Recipe) => {
    try {
      const newRecipes = recipes.map(r => r.id === recipe.id ? recipe : r);
      setRecipes(newRecipes);
      await AsyncStorage.setItem('recipes', JSON.stringify(newRecipes));
    } catch (error) {
      console.log('Error updating recipe:', error);
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const newRecipes = recipes.filter(r => r.id !== id);
      setRecipes(newRecipes);
      await AsyncStorage.setItem('recipes', JSON.stringify(newRecipes));
    } catch (error) {
      console.log('Error deleting recipe:', error);
    }
  };

  const updateUserStats = async (stats: UserStats) => {
    try {
      setUserStats(stats);
      await AsyncStorage.setItem('userStats', JSON.stringify(stats));
    } catch (error) {
      console.log('Error updating user stats:', error);
    }
  };

  const addPoints = async (points: number) => {
    if (!userStats) return;

    const newStats = { ...userStats };
    newStats.totalPoints += points;

    const pointsPerLevel = 500;
    newStats.level = Math.floor(newStats.totalPoints / pointsPerLevel) + 1;
    newStats.levelProgress = (newStats.totalPoints % pointsPerLevel) / pointsPerLevel;

    await updateUserStats(newStats);
  };

  const updateAppSettings = async (settings: AppSettings) => {
    try {
      setAppSettings(settings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error updating app settings:', error);
    }
  };

  const updateGameState = async (state: GameState) => {
    try {
      setGameState(state);
      await AsyncStorage.setItem('gameState', JSON.stringify(state));
    } catch (error) {
      console.log('Error updating game state:', error);
    }
  };

  const waterFlower = async (flowerId: string) => {
    if (!gameState) return;

    const updatedFlowers = gameState.flowers.map(flower => {
      if (flower.id === flowerId) {
        const today = new Date().toISOString().split('T')[0];
        const xpGain = 10;
        const newXp = flower.xp + xpGain;
        const xpPerLevel = 50;
        const newLevel = Math.floor(newXp / xpPerLevel) + 1;

        return {
          ...flower,
          xp: newXp,
          level: newLevel,
          lastWateredDate: today,
          wateredToday: true,
        };
      }
      return flower;
    });

    const updatedChallenges = gameState.challenges.map(challenge => {
      if (challenge.type === 'daily' && !challenge.completed) {
        return {
          ...challenge,
          progress: updatedFlowers.filter(f => f.wateredToday).length,
          completed: updatedFlowers.filter(f => f.wateredToday).length >= challenge.target,
          completedAt: updatedFlowers.filter(f => f.wateredToday).length >= challenge.target ? new Date().toISOString() : undefined,
        };
      }
      return challenge;
    });

    const newState: GameState = {
      ...gameState,
      flowers: updatedFlowers,
      challenges: updatedChallenges,
      totalXp: gameState.totalXp + 10,
    };

    await updateGameState(newState);
  };

  const addGameCoins = async (amount: number) => {
    if (!gameState) return;

    const newState: GameState = {
      ...gameState,
      coins: gameState.coins + amount,
    };

    await updateGameState(newState);
  };

  const useGameItem = async (itemId: string, flowerId: string) => {
    if (!gameState) return;

    const item = gameState.inventory.find(i => i.id === itemId);
    if (!item) return;

    const updatedInventory = gameState.inventory.map(i => {
      if (i.id === itemId) {
        return { ...i, quantity: i.quantity - 1 };
      }
      return i;
    }).filter(i => i.quantity > 0);

    const updatedFlowers = gameState.flowers.map(flower => {
      if (flower.id === flowerId) {
        const xpGain = item.xpBonus;
        const newXp = flower.xp + xpGain;
        const xpPerLevel = 50;
        const newLevel = Math.floor(newXp / xpPerLevel) + 1;

        return {
          ...flower,
          xp: newXp,
          level: newLevel,
        };
      }
      return flower;
    });

    const newState: GameState = {
      ...gameState,
      inventory: updatedInventory,
      flowers: updatedFlowers,
      totalXp: gameState.totalXp + item.xpBonus,
    };

    await updateGameState(newState);
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
      appointments,
      recipes,
      userStats,
      appSettings,
      gameState,
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
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointmentsByDate,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      updateUserStats,
      addPoints,
      updateAppSettings,
      updateGameState,
      waterFlower,
      addGameCoins,
      useGameItem,
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
