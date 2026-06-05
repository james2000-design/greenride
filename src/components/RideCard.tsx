import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ride } from "../context/AppContext";
import { Typography, Spacing, Radius } from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
interface Props {
  ride: Ride;
  onSelect: (ride: Ride) => void;
  colors: any;
  isSelected?: boolean;
}

const RideCard = React.memo(({ ride, onSelect, colors, isSelected }: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const isElectric = ride.vehicleType === "Electric";
  const badgeColor = isElectric ? colors.electricBadge : colors.hybridBadge;
  const badgeBg = isElectric
    ? `${colors.electricBadge}18`
    : `${colors.hybridBadge}18`;

  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onSelect(ride)}
      accessibilityLabel={`${ride.vehicleType} ride with ${ride.carModel}, ${ride.eta}, ₦${ride.price.toFixed(2)}`}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeBg, borderColor: badgeColor },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {isElectric ? (
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={14}
                  color="#F0A500"
                />
              ) : (
                <MaterialCommunityIcons
                  name="battery-charging"
                  size={14}
                  color="green"
                />
              )}{" "}
              {ride.vehicleType}
            </Text>
          </View>
          <View style={styles.etaChip}>
            <Text style={styles.etaDot}>
              {" \u00B7 "}{" "}
              <MaterialCommunityIcons name="clock-outline" size={14} />
            </Text>
            <Text style={styles.etaText}>{ride.eta}</Text>
          </View>
        </View>

        {/* Car & Driver */}
        <View style={styles.mainRow}>
          <View style={styles.carIcon}>
            <Text style={styles.carEmoji}>
              {isElectric ? (
                <MaterialCommunityIcons
                  name="car-sports"
                  color={"red"}
                  size={42}
                />
              ) : (
                <MaterialCommunityIcons
                  name={"car-sports"}
                  color={"#5B9BD5"}
                  size={42}
                />
              )}
            </Text>
          </View>
          <View style={styles.carInfo}>
            <Text style={styles.carModel}>{ride.carModel}</Text>
            <Text style={styles.driverName}>{ride.driverName}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingText}>{ride.driverRating}</Text>
              <Text style={styles.plateText}> · {ride.licensePlate}</Text>
            </View>
          </View>
        </View>

        {/* Footer row */}
        <View style={styles.footerRow}>
          <View style={styles.co2Pill}>
            <Text style={styles.co2Text}>
              {" "}
              <MaterialCommunityIcons
                name="leaf"
                size={14}
                color="green"
              />{" "}
              {ride.co2Saved}kg CO₂ saved
            </Text>
          </View>
          <Text style={styles.price}>₦{ride.price.toFixed(2)}</Text>
        </View>

        {/* Select indicator */}
        <View style={styles.selectBtn}>
          <Text style={styles.selectBtnText}>
            Book Ride{" "}
            <MaterialCommunityIcons
              name="arrow-right-thick"
              size={18}
              color="white"
            />{" "}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 3,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    badge: {
      borderRadius: Radius.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
    },
    badgeText: {
      ...Typography.label,
      fontSize: 11,
    },
    etaChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    etaDot: {
      color: "#4CAF73",
      fontSize: 8,
    },
    etaText: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    mainRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    carIcon: {
      width: 56,
      height: 56,
      borderRadius: Radius.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    carEmoji: {
      fontSize: 28,
    },
    carInfo: {
      flex: 1,
    },
    carModel: {
      ...Typography.subheading,
      color: colors.text,
    },
    driverName: {
      ...Typography.body,
      color: colors.textSecondary,
      marginTop: 2,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    starIcon: {
      color: "#F0A500",
      fontSize: 13,
    },
    ratingText: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginLeft: 2,
    },
    plateText: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    co2Pill: {
      backgroundColor: colors.primaryLight,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
    },
    co2Text: {
      ...Typography.caption,
      color: colors.primary,
    },
    price: {
      ...Typography.heading,
      color: colors.text,
      fontSize: 20,
    },
    selectBtn: {
      backgroundColor: colors.primary,
      borderRadius: Radius.md,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: Spacing.xs,
    },
    selectBtnText: {
      ...Typography.subheading,
      color: "#FFFFFF",
      alignItems: "center",
      flexDirection: "row",
    },
  });

export default RideCard;
