
// Global error logging for runtime errors

import { Platform } from "react-native";
import { HealthEntry, UserProfile } from "@/contexts/WidgetContext";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 100);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}:${JSON.stringify(data)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EXPO_ERROR',
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        source: 'expo-template'
      }, '*');
    } else {
      // Fallback to console if no parent window
      console.error('🚨 ERROR (no parent):', level, message, data);
    }
  } catch (error) {
    console.error('❌ Failed to send error to parent:', error);
  }
};

const calculateAverageValues = (entries: HealthEntry[]) => {
  if (entries.length === 0) {
    return { 
      avgPulse: 0, 
      avgSystolic: 0, 
      avgDiastolic: 0,
      avgPulseResting: 0,
      avgPulseLight: 0,
      avgPulseSports: 0,
    };
  }

  let totalPulse = 0;
  let totalSystolic = 0;
  let totalDiastolic = 0;
  let pulseCount = 0;
  let systolicCount = 0;
  let diastolicCount = 0;

  let totalPulseResting = 0;
  let pulseRestingCount = 0;
  let totalPulseLight = 0;
  let pulseLightCount = 0;
  let totalPulseSports = 0;
  let pulseSportsCount = 0;

  entries.forEach(entry => {
    if (entry.pulseResting) {
      totalPulse += entry.pulseResting;
      pulseCount++;

      // Categorize by activity level
      if (entry.activityLevel === 'resting') {
        totalPulseResting += entry.pulseResting;
        pulseRestingCount++;
      } else if (entry.activityLevel === 'light') {
        totalPulseLight += entry.pulseResting;
        pulseLightCount++;
      } else if (entry.activityLevel === 'sports') {
        totalPulseSports += entry.pulseResting;
        pulseSportsCount++;
      }
    }
    if (entry.systolicResting) {
      totalSystolic += entry.systolicResting;
      systolicCount++;
    }
    if (entry.diastolicResting) {
      totalDiastolic += entry.diastolicResting;
      diastolicCount++;
    }
  });

  return {
    avgPulse: pulseCount > 0 ? Math.round(totalPulse / pulseCount) : 0,
    avgSystolic: systolicCount > 0 ? Math.round(totalSystolic / systolicCount) : 0,
    avgDiastolic: diastolicCount > 0 ? Math.round(totalDiastolic / diastolicCount) : 0,
    avgPulseResting: pulseRestingCount > 0 ? Math.round(totalPulseResting / pulseRestingCount) : 0,
    avgPulseLight: pulseLightCount > 0 ? Math.round(totalPulseLight / pulseLightCount) : 0,
    avgPulseSports: pulseSportsCount > 0 ? Math.round(totalPulseSports / pulseSportsCount) : 0,
  };
};

const checkHealthWarnings = (entry: HealthEntry, profile: UserProfile) => {
  const warnings: string[] = [];

  if (entry.pulseResting && entry.pulseResting > profile.avgPulse * 1.3) {
    warnings.push(`High pulse: ${entry.pulseResting} bpm (avg: ${profile.avgPulse} bpm)`);
  }

  if (entry.pulseResting && entry.pulseResting < profile.avgPulse * 0.7) {
    warnings.push(`Low pulse: ${entry.pulseResting} bpm (avg: ${profile.avgPulse} bpm)`);
  }

  if (entry.systolicResting && entry.systolicResting > profile.avgSystolic * 1.2) {
    warnings.push(`High systolic: ${entry.systolicResting} mmHg (avg: ${profile.avgSystolic} mmHg)`);
  }

  if (entry.systolicResting && entry.systolicResting < profile.avgSystolic * 0.8) {
    warnings.push(`Low systolic: ${entry.systolicResting} mmHg (avg: ${profile.avgSystolic} mmHg)`);
  }

  return warnings;
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return ` | Source: ${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  const stack = new Error().stack || '';
  const lines = stack.split('\n');

  // Skip the first few lines (Error, getCallerInfo, console override)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    if (line.indexOf('app/') !== -1 || line.indexOf('components/') !== -1 || line.indexOf('.tsx') !== -1 || line.indexOf('.ts') !== -1) {
      const match = line.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
      if (match) {
        return ` | Called from: ${match[1]}:${match[2]}:${match[3]}`;
      }
    }
  }

  return '';
};

export const setupErrorLogging = () => {
  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    window.onerror = (message, source, lineno, colno, error) => {
      const sourceFile = source ? source.split('/').pop() : 'unknown';
      const errorData = {
        message: message,
        source: `${sourceFile}:${lineno}:${colno}`,
        line: lineno,
        column: colno,
        error: error?.stack || error,
        timestamp: new Date().toISOString()
      };

      console.error('🚨 RUNTIME ERROR:', errorData);
      sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      return false; // Don't prevent default error handling
    };
    // check if platform is web
    if (Platform.OS === 'web') {
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
          const errorData = {
          reason: event.reason,
          timestamp: new Date().toISOString()
        };

        console.error('🚨 UNHANDLED PROMISE REJECTION:', errorData);
        sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
      });
    }
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // UNCOMMENT BELOW CODE TO GET MORE SENSITIVE ERROR LOGGING (usually many errors triggered per 1 uncaught runtime error)

  // Override console.error to capture more detailed information
  // console.error = (...args: any[]) => {
  //   const stack = new Error().stack || '';
  //   const sourceInfo = extractSourceLocation(stack);
  //   const callerInfo = getCallerInfo();

  //   // Create enhanced message with source information
  //   const enhancedMessage = args.join(' ') + sourceInfo + callerInfo;

  //   // Add timestamp and make it stand out in Metro logs
  //   originalConsoleError('🔥🔥🔥 ERROR:', new Date().toISOString(), enhancedMessage);

  //   // Also send to parent
  //   sendErrorToParent('error', 'Console Error', enhancedMessage);
  // };

  // Override console.warn to capture warnings with source location
  // console.warn = (...args: any[]) => {
  //   const stack = new Error().stack || '';
  //   const sourceInfo = extractSourceLocation(stack);
  //   const callerInfo = getCallerInfo();

  //   // Create enhanced message with source information
  //   const enhancedMessage = args.join(' ') + sourceInfo + callerInfo;

  //   originalConsoleWarn('⚠️ WARNING:', new Date().toISOString(), enhancedMessage);

  //   // Also send to parent
  //   sendErrorToParent('warn', 'Console Warning', enhancedMessage);
  // };

  // // Also override console.log to catch any logs that might contain error information
  // console.log = (...args: any[]) => {
  //   const message = args.join(' ');

  //   // Check if this log message contains warning/error keywords
  //   if (message.indexOf('deprecated') !== -1 || message.indexOf('warning') !== -1 || message.indexOf('error') !== -1) {
  //     const stack = new Error().stack || '';
  //     const sourceInfo = extractSourceLocation(stack);
  //     const callerInfo = getCallerInfo();

  //     const enhancedMessage = message + sourceInfo + callerInfo;

  //     originalConsoleLog('📝 LOG (potential issue):', new Date().toISOString(), enhancedMessage);
  //     sendErrorToParent('info', 'Console Log (potential issue)', enhancedMessage);
  //   } else {
  //     // Normal log, just pass through
  //     originalConsoleLog(...args);
  //   }
  // };

  // Try to intercept React Native warnings at a lower level
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    // Override React's warning system if available
    const originalWarn = (window as any).console?.warn || console.warn;

    // Monkey patch any React warning functions
    if ((window as any).React && (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const internals = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (internals.ReactDebugCurrentFrame) {
        const originalGetStackAddendum = internals.ReactDebugCurrentFrame.getStackAddendum;
        internals.ReactDebugCurrentFrame.getStackAddendum = function() {
          const stack = originalGetStackAddendum ? originalGetStackAddendum.call(this) : '';
          return stack + ' | Enhanced by error logger';
        };
      }
    }
  }
};

export { calculateAverageValues, checkHealthWarnings };
