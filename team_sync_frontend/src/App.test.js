import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing headline', () => {
  render(<App />);
  const headline = screen.getByText(/Plan engaging team activities/i);
  expect(headline).toBeInTheDocument();
});
