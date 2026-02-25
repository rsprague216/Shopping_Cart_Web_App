import { renderHook, waitFor } from '@testing-library/react';
import useProduct from './useProduct';

const mockProduct = {
  id: 5,
  title: 'John Hardy Gold Bracelet',
  price: 695.00,
  description: 'From our Legends Collection',
  category: 'jewelery',
  image: 'bracelet.jpg',
  rating: { rate: 4.6, count: 400 },
};

describe('useProduct', () => {
  it('fetches from the correct URL using the provided productId', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    const { result } = renderHook(() => useProduct(5));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetch).toHaveBeenCalledWith('https://fakestoreapi.com/products/5');
  });

  it('returns loading=true and product=null on initial render', () => {
    vi.mocked(fetch).mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useProduct(1));

    expect(result.current.loading).toBe(true);
    expect(result.current.product).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('returns product and loading=false after a successful fetch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    const { result } = renderHook(() => useProduct(5));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.error).toBeNull();
  });

  it('sets error and loading=false when response.ok is false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useProduct(999));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network response was not ok');
    expect(result.current.product).toBeNull();
  });

  it('sets error and loading=false when fetch throws a network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useProduct(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.product).toBeNull();
  });

  it('re-fetches when productId changes', async () => {
    const mockProduct2 = { ...mockProduct, id: 7, title: 'White Gold Plated Princess' };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => mockProduct })
      .mockResolvedValueOnce({ ok: true, json: async () => mockProduct2 });

    const { result, rerender } = renderHook(({ id }) => useProduct(id), {
      initialProps: { id: 5 },
    });

    await waitFor(() => expect(result.current.product?.id).toBe(5));

    rerender({ id: 7 });

    await waitFor(() => expect(result.current.product?.id).toBe(7));

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://fakestoreapi.com/products/5');
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://fakestoreapi.com/products/7');
  });
});
