
import { Stack } from 'expo-router';

export default function OtherLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="todos"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="shopping"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notes"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="recipes"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
