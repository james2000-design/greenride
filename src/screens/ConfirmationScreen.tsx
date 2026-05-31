import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useApp, Ride } from "../context/AppContext";
import { Typography, Spacing, Radius } from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RideSuccessModal from "../components/RideSuccessModal";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function ConfirmationScreen({ navigation }: Props) {
  const {
    colors,
    selectedRide,
    pendingBooking,
    confirmBooking,
    clearSelectedRide,
    theme,
  } = useApp();

  const [showSuccess, setShowSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Snapshot ride + booking into local state so they survive context being cleared
  const [frozenRide, setFrozenRide] = useState<Ride | null>(selectedRide);
  const [frozenBooking, setFrozenBooking] = useState<{
    from: string;
    to: string;
  } | null>(pendingBooking);

  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const co2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.timing(co2Anim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
      delay: 300,
    }).start();
  }, []);

  // Guard: only go back if we didn't intentionally confirm
  useEffect(() => {
    if (!confirming && !selectedRide && !pendingBooking) {
      navigation.goBack();
    }
  }, [selectedRide, pendingBooking, navigation, confirming]);

  if (!frozenRide || !frozenBooking) {
    return null;
  }

  const ecoPoints = Math.round(frozenRide.co2Saved * 100);
  const isElectric = frozenRide.vehicleType === "Electric";

  const handleConfirm = () => {
    // Freeze local copies before context is wiped
    setFrozenRide(selectedRide);
    setFrozenBooking(pendingBooking);
    setConfirming(true);
    confirmBooking();
    setTimeout(() => {
      setShowSuccess(true);
    }, 150);
  };

  const handleCancel = () => {
    clearSelectedRide();
    navigation.goBack();
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RideSuccessModal
          visible={showSuccess}
          vehicleType={frozenRide.vehicleType}
          ecoPoints={ecoPoints}
          colors={colors}
          onViewProfile={() => {
            setShowSuccess(false);
            navigation.navigate("Main", { screen: "Profile" });
          }}
          onGoHome={() => {
            setShowSuccess(false);
            navigation.navigate("Main", { screen: "Home" });
          }}
        />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleCancel}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backBtnText}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={16}
              color={colors.text}
            />{" "}
            Back
          </Text>
        </TouchableOpacity>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroEmoji}>
              {isElectric ? (
                <MaterialCommunityIcons
                  name="car-electric"
                  size={52}
                  color={colors.accent}
                />
              ) : (
                <MaterialCommunityIcons
                  name="car-sports"
                  size={52}
                  color={colors.hybridBadge}
                />
              )}
            </View>
            <Text style={styles.heroTitle}>Ride Summary</Text>
            <Text style={styles.heroSubtitle}>Review your booking details</Text>
          </View>

          {/* Trip info */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TRIP DETAILS</Text>
            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <Text style={styles.routeText}>{frozenBooking.from}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View
                style={[styles.routeDot, { backgroundColor: colors.accentAlt }]}
              />
              <Text style={styles.routeText}>{frozenBooking.to}</Text>
            </View>
          </View>

          {/* Ride details */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>VEHICLE & DRIVER</Text>
            <View style={styles.detailGrid}>
              {[
                {
                  label: "Type",
                  value: frozenRide.vehicleType,
                  icon: isElectric ? (
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={16}
                      color={colors.accentAlt}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="battery"
                      size={16}
                      color={colors.hybridBadge}
                    />
                  ),
                },
                {
                  label: "ETA",
                  value: frozenRide.eta,
                  icon: (
                    <MaterialCommunityIcons
                      name="clock-time-four"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
                {
                  label: "Model",
                  value: frozenRide.carModel,
                  icon: (
                    <MaterialCommunityIcons
                      name="car"
                      size={16}
                      color={colors.electricBadge}
                    />
                  ),
                },
                {
                  label: "Driver",
                  value: frozenRide.driverName,
                  icon: (
                    <MaterialCommunityIcons
                      name="account"
                      size={16}
                      color={colors.hybridBadge}
                    />
                  ),
                },
                {
                  label: "Rating",
                  value: `${frozenRide.driverRating}`,
                  icon: (
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color={colors.accentAlt}
                    />
                  ),
                },
                {
                  label: "Plate",
                  value: frozenRide.licensePlate,
                  icon: (
                    <MaterialCommunityIcons
                      name="card-account-details"
                      size={16}
                      color={colors.textSecondary}
                    />
                  ),
                },
              ].map((item) => (
                <View key={item.label} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>
                    {item.icon} {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* CO2 savings highlight */}
          <View style={styles.co2Card}>
            <Text style={styles.co2CardLabel}>
              <MaterialCommunityIcons
                name="leaf"
                size={16}
                color={colors.accent}
              />{" "}
              ENVIRONMENTAL IMPACT
            </Text>
            <View style={styles.co2Row}>
              <View style={styles.co2Stat}>
                <Text style={styles.co2BigValue}>{frozenRide.co2Saved}kg</Text>
                <Text style={styles.co2StatLabel}>CO₂ Saved</Text>
              </View>
              <View style={styles.co2Divider} />
              <View style={styles.co2Stat}>
                <Text style={styles.co2BigValue}>+{ecoPoints}</Text>
                <Text style={styles.co2StatLabel}>EcoPoints</Text>
              </View>
            </View>
            <View style={styles.co2BarContainer}>
              <Animated.View
                style={[
                  styles.co2Bar,
                  {
                    width: co2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        "0%",
                        `${Math.min(frozenRide.co2Saved * 50, 100)}%`,
                      ],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.co2Equivalent}>
              Equivalent to planting {Math.round(frozenRide.co2Saved * 2)} trees{" "}
              <MaterialCommunityIcons
                name="tree"
                size={18}
                color={colors.accent}
              />
            </Text>
          </View>

          {/* Price card */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>TOTAL FARE</Text>
            <Text style={styles.priceValue}>
              ₦{frozenRide.price.toFixed(2)}
            </Text>
            <Text style={styles.priceNote}>
              Cash or card accepted on arrival
            </Text>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
            accessibilityLabel="Confirm ride booking"
            accessibilityRole="button"
          >
            <Text style={styles.confirmBtnText}>
              Confirm Booking{" "}
              <MaterialCommunityIcons
                name="leaf"
                size={16}
                color={colors.surface}
              />
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            accessibilityLabel="Cancel and go back"
            accessibilityRole="button"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
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
      padding: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    backBtn: {
      marginBottom: Spacing.md,
    },
    backBtnText: {
      ...Typography.body,
      color: colors.primary,
    },
    heroCard: {
      alignItems: "center",
      paddingVertical: Spacing.lg,
      marginBottom: Spacing.md,
    },
    heroEmoji: {
      marginBottom: Spacing.sm,
    },
    heroTitle: {
      ...Typography.displayMedium,
      color: colors.text,
    },
    heroSubtitle: {
      ...Typography.body,
      color: colors.textSecondary,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLabel: {
      ...Typography.label,
      color: colors.textMuted,
      marginBottom: Spacing.md,
    },
    routeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      paddingVertical: 4,
    },
    routeDot: {
      width: 10,
      height: 10,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
    },
    routeLine: {
      width: 2,
      height: 20,
      backgroundColor: colors.border,
      marginLeft: 4,
      marginVertical: 2,
    },
    routeText: {
      ...Typography.body,
      color: colors.text,
      flex: 1,
    },
    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },
    detailItem: {
      width: "47%",
      backgroundColor: colors.surfaceAlt,
      borderRadius: Radius.md,
      padding: Spacing.sm,
    },
    detailLabel: {
      ...Typography.label,
      color: colors.textMuted,
      marginBottom: 4,
    },
    detailValue: {
      ...Typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    co2Card: {
      backgroundColor: colors.primaryLight,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.primary + "44",
    },
    co2CardLabel: {
      ...Typography.label,
      color: colors.primary,
      marginBottom: Spacing.md,
    },
    co2Row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    co2Stat: {
      flex: 1,
      alignItems: "center",
    },
    co2BigValue: {
      ...Typography.displayMedium,
      color: colors.primary,
    },
    co2StatLabel: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    co2Divider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
    },
    co2BarContainer: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: Radius.full,
      overflow: "hidden",
      marginBottom: Spacing.sm,
    },
    co2Bar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: Radius.full,
    },
    co2Equivalent: {
      ...Typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
    },
    priceCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    priceLabel: {
      ...Typography.label,
      color: colors.textMuted,
      marginBottom: Spacing.sm,
    },
    priceValue: {
      ...Typography.displayLarge,
      color: colors.text,
      fontSize: 40,
    },
    priceNote: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: Spacing.xs,
    },
    confirmBtn: {
      backgroundColor: colors.primary,
      borderRadius: Radius.lg,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: Spacing.md,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    confirmBtnText: {
      ...Typography.subheading,
      color: "#FFFFFF",
      fontSize: 17,
    },
    cancelBtn: {
      borderRadius: Radius.lg,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelBtnText: {
      ...Typography.subheading,
      color: colors.textSecondary,
    },
  });
