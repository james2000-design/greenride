import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp, Ride } from '../context/AppContext';
import RideCard from '../components/RideCard';
import { Typography, Spacing, Radius } from '../theme';
import { MaterialCommunityIcons } from "@expo/vector-icons";
type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function HomeScreen({ navigation }: Props) {
  const { colors, rides, loading, fetchRides, selectRide, setPendingBooking, theme, toggleTheme } = useApp();
  const [from, setFrom] = useState('Victoria Island, Lagos');
  const [to, setTo] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Electric' | 'Hybrid'>('All');

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSelectRide = useCallback(
    (ride: Ride) => {
      if (!to.trim()) {
        return;
      }
      selectRide(ride);
      setPendingBooking({ from, to });
      navigation.navigate('Confirmation');
    },
    [from, to, selectRide, setPendingBooking, navigation]
  );

  const filteredRides = rides.filter(
    (r) => filterType === 'All' || r.vehicleType === filterType
  );

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
            {/* Header */}
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
                accessibilityRole="button">
                <Text style={styles.themeIcon}>
                  {theme === "dark" ? (
                    <MaterialCommunityIcons
                      name="white-balance-sunny"
                      color="#F0A500"
                      size={30}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="moon-waxing-crescent"
                      color="#F0A500"
                      size={30}
                    />
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Location inputs */}
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
                  style={[
                    styles.inputDot,
                    { backgroundColor: colors.accentAlt },
                  ]}
                />
                <TextInput
                  style={styles.input}
                  value={to}
                  onChangeText={setTo}
                  placeholder="To — enter destination"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Drop-off location"
                />
              </View>
            </View>

            {/* Eco banner */}
            <View style={styles.ecoBanner}>
              <Text style={styles.ecoBannerText}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={14}
                  color="green"
                />{" "}
                All rides below are certified eco-friendly. Choose wisely, save
                the planet.
              </Text>
            </View>

            <View style={styles.filterRow}>
              {(["All", "Electric", "Hybrid"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterTab,
                    filterType === type && styles.filterTabActive,
                  ]}
                  onPress={() => setFilterType(type)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${type} rides`}>
                  <Text
                    style={[
                      styles.filterTabText,
                      filterType === type && styles.filterTabTextActive,
                    ]}>
                    {type === "Electric" ? (
                      <MaterialCommunityIcons
                        name="lightning-bolt"
                        size={14}
                        color="#F0A500"
                      />
                    ) : type === "Hybrid" ? (
                      <MaterialCommunityIcons
                        name="battery-charging"
                        size={14}
                        color="green"
                      />
                    ) : (
                      ""
                    )}
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>
              {filteredRides.length} ride{filteredRides.length !== 1 ? "s" : ""}{" "}
              available
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RideCard ride={item} onSelect={handleSelectRide} colors={colors} />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                Finding eco rides near you…
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌿</Text>
              <Text style={styles.emptyText}>No rides available right now</Text>
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
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: Spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    greeting: {
      ...Typography.body,
      color: colors.textSecondary,
      fontSize: 24,
      marginBottom: Spacing.xs,
    },
    headerTitle: {
      ...Typography.displayMedium,
      color: colors.text,
    },
    themeToggle: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeIcon: {
      fontSize: 20,
    },
    inputCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 2,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
    ecoBanner: {
      backgroundColor: colors.primaryLight,
      marginHorizontal: Spacing.md,
      borderRadius: Radius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
    },
    ecoBannerText: {
      ...Typography.caption,
      color: colors.primary,
      textAlign: 'center',
      lineHeight: 18,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    filterTab: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterTabText: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    filterTabTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    sectionTitle: {
      ...Typography.caption,
      color: colors.textMuted,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingTop: Spacing.xxl,
    },
    loadingText: {
      ...Typography.body,
      color: colors.textSecondary,
      marginTop: Spacing.md,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingTop: Spacing.xxl,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: Spacing.md,
    },
    emptyText: {
      ...Typography.body,
      color: colors.textSecondary,
    },
  });
