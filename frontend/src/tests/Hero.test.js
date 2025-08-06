import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Hero from '../landing_page/home/Hero';

describe('Hero component', () => {
  test('renders hero image and content correctly', () => {
    render(<Hero />);

    // Image
    const heroImage = screen.getByAltText('Hero Image');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', 'media/image/homeHero.png');

    // Heading
    const heading = screen.getByText(/Invest in everything/i);
    expect(heading).toBeInTheDocument();

    // Paragraph
    const paragraph = screen.getByText(/Online platform to invest in stocks/i);
    expect(paragraph).toBeInTheDocument();

    // Button
    const button = screen.getByRole('button', { name: /Signup Now/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-primary');
  });
});
