import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('wallet-example Application Suite', () => {
  it('renders the wallet demonstration page successfully', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();

    // Check header or main elements rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders EIP-712 structured data signing and quick transfer panels', () => {
    render(<App />);

    expect(screen.getByText('EIP-712 Typed Data Signing (v4)')).toBeDefined();
    expect(screen.getByText('Quick Test Transfer')).toBeDefined();
    expect(screen.getByText('Quick Chain Presets')).toBeDefined();
    expect(screen.getByText('Sign Typed Data (EIP-712)')).toBeDefined();
    expect(screen.getByText('Execute Quick Transfer')).toBeDefined();
    expect(screen.getByText('EIP-712 Signature Verification & Recovery')).toBeDefined();
    expect(screen.getByText('Verify Typed Signature')).toBeDefined();
  });
});
