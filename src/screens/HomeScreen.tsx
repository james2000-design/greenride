// src/screens/HomeScreen.tsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useApp, Ride } from "../context/AppContext";
import RideCard from "../components/RideCard";
import MapViewComponent, { Destination } from "../components/MapViewComponent";
import { Typography, Spacing, Radius } from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Driver positions keyed by ride id — must match MapViewComponent's MOCK_DRIVER_LOCATIONS
const DRIVER_POSITIONS: Record<
  number,
  { latitude: number; longitude: number }
> = {
  1: { latitude: 6.4601, longitude: 3.3907 },
  2: { latitude: 6.4481, longitude: 3.4027 },
  3: { latitude: 6.4521, longitude: 3.3857 },
  4: { latitude: 6.4441, longitude: 3.3987 },
};

type Props = { navigation: NativeStackNavigationProp<any> };

export default function HomeScreen({ navigation }: Props) {
  const {
    colors,
    rides,
    loading,
    fetchRides,
    selectRide,
    setPendingBooking,
    theme,
    toggleTheme,
  } = useApp();

  const [from, setFrom] = useState("Victoria Island, Lagos");
  const [to, setTo] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Electric" | "Hybrid">(
    "All",
  );
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [activeDestination, setActiveDestination] =
    useState<Destination | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handleThemeToggle = useCallback(() => {
    spinAnim.setValue(0);
    Animated.parallel([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 130,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    toggleTheme();
  }, [toggleTheme, spinAnim, scaleAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchRides();
  }, []);

  // Handle destination selected inside MapViewComponent — sync "to" input
  const handleDestinationChange = useCallback((dest: Destination | null) => {
    setActiveDestination(dest);
    setTo(dest?.label ?? "");
  }, []);

  const handleSelectRide = useCallback(
    (ride: Ride) => {
      if (!to.trim()) return;
      setSelectedRideId(ride.id);
      selectRide(ride);
      setPendingBooking({ from, to });
      setTimeout(() => navigation.navigate("Confirmation"), 600);
    },
    [from, to, selectRide, setPendingBooking, navigation],
  );

  const filteredRides = rides.filter(
    (r) => filterType === "All" || r.vehicleType === filterType,
  );

  const selectedDriverPosition =
    selectedRideId !== null ? (DRIVER_POSITIONS[selectedRideId] ?? null) : null;

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/*  Header  */}
            <View style={styles.header}>
              <View>
                <Text
                  style={[styles.greeting, { color: colors.textSecondary }]}
                >
                  Good day{" "}
                  <MaterialCommunityIcons
                    name="hand-wave"
                    size={18}
                    color={colors.accentAlt ?? "#F0A500"}
                  />
                </Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Where to?
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  {
                    backgroundColor: colors.surfaceAlt ?? colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleThemeToggle}
                accessibilityLabel={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                accessibilityRole="button"
                activeOpacity={0.8}
              >
                <Animated.View
                  style={{
                    transform: [{ rotate: spin }, { scale: scaleAnim }],
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      theme === "dark"
                        ? "white-balance-sunny"
                        : "moon-waxing-crescent"
                    }
                    size={22}
                    color={
                      theme === "dark"
                        ? (colors.accentAlt ?? "#F0A500")
                        : colors.text
                    }
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/*  Location inputs */}
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.inputRow}>
                <View
                  style={[styles.inputDot, { backgroundColor: colors.primary }]}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={from}
                  onChangeText={setFrom}
                  placeholder="From"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Pickup location"
                />
              </View>
              <View
                style={[
                  styles.inputDivider,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={styles.inputRow}>
                <View
                  style={[styles.inputDot, { backgroundColor: "#E53935" }]}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={to}
                  onChangeText={setTo}
                  placeholder="To — tap a destination below"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Drop-off location"
                />
                {to.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setTo("");
                      setActiveDestination(null);
                    }}
                    accessibilityLabel="Clear destination"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/*  Map component  */}
            <MapViewComponent
              mode="embedded"
              onDestinationChange={handleDestinationChange}
              selectedDriverPosition={selectedDriverPosition}
              pulseAnim={pulseAnim}
              from={from}
            />

            {/*  Eco banner */}
            <View
              style={[
                styles.ecoBanner,
                { backgroundColor: colors.primaryLight ?? "#E8F5E9" },
              ]}
            >
              <MaterialCommunityIcons
                name="leaf"
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.ecoBannerText, { color: colors.primary }]}>
                All rides are certified eco-friendly. Choose wisely, save the
                planet.
              </Text>
            </View>

            {/* ── Filter tabs  */}
            <View style={styles.filterRow}>
              {(["All", "Electric", "Hybrid"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    filterType === type && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setFilterType(type)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${type} rides`}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: colors.textSecondary },
                      filterType === type && {
                        color: "#fff",
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {type === "Electric" ? (
                      <MaterialCommunityIcons
                        name="lightning-bolt"
                        size={14}
                        color={filterType === type ? "#fff" : colors.primary}
                      />
                    ) : type === "Hybrid" ? (
                      <MaterialCommunityIcons
                        name="battery-charging"
                        size={14}
                        color={colors.primary}
                      />
                    ) : (
                      ""
                    )}
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {filteredRides.length} ride{filteredRides.length !== 1 ? "s" : ""}{" "}
              available
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onSelect={handleSelectRide}
            colors={colors}
            isSelected={selectedRideId === item.id}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Finding eco rides near you…
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌿</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No rides available right now
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: Spacing.xxl },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    greeting: { ...Typography.body, marginBottom: Spacing.xs },
    headerTitle: { ...Typography.displayMedium },
    themeToggle: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },

    inputCard: {
      borderRadius: Radius.lg,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      padding: Spacing.md,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: Spacing.xs,
    },
    inputDot: {
      width: 10,
      height: 10,
      borderRadius: Radius.full,
      marginRight: Spacing.sm,
    },
    input: { flex: 1, ...Typography.body, paddingVertical: 6 },
    inputDivider: { height: 1, marginLeft: 18, marginVertical: 4 },

    ecoBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginHorizontal: Spacing.md,
      borderRadius: Radius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
    },
    ecoBannerText: { ...Typography.caption, flex: 1, lineHeight: 18 },

    filterRow: {
      flexDirection: "row",
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    filterTab: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    filterTabText: { ...Typography.caption },

    sectionTitle: {
      ...Typography.caption,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 1,
    },

    loadingContainer: { alignItems: "center", paddingTop: Spacing.xxl },
    loadingText: { ...Typography.body, marginTop: Spacing.md },
    emptyContainer: { alignItems: "center", paddingTop: Spacing.xxl },
    emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
    emptyText: { ...Typography.body },
  });
