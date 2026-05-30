import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useApp } from "../context/AppContext";
import { Typography, Spacing, Radius } from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Lagos, Nigeria — user's fixed location
const USER_LOCATION = { latitude: 6.4541, longitude: 3.3947 };

const INITIAL_REGION = {
  ...USER_LOCATION,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const MOCK_DRIVER_LOCATIONS = [
  { id: 1, latitude: 6.4601, longitude: 3.3907, type: "Electric" as const },
  { id: 2, latitude: 6.4481, longitude: 3.4027, type: "Hybrid" as const },
  { id: 3, latitude: 6.4521, longitude: 3.3857, type: "Electric" as const },
  { id: 4, latitude: 6.4441, longitude: 3.3987, type: "Hybrid" as const },
];

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

export default function MapScreen() {
  const { colors, theme } = useApp();
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [activeDestination, setActiveDestination] = useState<
    (typeof DESTINATIONS)[0] | null
  >(null);
  const [activeDriver, setActiveDriver] = useState<
    (typeof MOCK_DRIVER_LOCATIONS)[0] | null
  >(null);

  const styles = createStyles(colors);

  const recenter = () => {
    if (activeDestination) {
      mapRef.current?.fitToCoordinates(
        [USER_LOCATION, activeDestination.coordinate],
        {
          edgePadding: { top: 60, bottom: 60, left: 60, right: 60 },
          animated: true,
        },
      );
    } else {
      mapRef.current?.animateToRegion(INITIAL_REGION, 600);
    }
  };

  const handleDestinationSelect = useCallback(
    (dest: (typeof DESTINATIONS)[0]) => {
      setActiveDestination((prev) => (prev?.id === dest.id ? null : dest));
      setActiveDriver(null);

      setTimeout(() => {
        mapRef.current?.fitToCoordinates([USER_LOCATION, dest.coordinate], {
          edgePadding: { top: 60, bottom: 60, left: 60, right: 60 },
          animated: true,
        });
      }, 100);
    },
    [],
  );

  const handleDriverSelect = useCallback(
    (driver: (typeof MOCK_DRIVER_LOCATIONS)[0]) => {
      setActiveDriver((prev) => (prev?.id === driver.id ? null : driver));

      const coords = [
        USER_LOCATION,
        { latitude: driver.latitude, longitude: driver.longitude },
      ];
      if (activeDestination) coords.push(activeDestination.coordinate);

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, bottom: 60, left: 60, right: 60 },
          animated: true,
        });
      }, 100);
    },
    [activeDestination],
  );

  // Build polyline: user → driver (if selected) → destination (if selected)
  const routeCoords = [
    USER_LOCATION,
    ...(activeDriver
      ? [{ latitude: activeDriver.latitude, longitude: activeDriver.longitude }]
      : []),
    ...(activeDestination ? [activeDestination.coordinate] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nearby Rides</Text>
          <Text style={styles.headerSub}>
            {activeDestination
              ? `📍 Victoria Island → ${activeDestination.label}`
              : `${MOCK_DRIVER_LOCATIONS.length} eco-drivers nearby`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.mapTypeBtn}
          onPress={() =>
            setMapType((t) => (t === "standard" ? "satellite" : "standard"))
          }
          accessibilityLabel="Toggle map type"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name={mapType === "standard" ? "satellite-uplink" : "map"}
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.mapTypeBtnText}>
            {mapType === "standard" ? "Sat" : "Map"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Destination chips ────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {DESTINATIONS.map((dest) => (
          <TouchableOpacity
            key={dest.id}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              activeDestination?.id === dest.id && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => handleDestinationSelect(dest)}
            accessibilityRole="button"
            accessibilityLabel={`Show route to ${dest.label}`}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={12}
              color={
                activeDestination?.id === dest.id ? "#fff" : colors.primary
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
      </ScrollView>

      {/* ── Map ──────────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={INITIAL_REGION}
          mapType={mapType}
          customMapStyle={theme === "dark" ? colors.mapStyle : []}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          accessibilityLabel="Map showing nearby eco-friendly rides"
        >
          {/* User location */}
          <Marker
            coordinate={USER_LOCATION}
            anchor={{ x: 0.5, y: 0.5 }}
            title="You are here"
            description="Victoria Island, Lagos"
            accessibilityLabel="Your current location"
          >
            <View style={styles.userMarkerOuter}>
              <View
                style={[styles.userPulseRing, { borderColor: colors.primary }]}
              />
              <View
                style={[styles.userDot, { backgroundColor: colors.primary }]}
              />
            </View>
          </Marker>

          {/* Destination pin */}
          {activeDestination && (
            <Marker
              coordinate={activeDestination.coordinate}
              title={activeDestination.label}
              description="Selected destination"
              accessibilityLabel={`Destination: ${activeDestination.label}`}
            >
              <View style={styles.destMarker}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={36}
                  color="#E53935"
                />
                <View
                  style={[
                    styles.destLabel,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.destLabelText, { color: colors.text }]}>
                    {activeDestination.label}
                  </Text>
                </View>
              </View>
            </Marker>
          )}

          {/* Route polyline */}
          {routeCoords.length >= 2 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={colors.primary}
              strokeWidth={3}
              lineDashPattern={[8, 4]}
              accessibilityLabel="Route line"
            />
          )}

          {/* Driver markers */}
          {MOCK_DRIVER_LOCATIONS.map((driver) => (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.latitude,
                longitude: driver.longitude,
              }}
              title={`${driver.type} Ride`}
              description={
                driver.type === "Electric"
                  ? `${(<MaterialCommunityIcons name="lightning-bolt" size={14} color="#F0A500" />)} Tap to show route`
                  : "" +
                    `${(<MaterialCommunityIcons name="battery-charging" size={14} color="green" />)} Tap to show route`
              }
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => handleDriverSelect(driver)}
              accessibilityLabel={`${driver.type} driver nearby`}
            >
              <View
                style={[
                  styles.driverMarker,
                  {
                    backgroundColor:
                      driver.type === "Electric"
                        ? (colors.electricBadge ?? "#1565C0")
                        : (colors.hybridBadge ?? "#2E7D32"),
                    transform: [
                      { scale: activeDriver?.id === driver.id ? 1.2 : 1 },
                    ],
                    borderColor:
                      activeDriver?.id === driver.id ? "#FFD700" : "#fff",
                    borderWidth: activeDriver?.id === driver.id ? 3 : 2,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    driver.type === "Electric" ? "car-electric" : "car-sports"
                  }
                  size={18}
                  color="#fff"
                />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Recenter button */}
        <TouchableOpacity
          style={[
            styles.recenterBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={recenter}
          accessibilityLabel="Center map on current location"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Tap hint */}
        {!activeDriver && (
          <View
            style={[styles.tapHint, { backgroundColor: colors.surface + "EE" }]}
          >
            <MaterialCommunityIcons
              name="gesture-tap"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.tapHintText, { color: colors.textMuted }]}>
              Tap a driver to preview route
            </Text>
          </View>
        )}
      </View>

      {/*  Legend  */}
      <View
        style={[
          styles.legend,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.legendTitle, { color: colors.textMuted }]}>
          LEGEND
        </Text>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.electricBadge ?? "#1565C0" },
            ]}
          >
            <MaterialCommunityIcons
              name="car-electric"
              size={13}
              color="#fff"
            />
          </View>
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            Electric
          </Text>

          <View
            style={[
              styles.legendDot,
              {
                backgroundColor: colors.hybridBadge ?? "#2E7D32",
                marginLeft: Spacing.md,
              },
            ]}
          >
            <MaterialCommunityIcons name="car-sports" size={13} color="#fff" />
          </View>
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            Hybrid
          </Text>

          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.primary, marginLeft: Spacing.md },
            ]}
          >
            <MaterialCommunityIcons name="account" size={13} color="#fff" />
          </View>
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            You
          </Text>

          <View
            style={[
              styles.legendDot,
              { backgroundColor: "#E53935", marginLeft: Spacing.md },
            ]}
          >
            <MaterialCommunityIcons name="map-marker" size={13} color="#fff" />
          </View>
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            Dest.
          </Text>
        </View>
        <Text style={[styles.legendNote, { color: colors.textMuted }]}>
          {activeDestination
            ? `🟢 Route shown: Victoria Island → ${activeDestination.label}`
            : `${MOCK_DRIVER_LOCATIONS.length} eco-drivers available in Lagos`}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
    },
    headerTitle: { ...Typography.heading, color: colors.text },
    headerSub: { ...Typography.caption, color: colors.textMuted, marginTop: 2 },
    mapTypeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.surface,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapTypeBtnText: { ...Typography.caption, color: colors.textSecondary },

    chipRow: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.sm,
      gap: Spacing.xs,
      flexDirection: "row",
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

    mapContainer: {
      flex: 1,
      borderRadius: Radius.lg,
      overflow: "hidden",
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
    },
    map: { flex: 1 },

    // User location
    userMarkerOuter: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    userPulseRing: {
      position: "absolute",
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2,
      backgroundColor: "transparent",
      opacity: 0.4,
    },
    userDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: "#fff",
    },

    // Destination
    destMarker: { alignItems: "center" },
    destLabel: {
      marginTop: -6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    destLabelText: { fontSize: 10, fontWeight: "700" },

    // Drivers
    driverMarker: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },

    recenterBtn: {
      position: "absolute",
      bottom: Spacing.md,
      right: Spacing.md,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },

    tapHint: {
      position: "absolute",
      bottom: Spacing.md,
      left: Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.full,
    },
    tapHintText: { fontSize: 11 },

    legend: {
      padding: Spacing.md,
      margin: Spacing.md,
      marginTop: 0,
      borderRadius: Radius.lg,
      borderWidth: 1,
    },
    legendTitle: { ...Typography.label, marginBottom: Spacing.sm },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.xs,
      flexWrap: "wrap",
      gap: 4,
    },
    legendDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    legendLabel: { ...Typography.bodySmall },
    legendNote: { ...Typography.caption, marginTop: Spacing.xs },
  });
