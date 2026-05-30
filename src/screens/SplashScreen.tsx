import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Typography, Spacing, Radius } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function SplashScreen({ navigation }: Props) {
  const { colors } = useApp();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const leafAnim = useRef(new Animated.Value(0)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(leafAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(logoAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(leafRotate, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(leafRotate, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const leafSpin = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2E1A" />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoMark,
            {
              opacity: leafAnim,
              transform: [
                {
                  scale: leafAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
                { rotate: leafSpin },
              ],
            },
          ]}>
          <Text style={styles.leafEmoji}>
            <MaterialCommunityIcons name="leaf" size={250} color={"#47a660"} />
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: logoAnim,
            transform: [
              {
                translateY: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}>
          <Text style={styles.appName}>GreenRide</Text>
          <View style={styles.taglinePill}>
            <Text style={styles.taglinePillText}>ECO . SMART . FAST</Text>
          </View>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{
            opacity: taglineAnim,
            transform: [
              {
                translateY: taglineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
            marginTop: Spacing.xl,
          }}>
          <Text style={styles.tagline}>
            Every ride you take{"\n"}makes the planet greener.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.statsRow, { opacity: taglineAnim }]}>
          {[
            { value: "0g", label: "Emissions" },
            { value: "100%", label: "Eco Fleet" },
            {
              value: (
                <MaterialCommunityIcons
                  name="sprout"
                  size={24}
                  color="#6DD98A"
                />
              ),
              label: "EcoPoints",
            },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View
          style={{
            opacity: btnAnim,
            transform: [
              {
                translateY: btnAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            width: "100%",
          }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.replace("Main")}
            activeOpacity={0.85}
            accessibilityLabel="Get started with GreenRide"
            accessibilityRole="button">
            <Text style={styles.ctaText}>Get Started</Text>
            <Text style={styles.ctaArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={30}
                color="white"
              />
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            <MaterialCommunityIcons name="lock" size={15} color="gray" />{" "}
            Carbon-neutral since 2024 . Lagos, Nigeria
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0A2E1A',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bgCircle1: {
      position: 'absolute',
      width: width * 1.2,
      height: width * 1.2,
      borderRadius: width * 0.6,
      backgroundColor: 'rgba(26,122,60,0.18)',
      top: -width * 0.4,
      right: -width * 0.3,
    },
    bgCircle2: {
      position: 'absolute',
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: width * 0.4,
      backgroundColor: 'rgba(76,175,115,0.08)',
      bottom: -width * 0.2,
      left: -width * 0.2,
    },
    bgCircle3: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(76,175,115,0.12)',
      bottom: height * 0.25,
      right: 30,
    },
    content: {
      width: '100%',
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
    },
    logoMark: {
      marginBottom: Spacing.lg,
    },
    leafEmoji: {
      fontSize: 72,
    },
    appName: {
      ...Typography.displayLarge,
      fontSize: 48,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    taglinePill: {
      backgroundColor: 'rgba(76,175,115,0.25)',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      alignSelf: 'center',
      marginTop: Spacing.sm,
      borderWidth: 1,
      borderColor: 'rgba(76,175,115,0.4)',
    },
    taglinePillText: {
      ...Typography.label,
      color: '#6DD98A',
      letterSpacing: 2,
    },
    tagline: {
      ...Typography.subheading,
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      lineHeight: 26,
    },
    statsRow: {
      flexDirection: 'row',
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
      width: '100%',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    statValue: {
      ...Typography.heading,
      color: '#6DD98A',
      fontSize: 22,
    },
    statLabel: {
      ...Typography.caption,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 2,
    },
    ctaButton: {
      backgroundColor: '#4CAF73',
      borderRadius: Radius.lg,
      paddingVertical: 18,
      paddingHorizontal: Spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#4CAF73',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    ctaText: {
      ...Typography.subheading,
      color: '#FFFFFF',
      fontSize: 18,
    },
    ctaArrow: {
      color: '#FFFFFF',
      fontSize: 20,
      marginLeft: Spacing.sm,
    },
    footerNote: {
      ...Typography.caption,
      color: 'rgba(255,255,255,0.4)',
      textAlign: 'center',
      marginTop: Spacing.lg,
    },
  });
