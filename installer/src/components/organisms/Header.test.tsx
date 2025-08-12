import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/solidjs';
import Header from './Header';

describe('Header', () => {
  it('renders header with title', () => {
    render(() => <Header />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/regenfass/i)).toBeInTheDocument();
  });

  it('renders navigation elements', () => {
    render(() => <Header />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
