import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../theme';
import { rides as ridesData } from '../data/rides';


export interface Ride {
  id: number;
  vehicleType: 'Electric' | 'Hybrid';
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
  theme: 'light' | 'dark';
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
  colors: typeof Colors[keyof typeof Colors];
  fetchRides: () => void;
  selectRide: (ride: Ride) => void;
  setPendingBooking: (booking: { from: string; to: string } | null) => void;
  confirmBooking: () => void;
  clearSelectedRide: () => void;
}


const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookedRides, setBookedRides] = useState<BookedRide[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [pendingBooking, setPendingBookingState] = useState<{ from: string; to: string } | null>(null);

  // Sync with system theme
  useEffect(() => {
    if (systemScheme) {
      setTheme(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemScheme]);

  const totalCo2Saved = bookedRides.reduce((sum, r) => sum + r.co2Saved, 0);
  const totalEcoPoints = bookedRides.reduce((sum, r) => sum + r.ecoPoints, 0);

  const colors = Colors[theme];

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const fetchRides = useCallback(() => {
    setLoading(true);
    // Simulate mock API call
    setTimeout(() => {
      setRides(ridesData);
      setLoading(false);
    }, 800);
  }, []);

  const selectRide = useCallback((ride: Ride) => {
    setSelectedRide(ride);
  }, []);

  const setPendingBooking = useCallback((booking: { from: string; to: string } | null) => {
    setPendingBookingState(booking);
  }, []);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
