import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { AppProvider, useApp } from '@/context/AppContext';
import SplashScreen from '@/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import MapScreen from './src/screens/MapScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Map: '🗺️',
    Profile: '👤',
  };
  return React.createElement(
    Text,
    { style: { fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 } },
    icons[name]
  );
}

function MainTabs() {
  const { colors } = useApp();
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: 10,
          paddingTop: 6,
          height: 100,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 15,
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return React.createElement(
    AppProvider,
    null,
    React.createElement(NavigationContainer, null, React.createElement(RootNavigator, null))
  );
}
