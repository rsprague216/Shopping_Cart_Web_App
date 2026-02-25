import { render, screen } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('renders 5 star SVG icons in both the base and overlay layers', () => {
    const { container } = render(<StarRating rate={3} count={120} />);
    const svgs = container.querySelectorAll('svg');
    // 5 empty stars (base layer) + 5 full stars (overlay) = 10 total
    expect(svgs).toHaveLength(10);
  });

  it('sets the overlay width to rate * 20%', () => {
    const { container } = render(<StarRating rate={3} count={50} />);
    const overlay = container.querySelector('.overflow-hidden');
    expect(overlay).toHaveStyle({ width: '60%' });
  });

  it('displays the numeric rating value and review count text', () => {
    render(<StarRating rate={3.5} count={120} />);
    expect(screen.getByText('3.5 (120 ratings)')).toBeInTheDocument();
  });

  it('handles a perfect rating of 5 (100% overlay width)', () => {
    const { container } = render(<StarRating rate={5} count={200} />);
    const overlay = container.querySelector('.overflow-hidden');
    expect(overlay).toHaveStyle({ width: '100%' });
  });

  it('handles a rating of 0 (0% overlay width)', () => {
    const { container } = render(<StarRating rate={0} count={5} />);
    const overlay = container.querySelector('.overflow-hidden');
    expect(overlay).toHaveStyle({ width: '0%' });
  });
});
