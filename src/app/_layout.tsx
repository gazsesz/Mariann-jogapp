import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { DB_NAME, migrate } from '../lib/db';
import { C } from '../lib/theme';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={migrate}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.surface },
          headerTintColor: C.accent,
          headerTitleStyle: { color: C.ink },
          contentStyle: { backgroundColor: C.bg },
          headerBackTitle: 'Vissza',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Vissza' }} />
        <Stack.Screen name="pose/[id]" options={{ title: 'Ászana' }} />
        <Stack.Screen name="plan/[id]" options={{ title: 'Óravázlat' }} />
        <Stack.Screen name="pick" options={{ title: 'Ászanák hozzáadása' }} />
        <Stack.Screen name="series/new" options={{ title: 'Új tematika' }} />
        <Stack.Screen name="series/[id]" options={{ title: 'Tematika' }} />
        <Stack.Screen name="series/link" options={{ title: 'Óravázlat választása' }} />
        <Stack.Screen name="add-to-plan" options={{ title: 'Hozzáadás óravázlathoz', presentation: 'modal' }} />
      </Stack>
    </SQLiteProvider>
  );
}
