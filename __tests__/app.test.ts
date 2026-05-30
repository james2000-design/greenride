import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';

// ── Test 1: RideCard renders correctly ──────────────────────────────────────

// Mock simplified RideCard for unit test
const MockRideCard = ({
  ride,
  onSelect,
}: {
  ride: any;
  onSelect: (ride: any) => void;
}) => (
  <View>
    <Text testID="vehicle-type">{ride.vehicleType}</Text>
    <Text testID="car-model">{ride.carModel}</Text>
    <Text testID="price">₦{ride.price.toFixed(2)}</Text>
    <Text testID="co2-saved">🌿 {ride.co2Saved}kg CO₂ saved</Text>
    <Text testID="eta">{ride.eta}</Text>
    <TouchableOpacity testID="book-btn" onPress={() => onSelect(ride)}>
      <Text>Book Ride →</Text>
    </TouchableOpacity>
  </View>
);

describe('RideCard', () => {
  const mockRide = {
    id: 1,
    vehicleType: 'Electric',
    eta: '3 mins',
    price: 7.5,
    co2Saved: 1.4,
    driverName: 'Emeka Obi',
    driverRating: 4.9,
    carModel: 'Tesla Model 3',
    licensePlate: 'EKY-123-GH',
  };

  it('renders ride information correctly', () => {
    const { getByTestId } = render(
      <MockRideCard ride={mockRide} onSelect={() => {}} />
    );

    expect(getByTestId('vehicle-type').props.children).toBe('Electric');
    expect(getByTestId('car-model').props.children).toBe('Tesla Model 3');
    expect(getByTestId('price').props.children).toEqual(['₦', '7.50']);
    expect(getByTestId('eta').props.children).toBe('3 mins');
  });

  it('calls onSelect with the ride when book button is pressed', () => {
    const mockOnSelect = jest.fn();
    const { getByTestId } = render(
      <MockRideCard ride={mockRide} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByTestId('book-btn'));
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockRide);
  });

  it('displays CO2 savings', () => {
    const { getByTestId } = render(
      <MockRideCard ride={mockRide} onSelect={() => {}} />
    );
    expect(getByTestId('co2-saved').props.children).toEqual(['🌿 ', 1.4, 'kg CO₂ saved']);
  });
});

// ── Test 2: EcoPoints calculation logic ────────────────────────────────────

describe('EcoPoints Calculation', () => {
  const calculateEcoPoints = (co2Saved: number): number =>
    Math.round(co2Saved * 100);

  it('calculates correct EcoPoints for Electric ride (1.4kg)', () => {
    expect(calculateEcoPoints(1.4)).toBe(140);
  });

  it('calculates correct EcoPoints for Hybrid ride (0.8kg)', () => {
    expect(calculateEcoPoints(0.8)).toBe(80);
  });

  it('calculates zero points for zero CO2 savings', () => {
    expect(calculateEcoPoints(0)).toBe(0);
  });

  it('rounds fractional EcoPoints correctly', () => {
    expect(calculateEcoPoints(0.755)).toBe(76);
    expect(calculateEcoPoints(0.754)).toBe(75);
  });
});

// ── Test 3: Tier logic ────────────────────────────────────────────────────

describe('Tier Assignment', () => {
  const getTier = (points: number) => {
    if (points >= 500) return 'Platinum';
    if (points >= 200) return 'Gold';
    if (points >= 50) return 'Silver';
    return 'Bronze';
  };

  it('assigns Bronze for 0 points', () => {
    expect(getTier(0)).toBe('Bronze');
  });

  it('assigns Silver at exactly 50 points', () => {
    expect(getTier(50)).toBe('Silver');
  });

  it('assigns Gold at exactly 200 points', () => {
    expect(getTier(200)).toBe('Gold');
  });

  it('assigns Platinum at exactly 500 points', () => {
    expect(getTier(500)).toBe('Platinum');
  });

  it('assigns Bronze for 49 points (just below Silver)', () => {
    expect(getTier(49)).toBe('Bronze');
  });
});

// ── Test 4: CO2 total accumulation ────────────────────────────────────────

describe('CO2 Total Calculation', () => {
  const computeTotalCo2 = (rides: { co2Saved: number }[]): number =>
    rides.reduce((sum, r) => sum + r.co2Saved, 0);

  it('returns 0 for no rides', () => {
    expect(computeTotalCo2([])).toBe(0);
  });

  it('sums CO2 across multiple rides', () => {
    const rides = [{ co2Saved: 1.4 }, { co2Saved: 0.8 }, { co2Saved: 1.6 }];
    expect(computeTotalCo2(rides)).toBeCloseTo(3.8);
  });

  it('handles single ride', () => {
    expect(computeTotalCo2([{ co2Saved: 1.4 }])).toBe(1.4);
  });
});
