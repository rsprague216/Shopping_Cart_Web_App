import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartProvider from '../cart/CartProvider';
import ProductCard from './ProductCard';

const defaultProps = {
  id: 3,
  title: 'Mens Cotton Jacket',
  price: 55.99,
  image: 'https://fakestoreapi.com/img/jacket.jpg',
};

const renderCard = (props = defaultProps) =>
  render(
    <MemoryRouter>
      <CartProvider>
        <ProductCard {...props} />
      </CartProvider>
    </MemoryRouter>
  );

describe('ProductCard', () => {
  it('renders the product image with correct src and alt text', () => {
    renderCard();
    const img = screen.getByAltText(defaultProps.title);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.image);
  });

  it('renders the formatted price', () => {
    renderCard();
    expect(screen.getByText('$55.99')).toBeInTheDocument();
  });

  it('renders a price with two decimal places even when the value is a whole number', () => {
    renderCard({ ...defaultProps, price: 20 });
    expect(screen.getByText('$20.00')).toBeInTheDocument();
  });

  it('renders the product title', () => {
    renderCard();
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('renders a link to the product detail page', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/products/${defaultProps.id}`);
  });

  it('renders an Add to Cart button', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
});
