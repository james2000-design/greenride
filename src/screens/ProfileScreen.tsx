import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { Typography, Spacing, Radius } from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const {
    colors,
    theme,
    toggleTheme,
    bookedRides,
    totalCo2Saved,
    totalEcoPoints,
  } = useApp();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
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
  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const tier =
    totalEcoPoints >= 500
      ? {
          name: "Platinum",
          icon: (
            <MaterialCommunityIcons name="diamond" size={14} color="#5B9BD5" />
          ),
          color: "#5B9BD5",
        }
      : totalEcoPoints >= 200
        ? {
            name: "Gold",
            icon: (
              <MaterialCommunityIcons name="gold" size={14} color="#F0A500" />
            ),
            color: "#F0A500",
          }
        : totalEcoPoints >= 50
          ? {
              name: "Silver",
              icon: (
                <MaterialCommunityIcons
                  name="medal"
                  size={14}
                  color={colors.text}
                />
              ),
            }
          : {
              name: "Bronze",
              icon: (
                <MaterialCommunityIcons
                  name="medal"
                  size={14}
                  color={colors.accentAlt}
                />
              ),
              color: "#CD7F32",
            };

  const nextTierPoints =
    totalEcoPoints < 50
      ? 50
      : totalEcoPoints < 200
        ? 200
        : totalEcoPoints < 500
          ? 500
          : 1000;
  const tierProgress = Math.min(totalEcoPoints / nextTierPoints, 1);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>
              Eco Warrior{" "}
              <MaterialCommunityIcons
                name="earth"
                size={16}
                color={colors.hybridBadge}
              />
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
              style={{ transform: [{ rotate: spin }, { scale: scaleAnim }] }}
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
        </Animated.View>

        {/* Avatar & Tier */}
        <Animated.View style={[styles.avatarSection, { opacity: headerAnim }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>
              <MaterialCommunityIcons
                name="leaf"
                size={32}
                color={colors.primary}
              />
            </Text>
          </View>
          <Text style={styles.userName}>GreenRider</Text>
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: tier.color + "22", borderColor: tier.color },
            ]}
          >
            <Text style={[styles.tierText, { color: tier.color }]}>
              {tier.icon} {tier.name} Member
            </Text>
          </View>
        </Animated.View>

        {/* Progress to next tier */}
        <Animated.View style={[styles.card, { opacity: statsAnim }]}>
          <View style={styles.tierProgressHeader}>
            <Text style={styles.cardLabel}>TIER PROGRESS</Text>
            <Text style={styles.tierProgressTarget}>
              {totalEcoPoints} / {nextTierPoints} pts
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: `${tierProgress * 100}%`,
                  backgroundColor: tier.color,
                },
              ]}
            />
          </View>
          <Text style={styles.tierHint}>
            {nextTierPoints - totalEcoPoints > 0
              ? `${nextTierPoints - totalEcoPoints} more points to next tier`
              : `Max tier reached! ${(
                  <MaterialCommunityIcons
                    name="party-popper"
                    size={16}
                    color={colors.accent}
                  />
                )} `}
          </Text>
        </Animated.View>

        {/* Stats grid */}
        <Animated.View style={[styles.statsGrid, { opacity: statsAnim }]}>
          {[
            {
              icon: (
                <MaterialCommunityIcons
                  name="car"
                  size={32}
                  color={colors.primaryDark}
                />
              ),
              value: bookedRides.length,
              label: "Total Rides",
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="leaf"
                  size={32}
                  color={colors.primary}
                />
              ),
              value: `${totalCo2Saved.toFixed(1)}kg`,
              label: "CO₂ Saved",
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="star"
                  size={32}
                  color={colors.accentAlt}
                />
              ),
              value: totalEcoPoints,
              label: "EcoPoints",
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="tree"
                  size={32}
                  color={colors.accent}
                />
              ),
              value: Math.round(totalCo2Saved * 2),
              label: "Trees Equiv.",
            },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Rewards */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            <MaterialCommunityIcons
              name="gift"
              size={16}
              color={colors.accentAlt}
            />{" "}
            REWARDS SHOP
          </Text>
          {[
            {
              icon: (
                <MaterialCommunityIcons
                  name="coffee"
                  size={32}
                  color={colors.accentAlt}
                />
              ),
              name: "Free Coffee",
              points: 50,
              available: totalEcoPoints >= 50,
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="film"
                  size={32}
                  color={colors.accentAlt}
                />
              ),
              name: "Movie Ticket",
              points: 150,
              available: totalEcoPoints >= 150,
            },
            {
              icon: (
                <MaterialCommunityIcons
                  name="cart"
                  size={32}
                  color={colors.accentAlt}
                />
              ),
              name: "Free Ride",
              points: 300,
              available: totalEcoPoints >= 300,
            },
          ].map((reward) => (
            <View key={reward.name} style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>{reward.icon}</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardPoints}>{reward.points} pts</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.redeemBtn,
                  !reward.available && styles.redeemBtnDisabled,
                ]}
                disabled={!reward.available}
                accessibilityLabel={`Redeem ${reward.name} for ${reward.points} EcoPoints`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.redeemBtnText,
                    !reward.available && styles.redeemBtnTextDisabled,
                  ]}
                >
                  {reward.available ? "Redeem" : "Locked"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Recent rides */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>RECENT RIDES</Text>
          {bookedRides.length === 0 ? (
            <View style={styles.emptyRides}>
              <Text style={styles.emptyRidesEmoji}>
                <MaterialCommunityIcons
                  name="car"
                  size={40}
                  color={colors.textSecondary}
                />
              </Text>
              <Text style={styles.emptyRidesText}>
                No rides yet. Book your first eco ride!
              </Text>
            </View>
          ) : (
            bookedRides.slice(0, 5).map((ride, index) => (
              <View
                key={`${ride.id}-${ride.bookedAt}`}
                style={[
                  styles.rideHistoryItem,
                  index > 0 && styles.rideHistoryDivider,
                ]}
              >
                <View style={styles.rideHistoryLeft}>
                  <Text style={styles.rideHistoryType}>
                    {ride.vehicleType === "Electric" ? "⚡" : "🔋"}{" "}
                    {ride.vehicleType}
                  </Text>
                  <Text style={styles.rideHistoryRoute}>
                    {ride.from} → {ride.to}
                  </Text>
                  <Text style={styles.rideHistoryDate}>
                    {new Date(ride.bookedAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.rideHistoryRight}>
                  <Text style={styles.rideHistoryPrice}>
                    ₦{ride.price.toFixed(2)}
                  </Text>
                  <Text style={styles.rideHistoryCo2}>
                    <MaterialCommunityIcons
                      name="leaf"
                      size={16}
                      color={colors.primary}
                    />{" "}
                    {ride.co2Saved}kg
                  </Text>
                  <Text style={styles.rideHistoryPoints}>
                    +{ride.ecoPoints}pts
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: Spacing.xxl,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      ...Typography.displayMedium,
      color: colors.text,
    },
    headerSubtitle: {
      ...Typography.body,
      color: colors.textSecondary,
    },
    themeToggle: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeIcon: {
      fontSize: 20,
    },
    avatarSection: {
      alignItems: "center",
      paddingVertical: Spacing.lg,
    },
    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.primary,
      marginBottom: Spacing.sm,
    },
    avatarEmoji: {
      fontSize: 40,
    },
    userName: {
      ...Typography.heading,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    tierBadge: {
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 5,
      borderWidth: 1,
    },
    tierText: {
      ...Typography.label,
      fontSize: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLabel: {
      ...Typography.label,
      color: colors.textMuted,
      marginBottom: Spacing.md,
    },
    tierProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    tierProgressTarget: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.surfaceAlt,
      borderRadius: Radius.full,
      overflow: "hidden",
      marginBottom: Spacing.xs,
    },
    progressBar: {
      height: "100%",
      borderRadius: Radius.full,
    },
    tierHint: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    statCard: {
      width: "47%",
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      fontSize: 28,
      marginBottom: Spacing.xs,
    },
    statValue: {
      ...Typography.heading,
      color: colors.text,
      fontSize: 22,
    },
    statLabel: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    rewardItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rewardIcon: {
      fontSize: 28,
      marginRight: Spacing.sm,
    },
    rewardInfo: {
      flex: 1,
    },
    rewardName: {
      ...Typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    rewardPoints: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    redeemBtn: {
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
    },
    redeemBtnDisabled: {
      backgroundColor: colors.surfaceAlt,
    },
    redeemBtnText: {
      ...Typography.caption,
      color: "#FFFFFF",
      fontWeight: "700",
    },
    redeemBtnTextDisabled: {
      color: colors.textMuted,
    },
    emptyRides: {
      alignItems: "center",
      paddingVertical: Spacing.lg,
    },
    emptyRidesEmoji: {
      fontSize: 40,
      marginBottom: Spacing.sm,
    },
    emptyRidesText: {
      ...Typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
    rideHistoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: Spacing.sm,
    },
    rideHistoryDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    rideHistoryLeft: {
      flex: 1,
    },
    rideHistoryType: {
      ...Typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    rideHistoryRoute: {
      ...Typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    rideHistoryDate: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    rideHistoryRight: {
      alignItems: "flex-end",
    },
    rideHistoryPrice: {
      ...Typography.body,
      color: colors.text,
      fontWeight: "700",
    },
    rideHistoryCo2: {
      ...Typography.caption,
      color: colors.primary,
      marginTop: 2,
    },
    rideHistoryPoints: {
      ...Typography.caption,
      color: colors.accentAlt,
      marginTop: 2,
    },
  });
