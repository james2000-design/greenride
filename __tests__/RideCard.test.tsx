import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RideCard from '../src/components/RideCard';
import { Colors } from '../src/theme';

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('RideCard Component', () => {
  const mockRide = {
    id: 1,
    vehicleType: 'Electric' as const,
    eta: '3 mins',
    price: 7.5,
    co2Saved: 1.4,
    driverName: 'Emeka Obi',
    driverRating: 4.9,
    carModel: 'Tesla Model 3',
    licensePlate: 'EKY-123-GH',
  };

  const mockOnSelect = jest.fn();
  const lightColors = Colors.light;

  it('renders correctly with ride data', () => {
    const { getByText } = render(
      <RideCard ride={mockRide} onSelect={mockOnSelect} colors={lightColors} />
    );

    expect(getByText('Electric')).toBeTruthy();
    expect(getByText('Tesla Model 3')).toBeTruthy();
    expect(getByText('Emeka Obi')).toBeTruthy();
    expect(getByText('3 mins')).toBeTruthy();
    expect(getByText('₦7.50')).toBeTruthy();
    expect(getByText('1.4kg CO₂ saved')).toBeTruthy();
  });

  it('calls onSelect when pressed', () => {
    const { getByRole } = render(
      <RideCard ride={mockRide} onSelect={mockOnSelect} colors={lightColors} />
    );

    const button = getByRole('button');
    fireEvent.press(button);

    expect(mockOnSelect).toHaveBeenCalledWith(mockRide);
  });

  it('displays correct badge and icon for Hybrid vehicle', () => {
    const hybridRide = { ...mockRide, vehicleType: 'Hybrid' as const };
    const { getByText } = render(
      <RideCard ride={hybridRide} onSelect={mockOnSelect} colors={lightColors} />
    );

    expect(getByText('Hybrid')).toBeTruthy();
  });
});
