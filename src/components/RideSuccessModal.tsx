import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  vehicleType: string;
  ecoPoints: number;
  onViewProfile: () => void;
  onGoHome: () => void;
  colors: any;
};

export default function RideSuccessModal({
  visible,
  vehicleType,
  ecoPoints,
  onViewProfile,
  onGoHome,
  colors,
}: Props) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="leaf"
            size={44}
            color={colors.primary}
          />

          <Text style={[styles.title, { color: colors.text }]}>
            Ride Booked!
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your {vehicleType} ride is confirmed.
          </Text>

          <Text style={[styles.points, { color: colors.primary }]}>
            +{ecoPoints} EcoPoints earned
          </Text>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={onViewProfile}
          >
            <Text style={styles.btnText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnOutline, { borderColor: colors.border }]}
            onPress={onGoHome}
          >
            <Text style={[styles.btnOutlineText, { color: colors.text }]}>
              Back Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
  subtitle: {
    marginTop: 6,
    textAlign: "center",
  },
  points: {
    marginTop: 10,
    fontWeight: "600",
  },
  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  btnOutline: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  btnOutlineText: {
    fontWeight: "600",
  },
});
