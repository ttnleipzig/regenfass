import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/solidjs';
import Link from './Link';

describe('Link', () => {
  it('renders with correct href and text', () => {
    render(() => <Link href="https://example.com">Test Link</Link>);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveTextContent('Test Link');
  });

  it('renders external links with target="_blank"', () => {
    render(() => <Link href="https://external.com">External Link</Link>);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders internal links without target="_blank"', () => {
    render(() => <Link href="/internal">Internal Link</Link>);
    
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});
