import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ThemeToggle } from '../src/components/ui';
import { ThemeProvider } from '../src/components/ThemeContext';

describe('theme toggle', () => {
  it('switches themes and persists the selected mode', async () => {
    await render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggle = screen.getByRole('switch');
    expect(toggle.props.accessibilityState.checked).toBe(false);
    await fireEvent.press(toggle);

    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(true);
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('@fitness-tracker/theme', 'dark'));
  });
});
