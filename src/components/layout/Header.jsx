import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

/**
 * Sticky application header with branding and cart toggle button.
 *
 * Uses w-screen instead of w-full so the header background extends into the
 * scrollbar gutter when body-scroll-lock reserves that space, preventing
 * a visible gap at the top right when the cart opens.
 *
 * @component
 * @returns {JSX.Element}
 */
const Header = () => {
  const { items, toggleCart } = useCart();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-10 bg-blue-100 shadow-md flex items-center justify-between px-6 py-4 w-screen">
      <h1 className="text-3xl font-bold text-blue-900">
        <Link to="/">ShopBuddy</Link>
      </h1>
      <button className="relative flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600" aria-label="Toggle cart" onClick={toggleCart}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0a2 2 0 11-4 0 2 2 0 014 0m3-9a2 2 0 11-4 0 2 2 0 014 0" />
        </svg>
        Cart {itemCount > 0 && <span className="absolute -top-2 -right-2 ml-1 bg-blue-400 text-white text-xs font-bold rounded-full px-2 py-1 border-2 border-white">{itemCount}</span>}
      </button>
    </header>
  );
};

export default Header;