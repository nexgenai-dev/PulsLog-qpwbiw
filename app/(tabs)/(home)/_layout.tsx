import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === 'ios',
          title: 'PulsLog',
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            color: colors.text,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
        }}
      />
    </Stack>
  );
}
