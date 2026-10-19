import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { Session } from '@/services/session';
export default function RootLayout(){return <Session><ThemeProvider value={DefaultTheme}><Stack screenOptions={{headerShown:false}}/></ThemeProvider></Session>;}
