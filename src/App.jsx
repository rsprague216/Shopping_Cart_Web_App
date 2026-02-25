/**
 * Root application component.
 *
 * Composes the three top-level layout sections — Header, Main content area,
 * and CartSideBar — inside CartProvider so all children share the same
 * cart state via context.
 *
 * CartSideBar lives at this level (rather than inside Main) so it can slide
 * over the entire viewport, including the header.
 */
import Header from './components/layout/Header';
import Main from './components/layout/Main';
import CartSideBar from './components/cart/CartSideBar';
import CartProvider from './components/cart/CartProvider';

function App() {
  return (
    <CartProvider>
      <Header />
      <Main />
      <CartSideBar />
    </CartProvider>
  );
};

export default App;
