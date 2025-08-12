import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/solidjs';
import Status from './Status';

describe('Status', () => {
  it('renders idle status correctly', () => {
    render(() => <Status status="idle" message="Ready" />);
    
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass('status-idle');
  });

  it('renders loading status correctly', () => {
    render(() => <Status status="loading" message="Loading..." />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass('status-loading');
  });

  it('renders success status correctly', () => {
    render(() => <Status status="success" message="Success!" />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass('status-success');
  });

  it('renders error status correctly', () => {
    render(() => <Status status="error" message="Error occurred" />);
    
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass('status-error');
  });
});
