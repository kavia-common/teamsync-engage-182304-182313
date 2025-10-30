import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing headline', () => {
  render(<App />);
  // Exact headline verification
  const headline = screen.getByText('Plan engaging team activities in just a few clicks.');
  expect(headline).toBeInTheDocument();
});
