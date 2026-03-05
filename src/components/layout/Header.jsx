import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import useDarkMode from '../../hooks/useDarkMode';

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
  const [isDark, toggleDarkMode] = useDarkMode();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-10 bg-blue-100 dark:bg-slate-900 shadow-md flex items-center justify-between px-6 py-4 w-screen">
      <h1 className="text-3xl font-bold text-blue-900 dark:text-slate-100">
        <Link to="/">ShopBuddy</Link>
      </h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded cursor-pointer text-blue-900 dark:text-slate-100 hover:bg-blue-200 dark:hover:bg-slate-700" aria-label="Toggle dark mode" onClick={toggleDarkMode}>
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <button className="relative flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600" aria-label="Toggle cart" onClick={toggleCart}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0a2 2 0 11-4 0 2 2 0 014 0m3-9a2 2 0 11-4 0 2 2 0 014 0" />
        </svg>
        <span className='hidden md:inline'>Cart</span> {itemCount > 0 && <span className="absolute -top-2 -right-2 ml-1 bg-blue-400 text-white text-xs font-bold rounded-full px-2 py-1 border-2 border-white">{itemCount}</span>}
        </button>
      </div>
    </header>
  );
};

export default Header;