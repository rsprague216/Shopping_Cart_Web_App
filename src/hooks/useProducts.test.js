import { renderHook, waitFor } from '@testing-library/react';
import useProducts from './useProducts';

const mockProducts = [
  { id: 1, title: 'Fjallraven Backpack', price: 109.95, image: 'backpack.jpg' },
  { id: 2, title: 'Mens Casual T-Shirt', price: 22.30, image: 'tshirt.jpg' },
];

describe('useProducts', () => {
  it('returns loading=true and empty products array on initial render', () => {
    // Mock fetch to return a promise that never resolves so we can inspect
    // the intermediate loading state before any data arrives.
    vi.mocked(fetch).mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns products and loading=false after a successful fetch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
  });

  it('sets error and loading=false when response.ok is false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network response was not ok');
    expect(result.current.products).toEqual([]);
  });

  it('sets error and loading=false when fetch throws a network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.products).toEqual([]);
  });
});
