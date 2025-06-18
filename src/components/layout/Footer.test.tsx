import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer Component', () => {
  it('renders the current year in the copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    // Use a regex to be more flexible with whitespace or surrounding text
    const copyrightText = screen.getByText(
      new RegExp(`© ${currentYear} JobBoardly. All rights reserved.`)
    );
    expect(copyrightText).toBeInTheDocument();
  });

  it('renders the powered by AI message', () => {
    render(<Footer />);
    const poweredByMessage = screen.getByText(
      'Powered by AI to help you find your dream job.'
    );
    expect(poweredByMessage).toBeInTheDocument();
  });
});
