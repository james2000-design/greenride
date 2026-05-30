import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useApp } from '../context/AppContext';
import { Typography, Spacing, Radius } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

// Lagos, Nigeria coordinates
const INITIAL_REGION = {
  latitude: 6.4541,
  longitude: 3.3947,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const MOCK_DRIVER_LOCATIONS = [
  { id: 1, latitude: 6.4601, longitude: 3.3907, type: 'Electric' as const },
  { id: 2, latitude: 6.4481, longitude: 3.4027, type: 'Hybrid' as const },
  { id: 3, latitude: 6.4521, longitude: 3.3857, type: 'Electric' as const },
  { id: 4, latitude: 6.4441, longitude: 3.3987, type: 'Hybrid' as const },
];

export default function MapScreen() {
  const { colors, theme } = useApp();
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const styles = createStyles(colors);

  const recenter = () => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Rides</Text>
        <TouchableOpacity
          style={styles.mapTypeBtn}
          onPress={() =>
            setMapType((t) => (t === "standard" ? "satellite" : "standard"))
          }
          accessibilityLabel="Toggle map type"
          accessibilityRole="button">
          <View style={styles.mapTypeBtnContent}>
            <MaterialCommunityIcons
              name={mapType === "standard" ? "satellite-uplink" : "map"}
              size={16}
              color={colors.textSecondary}
              style={styles.mapTypeIcon}
            />
            <Text style={styles.mapTypeBtnText}>
              {mapType === "standard" ? "Sat" : "Map"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={INITIAL_REGION}
          mapType={mapType}
          customMapStyle={theme === "dark" ? colors.mapStyle : []}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          accessibilityLabel="Map showing nearby eco-friendly rides">
          {/* User location marker */}
          <Marker
            coordinate={{ latitude: 6.4541, longitude: 3.3947 }}
            title="You are here"
            description="Victoria Island, Lagos"
            accessibilityLabel="Your current location">
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>

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
                  ? "⚡ Electric Vehicle"
                  : "🔋 Hybrid Vehicle"
              }
              accessibilityLabel={`${driver.type} driver nearby`}>
              <View
                style={[
                  styles.driverMarker,
                  {
                    backgroundColor:
                      driver.type === "Electric"
                        ? colors.electricBadge
                        : colors.hybridBadge,
                  },
                ]}>
                <MaterialCommunityIcons
                  name={
                    driver.type === "Electric"
                      ? "car-electric"
                      : "car-sports"
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
          style={styles.recenterBtn}
          onPress={recenter}
          accessibilityLabel="Center map on current location"
          accessibilityRole="button">
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>LEGEND</Text>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.electricBadge },
            ]}>
            <MaterialCommunityIcons
              name="car-electric"
              size={14}
              color="#fff"
            />
          </View>
          <Text style={styles.legendLabel}>Electric Vehicle</Text>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.hybridBadge, marginLeft: Spacing.md },
            ]}>
            <MaterialCommunityIcons
              name="car-sports"
              size={14}
              color="#fff"
            />
          </View>
          <Text style={styles.legendLabel}>Hybrid Vehicle</Text>
        </View>
        <Text style={styles.legendNote}>
          <MaterialCommunityIcons
            name="information-outline"
            size={14}
            color={colors.textMuted}
          />{" "}
          {MOCK_DRIVER_LOCATIONS.length} eco-drivers nearby in Lagos
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
    },
    headerTitle: {
      ...Typography.heading,
      color: colors.text,
    },
    mapTypeBtn: {
      backgroundColor: colors.surface,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapTypeBtnContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mapTypeIcon: {
      marginRight: Spacing.xs,
    },
    mapTypeBtnText: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    mapContainer: {
      flex: 1,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      marginHorizontal: Spacing.md,
    },
    map: {
      flex: 1,
    },
    userMarker: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(26,122,60,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    userMarkerInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    driverMarker: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    driverMarkerText: {
      fontSize: 16,
    },
    recenterBtn: {
      position: 'absolute',
      bottom: Spacing.md,
      right: Spacing.md,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    recenterIcon: {
      fontSize: 22,
      color: colors.primary,
    },
    legend: {
      backgroundColor: colors.surface,
      padding: Spacing.md,
      margin: Spacing.md,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendTitle: {
      ...Typography.label,
      color: colors.textMuted,
      marginBottom: Spacing.sm,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    legendDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.xs,
    },
    legendDotText: {
      fontSize: 13,
    },
    legendLabel: {
      ...Typography.bodySmall,
      color: colors.textSecondary,
    },
    legendNote: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: Spacing.xs,
    },
  });
