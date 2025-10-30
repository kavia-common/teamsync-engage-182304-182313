import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing headline', () => {
  render(<App />);
  const headline = screen.getByText(/Find the perfect team activity/i);
  expect(headline).toBeInTheDocument();
});
