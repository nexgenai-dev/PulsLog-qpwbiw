
import { SamsungHealthData } from '@/contexts/WidgetContext';

export const generateSimulatedHealthData = (date: string): SamsungHealthData => {
  return {
    id: Date.now().toString(),
    date,
    heartRateResting: Math.floor(Math.random() * 20) + 60,
    heartRateLight: Math.floor(Math.random() * 30) + 80,
    heartRateSports: Math.floor(Math.random() * 50) + 130,
    stepCount: Math.floor(Math.random() * 10000) + 5000,
    sleepDuration: Math.floor(Math.random() * 3) + 6,
    sleepLight: Math.floor(Math.random() * 2) + 2,
    sleepDeep: Math.floor(Math.random() * 2) + 1,
    sleepREM: Math.floor(Math.random() * 1.5) + 0.5,
    lastSyncTime: new Date().toISOString(),
  };
};

export const calculateHealthMetrics = (data: SamsungHealthData) => {
  return {
    avgHeartRate: Math.round(
      (data.heartRateResting + data.heartRateLight + data.heartRateSports) / 3
    ),
    totalSteps: data.stepCount || 0,
    totalSleep: data.sleepDuration || 0,
    sleepQuality: calculateSleepQuality(data),
  };
};

export const calculateSleepQuality = (data: SamsungHealthData): string => {
  if (!data.sleepDuration) return 'No data';
  
  const deepSleepPercent = data.sleepDeep ? (data.sleepDeep / data.sleepDuration) * 100 : 0;
  const remPercent = data.sleepREM ? (data.sleepREM / data.sleepDuration) * 100 : 0;
  
  if (deepSleepPercent > 20 && remPercent > 15) {
    return 'Excellent';
  } else if (deepSleepPercent > 15 && remPercent > 10) {
    return 'Good';
  } else if (deepSleepPercent > 10 && remPercent > 5) {
    return 'Fair';
  } else {
    return 'Poor';
  }
};

export const formatHealthDataForDisplay = (data: SamsungHealthData) => {
  return {
    date: new Date(data.date).toLocaleDateString(),
    heartRateResting: data.heartRateResting?.toString() || '—',
    heartRateLight: data.heartRateLight?.toString() || '—',
    heartRateSports: data.heartRateSports?.toString() || '—',
    stepCount: data.stepCount?.toString() || '—',
    sleepDuration: data.sleepDuration?.toFixed(1) || '—',
    sleepLight: data.sleepLight?.toFixed(1) || '—',
    sleepDeep: data.sleepDeep?.toFixed(1) || '—',
    sleepREM: data.sleepREM?.toFixed(1) || '—',
  };
};
