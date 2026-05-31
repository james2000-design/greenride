import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useColorScheme, Animated, Easing } from "react-native";
import { Colors } from "../theme";
import { rides as ridesData } from "../data/rides";

export interface Ride {
  id: number;
  vehicleType: "Electric" | "Hybrid";
  eta: string;
  price: number;
  co2Saved: number;
  driverName: string;
  driverRating: number;
  carModel: string;
  licensePlate: string;
}

export interface BookedRide extends Ride {
  bookedAt: string;
  from: string;
  to: string;
  ecoPoints: number;
}

export interface AppState {
  theme: "light" | "dark";
  rides: Ride[];
  loading: boolean;
  bookedRides: BookedRide[];
  totalCo2Saved: number;
  totalEcoPoints: number;
  selectedRide: Ride | null;
  pendingBooking: { from: string; to: string } | null;
}

interface AppContextValue extends AppState {
  toggleTheme: () => void;
  colors: (typeof Colors)[keyof typeof Colors];
  fetchRides: () => void;
  selectRide: (ride: Ride) => void;
  setPendingBooking: (booking: { from: string; to: string } | null) => void;
  confirmBooking: () => void;
  clearSelectedRide: () => void;
  themeTransitionAnim: Animated.Value;
  isTransitioning: boolean;
  prevTheme: "light" | "dark";
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<"light" | "dark">(
    systemScheme === "dark" ? "dark" : "light",
  );
  const [prevTheme, setPrevTheme] = useState<"light" | "dark">(
    systemScheme === "dark" ? "dark" : "light",
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookedRides, setBookedRides] = useState<BookedRide[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [pendingBooking, setPendingBookingState] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const themeTransitionAnim = useRef(new Animated.Value(0)).current;

  const runTransition = useCallback(() => {
    themeTransitionAnim.setValue(1);
    setIsTransitioning(true);
    Animated.timing(themeTransitionAnim, {
      toValue: 0,
      duration: 650,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start(() => {
      setIsTransitioning(false);
    });
  }, [themeTransitionAnim]);

  // Sync with system theme
  useEffect(() => {
    if (
      systemScheme &&
      systemScheme !== "unspecified" &&
      systemScheme !== theme
    ) {
      const next = systemScheme === "dark" ? "dark" : "light";
      setPrevTheme(theme);
      setTheme(next);
      runTransition();
    }
  }, [systemScheme]);

  const totalCo2Saved = bookedRides.reduce((sum, r) => sum + r.co2Saved, 0);
  const totalEcoPoints = bookedRides.reduce((sum, r) => sum + r.ecoPoints, 0);

  const colors = Colors[theme];

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setPrevTheme(theme);
    setTheme(newTheme);
    runTransition();
  }, [theme, runTransition]);

  const fetchRides = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setRides(ridesData);
      setLoading(false);
    }, 800);
  }, []);

  const selectRide = useCallback((ride: Ride) => {
    setSelectedRide(ride);
  }, []);

  const setPendingBooking = useCallback(
    (booking: { from: string; to: string } | null) => {
      setPendingBookingState(booking);
    },
    [],
  );

  const confirmBooking = useCallback(() => {
    if (!selectedRide || !pendingBooking) return;
    const ecoPoints = Math.round(selectedRide.co2Saved * 100);
    const booked: BookedRide = {
      ...selectedRide,
      bookedAt: new Date().toISOString(),
      from: pendingBooking.from,
      to: pendingBooking.to,
      ecoPoints,
    };
    setBookedRides((prev) => [booked, ...prev]);
    setSelectedRide(null);
    setPendingBookingState(null);
  }, [selectedRide, pendingBooking]);

  const clearSelectedRide = useCallback(() => {
    setSelectedRide(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        rides,
        loading,
        bookedRides,
        totalCo2Saved,
        totalEcoPoints,
        selectedRide,
        pendingBooking,
        toggleTheme,
        colors,
        fetchRides,
        selectRide,
        setPendingBooking,
        confirmBooking,
        clearSelectedRide,
        themeTransitionAnim,
        isTransitioning,
        prevTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
