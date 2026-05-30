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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useApp, Ride } from "../context/AppContext";
import RideCard from "../components/RideCard";
import { Typography, Spacing, Radius } from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

// Lagos, Nigeria — user's current location
const USER_LOCATION = { latitude: 6.4541, longitude: 3.3947 };

const INITIAL_REGION = {
  ...USER_LOCATION,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Named destinations the user can pick from
const DESTINATIONS = [
  {
    id: "lekki",
    label: "Lekki Phase 1",
    coordinate: { latitude: 6.4305, longitude: 3.5035 },
  },
  {
    id: "ikoyi",
    label: "Ikoyi",
    coordinate: { latitude: 6.4476, longitude: 3.4145 },
  },
  {
    id: "yaba",
    label: "Yaba",
    coordinate: { latitude: 6.515, longitude: 3.384 },
  },
  {
    id: "ajah",
    label: "Ajah",
    coordinate: { latitude: 6.4698, longitude: 3.5682 },
  },
];

// Mock driver positions — one per ride id so they move around the map naturally
const DRIVER_POSITIONS: Record<
  number,
  { latitude: number; longitude: number }
> = {
  1: { latitude: 6.4601, longitude: 3.3907 },
  2: { latitude: 6.4481, longitude: 3.4027 },
  3: { latitude: 6.4521, longitude: 3.3857 },
  4: { latitude: 6.4441, longitude: 3.3987 },
};

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
  const [activeDestination, setActiveDestination] = useState<
    (typeof DESTINATIONS)[0] | null
  >(null);

  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchRides();
  }, []);

  // Pulse animation on the user dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // When a destination chip is tapped, update the "to" input and zoom map
  const handleDestinationChip = useCallback(
    (dest: (typeof DESTINATIONS)[0]) => {
      setTo(dest.label);
      setActiveDestination(dest);
      // Fit map to show both user and destination
      mapRef.current?.fitToCoordinates([USER_LOCATION, dest.coordinate], {
        edgePadding: { top: 40, bottom: 40, left: 40, right: 40 },
        animated: true,
      });
    },
    [],
  );

  // When a ride card is selected, zoom to that driver
  const handleSelectRide = useCallback(
    (ride: Ride) => {
      if (!to.trim()) return;
      setSelectedRideId(ride.id);
      selectRide(ride);
      setPendingBooking({ from, to });

      // Animate map to show user → driver → destination triangle
      const driverPos = DRIVER_POSITIONS[ride.id] ?? USER_LOCATION;
      const destCoord = activeDestination?.coordinate ?? USER_LOCATION;
      mapRef.current?.fitToCoordinates([USER_LOCATION, driverPos, destCoord], {
        edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
        animated: true,
      });

      // Short delay so the user sees the map update before navigating
      setTimeout(() => navigation.navigate("Confirmation"), 600);
    },
    [from, to, activeDestination, selectRide, setPendingBooking, navigation],
  );

  const filteredRides = rides.filter(
    (r) => filterType === "All" || r.vehicleType === filterType,
  );

  const selectedDriver =
    selectedRideId !== null ? DRIVER_POSITIONS[selectedRideId] : null;

  const routeCoords =
    selectedDriver && activeDestination
      ? [USER_LOCATION, selectedDriver, activeDestination.coordinate]
      : activeDestination
        ? [USER_LOCATION, activeDestination.coordinate]
        : [];

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
        ListHeaderComponent={
          <View>
            {/* ── Header ─────────────────────────────────── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  Good day{" "}
                  <MaterialCommunityIcons
                    name="hand-wave"
                    size={18}
                    color="#F0A500"
                  />
                </Text>
                <Text style={styles.headerTitle}>Where to?</Text>
              </View>
              <TouchableOpacity
                style={styles.themeToggle}
                onPress={toggleTheme}
                accessibilityLabel={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={
                    theme === "dark"
                      ? "white-balance-sunny"
                      : "moon-waxing-crescent"
                  }
                  color="#F0A500"
                  size={22}
                />
              </TouchableOpacity>
            </View>

            {/* ── Location inputs ────────────────────────── */}
            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <View
                  style={[styles.inputDot, { backgroundColor: colors.primary }]}
                />
                <TextInput
                  style={styles.input}
                  value={from}
                  onChangeText={setFrom}
                  placeholder="From"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Pickup location"
                />
              </View>
              <View style={styles.inputDivider} />
              <View style={styles.inputRow}>
                <View
                  style={[styles.inputDot, { backgroundColor: "#E53935" }]}
                />
                <TextInput
                  style={styles.input}
                  value={to}
                  onChangeText={setTo}
                  placeholder="To — enter or pick below"
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

            {/* ── Quick destination chips ─────────────────── */}
            <View style={styles.chipRow}>
              {DESTINATIONS.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[
                    styles.chip,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                    activeDestination?.id === dest.id && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleDestinationChip(dest)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set destination to ${dest.label}`}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={12}
                    color={
                      activeDestination?.id === dest.id
                        ? "#fff"
                        : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.textSecondary },
                      activeDestination?.id === dest.id && {
                        color: "#fff",
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {dest.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Map ────────────────────────────────────── */}
            <View style={styles.mapSection}>
              <View style={styles.mapLabelRow}>
                <Text style={styles.mapLabel}>
                  {activeDestination
                    ? `📍 ${from}  →  ${activeDestination.label}`
                    : "Tap a destination above"}
                </Text>
                {activeDestination && (
                  <TouchableOpacity
                    onPress={() =>
                      mapRef.current?.fitToCoordinates(
                        [USER_LOCATION, activeDestination.coordinate],
                        {
                          edgePadding: {
                            top: 40,
                            bottom: 40,
                            left: 40,
                            right: 40,
                          },
                          animated: true,
                        },
                      )
                    }
                    accessibilityLabel="Re-centre map"
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.mapWrapper}>
                <MapView
                  ref={mapRef}
                  provider={
                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                  }
                  style={styles.map}
                  initialRegion={INITIAL_REGION}
                  customMapStyle={theme === "dark" ? colors.mapStyle : []}
                  showsUserLocation={false} // we draw our own pulsing dot
                  showsMyLocationButton={false}
                  showsCompass={false}
                  accessibilityLabel="Map showing your location and selected destination"
                >
                  {/* ── User location — pulsing ring ─────── */}
                  <Marker
                    coordinate={USER_LOCATION}
                    anchor={{ x: 0.5, y: 0.5 }}
                    accessibilityLabel="Your location"
                  >
                    <View style={styles.userMarkerOuter}>
                      <Animated.View
                        style={[
                          styles.userPulse,
                          {
                            transform: [{ scale: pulseAnim }],
                            borderColor: colors.primary,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.userDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                  </Marker>

                  {/* ── Destination pin ──────────────────── */}
                  {activeDestination && (
                    <Marker
                      coordinate={activeDestination.coordinate}
                      title={activeDestination.label}
                      description="Your destination"
                      accessibilityLabel={`Destination: ${activeDestination.label}`}
                    >
                      <View style={styles.destMarker}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={32}
                          color="#E53935"
                        />
                        <View
                          style={[
                            styles.destLabel,
                            { backgroundColor: colors.surface },
                          ]}
                        >
                          <Text
                            style={[
                              styles.destLabelText,
                              { color: colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {activeDestination.label}
                          </Text>
                        </View>
                      </View>
                    </Marker>
                  )}

                  {/* ── Selected driver pin ───────────────── */}
                  {selectedDriver && (
                    <Marker
                      coordinate={selectedDriver}
                      title="Your driver"
                      description="En route to you"
                      anchor={{ x: 0.5, y: 0.5 }}
                      accessibilityLabel="Your selected driver location"
                    >
                      <View
                        style={[
                          styles.driverMarker,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="car-electric"
                          size={18}
                          color="#fff"
                        />
                      </View>
                    </Marker>
                  )}

                  {/* ── Route polyline ────────────────────── */}
                  {routeCoords.length >= 2 && (
                    <Polyline
                      coordinates={routeCoords}
                      strokeColor={colors.primary}
                      strokeWidth={3}
                      lineDashPattern={[8, 4]}
                      accessibilityLabel="Route from your location to destination"
                    />
                  )}

                  {/* ── Nearby drivers (unselected) ──────── */}
                  {rides.map((ride) => {
                    const pos = DRIVER_POSITIONS[ride.id];
                    if (!pos || ride.id === selectedRideId) return null;
                    return (
                      <Marker
                        key={ride.id}
                        coordinate={pos}
                        title={`${ride.vehicleType} — ${ride.eta}`}
                        description={`$${ride.price.toFixed(2)} · saves ${ride.co2Saved} kg CO₂`}
                        anchor={{ x: 0.5, y: 0.5 }}
                        accessibilityLabel={`${ride.vehicleType} driver nearby`}
                      >
                        <View
                          style={[
                            styles.nearbyDriver,
                            {
                              backgroundColor:
                                ride.vehicleType === "Electric"
                                  ? (colors.electricBadge ?? "#1565C0")
                                  : (colors.hybridBadge ?? "#2E7D32"),
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={
                              ride.vehicleType === "Electric"
                                ? "lightning-bolt"
                                : "leaf"
                            }
                            size={14}
                            color="#fff"
                          />
                        </View>
                      </Marker>
                    );
                  })}
                </MapView>

                {/* Map legend overlay */}
                <View
                  style={[
                    styles.mapLegend,
                    { backgroundColor: colors.surface + "EE" },
                  ]}
                >
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.legendText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      You
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={12}
                      color={colors.electricBadge ?? "#1565C0"}
                    />
                    <Text
                      style={[
                        styles.legendText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Electric
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <MaterialCommunityIcons
                      name="leaf"
                      size={12}
                      color={colors.hybridBadge ?? "#2E7D32"}
                    />
                    <Text
                      style={[
                        styles.legendText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Hybrid
                    </Text>
                  </View>
                </View>
              </View>

              {!to.trim() && (
                <View
                  style={[
                    styles.mapHint,
                    { backgroundColor: colors.primaryLight ?? "#E8F5E9" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={[styles.mapHintText, { color: colors.primary }]}>
                    Enter a destination to enable ride booking
                  </Text>
                </View>
              )}
            </View>

            {/* ── Eco banner ─────────────────────────────── */}
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

            {/* ── Filter tabs ────────────────────────────── */}
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
                    {type === "Electric"
                      ? "⚡ "
                      : type === "Hybrid"
                        ? "🌿 "
                        : ""}
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
        showsVerticalScrollIndicator={false}
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
    greeting: {
      ...Typography.body,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    headerTitle: { ...Typography.displayMedium, color: colors.text },
    themeToggle: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      backgroundColor: colors.surfaceAlt ?? colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    inputCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
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
    input: {
      flex: 1,
      ...Typography.body,
      color: colors.text,
      paddingVertical: 6,
    },
    inputDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 18,
      marginVertical: 4,
    },

    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: Spacing.md,
      gap: Spacing.xs,
      marginBottom: Spacing.md,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    chipText: { ...Typography.caption, fontSize: 12 },

    mapSection: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
    mapLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    mapLabel: { ...Typography.caption, color: colors.textMuted, flex: 1 },
    mapWrapper: {
      height: 220,
      borderRadius: Radius.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    map: { flex: 1 },

    // User location marker
    userMarkerOuter: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    userPulse: {
      position: "absolute",
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      backgroundColor: "transparent",
    },
    userDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: "#fff",
    },

    // Destination marker
    destMarker: { alignItems: "center" },
    destLabel: {
      marginTop: -4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    destLabelText: { fontSize: 10, fontWeight: "700" },

    // Driver markers
    driverMarker: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    nearbyDriver: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#fff",
      opacity: 0.85,
    },

    // Map legend
    mapLegend: {
      position: "absolute",
      bottom: 8,
      left: 8,
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.full,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 10, fontWeight: "600" },

    mapHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
      padding: 10,
      borderRadius: Radius.md,
    },
    mapHintText: { fontSize: 12, fontWeight: "500", flex: 1 },

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
