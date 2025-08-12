import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/solidjs';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
