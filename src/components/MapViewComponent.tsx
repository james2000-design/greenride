// src/components/MapViewComponent.tsx
// Reusable map component used in both HomeScreen (embedded) and MapScreen (full-screen)

import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useApp } from "../context/AppContext";
import { Typography, Spacing, Radius } from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

export const DESTINATIONS = [
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
  {
    id: "ikeja",
    label: "Ikeja",
    coordinate: { latitude: 6.6018, longitude: 3.3515 },
  },
];

export type Destination = (typeof DESTINATIONS)[0];

interface Props {
  mode?: "embedded" | "fullscreen";
  onDestinationChange?: (dest: Destination | null) => void;
  selectedDriverPosition?: { latitude: number; longitude: number } | null;
  pulseAnim?: Animated.Value;
  from?: string;
}

export default function MapViewComponent({
  mode = "embedded",
  onDestinationChange,
  selectedDriverPosition,
  pulseAnim: externalPulse,
  from = "Your Location",
}: Props) {
  const { colors, theme } = useApp();
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [activeDestination, setActiveDestination] =
    useState<Destination | null>(null);
  const [activeDriver, setActiveDriver] = useState<
    (typeof MOCK_DRIVER_LOCATIONS)[0] | null
  >(null);

  // Internal pulse animation (used in embedded mode or when no external one is passed)
  const internalPulse = useRef(new Animated.Value(1)).current;
  const pulseAnim = externalPulse ?? internalPulse;

  React.useEffect(() => {
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

  const handleDestinationSelect = useCallback(
    (dest: Destination) => {
      const next = activeDestination?.id === dest.id ? null : dest;
      setActiveDestination(next);
      setActiveDriver(null);
      onDestinationChange?.(next);

      const coords = next ? [USER_LOCATION, next.coordinate] : undefined;
      if (coords) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 60, bottom: 60, left: 60, right: 60 },
            animated: true,
          });
        }, 100);
      } else {
        mapRef.current?.animateToRegion(INITIAL_REGION, 500);
      }
    },
    [activeDestination, onDestinationChange],
  );

  const handleDriverSelect = useCallback(
    (driver: (typeof MOCK_DRIVER_LOCATIONS)[0]) => {
      const next = activeDriver?.id === driver.id ? null : driver;
      setActiveDriver(next);

      const coords = [
        USER_LOCATION,
        { latitude: driver.latitude, longitude: driver.longitude },
        ...(activeDestination ? [activeDestination.coordinate] : []),
      ];
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, bottom: 60, left: 60, right: 60 },
          animated: true,
        });
      }, 100);
    },
    [activeDriver, activeDestination],
  );

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

  // Driver shown on map — prefer the one passed from HomeScreen (after booking tap)
  const activeDriverCoord =
    selectedDriverPosition ??
    (activeDriver
      ? { latitude: activeDriver.latitude, longitude: activeDriver.longitude }
      : null);

  // Build route: user  driver (if any)  destination (if any)
  const routeCoords = [
    USER_LOCATION,
    ...(activeDriverCoord ? [activeDriverCoord] : []),
    ...(activeDestination ? [activeDestination.coordinate] : []),
  ];

  const isFullscreen = mode === "fullscreen";

  return (
    <View style={[styles.wrapper, isFullscreen && styles.wrapperFullscreen]}>
      {/*  Destination chips  */}
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
            accessibilityLabel={`Set destination to ${dest.label}`}
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

      {/* Map label row */}
      <View style={styles.mapLabelRow}>
        {activeDestination ? (
          <View style={styles.routeLabel}>
            {/* From */}
            <View style={styles.routeLabelSide}>
              <MaterialCommunityIcons
                name="map-marker"
                size={13}
                color={colors.primary}
              />
              <Text
                style={[styles.routeLabelText, { color: colors.text }]}
                numberOfLines={1}
              >
                {from}
              </Text>
            </View>

            {/* Arrow — absolutely centered */}
            <View style={styles.routeArrow}>
              <MaterialCommunityIcons
                name="arrow-right-bold-outline"
                size={16}
                color={colors.textMuted}
              />
            </View>

            {/* To */}
            <View
              style={[styles.routeLabelSide, { justifyContent: "flex-end" }]}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={13}
                color="#E53935"
              />
              <Text
                style={[styles.routeLabelText, { color: colors.text }]}
                numberOfLines={1}
              >
                {activeDestination.label}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.mapLabel, { color: colors.textMuted }]}>
            Tap a destination above
          </Text>
        )}

        {/* Satellite toggle — fullscreen only */}
        {isFullscreen && (
          <TouchableOpacity
            style={[
              styles.mapTypeBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() =>
              setMapType((t) => (t === "standard" ? "satellite" : "standard"))
            }
            accessibilityLabel="Toggle satellite view"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={mapType === "standard" ? "satellite-uplink" : "map"}
              size={14}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.mapTypeBtnText, { color: colors.textSecondary }]}
            >
              {mapType === "standard" ? "Sat" : "Map"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/*  Map */}
      <View
        style={[
          styles.mapWrapper,
          { borderColor: colors.border },
          isFullscreen && styles.mapWrapperFullscreen,
        ]}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          mapType={mapType}
          customMapStyle={theme === "dark" ? colors.mapStyle : []}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          accessibilityLabel="Map showing your location and nearby eco-friendly rides"
        >
          {/* User location — pulsing dot */}
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
                style={[styles.userDot, { backgroundColor: colors.primary }]}
              />
            </View>
          </Marker>

          {/* Destination pin */}
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

          {/* Selected / booked driver */}
          {activeDriverCoord && (
            <Marker
              coordinate={activeDriverCoord}
              title="Your driver"
              description="En route to you"
              anchor={{ x: 0.5, y: 0.5 }}
              accessibilityLabel="Your selected driver"
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

          {/* Route polyline */}
          {routeCoords.length >= 2 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={colors.primary}
              strokeWidth={3}
              lineDashPattern={[8, 4]}
              accessibilityLabel="Route from your location to destination"
            />
          )}

          {/* Nearby drivers (unselected) */}
          {MOCK_DRIVER_LOCATIONS.map((driver) => {
            const isActive = activeDriver?.id === driver.id;
            const isBookedDriver =
              selectedDriverPosition &&
              driver.latitude === selectedDriverPosition.latitude &&
              driver.longitude === selectedDriverPosition.longitude;
            if (isBookedDriver) return null; // already shown as the selected driver above
            return (
              <Marker
                key={driver.id}
                coordinate={{
                  latitude: driver.latitude,
                  longitude: driver.longitude,
                }}
                title={`${driver.type} Ride`}
                description={`${driver.type === "Electric" ? <MaterialCommunityIcons name="lightning-bolt" size={12} color={colors.electricBadge ?? "#1565C0"} /> : <MaterialCommunityIcons name="leaf" size={12} color={colors.hybridBadge ?? "#2E7D32"} />} Tap to preview route`}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={() => isFullscreen && handleDriverSelect(driver)}
                accessibilityLabel={`${driver.type} driver nearby`}
              >
                <View
                  style={[
                    styles.nearbyDriver,
                    {
                      backgroundColor:
                        driver.type === "Electric"
                          ? (colors.electricBadge ?? "#1565C0")
                          : (colors.hybridBadge ?? "#2E7D32"),
                      borderColor: isActive ? "#FFD700" : "#fff",
                      borderWidth: isActive ? 3 : 2,
                      transform: [{ scale: isActive ? 1.2 : 1 }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      driver.type === "Electric"
                        ? "lightning-bolt"
                        : "battery-charging"
                    }
                    size={14}
                    color="#fff"
                  />
                </View>
              </Marker>
            );
          })}
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
        {/* Legend overlay */}
        <View
          style={[styles.mapLegend, { backgroundColor: colors.surface + "EE" }]}
        >
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              You
            </Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={11}
              color={colors.electricBadge ?? "#1565C0"}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Electric
            </Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons
              name="battery-charging"
              size={11}
              color={colors.electricBadge}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Hybrid
            </Text>
          </View>
          {activeDestination && (
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#E53935" }]}
              />
              <Text
                style={[styles.legendText, { color: colors.textSecondary }]}
              >
                Dest.
              </Text>
            </View>
          )}
        </View>
        {/* Tap hint — fullscreen only */}
        {isFullscreen && !activeDriver && (
          <View
            style={[styles.tapHint, { backgroundColor: colors.surface + "EE" }]}
          >
            <MaterialCommunityIcons
              name="gesture-tap"
              size={13}
              color={colors.textMuted}
            />
            <Text style={[styles.tapHintText, { color: colors.textMuted }]}>
              Tap a driver to preview route
            </Text>
          </View>
        )}
      </View>

      {/* Destination-required hint — embedded only */}
      {!isFullscreen && !activeDestination && (
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
            Select a destination above to enable booking
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  wrapperFullscreen: { flex: 1, marginHorizontal: 0, marginBottom: 0 },

  chipRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
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
  chipText: { fontSize: 12 },

  mapLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  mapLabel: { flex: 1, fontSize: 12 },
  mapTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  mapTypeBtnText: { fontSize: 11 },

  mapWrapper: {
    height: 220,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    marginHorizontal: Spacing.xs,
  },
  mapWrapperFullscreen: {
    flex: 1,
    height: undefined,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  map: { flex: 1 },

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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

  mapLegend: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: "600" },

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

  mapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: Spacing.md,
    marginTop: 8,
    padding: 10,
    borderRadius: Radius.md,
  },
  mapHintText: { fontSize: 12, fontWeight: "500", flex: 1 },
  routeLabel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeLabelSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  routeArrow: {
    paddingHorizontal: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  routeLabelText: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
});
