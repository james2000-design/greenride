import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { AppProvider, useApp, Ride } from '../src/context/AppContext';

const TestComponent = () => {
  const {
    theme,
    toggleTheme,
    confirmBooking,
    selectRide,
    setPendingBooking,
    bookedRides,
    totalCo2Saved,
    totalEcoPoints,
  } = useApp();

  const mockRide: Ride = {
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

  return (
    <View>
      <Text testID="theme">{theme}</Text>
      <TouchableOpacity testID="toggle-theme" onPress={toggleTheme}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="select-ride"
        onPress={() => {
          selectRide(mockRide);
          setPendingBooking({ from: 'A', to: 'B' });
        }}
      >
        <Text>Select Ride</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="confirm-booking" onPress={confirmBooking}>
        <Text>Confirm Booking</Text>
      </TouchableOpacity>
      <Text testID="booked-count">{bookedRides.length}</Text>
      <Text testID="total-co2">{totalCo2Saved}</Text>
      <Text testID="total-points">{totalEcoPoints}</Text>
    </View>
  );
};

describe('AppContext', () => {
  it('toggles theme correctly', () => {
    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const themeText = getByTestId('theme');
    const toggleBtn = getByTestId('toggle-theme');

    const initialTheme = themeText.props.children;
    fireEvent.press(toggleBtn);

    expect(themeText.props.children).toBe(initialTheme === 'light' ? 'dark' : 'light');
  });

  it('confirms booking and calculates totals correctly', () => {
    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const selectBtn = getByTestId('select-ride');
    const confirmBtn = getByTestId('confirm-booking');

    fireEvent.press(selectBtn);
    fireEvent.press(confirmBtn);

    expect(getByTestId('booked-count').props.children).toBe(1);
    expect(getByTestId('total-co2').props.children).toBe(1.4);
    expect(getByTestId('total-points').props.children).toBe(140);
  });
});
