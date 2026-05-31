import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppProvider, useApp } from "./src/context/AppContext";
import { Colors } from "./src/theme";
import SplashScreen from "./src/screens/SplashScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ConfirmationScreen from "./src/screens/ConfirmationScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, "car" | "map" | "account"> = {
            Home: "car",
            Map: "map",
            Profile: "account",
          };

          const iconName = icons[route.name] ?? "car";

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
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
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}

function ThemedRoot() {
  const { themeTransitionAnim, isTransitioning, prevTheme, theme } = useApp();

  return (
    <SafeAreaProvider>
      <View style={[styles.root, { backgroundColor: Colors[theme].background }]}>
        <Animated.View
          style={{
            flex: 1,
            transform: [
              {
                scale: themeTransitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.98],
                }),
              },
              {
                translateY: themeTransitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
              },
            ],
          }}
        >
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </Animated.View>

        {isTransitioning && (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: Colors[prevTheme].background,
                opacity: themeTransitionAnim,
              },
            ]}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemedRoot />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
