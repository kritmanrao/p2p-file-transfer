import { test, expect } from 'vitest'; // <--- temporary fix
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders the app title', () => {
  render(<App />);
  expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument();
});

